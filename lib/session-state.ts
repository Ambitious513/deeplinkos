import { createHash, randomBytes, randomUUID } from "node:crypto";

import {
  CLICK_TOKEN_TTL_MINUTES,
  DEFAULT_LINK_POLICY,
  TRACKING_QUERY_KEYS
} from "./constants";
import type {
  BrowserFamily,
  ClickSessionRecord,
  ConfirmedEnvironment,
  ConsentState,
  DevicePlatform,
  EscapeState,
  LinkPolicy,
  LinkRecord,
  OemFamily,
  RouteSelection,
  UtmBlob
} from "./types";
import {
  detectPlatform,
  inferBrowserFamily,
  inferOemFamily,
  inferOsVersion,
  isXContext,
  mergeTrackingParams,
  resolveDestination
} from "./routing";

export function createClickToken() {
  return randomBytes(18).toString("base64url");
}

export function extractUtmBlob(input: URL | URLSearchParams): UtmBlob {
  const searchParams = input instanceof URL ? input.searchParams : input;
  return TRACKING_QUERY_KEYS.reduce<UtmBlob>((accumulator, key) => {
    const value = searchParams.get(key);
    if (value) {
      accumulator[key] = value;
    }
    return accumulator;
  }, {});
}

export function getLinkPolicy(record: LinkRecord): LinkPolicy {
  return {
    ...DEFAULT_LINK_POLICY,
    ...(record.routingConfig || {})
  };
}

export function selectRoute(params: {
  platformFamily: DevicePlatform;
  xContextInferred: boolean;
  policy: LinkPolicy;
  laneHint: string | null;
}): RouteSelection {
  const { laneHint, platformFamily, policy, xContextInferred } = params;

  if (xContextInferred && platformFamily === "android" && policy.androidBreakoutEnabled) {
    if (laneHint === "probe" && policy.probeLaneEnabled) {
      return "android_probe";
    }

    if (policy.chromePrimaryEnabled) {
      return "android_chrome";
    }

    if (policy.probeLaneEnabled) {
      return "android_probe";
    }
  }

  if (xContextInferred && platformFamily === "ios" && policy.iosContainmentEnabled) {
    return "ios_containment";
  }

  return "generic_web";
}

export function resolveCanonicalDestination(params: {
  record: LinkRecord;
  userAgent: string | null;
  xContextInferred: boolean;
  utmBlob: UtmBlob;
}): string | null {
  const { record, userAgent, utmBlob, xContextInferred } = params;
  const browserSafeDestination = xContextInferred ? record.desktopUrl : undefined;
  const resolved = browserSafeDestination
    ? { destination: browserSafeDestination }
    : resolveDestination(record, userAgent);

  if (!resolved?.destination) {
    return null;
  }

  return mergeTrackingParams(resolved.destination, utmBlob);
}

export function buildDebugPayloadHash(input: {
  canonicalDestination: string;
  utmBlob: UtmBlob;
  routeSelected: RouteSelection;
}): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        destination: input.canonicalDestination,
        routeSelected: input.routeSelected,
        utmBlob: Object.entries(input.utmBlob).sort(([left], [right]) => left.localeCompare(right))
      })
    )
    .digest("hex");
}

export function createClickSessionRecord(params: {
  record: LinkRecord;
  requestUrl: URL;
  userAgent: string | null;
  referer: string | null;
  xRequestedWith: string | null;
  laneHint: string | null;
  consentState?: ConsentState;
}): ClickSessionRecord {
  const { laneHint, record, referer, requestUrl, userAgent, xRequestedWith } = params;
  const platformFamily = detectPlatform(userAgent);
  const xContextInferred = isXContext(userAgent, xRequestedWith, referer);
  const policy = getLinkPolicy(record);
  const routeSelected = selectRoute({
    platformFamily,
    xContextInferred,
    policy,
    laneHint
  });
  const utmBlob = extractUtmBlob(requestUrl);
  const destinationUrlCanonical = resolveCanonicalDestination({
    record,
    userAgent,
    xContextInferred,
    utmBlob
  });

  if (!destinationUrlCanonical) {
    throw new Error("Unable to resolve a destination for this click.");
  }

  const createdAt = new Date();

  return {
    id: randomUUID(),
    linkId: record.id,
    linkSlug: record.slug,
    clickToken: createClickToken(),
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + CLICK_TOKEN_TTL_MINUTES * 60_000).toISOString(),
    platformFamily,
    osVersion: inferOsVersion(userAgent),
    browserFamilyInferred: inferBrowserFamily(userAgent),
    oemFamilyInferred: inferOemFamily(userAgent),
    xContextInferred,
    routeSelected,
    stateCurrent: "click_received",
    autoAttemptCount: 0,
    firstOpenAt: null,
    openCount: 0,
    confirmedEnvironment: "unknown_environment",
    consentState: params.consentState || "unknown",
    canonicalEventId: randomUUID(),
    utmBlob,
    destinationUrlCanonical,
    debugPayloadHash: buildDebugPayloadHash({
      canonicalDestination: destinationUrlCanonical,
      routeSelected,
      utmBlob
    }),
    referer,
    userAgent,
    xRequestedWith,
    campaign: record.campaign || null,
    lastEventAt: null
  };
}

export function markSessionState(
  session: ClickSessionRecord,
  eventName: EscapeState,
  confirmedEnvironment?: ConfirmedEnvironment
): ClickSessionRecord {
  return {
    ...session,
    stateCurrent: eventName,
    confirmedEnvironment: confirmedEnvironment || session.confirmedEnvironment,
    lastEventAt: new Date().toISOString()
  };
}

export function consumeAutoAttempt(
  session: ClickSessionRecord,
  policy: LinkPolicy = DEFAULT_LINK_POLICY
): { allowed: boolean; session: ClickSessionRecord } {
  if (session.autoAttemptCount >= policy.maxAutoAttempts) {
    return { allowed: false, session };
  }

  return {
    allowed: true,
    session: {
      ...session,
      autoAttemptCount: session.autoAttemptCount + 1,
      lastEventAt: new Date().toISOString()
    }
  };
}

export function applyOpen(session: ClickSessionRecord): {
  isFirstOpen: boolean;
  session: ClickSessionRecord;
} {
  const now = new Date().toISOString();
  const isFirstOpen = !session.firstOpenAt;

  return {
    isFirstOpen,
    session: {
      ...session,
      firstOpenAt: session.firstOpenAt || now,
      openCount: session.openCount + 1,
      stateCurrent: isFirstOpen ? "escape_success_confirmed" : session.stateCurrent,
      confirmedEnvironment:
        session.routeSelected === "ios_containment"
          ? "in_app_browser_contained"
          : "external_browser_confirmed",
      lastEventAt: now
    }
  };
}

export function isExpired(session: ClickSessionRecord) {
  return new Date(session.expiresAt).getTime() <= Date.now();
}

export function summarizeClientContext(params: {
  browserFamilyInferred: BrowserFamily;
  oemFamilyInferred: OemFamily;
  platformFamily: DevicePlatform;
}) {
  return `${params.platformFamily}:${params.browserFamilyInferred}:${params.oemFamilyInferred}`;
}
