import { describe, expect, it } from "vitest";

import { createSlug, normalizeSlug } from "../lib/slug";

describe("normalizeSlug", () => {
  it("normalizes casing and separators", () => {
    expect(normalizeSlug(" Spring Drop 2026 ")).toBe("spring-drop-2026");
  });
});

describe("createSlug", () => {
  it("creates a slug with the requested length", () => {
    expect(createSlug(8)).toHaveLength(8);
  });
});
