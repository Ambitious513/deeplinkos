import { describe, expect, it } from "vitest";

import { applyOpen, consumeAutoAttempt, createClickSessionRecord } from "../lib/session-state";
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

describe("createClickSessionRecord", () => {
  it("routes X Android traffic into the Chrome breakout lane", () => {
    const session = createClickSessionRecord({
      record: baseRecord,
      requestUrl: new URL("https://deeplinkos.com/r/spring-drop?utm_source=x&utm_campaign=test"),
      userAgent:
        "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
      referer: "https://t.co/example",
      xRequestedWith: "com.twitter.android",
      laneHint: null
    });

    expect(session.routeSelected).toBe("android_chrome");
    expect(session.destinationUrlCanonical).toContain("https://brand.com/launch");
    expect(session.destinationUrlCanonical).toContain("utm_source=x");
  });

  it("routes X iPhone traffic into containment", () => {
    const session = createClickSessionRecord({
      record: baseRecord,
      requestUrl: new URL("https://deeplinkos.com/r/spring-drop"),
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Twitter for iPhone",
      referer: "https://t.co/example",
      xRequestedWith: null,
      laneHint: null
    });

    expect(session.routeSelected).toBe("ios_containment");
  });
});

describe("consumeAutoAttempt", () => {
  it("allows only one automatic launch by default", () => {
    const session = createClickSessionRecord({
      record: baseRecord,
      requestUrl: new URL("https://deeplinkos.com/r/spring-drop"),
      userAgent:
        "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
      referer: "https://t.co/example",
      xRequestedWith: "com.twitter.android",
      laneHint: null
    });

    const first = consumeAutoAttempt(session);
    const second = consumeAutoAttempt(first.session);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
    expect(second.session.autoAttemptCount).toBe(1);
  });
});

describe("applyOpen", () => {
  it("creates one canonical open and reuses the event on reopen", () => {
    const session = createClickSessionRecord({
      record: baseRecord,
      requestUrl: new URL("https://deeplinkos.com/r/spring-drop"),
      userAgent:
        "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
      referer: "https://t.co/example",
      xRequestedWith: "com.twitter.android",
      laneHint: null
    });

    const first = applyOpen(session);
    const second = applyOpen(first.session);

    expect(first.isFirstOpen).toBe(true);
    expect(second.isFirstOpen).toBe(false);
    expect(second.session.firstOpenAt).toBe(first.session.firstOpenAt);
    expect(second.session.openCount).toBe(2);
    expect(second.session.canonicalEventId).toBe(first.session.canonicalEventId);
  });
});
