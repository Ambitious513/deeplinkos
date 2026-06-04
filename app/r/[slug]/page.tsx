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
  if (u.includes("android"))  return "Android";
  if (u.includes("windows"))  return "Windows";
  if (u.includes("macintosh")) return "macOS";
  if (u.includes("linux"))    return "Linux";
  return "Unknown";
}

/**
 * Derive traffic source from the HTTP Referer header OR from the User-Agent
 * when apps like WhatsApp, Telegram, Instagram don't send a Referer.
 * Returns a human-readable source string stored in the `referrer` column.
 */
function detectReferrer(ua: string, refererHeader: string | null): string | null {
  // 1. Prefer the real HTTP Referer when present
  if (refererHeader) {
    try {
      const host = new URL(refererHeader).hostname.replace(/^www\./, "");
      // Map known social domains to clean labels
      const domainMap: Record<string, string> = {
        "t.co":           "Twitter / X",
        "x.com":          "Twitter / X",
        "twitter.com":    "Twitter / X",
        "facebook.com":   "Facebook",
        "fb.com":         "Facebook",
        "l.facebook.com": "Facebook",
        "instagram.com":  "Instagram",
        "l.instagram.com":"Instagram",
        "tiktok.com":     "TikTok",
        "wa.me":          "WhatsApp",
        "whatsapp.com":   "WhatsApp",
        "t.me":           "Telegram",
        "telegram.org":   "Telegram",
        "reddit.com":     "Reddit",
        "out.reddit.com": "Reddit",
        "linkedin.com":   "LinkedIn",
        "lnkd.in":        "LinkedIn",
        "youtube.com":    "YouTube",
        "youtu.be":       "YouTube",
        "snapchat.com":   "Snapchat",
        "pinterest.com":  "Pinterest",
      };
      return domainMap[host] ?? host;
    } catch {
      return refererHeader;
    }
  }

  // 2. No Referer? Fall back to UA sniffing for in-app browsers
  const u = ua;
  if (/WhatsApp\//i.test(u))                      return "WhatsApp";
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(u))    return "Facebook";
  if (/Instagram/i.test(u))                        return "Instagram";
  if (/musical_ly|TikTok/i.test(u))               return "TikTok";
  if (/Snapchat/i.test(u))                         return "Snapchat";
  if (/Twitter|XiaoMi\/MiuiBrowser/i.test(u))     return "Twitter / X";
  if (/Telegram/i.test(u))                         return "Telegram";
  if (/LinkedInApp/i.test(u))                      return "LinkedIn";
  if (/Pinterest/i.test(u))                        return "Pinterest";
  if (/Reddit/i.test(u))                           return "Reddit";
  if (/Line\//i.test(u))                           return "Line";
  if (/MicroMessenger/i.test(u))                   return "WeChat";

  // 3. Truly direct — user typed the URL or used a bookmark
  return "direct";
}

/**
 * Hash the IP into a short anonymous string — never store raw IPs.
 * We XOR-fold the bytes for a fast, deterministic 8-char hex token.
 */
function hashIp(ip: string): string {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (Math.imul(31, h) + ip.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/* ── Page ────────────────────────────────────────────────────── */

export default async function DeepLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = await getLink(slug);

  if (!record) redirect("/missing");

  const headersList = await headers();
  const ua        = headersList.get("user-agent") ?? "";
  const ip        = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const referer   = headersList.get("referer") ?? null;
  const platform  = detectPlatform(ua);
  const browser   = detectBrowser(ua);
  const os        = detectOS(ua);
  const ipHash    = hashIp(ip);
  const source    = detectReferrer(ua, referer);

  // ── Track click AFTER response — uses cookie-free tracking client
  //    so it works correctly even after redirect() fires.
  after(async () => {
    try {
      const supabase = createTrackingClient();
      const { error } = await supabase.from("clicks").insert({
        link_id:  record.id,
        device:   platform,      // "ios" | "android" | "desktop" | "unknown"
        os,                      // "iOS" | "Android" | "Windows" | "macOS" | ...
        browser,                 // "Chrome" | "Safari" | "Firefox" | ...
        ip_hash:  ipHash,        // anonymised 8-char hex, used for unique-visitor counts
        referrer: source,        // "WhatsApp" | "Instagram" | "direct" | domain | ...
      });
      if (error) {
        console.error("[click-tracking] insert error:", error.message);
      }
    } catch (err) {
      console.error("[click-tracking] unexpected error:", err);
    }
  });

  /* ── Build redirect URLs ─────────────────────────────────── */

  const appScheme =
    platform === "ios"
      ? record.iosDeepLink
      : platform === "android"
      ? record.androidDeepLink
      : undefined;

  const webFallback =
    record.desktopUrl ||
    record.iosStoreUrl ||
    record.androidStoreUrl ||
    "/";

  // Desktop: fast server-side redirect (no JS needed)
  if (platform === "desktop") redirect(webFallback as any);

  /* ── Mobile: JS interstitial for deep-link launch ─────── */

  const safeScheme   = appScheme ? JSON.stringify(appScheme) : "null";
  const safeFallback = JSON.stringify(webFallback);
  const safeIos      = record.iosStoreUrl ? JSON.stringify(record.iosStoreUrl) : safeFallback;
  const safeAndroid  = record.androidStoreUrl ? JSON.stringify(record.androidStoreUrl) : safeFallback;
  const isIos        = platform === "ios";
  const storeFallback = isIos ? safeIos : safeAndroid;

  const redirectScript = `
(function() {
  var appScheme    = ${safeScheme};
  var webFallback  = ${safeFallback};
  var storeFallback= ${storeFallback};
  var isIos        = ${isIos};

  function launchApp() {
    if (!appScheme) {
      window.location.href = webFallback;
      return;
    }

    // Try the deep-link scheme
    var a = document.getElementById('__dl_anchor__');
    if (a) { a.href = appScheme; a.click(); }
    try { window.location.href = appScheme; } catch(e) {}

    // If the app didn't open, fall back to the store after a delay
    var delay     = isIos ? 2500 : 2000;
    var startTime = Date.now();
    setTimeout(function() {
      if (document.hidden || document.webkitHidden) return;
      if (Date.now() - startTime < delay - 200)    return;
      window.location.href = storeFallback !== webFallback ? storeFallback : webFallback;
    }, delay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', launchApp);
  } else {
    launchApp();
  }
})();
`.trim();

  return (
    <>
      {/* Hidden anchor used by the deep-link launcher */}
      <a
        id="__dl_anchor__"
        href={appScheme ?? webFallback}
        style={{ display: "none" }}
        aria-hidden="true"
      />

      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          background: "var(--bg, #f0f4ff)",
        }}
      >
        {/* Spinner */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "4px solid rgba(59,130,246,0.15)",
            borderTopColor: "#3b82f6",
            animation: "spin 0.8s linear infinite",
            marginBottom: "1.5rem",
          }}
          aria-hidden="true"
        />

        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "var(--text, #0d1f3c)",
            marginBottom: "0.5rem",
          }}
        >
          Opening {record.title || "your link"}…
        </h1>
        <p style={{ color: "var(--text-2, #4a617d)", fontSize: "0.95rem" }}>
          You&apos;ll be redirected to the app automatically.
        </p>

        <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "var(--text-3, #8aaccc)" }}>
          If nothing happens,{" "}
          <a href={webFallback} style={{ color: "#3b82f6", textDecoration: "underline" }}>
            tap here to continue
          </a>
          .
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
    </>
  );
}
