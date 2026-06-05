import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { getLink } from "@/lib/links";
import { detectPlatform } from "@/lib/routing";
import { createTrackingClient } from "@/lib/supabase/tracking";

/* ── Helpers ─────────────────────────────────────────────────── */

function detectBrowser(ua: string): string {
  const u = ua.toLowerCase();
  if (u.includes("edg/"))    return "Edge";
  if (u.includes("opr/") || u.includes("opera")) return "Opera";
  if (u.includes("samsungbrowser")) return "Samsung";
  if (u.includes("firefox")) return "Firefox";
  if (u.includes("chrome"))  return "Chrome";
  if (u.includes("safari"))  return "Safari";
  return "Other";
}

function detectOS(ua: string): string {
  const u = ua.toLowerCase();
  if (u.includes("iphone") || u.includes("ipad") || u.includes("ipod")) return "iOS";
  if (u.includes("android"))   return "Android";
  if (u.includes("windows"))   return "Windows";
  if (u.includes("macintosh")) return "macOS";
  if (u.includes("linux"))     return "Linux";
  return "Unknown";
}

function detectReferrer(ua: string, refererHeader: string | null): string {
  if (refererHeader) {
    try {
      const host = new URL(refererHeader).hostname.replace(/^www\./, "");
      const map: Record<string, string> = {
        "t.co": "Twitter / X", "x.com": "Twitter / X", "twitter.com": "Twitter / X",
        "facebook.com": "Facebook", "fb.com": "Facebook", "l.facebook.com": "Facebook",
        "instagram.com": "Instagram", "l.instagram.com": "Instagram",
        "tiktok.com": "TikTok",
        "wa.me": "WhatsApp", "whatsapp.com": "WhatsApp",
        "t.me": "Telegram", "telegram.org": "Telegram",
        "reddit.com": "Reddit", "out.reddit.com": "Reddit",
        "linkedin.com": "LinkedIn", "lnkd.in": "LinkedIn",
        "youtube.com": "YouTube", "youtu.be": "YouTube",
        "snapchat.com": "Snapchat",
        "pinterest.com": "Pinterest",
      };
      return map[host] ?? host;
    } catch { return refererHeader; }
  }
  // UA sniffing for apps that strip Referer
  if (/WhatsApp\//i.test(ua))                    return "WhatsApp";
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(ua))  return "Facebook";
  if (/Instagram/i.test(ua))                      return "Instagram";
  if (/musical_ly|TikTok/i.test(ua))             return "TikTok";
  if (/Snapchat/i.test(ua))                       return "Snapchat";
  if (/Twitter/i.test(ua))                        return "Twitter / X";
  if (/Telegram/i.test(ua))                       return "Telegram";
  if (/LinkedInApp/i.test(ua))                    return "LinkedIn";
  if (/Pinterest/i.test(ua))                      return "Pinterest";
  if (/Reddit/i.test(ua))                         return "Reddit";
  if (/Line\//i.test(ua))                         return "Line";
  if (/MicroMessenger/i.test(ua))                 return "WeChat";
  return "direct";
}

/** SHA-256 hash of the IP — 16 hex chars (64-bit), salted for rainbow-table protection.
 * async because Web Crypto subtle.digest() is Promise-based. */
async function hashIp(ip: string): Promise<string> {
  const salt = process.env.IP_HASH_SALT || "dl-default-salt";
  const enc = new TextEncoder();
  const data = enc.encode(ip + salt);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // 16 hex chars = 64-bit = negligible collision risk
}

/* ── Bot / prefetch filter ──────────────────────────────────── */

/**
 * Returns true for known bots, crawlers, link-preview scrapers, and
 * monitoring agents. These must not be counted as real user clicks.
 */
function isBot(ua: string): boolean {
  if (!ua) return true; // no UA = headless / scripted
  const u = ua.toLowerCase();
  return (
    // Search crawlers
    u.includes("googlebot") ||
    u.includes("bingbot") ||
    u.includes("slurp") ||          // Yahoo
    u.includes("duckduckbot") ||
    u.includes("baiduspider") ||
    u.includes("yandexbot") ||
    u.includes("sogou") ||
    u.includes("exabot") ||
    u.includes("ia_archiver") ||
    // SEO / monitoring tools
    u.includes("ahrefsbot") ||
    u.includes("semrushbot") ||
    u.includes("mj12bot") ||
    u.includes("dotbot") ||
    u.includes("rogerbot") ||
    u.includes("uptimerobot") ||
    u.includes("pingdom") ||
    u.includes("datadoghq") ||
    u.includes("newrelic") ||
    // Social / link-preview bots (THE main culprit for inflated counts)
    u.includes("facebookexternalhit") ||
    u.includes("facebot") ||
    u.includes("twitterbot") ||
    u.includes("linkedinbot") ||
    u.includes("slackbot") ||
    u.includes("discordbot") ||
    u.includes("telegrambot") ||
    u.includes("whatsapp") ||
    u.includes("applebot") ||
    u.includes("pinterest") ||
    u.includes("redditbot") ||
    u.includes("tumblr") ||
    // Generic headless / scripted
    u.includes("headlesschrome") ||
    u.includes("phantomjs") ||
    u.includes("python-requests") ||
    u.includes("python-urllib") ||
    u.includes("axios") ||
    u.includes("node-fetch") ||
    u.includes("go-http-client") ||
    u.includes("java/") ||
    u.includes("curl/") ||
    u.includes("wget/") ||
    // Catchall: contains "bot" or "crawler" or "spider"
    /\b(bot|crawler|spider|scraper|checker|validator)\b/.test(u)
  );
}

/* ── Page ────────────────────────────────────────────────────── */

// Force dynamic — never cache redirect pages
export const dynamic = "force-dynamic";

export default async function DeepLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pw?: string }>;
}) {
  const { slug } = await params;
  const { pw } = await searchParams;
  const record = await getLink(slug);

  if (!record) redirect("/missing");

  // Deactivated link
  if (record.isActive === false) redirect("/missing");

  // Expired link
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) redirect("/missing");

  // Password-protected link
  if (record.password) {
    if (!pw || pw !== record.password) {
      const wrongPassword = !!pw && pw !== record.password;
      return (
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "#f0f4ff", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
          padding: "2rem",
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "40px 36px",
            maxWidth: 360, width: "100%", boxShadow: "0 8px 40px rgba(0,0,0,.10)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0d1f3c", marginBottom: 6 }}>
              {record.title || "Protected Link"}
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
              This link is password protected. Enter the password to continue.
            </p>

            <form method="GET" action={`/r/${slug}`} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                name="pw"
                type="password"
                required
                autoFocus
                placeholder="Enter password"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 15,
                  border: wrongPassword ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
                  outline: "none", boxSizing: "border-box" as const,
                }}
              />
              {wrongPassword && (
                <p style={{ color: "#ef4444", fontSize: 13, margin: 0, textAlign: "left" }}>
                  Incorrect password. Please try again.
                </p>
              )}
              <button
                type="submit"
                style={{
                  padding: "13px", borderRadius: 10, background: "#3b82f6", color: "#fff",
                  border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer",
                }}
              >
                Continue →
              </button>
            </form>
          </div>
        </div>
      );
    }
  }

  const headersList = await headers();
  const ua       = headersList.get("user-agent") ?? "";
  const ip       = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const referer  = headersList.get("referer") ?? null;
  const platform = detectPlatform(ua);
  const browser  = detectBrowser(ua);
  const os       = detectOS(ua);
  const ipHash   = await hashIp(ip);
  const source   = detectReferrer(ua, referer);

  // Country from Cloudflare header (zero latency when behind CF/Coolify proxy)
  const country  = headersList.get("cf-ipcountry") ?? null;

  // A/B test variant — randomly assigned 50/50 if ab_test_url is set
  const variant  = record!.abTestUrl ? (Math.random() < 0.5 ? "a" : "b") : null;
  const abDest   = variant === "b" ? record!.abTestUrl! : null;

  // ── Layer 1: Bot / crawler filter ───────────────────────────
  // ── Layer 2: Prefetch / speculative request filter ───────────
  const isPrefetch = (
    headersList.get("purpose")     === "prefetch" ||
    headersList.get("x-purpose")   === "preview"  ||
    headersList.get("sec-purpose") === "prefetch"
  );

  const shouldTrack = !isBot(ua) && !isPrefetch;

  // Track click after response — only for real human clicks
  // Layer 3 dedup: DB unique index on (link_id, ip_hash, minute) prevents
  // counting the same IP more than once per 60 seconds at DB level.
  if (shouldTrack) {
    after(async () => {
      try {
        const db = createTrackingClient();
        // ignoreDuplicates: true means ON CONFLICT DO NOTHING
        // The unique index on (link_id, ip_hash, date_trunc('minute', timestamp))
        // is the DB-level dedup guard — no pre-check query needed.
        const { error } = await db.from("clicks").insert({
          link_id:  record!.id,
          device:   platform,
          os,
          browser,
          ip_hash:  ipHash,
          referrer: source,
          country,
          variant,
        }, { ignoreDuplicates: true } as any);
        if (error && error.code !== "23505") { // 23505 = unique_violation (expected)
          console.error("[click-tracking]", error.message);
        }
      } catch (err) {
        console.error("[click-tracking]", err);
      }
    });
  }

  /* ── Destination resolution ──────────────────────────────── */

  const webFallback =
    abDest ||
    record!.desktopUrl ||
    record!.iosStoreUrl ||
    record!.androidStoreUrl ||
    "/";

  // ① Desktop → instant server-side 307 redirect (no page render at all)
  if (platform === "desktop") {
    redirect(webFallback as any);
  }

  // ② iOS — if only a store URL exists (no custom scheme), 307 to App Store instantly
  if (platform === "ios" && !record.iosDeepLink) {
    redirect((record.iosStoreUrl || webFallback) as any);
  }

  // ③ Android — if only a store URL exists (no custom scheme), 307 to Play Store instantly
  if (platform === "android" && !record.androidDeepLink) {
    redirect((record.androidStoreUrl || webFallback) as any);
  }

  // ④ Unknown platform — redirect to best web fallback
  if (platform === "unknown") {
    redirect(webFallback as any);
  }

  /* ── Mobile with custom deep-link scheme ─────────────────── */

  const appScheme    = platform === "ios" ? record.iosDeepLink! : record.androidDeepLink!;
  const storeFallback = platform === "ios"
    ? (record.iosStoreUrl || webFallback)
    : (record.androidStoreUrl || webFallback);
  const isIos = platform === "ios";

  // Inline script — runs IMMEDIATELY as browser parses it (no DOMContentLoaded wait)
  // Kept intentionally tiny to minimise parse time
  const inlineScript = `(function(){
var s=${JSON.stringify(appScheme)};
var f=${JSON.stringify(storeFallback)};
var t=Date.now(),d=${isIos ? 2500 : 2000};
window.location.href=s;
setTimeout(function(){
if(document.hidden||document.webkitHidden)return;
if(Date.now()-t<d-200)return;
window.location.replace(f);
},d);
})();`;

  return (
    <>
      {/*
       * Script is the FIRST element rendered — browser executes it the instant
       * it's parsed in the HTML stream, before any layout/paint occurs.
       * This gives URLgeni.us-style instant opening with no loading spinner.
       */}
      <script dangerouslySetInnerHTML={{ __html: inlineScript }} />

      {/* Minimal fallback — no spinner, no CSS file, no animations */}
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        background: "#f0f4ff", gap: 12,
        padding: "2rem", textAlign: "center",
      }}>
        <p style={{ fontSize: 15, color: "#0d1f3c", fontWeight: 600, margin: 0 }}>
          Opening {record.title || "your link"}…
        </p>
        <a
          href={storeFallback}
          style={{
            marginTop: 8, fontSize: 13, color: "#3b82f6",
            textDecoration: "underline", textUnderlineOffset: 3,
          }}
        >
          Tap here if the app doesn&apos;t open
        </a>
      </div>
    </>
  );
}
