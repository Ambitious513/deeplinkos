import { toAndroidIntentUri, toIosDeepLink, detectAppScheme } from "@/lib/app-schemes";
import type { DevicePlatform, LinkRecord, ResolvedDestination } from "@/lib/types";

export { detectPlatform };

function detectPlatform(userAgent: string | null): DevicePlatform {
  const agent = (userAgent || "").toLowerCase();

  if (agent.includes("iphone") || agent.includes("ipad") || agent.includes("ipod")) return "ios";
  if (agent.includes("android")) return "android";
  if (agent.includes("windows") || agent.includes("macintosh") || agent.includes("linux")) return "desktop";

  return "unknown";
}

export function isInAppWebView(userAgent: string | null, xRequestedWith: string | null = null, referer: string | null = null) {
  const ua = userAgent || "";
  const xrw = (xRequestedWith || "").toLowerCase();
  const ref = referer || "";

  if (/t\.co|l\.facebook\.com|l\.instagram\.com|lnkd\.in|out\.reddit\.com/i.test(ref)) return true;
  if (xrw && xrw !== "com.android.chrome" && xrw !== "com.sec.android.app.sbrowser") return true;
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A|FB_UI|FB_WebView|Messenger|Instagram|musical_ly|TikTok|Twitter|Snapchat|Line\/|MicroMessenger|LinkedInApp|Pinterest|Reddit/i.test(ua)) {
    return true;
  }
  if (/wv\)/i.test(ua) && /Android/i.test(ua)) return true;
  if (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua)) return true;

  return false;
}

/**
 * Builds an Android intent:// URI for IAB direct routing.
 * Prefers an explicitly set androidDeepLink, then auto-detects from destination URL.
 * Returns null if the app isn't in the registry and no explicit deep link is provided.
 */
export function buildIntentUri(record: LinkRecord): string | null {
  const destination = record.destinationUrl ?? "";

  // If already an intent:// URI, use as-is
  if (record.androidDeepLink?.startsWith("intent://")) {
    return record.androidDeepLink;
  }

  // Auto-generate intent:// from destination URL via app-schemes registry
  const intentUri = toAndroidIntentUri(destination);
  if (intentUri) return intentUri;

  return null;
}

/**
 * Returns the best iOS deep link for a record.
 * Prefers an explicitly set iosDeepLink, then auto-detects from destination URL.
 */
export function getIosDeepLink(record: LinkRecord): string | null {
  if (record.iosDeepLink) return record.iosDeepLink;
  return record.destinationUrl ? toIosDeepLink(record.destinationUrl) : null;
}

/**
 * Detects if a destination URL belongs to a known app (auto-routing capable).
 */
export function detectSmartRouting(destinationUrl: string | null): {
  detected: boolean;
  appName: string | null;
} {
  if (!destinationUrl) return { detected: false, appName: null };
  const scheme = detectAppScheme(destinationUrl);
  return { detected: scheme !== null, appName: scheme?.name ?? null };
}

export function resolveDestination(record: LinkRecord, userAgent: string | null, variantUrl?: string | null): ResolvedDestination | null {
  const platform = detectPlatform(userAgent);

  if (variantUrl) {
    return { platform, destination: variantUrl, reason: "web-fallback" };
  }

  if (platform === "ios") {
    // Auto-detect iOS deep link if not set
    const iosLink = record.iosDeepLink ?? toIosDeepLink(record.destinationUrl ?? "");
    if (iosLink) return { platform, destination: iosLink, reason: "deep-link" };
    if (record.iosStoreUrl) return { platform, destination: record.iosStoreUrl, reason: "store-fallback" };
    if (record.desktopUrl || record.fallbackUrl || record.destinationUrl) {
      return { platform, destination: record.desktopUrl || record.fallbackUrl || record.destinationUrl!, reason: "web-fallback" };
    }
  }

  if (platform === "android") {
    // Auto-detect Android deep link if not set
    const intentUri = buildIntentUri(record);
    if (intentUri) return { platform, destination: intentUri, reason: "deep-link" };
    if (record.androidStoreUrl) return { platform, destination: record.androidStoreUrl, reason: "store-fallback" };
    if (record.desktopUrl || record.fallbackUrl || record.destinationUrl) {
      return { platform, destination: record.desktopUrl || record.fallbackUrl || record.destinationUrl!, reason: "web-fallback" };
    }
  }

  if (platform === "desktop" && (record.desktopUrl || record.fallbackUrl || record.destinationUrl)) {
    return { platform, destination: record.desktopUrl || record.fallbackUrl || record.destinationUrl!, reason: "web-fallback" };
  }

  const fallback = record.fallbackUrl || record.desktopUrl || record.destinationUrl || record.iosStoreUrl || record.androidStoreUrl || record.iosDeepLink || record.androidDeepLink;
  if (!fallback) return null;

  return { platform, destination: fallback, reason: "generic-fallback" };
}
