import { describe, expect, it } from "vitest";

import { detectPlatform, resolveDestination } from "../lib/routing";
import type { LinkRecord } from "../lib/types";

const baseRecord: LinkRecord = {
  id: "1",
  slug: "spring-drop",
  title: "Spring Drop",
  preset: "instagram",
  status: "active",
  iosDeepLink: "instagram://user?username=brand",
  iosStoreUrl: "https://apps.apple.com/app/id1",
  androidDeepLink: "intent://profile/brand",
  androidStoreUrl: "https://play.google.com/store/apps/details?id=brand",
  desktopUrl: "https://brand.com/launch",
  workspaceId: null,
  createdByUserId: null,
  createdAt: "2026-05-20T00:00:00.000Z",
  updatedAt: "2026-05-20T00:00:00.000Z"
};

describe("detectPlatform", () => {
  it("detects ios user agents", () => {
    expect(detectPlatform("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("ios");
  });

  it("detects android user agents", () => {
    expect(detectPlatform("Mozilla/5.0 (Linux; Android 15; Pixel)")).toBe("android");
  });
});

describe("resolveDestination", () => {
  it("prefers iOS deep links for iPhone traffic", () => {
    const result = resolveDestination(baseRecord, "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)");
    expect(result?.destination).toBe(baseRecord.iosDeepLink);
  });

  it("falls back to desktop web for desktop traffic", () => {
    const result = resolveDestination(baseRecord, "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    expect(result?.destination).toBe(baseRecord.desktopUrl);
  });

  it("uses the safest available fallback for unknown agents", () => {
    const result = resolveDestination(baseRecord, "Unknown Agent");
    expect(result?.destination).toBe(baseRecord.desktopUrl);
  });
});
