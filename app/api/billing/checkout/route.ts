import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { buildCheckoutUrl, getPortalUrl, type PaidPlanId } from "@/lib/polar";

const VALID_PLANS: PaidPlanId[] = ["creator", "scale", "enterprise", "lifetime"];

/**
 * POST /api/billing/checkout
 * Body: { plan: "creator" | "scale" | "enterprise" | "lifetime" }
 *
 * Returns a Polar checkout URL prefilled with the user's email.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let plan: PaidPlanId;
  try {
    const body = await request.json();
    if (!VALID_PLANS.includes(body.plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    plan = body.plan;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const checkoutUrl = buildCheckoutUrl(plan, user.email);

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "Checkout not configured. Set the POLAR_CHECKOUT_URL_* environment variables." },
      { status: 503 },
    );
  }

  return NextResponse.json({ url: checkoutUrl });
}

/**
 * GET /api/billing/checkout
 * Returns the Polar customer portal URL for managing subscriptions.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ url: getPortalUrl() });
}
