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

/** Build a native iOS URI scheme from a web URL for the given preset */
function toIosScheme(preset: PresetKey, url: URL): string | undefined {
  const path = url.pathname; // e.g. /watch, /@handle, /reel/123

  switch (preset) {
    case "youtube":
      // vnd.youtube:// is the confirmed working iOS scheme
      return `vnd.youtube://${url.hostname}${path}${url.search}`;

    case "instagram":
      // instagram:// handles profiles, reels, posts
      return `instagram://${url.hostname}${path}${url.search}`;

    case "tiktok":
      return `snssdk1233://${url.hostname}${path}${url.search}`;

    case "twitter":
      return `twitter://${url.hostname}${path}${url.search}`;

    case "facebook":
      return `fb://${url.hostname}${path}${url.search}`;

    case "whatsapp": {
      // wa.me/PHONE → whatsapp://send?phone=PHONE
      const phone = url.pathname.replace(/^\//, "");
      return phone ? `whatsapp://send?phone=${phone}` : undefined;
    }

    case "telegram": {
      // t.me/USERNAME → tg://resolve?domain=USERNAME
      const username = url.pathname.replace(/^\//, "");
      return username ? `tg://resolve?domain=${username}` : undefined;
    }

    default:
      return undefined;
  }
}

/** Build an Android Intent URI from a web URL for the given preset.
 *  Intent URIs bypass WebView restrictions because they are handled by the OS. */
function toAndroidIntent(preset: PresetKey, url: URL): string | undefined {
  const packages: Partial<Record<PresetKey, string>> = {
    youtube:   "com.google.android.youtube",
    instagram: "com.instagram.android",
    tiktok:    "com.zhiliaoapp.musically",
    twitter:   "com.twitter.android",
    facebook:  "com.facebook.katana",
    whatsapp:  "com.whatsapp",
    telegram:  "org.telegram.messenger",
  };

  const pkg = packages[preset];
  if (!pkg) return undefined;

  if (preset === "whatsapp") {
    const phone = url.pathname.replace(/^\//, "");
    return phone
      ? `intent://send?phone=${phone}#Intent;scheme=whatsapp;package=${pkg};end;`
      : undefined;
  }

  if (preset === "telegram") {
    const username = url.pathname.replace(/^\//, "");
    return username
      ? `intent://resolve?domain=${username}#Intent;scheme=tg;package=${pkg};end;`
      : undefined;
  }

  // Generic: intent://host/path#Intent;scheme=https;package=PKG;end;
  return `intent://${url.hostname}${url.pathname}${url.search}#Intent;scheme=https;package=${pkg};end;`;
}

export function inferLinkFromDestination(input: string): InferredLink {
  const desktopUrl = normalizeUrl(input);
  const preset = detectPresetFromUrl(desktopUrl);

  let iosDeepLink: string | undefined;
  let androidDeepLink: string | undefined;

  try {
    const parsed = new URL(desktopUrl);
    iosDeepLink     = toIosScheme(preset, parsed)     ?? desktopUrl;
    androidDeepLink = toAndroidIntent(preset, parsed) ?? desktopUrl;
  } catch {
    iosDeepLink     = desktopUrl;
    androidDeepLink = desktopUrl;
  }

  return {
    preset,
    title: titleFromPreset(preset),
    slug: slugFromUrl(desktopUrl),
    desktopUrl,
    iosDeepLink,
    androidDeepLink,
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
