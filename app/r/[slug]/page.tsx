import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { hashIp, verifyPassword } from "@/lib/crypto";
import { findActiveLinkForRedirect } from "@/lib/links";
import { detectPlatform, isInAppWebView, resolveDestination } from "@/lib/routing";
import { createTrackingClient } from "@/lib/supabase/tracking";
import {
  detectBrowser,
  detectOS,
  detectReferrer,
  deviceLabel,
  isBot,
  isPrefetch,
  detectIABSource,
} from "@/lib/request-insights";

export const dynamic = "force-dynamic";

// ── Password brute-force rate limiter (2.1) ────────────────────────────────────
// Module-level Map persists across requests within the same Node.js process.
// Works correctly on a single-instance VPS. Replace with Redis for multi-instance.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

type RateBucket = { count: number; firstAttempt: number };
const _rateBuckets = new Map<string, RateBucket>();

function isRateLimited(ip: string, slug: string): boolean {
  const key = `${ip}:${slug}`;
  const bucket = _rateBuckets.get(key);
  if (!bucket) return false;
  if (Date.now() - bucket.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    _rateBuckets.delete(key);
    return false;
  }
  return bucket.count >= RATE_LIMIT_MAX;
}

function recordFailedAttempt(ip: string, slug: string): void {
  const key = `${ip}:${slug}`;
  const existing = _rateBuckets.get(key);
  const now = Date.now();
  if (!existing || now - existing.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    _rateBuckets.set(key, { count: 1, firstAttempt: now });
  } else {
    existing.count += 1;
  }
  // Purge expired buckets periodically to prevent unbounded memory growth
  if (_rateBuckets.size > 5000) {
    for (const [k, b] of _rateBuckets) {
      if (now - b.firstAttempt > RATE_LIMIT_WINDOW_MS) _rateBuckets.delete(k);
    }
  }
}

// ── URL scheme allowlist (2.2) ─────────────────────────────────────────────────
// Only allow known-safe schemes as redirect destinations.
// Blocks javascript:, data:, vbscript:, and any other unexpected scheme.
const SAFE_PROTOCOLS = new Set(["https:", "http:", "intent:", "x-safari-https:", "x-safari-http:"]);

function isSafeDestination(url: string): boolean {
  // intent:// URIs are not parseable by URL() — allow them explicitly
  if (url.startsWith("intent://")) return true;
  try {
    const { protocol } = new URL(url);
    // Allow known-safe protocols
    if (SAFE_PROTOCOLS.has(protocol)) return true;
    // Allow any custom app URI scheme (e.g. spotify://, youtube://)
    // These are set by authenticated users at link-creation time
    if (/^[a-z][a-z0-9+\-.]+:\/\//i.test(url)) return true;
    return false;
  } catch {
    return false;
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

type RedirectSearchParams = {
  pw?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: string | string[] | undefined;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function utmEntries(searchParams: RedirectSearchParams) {
  const entries: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const value = firstParam(searchParams[key]);
    if (value) entries[key] = value;
  }
  return entries;
}

function appendUtm(rawUrl: string, stored: Record<string, string | null>, incoming: Record<string, string>) {
  const merged: Record<string, string> = {};
  for (const [key, value] of Object.entries({ ...stored, ...incoming })) {
    if (value) merged[key] = value;
  }
  if (!Object.keys(merged).length) return rawUrl;
  try {
    const url = new URL(rawUrl);
    for (const [key, value] of Object.entries(merged)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function pickVariant(abTestUrl: string | null, abTestWeight: number): { variant: "a" | "b" | null; variantUrl: string | null } {
  if (!abTestUrl) return { variant: null, variantUrl: null };
  const useVariantB = Math.random() * 100 < abTestWeight;
  return { variant: useVariantB ? "b" : "a", variantUrl: useVariantB ? abTestUrl : null };
}

function minuteBucket(date = new Date()) {
  date.setSeconds(0, 0);
  return date.toISOString();
}

/** Converts https://... to x-safari-https://... for iOS IAB escape-to-Safari trick */
function toSafariEscape(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:") return `x-safari-https://${parsed.host}${parsed.pathname}${parsed.search}`;
    if (parsed.protocol === "http:") return `x-safari-http://${parsed.host}${parsed.pathname}${parsed.search}`;
    return null;
  } catch {
    return null;
  }
}

// ── Password gate UI ──────────────────────────────────────────────────────────

function PasswordGate({
  slug,
  title,
  wrongPassword,
  incomingUtm,
}: {
  slug: string;
  title: string;
  wrongPassword: boolean;
  incomingUtm: Record<string, string>;
}) {
  return (
    <main className="section">
      <div className="card" style={{ maxWidth: 420, margin: "12vh auto 0", textAlign: "center" }}>
        <div className="eyebrow">Protected link</div>
        <h1 className="dashboard-page__title" style={{ fontSize: "clamp(2rem, 6vw, 3rem)" }}>
          {title || "Enter password"}
        </h1>
        <p className="dashboard-page__summary">This destination is private. Enter the password to continue.</p>
        <form action={`/r/${slug}`} method="GET" style={{ display: "grid", gap: 12, marginTop: 22 }}>
          {Object.entries(incomingUtm).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <input
            name="pw"
            type="password"
            required
            autoFocus
            placeholder="Password"
            style={{
              border: wrongPassword ? "1px solid #ef4444" : "1px solid var(--border)",
              borderRadius: 14,
              padding: "14px 16px",
              font: "inherit",
              background: "var(--surface)",
              color: "var(--text)",
            }}
          />
          {wrongPassword ? <p style={{ margin: 0, color: "#ef4444", fontSize: 13 }}>Incorrect password. Try again.</p> : null}
          <button className="button button--primary" type="submit">
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}

// ── Rate-limited lockout UI ───────────────────────────────────────────────────

function RateLimitGate() {
  return (
    <main className="section">
      <div className="card" style={{ maxWidth: 420, margin: "12vh auto 0", textAlign: "center", display: "grid", gap: 12 }}>
        <div className="eyebrow">Too many attempts</div>
        <h1 className="dashboard-page__title" style={{ fontSize: "clamp(1.5rem, 5vw, 2.25rem)" }}>
          Link locked
        </h1>
        <p className="dashboard-page__summary">
          Too many incorrect password attempts. Please try again in 10 minutes.
        </p>
      </div>
    </main>
  );
}

// ── Main redirect page ────────────────────────────────────────────────────────

export default async function DeepLinkRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RedirectSearchParams>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const headersList = await headers();
  const hostname = headersList.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const record = await findActiveLinkForRedirect(slug, hostname);

  if (!record) redirect("/missing");
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) redirect("/missing");

  const userAgent = headersList.get("user-agent") ?? "";
  const platform = detectPlatform(userAgent);
  const referer = headersList.get("referer");
  const xRequestedWith = headersList.get("x-requested-with");
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const incomingUtm = utmEntries(query);
  const providedPassword = firstParam(query.pw);

  // ── Password gate with rate limiting ─────────────────────────────────────
  if (record.passwordHash) {
    if (isRateLimited(ip, record.slug)) {
      return <RateLimitGate />;
    }
    if (!providedPassword || !(await verifyPassword(providedPassword, record.passwordHash))) {
      if (providedPassword) recordFailedAttempt(ip, record.slug);
      return (
        <PasswordGate
          slug={record.slug}
          title={record.title}
          wrongPassword={Boolean(providedPassword)}
          incomingUtm={incomingUtm}
        />
      );
    }
  }

  const { variant, variantUrl } = pickVariant(record.abTestUrl, record.abTestWeight);
  const destination = resolveDestination(record, userAgent, variantUrl);

  if (!destination) redirect("/missing");

  // ── URL scheme allowlist ──────────────────────────────────────────────────
  if (!isSafeDestination(destination.destination)) {
    console.error(
      `[redirect] Blocked unsafe destination scheme for slug=${record.slug}: ` +
        destination.destination.slice(0, 60)
    );
    redirect("/missing");
  }

  const storedUtm = {
    utm_source: record.utmSource,
    utm_medium: record.utmMedium,
    utm_campaign: record.utmCampaign,
    utm_term: record.utmTerm,
    utm_content: record.utmContent,
  };
  const finalDestination = appendUtm(destination.destination, storedUtm, incomingUtm);
  const prefetch = isPrefetch(headersList);
  const bot = isBot(userAgent);

  // ── IAB detection ─────────────────────────────────────────────────────────
  const iabSource = detectIABSource(userAgent);
  const isIAB = iabSource !== null || isInAppWebView(userAgent, xRequestedWith, referer);
  const isDeepLink = destination.reason === "deep-link";
  const isIntentUri = finalDestination.startsWith("intent://");

  // ── Click analytics (non-blocking via after()) ────────────────────────────
  if (!bot && !prefetch) {
    after(async () => {
      try {
        const db = createTrackingClient();
        const { error } = await db.from("clicks").insert({
          link_id: record.id,
          dedupe_bucket: minuteBucket(),
          variant,
          device: deviceLabel(platform),
          os: detectOS(userAgent),
          browser: iabSource ? `${iabSource} IAB` : detectBrowser(userAgent),
          referrer: detectReferrer(userAgent, referer),
          country: headersList.get("cf-ipcountry"),
          ip_hash: await hashIp(ip),
          is_bot: false,
          is_prefetch: false,
          utm_source: incomingUtm.utm_source ?? record.utmSource,
          utm_medium: incomingUtm.utm_medium ?? record.utmMedium,
          utm_campaign: incomingUtm.utm_campaign ?? record.utmCampaign,
          utm_term: incomingUtm.utm_term ?? record.utmTerm,
          utm_content: incomingUtm.utm_content ?? record.utmContent,
        });
        if (error && error.code !== "23505") {
          console.error("[click-tracking]", error.message);
        }
      } catch (error) {
        console.error("[click-tracking]", error);
      }
    });
  }

  // ── Routing decision tree ─────────────────────────────────────────────────
  // Case 1 — Not in an IAB, or not a deep-link → plain redirect
  if (!isIAB || !isDeepLink) {
    redirect(finalDestination);
  }

  // Case 2 — Android + intent URI → OS-level redirect (zero page rendered)
  if (platform === "android" && isIntentUri) {
    redirect(finalDestination);
  }

  // Case 3 — interstitial for iOS IABs (and Android with custom scheme deep links)
  const fallback = appendUtm(
    record.iosStoreUrl ||
      record.androidStoreUrl ||
      record.fallbackUrl ||
      record.desktopUrl ||
      record.destinationUrl ||
      finalDestination,
    storedUtm,
    incomingUtm
  );

  const safariEscape = platform === "ios" ? toSafariEscape(fallback) : null;

  const inlineScript = `(function(){
  var target=${JSON.stringify(finalDestination)};
  var fallback=${JSON.stringify(fallback)};
  var safari=${JSON.stringify(safariEscape)};
  var isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
  var started=Date.now();
  window.location.href=target;
  setTimeout(function(){
    if(document.hidden||document.webkitHidden)return;
    if(Date.now()-started<1100)return;
    if(isIOS&&safari){
      window.location.href=safari;
      setTimeout(function(){
        if(document.hidden||document.webkitHidden)return;
        window.location.replace(fallback);
      },500);
    }else{
      window.location.replace(fallback);
    }
  },1200);
}());`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: inlineScript }} />
      <main className="section">
        <div
          className="card"
          style={{
            maxWidth: 480,
            margin: "14vh auto 0",
            textAlign: "center",
            display: "grid",
            gap: 16,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--accent, #2563eb)",
              margin: "0 auto",
              animation: "pulse 1.4s ease-in-out infinite",
            }}
          />
          <style>{`@keyframes pulse{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:.45;transform:scale(.88)}}`}</style>
          <div className="eyebrow">Opening link</div>
          <h1 className="dashboard-page__title" style={{ fontSize: "clamp(1.75rem, 5vw, 2.75rem)", margin: 0 }}>
            {record.title}
          </h1>
          <p className="dashboard-page__summary" style={{ margin: 0 }}>
            Taking you there now. If nothing happens, tap below.
          </p>
          <a className="button button--primary" href={fallback} style={{ marginTop: 8 }}>
            Continue →
          </a>
        </div>
      </main>
    </>
  );
}
