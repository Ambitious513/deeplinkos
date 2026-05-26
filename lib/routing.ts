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
export function isInAppWebView(userAgent: string | null): boolean {
  const ua = userAgent || "";

  // Facebook / Facebook Lite
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(ua)) return true;

  // Instagram
  if (/Instagram/i.test(ua)) return true;

  // TikTok
  if (/musical_ly|TikTok/i.test(ua)) return true;

  // Twitter / X in-app
  if (/TwitterAndroid|TwitteriPhone/i.test(ua)) return true;

  // Snapchat
  if (/Snapchat/i.test(ua)) return true;

  // Line
  if (/Line\//i.test(ua)) return true;

  // WeChat
  if (/MicroMessenger/i.test(ua)) return true;

  // LinkedIn
  if (/LinkedInApp/i.test(ua)) return true;

  // Generic Android WebView markers
  if (/wv\)/.test(ua) && /Android/i.test(ua)) return true;

  return false;
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
