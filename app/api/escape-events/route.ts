import { NextResponse } from "next/server";

import { markSessionState } from "@/lib/session-state";
import { createEscapeEvent, findClickSessionByToken, updateClickSession } from "@/lib/store";
import type { EscapeState } from "@/lib/types";

const allowedEventNames = new Set<EscapeState>([
  "hidden_observed",
  "intent_rejected",
  "scheme_unavailable",
  "watchdog_timeout",
  "fallback_rendered",
  "escape_hidden_no_land",
  "ios_containment_viewed"
]);

async function parsePayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as {
      eventName?: EscapeState;
      attemptedMethod?: string;
      latencyMs?: number;
      experimentLane?: string | null;
    };
  }

  const raw = await request.text();
  try {
    return JSON.parse(raw) as {
      eventName?: EscapeState;
      attemptedMethod?: string;
      latencyMs?: number;
      experimentLane?: string | null;
    };
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const clickSession = await findClickSessionByToken(token);
  if (!clickSession) {
    return NextResponse.json({ error: "Unknown session." }, { status: 404 });
  }

  const payload = await parsePayload(request);
  if (!payload.eventName || !allowedEventNames.has(payload.eventName)) {
    return NextResponse.json({ error: "Unsupported event." }, { status: 400 });
  }

  const confirmedEnvironment =
    payload.eventName === "ios_containment_viewed"
      ? "in_app_browser_contained"
      : payload.eventName === "watchdog_timeout" || payload.eventName === "escape_hidden_no_land"
        ? "escape_failed"
        : undefined;

  const nextSession =
    (await updateClickSession(token, (session) =>
      markSessionState(session, payload.eventName as EscapeState, confirmedEnvironment)
    )) || clickSession;

  await createEscapeEvent({
    clickSession: nextSession,
    eventName: payload.eventName,
    attemptedMethod: payload.attemptedMethod || null,
    latencyMs: typeof payload.latencyMs === "number" ? payload.latencyMs : null,
    experimentLane: payload.experimentLane || null
  });

  return NextResponse.json({ ok: true });
}
