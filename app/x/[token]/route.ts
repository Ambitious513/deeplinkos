import { NextResponse } from "next/server";

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
    (await updateClickSession(token, (session) => markSessionState(session, "route_selected"))) ||
    clickSession;

  await createEscapeEvent({
    clickSession: nextSession,
    eventName: "route_selected",
    attemptedMethod: nextSession.routeSelected
  });

  const origin = getRequestOrigin(request);
  const routeMap = {
    android_chrome: `${origin}/escape/chrome/${token}`,
    android_probe: `${origin}/escape/probe/${token}`,
    ios_containment: `${origin}/contain/ios/${token}`,
    generic_web: `${origin}/open/${token}`
  } as const;

  return NextResponse.redirect(routeMap[nextSession.routeSelected], 307);
}
