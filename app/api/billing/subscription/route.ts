import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { PLANS, TRIAL_LINK_LIMIT, type PlanId } from "@/lib/polar";

/**
 * GET /api/billing/subscription
 *
 * Returns the authenticated user's current plan, billing state, and
 * trial status. Data comes from the profiles table (written by the Polar webhook).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan, polar_subscription_id, polar_current_period_end")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const planId = (profile.plan ?? "creator_trial") as PlanId;
  const plan = PLANS[planId] ?? PLANS.creator_trial;

  // Count links so the client can show trial progress without a separate call
  let trialLinksUsed = 0;
  if (planId === "creator_trial") {
    const { count } = await supabase
      .from("deep_links")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    trialLinksUsed = count ?? 0;
  }

  return NextResponse.json({
    planId,
    plan,
    subscriptionId: profile.polar_subscription_id,
    currentPeriodEnd: profile.polar_current_period_end,
    isActive: !!profile.polar_subscription_id || planId === "lifetime",
    isTrial: planId === "creator_trial",
    trialLinksUsed,
    trialLinkLimit: TRIAL_LINK_LIMIT,
  });
}
