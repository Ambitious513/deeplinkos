import { NextResponse } from "next/server";

import { applyOpen, isExpired } from "@/lib/session-state";
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

  const opened = applyOpen(clickSession);
  const nextSession = (await updateClickSession(token, () => opened.session)) || clickSession;

  await createEscapeEvent({
    clickSession: nextSession,
    eventName: "open_landed",
    attemptedMethod: opened.isFirstOpen ? "canonical-open" : "reopen"
  });

  return NextResponse.redirect(nextSession.destinationUrlCanonical, 307);
}
