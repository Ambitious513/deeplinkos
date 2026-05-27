import { NextResponse } from "next/server";

import { renderIosContainmentPage } from "@/lib/escape-pages";
import { getRequestOrigin } from "@/lib/request";
import { isExpired, markSessionState } from "@/lib/session-state";
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

  const nextSession =
    (await updateClickSession(token, (session) =>
      markSessionState(session, "ios_containment_viewed", "in_app_browser_contained")
    )) || clickSession;

  await createEscapeEvent({
    clickSession: nextSession,
    eventName: "ios_containment_viewed",
    attemptedMethod: "ios-containment"
  });

  const origin = getRequestOrigin(request);
  const html = renderIosContainmentPage({
    title: nextSession.linkSlug,
    destinationHref: `${origin}/open/${token}`,
    beaconHref: `${origin}/api/escape-events?token=${encodeURIComponent(token)}`
  });

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
