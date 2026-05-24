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
