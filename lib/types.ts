export type PresetKey =
  | "custom"
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "telegram"
  | "tiktok"
  | "youtube"
  | "twitter"
  | "google-maps";

export type DevicePlatform = "ios" | "android" | "desktop" | "unknown";

export type LinkRecord = {
  id: string;
  slug: string;
  title: string;
  preset: PresetKey;
  status: "active" | "inactive";
  isActive: boolean;
  expiresAt?: string | null;
  password?: string | null;
  iosDeepLink?: string;
  iosStoreUrl?: string;
  androidDeepLink?: string;
  androidStoreUrl?: string;
  desktopUrl?: string;
  campaign?: string;
  workspaceId?: string | null;
  createdByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
};

export type CreateLinkInput = {
  destinationUrl?: string;
  title?: string;
  preset?: PresetKey;
  slug?: string;
  iosDeepLink?: string;
  iosStoreUrl?: string;
  androidDeepLink?: string;
  androidStoreUrl?: string;
  desktopUrl?: string;
  campaign?: string;
  password?: string;
  expiresAt?: string;
  abTestUrl?: string;
};

export type ResolvedDestination = {
  platform: DevicePlatform;
  destination: string;
  reason: "deep-link" | "store-fallback" | "web-fallback" | "generic-fallback";
};
