import { NextResponse } from "next/server";

import { DEFAULT_LINK_POLICY } from "@/lib/constants";
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

  const consumedResult = consumeAutoAttempt(clickSession, DEFAULT_LINK_POLICY);
  const nextSession =
    (await updateClickSession(token, () => ({
      ...consumedResult.session,
      stateCurrent: consumedResult.allowed ? "launch_attempted" : "scheme_unavailable"
    }))) || clickSession;

  await createEscapeEvent({
    clickSession: nextSession,
    eventName: consumedResult.allowed ? "launch_attempted" : "scheme_unavailable",
    attemptedMethod: consumedResult.allowed ? "intent-chrome-primary" : "auto-attempt-exhausted"
  });

  const origin = getRequestOrigin(request);
  const openUrl = `${origin}/open/${token}`;
  const intentUrl = `intent://${new URL(openUrl).host}${new URL(openUrl).pathname}${new URL(openUrl).search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(openUrl)};end;`;

  const html = renderAndroidEscapePage({
    title: nextSession.linkSlug,
    destinationHref: openUrl,
    beaconHref: `${origin}/api/escape-events?token=${encodeURIComponent(token)}`,
    intentHref: intentUrl,
    attemptedMethod: "intent-chrome-primary",
    autoAttemptConsumed: consumedResult.allowed
  });

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
