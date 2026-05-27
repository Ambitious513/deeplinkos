import { NextResponse } from "next/server";

import { getLink } from "@/lib/links";
import { getRequestOrigin } from "@/lib/request";
import { createClickSessionRecord } from "@/lib/session-state";
import { createClickSession, createEscapeEvent } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const record = await getLink(slug);

  if (!record) {
    return NextResponse.redirect(new URL("/missing", request.url));
  }

  const requestUrl = new URL(request.url);
  const clickSession = createClickSessionRecord({
    record,
    requestUrl,
    userAgent: request.headers.get("user-agent"),
    referer: request.headers.get("referer"),
    xRequestedWith: request.headers.get("x-requested-with"),
    laneHint: requestUrl.searchParams.get("lane"),
    consentState: "unknown"
  });

  await createClickSession(clickSession);
  await createEscapeEvent({
    clickSession,
    eventName: "click_received",
    attemptedMethod: "short-link-entry"
  });

  const origin = getRequestOrigin(request);
  return NextResponse.redirect(`${origin}/x/${clickSession.clickToken}`, 307);
}
