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

export type BrowserFamily =
  | "chrome"
  | "samsung-internet"
  | "firefox"
  | "brave"
  | "edge"
  | "safari"
  | "other"
  | "unknown";

export type OemFamily =
  | "apple"
  | "pixel"
  | "samsung"
  | "xiaomi"
  | "motorola"
  | "oneplus"
  | "desktop"
  | "other_oem_android"
  | "unknown";

export type RouteSelection = "android_chrome" | "android_probe" | "ios_containment" | "generic_web";

export type EscapeState =
  | "click_received"
  | "route_selected"
  | "launch_attempted"
  | "hidden_observed"
  | "intent_rejected"
  | "scheme_unavailable"
  | "open_landed"
  | "watchdog_timeout"
  | "fallback_rendered"
  | "escape_success_confirmed"
  | "escape_hidden_no_land"
  | "ios_containment_viewed"
  | "generic_web_completed";

export type ConfirmedEnvironment =
  | "external_browser_confirmed"
  | "in_app_browser_contained"
  | "escape_failed"
  | "unknown_environment";

export type ConsentState = "granted" | "denied" | "unknown";

export type LinkRecord = {
  id: string;
  slug: string;
  title: string;
  preset: PresetKey;
  status: "active";
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
  routingConfig?: Partial<LinkPolicy>;
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
};

export type ResolvedDestination = {
  platform: DevicePlatform;
  destination: string;
  reason: "deep-link" | "store-fallback" | "web-fallback" | "generic-fallback";
};

export type UtmBlob = Record<string, string>;

export type LinkPolicy = {
  androidBreakoutEnabled: boolean;
  chromePrimaryEnabled: boolean;
  probeLaneEnabled: boolean;
  iosContainmentEnabled: boolean;
  maxAutoAttempts: number;
  killSwitchGroup: string;
};

export type ClickSessionRecord = {
  id: string;
  linkId: string;
  linkSlug: string;
  clickToken: string;
  createdAt: string;
  expiresAt: string;
  platformFamily: DevicePlatform;
  osVersion: string | null;
  browserFamilyInferred: BrowserFamily;
  oemFamilyInferred: OemFamily;
  xContextInferred: boolean;
  routeSelected: RouteSelection;
  stateCurrent: EscapeState;
  autoAttemptCount: number;
  firstOpenAt: string | null;
  openCount: number;
  confirmedEnvironment: ConfirmedEnvironment;
  consentState: ConsentState;
  canonicalEventId: string;
  utmBlob: UtmBlob;
  destinationUrlCanonical: string;
  debugPayloadHash: string;
  referer: string | null;
  userAgent: string | null;
  xRequestedWith: string | null;
  campaign: string | null;
  lastEventAt: string | null;
};

export type EscapeEventRecord = {
  id: string;
  clickSessionId: string;
  eventName: EscapeState;
  attemptedMethod: string | null;
  latencyMs: number | null;
  platformFamily: DevicePlatform;
  browserFamilyInferred: BrowserFamily;
  oemFamilyInferred: OemFamily;
  xContextInferred: boolean;
  experimentLane: string | null;
  debugPayloadHash: string;
  createdAt: string;
};
