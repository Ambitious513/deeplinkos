import { presetMeta } from "./constants";
import { normalizeSlug } from "./slug";
import type { CreateLinkInput, PresetKey } from "./types";

type InferredLink = {
  preset: PresetKey;
  title: string;
  desktopUrl: string;
  slug: string;
  iosDeepLink?: string;
  androidDeepLink?: string;
};

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function hostnameFor(url: URL) {
  return url.hostname.replace(/^www\./, "").toLowerCase();
}

export function detectPresetFromUrl(input: string): PresetKey {
  try {
    const parsed = new URL(normalizeUrl(input));
    const hostname = hostnameFor(parsed);
    const path = parsed.pathname.toLowerCase();

    if (hostname.includes("instagram.com")) {
      return "instagram";
    }
    if (hostname === "wa.me" || hostname.includes("whatsapp.com")) {
      return "whatsapp";
    }
    if (hostname === "t.me" || hostname.includes("telegram")) {
      return "telegram";
    }
    if (hostname.includes("tiktok.com")) {
      return "tiktok";
    }
    if (hostname === "youtu.be" || hostname.includes("youtube.com")) {
      return "youtube";
    }
    if (hostname.includes("google.") && path.startsWith("/maps")) {
      return "google-maps";
    }
  } catch {
    return "custom";
  }

  return "custom";
}

function titleFromPreset(preset: PresetKey) {
  return `${presetMeta[preset].label} smart link`;
}

function slugFromUrl(input: string) {
  try {
    const parsed = new URL(normalizeUrl(input));
    const hostname = hostnameFor(parsed);
    const rawPath = parsed.pathname.replace(/\/+$/, "");
    const segments = rawPath.split("/").filter(Boolean);

    if (hostname.includes("youtube.com") && segments[0]?.startsWith("@")) {
      return normalizeSlug(segments[0].slice(1));
    }

    if (hostname === "youtu.be" && segments[0]) {
      return normalizeSlug(segments[0]);
    }

    if (segments[0]?.startsWith("@")) {
      return normalizeSlug(segments[0].slice(1));
    }

    if (hostname === "wa.me" && segments[0]) {
      return normalizeSlug(segments[0]);
    }

    if (hostname === "t.me" && segments[0]) {
      return normalizeSlug(segments[0]);
    }

    if (segments.length) {
      return normalizeSlug(segments[segments.length - 1]);
    }

    return normalizeSlug(hostname.split(".")[0]);
  } catch {
    return "";
  }
}

export function inferLinkFromDestination(input: string): InferredLink {
  const desktopUrl = normalizeUrl(input);
  const preset = detectPresetFromUrl(desktopUrl);

  return {
    preset,
    title: titleFromPreset(preset),
    slug: slugFromUrl(desktopUrl),
    desktopUrl,
    // Universal links often open the app directly for supported destinations, which keeps v1 simple.
    iosDeepLink: desktopUrl,
    androidDeepLink: desktopUrl
  };
}

export function mergeInferredInput(input: CreateLinkInput) {
  const inferred = input.destinationUrl ? inferLinkFromDestination(input.destinationUrl) : null;

  return {
    destinationUrl: input.destinationUrl,
    preset: input.preset || inferred?.preset || "custom",
    title: input.title?.trim() || inferred?.title || "Custom smart link",
    slug: input.slug || inferred?.slug,
    iosDeepLink: input.iosDeepLink || inferred?.iosDeepLink,
    iosStoreUrl: input.iosStoreUrl,
    androidDeepLink: input.androidDeepLink || inferred?.androidDeepLink,
    androidStoreUrl: input.androidStoreUrl,
    desktopUrl: input.desktopUrl || inferred?.desktopUrl,
    campaign: input.campaign
  };
}
