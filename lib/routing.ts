import type { DevicePlatform, LinkRecord, ResolvedDestination } from "@/lib/types";

export function detectPlatform(userAgent: string | null): DevicePlatform {
  const agent = (userAgent || "").toLowerCase();

  if (agent.includes("iphone") || agent.includes("ipad") || agent.includes("ipod")) {
    return "ios";
  }

  if (agent.includes("android")) {
    return "android";
  }

  if (agent.includes("windows") || agent.includes("macintosh") || agent.includes("linux")) {
    return "desktop";
  }

  return "unknown";
}

/**
 * Detect if the request is coming from an in-app WebView (e.g. Facebook, Instagram, TikTok).
 * These browsers intentionally block native URI scheme redirects unless triggered by a user
 * gesture (a JS .click()), so we need to serve the JS interstitial page for them.
 *
 * Regular mobile browsers (Chrome, Safari) handle intent:// and custom schemes just fine
 * via a plain HTTP 307 redirect — which is much faster.
 */
export function isInAppWebView(
  userAgent: string | null,
  xRequestedWith: string | null = null,
  referer: string | null = null
): boolean {
  const ua = (userAgent || "").toLowerCase();
  const xrw = (xRequestedWith || "").toLowerCase();
  const ref = (referer || "").toLowerCase();

  // Social Media Link Wrappers (Chrome Custom Tabs / SFSafariViewController)
  // Detected via Referer from known social shorteners.
  if (/t\.co|l\.facebook\.com|l\.instagram\.com|lnkd\.in|out\.reddit\.com/i.test(ref)) {
    return true;
  }

  // Android Stealth WebViews — X-Requested-With reveals the hosting app package.
  if (xrw && xrw !== "com.android.chrome" && xrw !== "com.sec.android.app.sbrowser") {
    return true;
  }

  // Facebook / Facebook Lite / Messenger
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A|FB_UI|FB_WebView|Messenger/i.test(ua)) return true;

  // Instagram
  if (/Instagram/i.test(ua)) return true;

  // TikTok
  if (/musical_ly|TikTok/i.test(ua)) return true;

  // Twitter / X in-app
  if (/Twitter/i.test(ua)) return true;

  // Snapchat
  if (/Snapchat/i.test(ua)) return true;

  // Line
  if (/Line\//i.test(ua)) return true;

  // WeChat
  if (/MicroMessenger/i.test(ua)) return true;

  // LinkedIn
  if (/LinkedInApp/i.test(ua)) return true;

  // Pinterest
  if (/Pinterest/i.test(ua)) return true;

  // Reddit
  if (/Reddit/i.test(ua)) return true;

  // Generic Android WebView markers
  if (/wv\)/.test(ua) && /Android/i.test(ua)) return true;

  // Generic iOS WebView markers
  if (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua)) return true;

  return false;
}

/**
 * Detect if the request is specifically coming from X.com / Twitter's
 * Chrome Custom Tab (CCT). CCTs are powered by the real Chrome engine so
 * targeting intent://...package=com.android.chrome is a no-op. Instead we
 * try alternative browsers and fall back to the CCT itself.
 *
 * Detection signal: Referer routed through t.co (Twitter's link shortener)
 * AND the User-Agent looks like stock Chrome (no WebView wv) marker.
 */
export function isChromeCustomTab(
  userAgent: string | null,
  xRequestedWith: string | null = null,
  referer: string | null = null
): boolean {
  const ua = (userAgent || "").toLowerCase();
  const xrw = (xRequestedWith || "").toLowerCase();
  const ref = (referer || "").toLowerCase();

  // Must have a t.co referer (came from X/Twitter)
  if (!ref.includes("t.co")) return false;

  // Must look like Chrome, not a raw WebView (wv marker) or other app
  const isChromeLike = /chrome\//.test(ua) && !/wv\)/.test(ua);
  if (!isChromeLike) return false;

  // Must NOT have an X-Requested-With that identifies a raw WebView host
  if (xrw && xrw !== "com.android.chrome") return false;

  return true;
}

export function resolveDestination(
  record: LinkRecord,
  userAgent: string | null
): ResolvedDestination | null {
  const platform = detectPlatform(userAgent);

  if (platform === "ios") {
    if (record.iosDeepLink) {
      return { platform, destination: record.iosDeepLink, reason: "deep-link" };
    }
    if (record.iosStoreUrl) {
      return { platform, destination: record.iosStoreUrl, reason: "store-fallback" };
    }
    if (record.desktopUrl) {
      return { platform, destination: record.desktopUrl, reason: "web-fallback" };
    }
  }

  if (platform === "android") {
    if (record.androidDeepLink) {
      return { platform, destination: record.androidDeepLink, reason: "deep-link" };
    }
    if (record.androidStoreUrl) {
      return { platform, destination: record.androidStoreUrl, reason: "store-fallback" };
    }
    if (record.desktopUrl) {
      return { platform, destination: record.desktopUrl, reason: "web-fallback" };
    }
  }

  if (platform === "desktop" && record.desktopUrl) {
    return { platform, destination: record.desktopUrl, reason: "web-fallback" };
  }

  const fallback =
    record.desktopUrl ||
    record.iosStoreUrl ||
    record.androidStoreUrl ||
    record.iosDeepLink ||
    record.androidDeepLink;

  if (!fallback) {
    return null;
  }

  return { platform, destination: fallback, reason: "generic-fallback" };
}
