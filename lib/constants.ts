import type { PresetKey } from "@/lib/types";

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
