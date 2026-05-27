import { describe, expect, it } from "vitest";

import { detectPresetFromUrl, inferLinkFromDestination, mergeInferredInput } from "../lib/inference";

describe("detectPresetFromUrl", () => {
  it("detects youtube links", () => {
    expect(detectPresetFromUrl("https://www.youtube.com/@buildwithtiana")).toBe("youtube");
  });

  it("falls back to custom for unknown domains", () => {
    expect(detectPresetFromUrl("https://example.com/page")).toBe("custom");
  });
});

describe("inferLinkFromDestination", () => {
  it("uses the destination url as the fallback and app-open default", () => {
    const inferred = inferLinkFromDestination("youtube.com/@buildwithtiana");
    expect(inferred.preset).toBe("youtube");
    expect(inferred.desktopUrl).toBe("https://youtube.com/@buildwithtiana");
    expect(inferred.iosDeepLink).toBe("vnd.youtube://youtube.com/@buildwithtiana");
  });
});

describe("mergeInferredInput", () => {
  it("fills missing fields from the destination url", () => {
    const merged = mergeInferredInput({
      destinationUrl: "https://instagram.com/buildwithtiana",
      slug: "buildwithtiana"
    });

    expect(merged.preset).toBe("instagram");
    expect(merged.title).toBe("Instagram smart link");
    expect(merged.desktopUrl).toBe("https://instagram.com/buildwithtiana");
  });
});
