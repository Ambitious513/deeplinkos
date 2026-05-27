import type { LinkPolicy, PresetKey } from "@/lib/types";

export const presetOptions: Array<{
  value: PresetKey;
  label: string;
  description: string;
  placeholder: string;
}> = [
  {
    value: "youtube",
    label: "YouTube",
    description: "Channels, videos, and creator destinations.",
    placeholder: "https://www.youtube.com/@channelname"
  },
  {
    value: "tiktok",
    label: "TikTok",
    description: "Profiles, videos, and creator campaigns.",
    placeholder: "https://www.tiktok.com/@creator"
  },
  {
    value: "instagram",
    label: "Instagram",
    description: "Profiles, posts, stories, and app-open routing.",
    placeholder: "https://www.instagram.com/username"
  },
  {
    value: "facebook",
    label: "Facebook",
    description: "Pages, groups, and profile deep links.",
    placeholder: "https://www.facebook.com/pagename"
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    description: "Chats, message links, and direct mobile routing.",
    placeholder: "https://wa.me/15551234567"
  },
  {
    value: "telegram",
    label: "Telegram",
    description: "Channels, groups, and direct in-app navigation.",
    placeholder: "https://t.me/yourchannel"
  },
  {
    value: "twitter",
    label: "X / Twitter",
    description: "Profiles, posts, and thread deep links.",
    placeholder: "https://x.com/username"
  },
  {
    value: "google-maps",
    label: "Google Maps",
    description: "Directions, places, and mobile-first location routing.",
    placeholder: "https://maps.google.com/?q=Times+Square"
  },
  {
    value: "custom",
    label: "Custom",
    description: "Bring your own URI scheme or universal link setup.",
    placeholder: "https://yourapp.com/path"
  }
];

export const presetMeta = Object.fromEntries(
  presetOptions.map((preset) => [preset.value, preset])
) as Record<PresetKey, (typeof presetOptions)[number]>;

export const DEFAULT_LINK_POLICY: LinkPolicy = {
  androidBreakoutEnabled: true,
  chromePrimaryEnabled: true,
  probeLaneEnabled: false,
  iosContainmentEnabled: true,
  maxAutoAttempts: 1,
  killSwitchGroup: "x-default"
};

export const LAUNCH_SETTLE_MS = 1500;
export const OPEN_CONFIRM_WINDOW_MS = 8000;
export const CLICK_TOKEN_TTL_MINUTES = 30;

export const TRACKING_QUERY_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "ttclid",
  "msclkid"
] as const;

export const PROBE_BROWSER_TARGETS = [
  {
    lane: "samsung-internet",
    attemptedMethod: "intent-samsung-internet",
    buildIntent: (openUrl: string) => {
      const url = new URL(openUrl);
      return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=sbrowser;package=com.sec.android.app.sbrowser;end;`;
    }
  },
  {
    lane: "firefox",
    attemptedMethod: "intent-firefox",
    buildIntent: (openUrl: string) =>
      `intent://open-url?url=${encodeURIComponent(openUrl)}#Intent;scheme=firefox;package=org.mozilla.firefox;end;`
  },
  {
    lane: "brave",
    attemptedMethod: "intent-brave",
    buildIntent: (openUrl: string) =>
      `intent://open-url?url=${encodeURIComponent(openUrl)}#Intent;scheme=brave;package=com.brave.browser;end;`
  },
  {
    lane: "edge",
    attemptedMethod: "intent-edge",
    buildIntent: (openUrl: string) => {
      const url = new URL(openUrl);
      return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=microsoft-edge;package=com.microsoft.emmx;end;`;
    }
  }
] as const;
