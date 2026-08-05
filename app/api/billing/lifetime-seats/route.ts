import { NextResponse } from "next/server";

import { createTrackingClient } from "@/lib/supabase/tracking";
import { LIFETIME_SEAT_LIMIT } from "@/lib/polar";

/**
 * GET /api/billing/lifetime-seats
 *
 * Public endpoint — returns how many Lifetime seats have been claimed.
 * Used to show the scarcity counter on the pricing page.
 * Uses the service-role client to count across all profiles.
 */
export async function GET() {
  const db = createTrackingClient();

  const { count, error } = await db
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("plan", "lifetime");

  if (error) {
    // Fail gracefully — don't expose DB errors publicly
    return NextResponse.json({ claimed: 0, total: LIFETIME_SEAT_LIMIT, available: LIFETIME_SEAT_LIMIT });
  }

  const claimed = count ?? 0;
  return NextResponse.json({
    claimed,
    total: LIFETIME_SEAT_LIMIT,
    available: Math.max(0, LIFETIME_SEAT_LIMIT - claimed),
    isSoldOut: claimed >= LIFETIME_SEAT_LIMIT,
  });
}
