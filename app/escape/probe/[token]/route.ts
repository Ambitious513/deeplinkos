import { NextResponse } from "next/server";

import { DEFAULT_LINK_POLICY, PROBE_BROWSER_TARGETS } from "@/lib/constants";
import { renderAndroidEscapePage } from "@/lib/escape-pages";
import { getRequestOrigin } from "@/lib/request";
import { consumeAutoAttempt, isExpired } from "@/lib/session-state";
import { createEscapeEvent, findClickSessionByToken, updateClickSession } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const clickSession = await findClickSessionByToken(token);

  if (!clickSession || isExpired(clickSession)) {
    return NextResponse.redirect(new URL("/missing", request.url));
  }

  const origin = getRequestOrigin(request);
  const openUrl = `${origin}/open/${token}`;
  const target =
    PROBE_BROWSER_TARGETS.find(
      (candidate) => candidate.lane === new URL(request.url).searchParams.get("browser")
    ) || PROBE_BROWSER_TARGETS[0];

  const consumedResult = consumeAutoAttempt(clickSession, DEFAULT_LINK_POLICY);
  const eventName = target && consumedResult.allowed ? "launch_attempted" : "scheme_unavailable";
  const nextSession =
    (await updateClickSession(token, () => ({
      ...consumedResult.session,
      stateCurrent: eventName
    }))) || clickSession;

  await createEscapeEvent({
    clickSession: nextSession,
    eventName,
    attemptedMethod: target?.attemptedMethod || "probe-unavailable",
    experimentLane: target?.lane || null
  });

  const html = renderAndroidEscapePage({
    title: nextSession.linkSlug,
    destinationHref: openUrl,
    beaconHref: `${origin}/api/escape-events?token=${encodeURIComponent(token)}`,
    intentHref: target ? target.buildIntent(openUrl) : openUrl,
    attemptedMethod: target?.attemptedMethod || "probe-unavailable",
    experimentLane: target?.lane || null,
    autoAttemptConsumed: Boolean(target) && consumedResult.allowed
  });

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
