import type {
  BrowserFamily,
  DevicePlatform,
  LinkRecord,
  OemFamily,
  ResolvedDestination,
  UtmBlob
} from "@/lib/types";

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

export function inferBrowserFamily(userAgent: string | null): BrowserFamily {
  const agent = (userAgent || "").toLowerCase();

  if (agent.includes("edg/") || agent.includes("edga/")) {
    return "edge";
  }

  if (agent.includes("samsungbrowser/")) {
    return "samsung-internet";
  }

  if (agent.includes("brave")) {
    return "brave";
  }

  if (agent.includes("firefox/") || agent.includes("fxios/")) {
    return "firefox";
  }

  if (agent.includes("crios/") || agent.includes("chrome/")) {
    return "chrome";
  }

  if (agent.includes("safari/")) {
    return "safari";
  }

  return agent ? "other" : "unknown";
}

export function inferOemFamily(userAgent: string | null): OemFamily {
  const agent = (userAgent || "").toLowerCase();
  const platform = detectPlatform(userAgent);

  if (platform === "ios") {
    return "apple";
  }

  if (platform === "desktop") {
    return "desktop";
  }

  if (platform !== "android") {
    return "unknown";
  }

  if (agent.includes("pixel")) return "pixel";
  if (agent.includes("sm-") || agent.includes(" samsung")) return "samsung";
  if (agent.includes("mi ") || agent.includes("redmi") || agent.includes("xiaomi")) return "xiaomi";
  if (agent.includes("moto") || agent.includes("motorola")) return "motorola";
  if (agent.includes("oneplus")) return "oneplus";

  return "other_oem_android";
}

export function inferOsVersion(userAgent: string | null) {
  const agent = userAgent || "";
  const iosMatch = agent.match(/OS (\d+(?:[_\.]\d+)*) like Mac OS X/i);
  if (iosMatch) {
    return iosMatch[1].replace(/_/g, ".");
  }

  const androidMatch = agent.match(/Android (\d+(?:\.\d+)*)/i);
  if (androidMatch) {
    return androidMatch[1];
  }

  return null;
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

export function isXContext(
  userAgent: string | null,
  xRequestedWith: string | null = null,
  referer: string | null = null
) {
  const ua = (userAgent || "").toLowerCase();
  const xrw = (xRequestedWith || "").toLowerCase();
  const ref = (referer || "").toLowerCase();

  if (ref.includes("t.co") || ref.includes("x.com") || ref.includes("twitter.com")) {
    return true;
  }

  if (xrw.includes("com.twitter.android")) {
    return true;
  }

  return /twitter/i.test(ua);
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

export function mergeTrackingParams(destination: string, utmBlob: UtmBlob) {
  try {
    const url = new URL(destination);
    for (const [key, value] of Object.entries(utmBlob)) {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  } catch {
    return destination;
  }
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
