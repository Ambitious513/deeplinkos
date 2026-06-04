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

function hashIp(ip: string): string {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (Math.imul(31, h) + ip.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/* ── Page ────────────────────────────────────────────────────── */

// Force dynamic — never cache redirect pages
export const dynamic = "force-dynamic";

export default async function DeepLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = await getLink(slug);

  if (!record) redirect("/missing");

  // Deactivated link
  if (record.isActive === false) redirect("/missing");

  // Expired link
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) redirect("/missing");

  const headersList = await headers();
  const ua       = headersList.get("user-agent") ?? "";
  const ip       = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const referer  = headersList.get("referer") ?? null;
  const platform = detectPlatform(ua);
  const browser  = detectBrowser(ua);
  const os       = detectOS(ua);
  const ipHash   = hashIp(ip);
  const source   = detectReferrer(ua, referer);

  // Track click after response — cookie-free client so after() works
  after(async () => {
    try {
      const db = createTrackingClient();
      const { error } = await db.from("clicks").insert({
        link_id:  record.id,
        device:   platform,
        os,
        browser,
        ip_hash:  ipHash,
        referrer: source,
      });
      if (error) console.error("[click-tracking]", error.message);
    } catch (err) {
      console.error("[click-tracking]", err);
    }
  });

  /* ── Destination resolution ──────────────────────────────── */

  const webFallback =
    record.desktopUrl ||
    record.iosStoreUrl ||
    record.androidStoreUrl ||
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
