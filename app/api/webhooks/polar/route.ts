import { NextResponse } from "next/server";

import { createTrackingClient } from "@/lib/supabase/tracking";
import {
  verifyPolarWebhook,
  planForProductId,
  LIFETIME_SEAT_LIMIT,
  type PolarWebhookPayload,
} from "@/lib/polar";

/**
 * POST /api/webhooks/polar
 *
 * Handles Polar.sh subscription and order events.
 * Register this URL in Polar dashboard → Webhooks:
 *   https://your-domain.com/api/webhooks/polar
 *
 * Events handled:
 *   subscription.created / updated / active  → upgrade plan
 *   subscription.canceled                    → mark cancel_at_period_end
 *   subscription.revoked                     → downgrade to creator_trial
 *   order.created (lifetime product)         → grant lifetime plan
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  // ── Require POLAR_WEBHOOK_SECRET — hard-fail if not configured ──────────────
  // In dev without a live Polar tunnel, test by setting POLAR_WEBHOOK_SECRET
  // to any string and signing requests manually, or use the Polar CLI.
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error(
      "[polar-webhook] POLAR_WEBHOOK_SECRET is not set. " +
      "All webhook requests are rejected to prevent unauthorized plan changes. " +
      "Set this variable in your VPS environment."
    );
    return NextResponse.json(
      { error: "Webhook not configured — contact support" },
      { status: 503 }
    );
  }

  // ── Verify Standard Webhooks signature ────────────────────────────────────
  const webhookId        = request.headers.get("webhook-id") ?? "";
  const webhookTimestamp = request.headers.get("webhook-timestamp") ?? "";
  const signatureHeader  = request.headers.get("webhook-signature") ?? "";

  if (!webhookId || !webhookTimestamp || !signatureHeader) {
    return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
  }

  const isValid = await verifyPolarWebhook(rawBody, webhookId, webhookTimestamp, signatureHeader);
  if (!isValid) {
    console.error("[polar-webhook] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // ── Parse payload ───────────────────────────────────────────────────────────
  let payload: PolarWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as PolarWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data } = payload;
  const customerEmail = data.customer_email ?? "";
  console.info(`[polar-webhook] ${type} | ${customerEmail || data.customer_id}`);

  const db = createTrackingClient(); // service-role client, bypasses RLS

  try {
    switch (type) {
      // ── Active subscriptions ──────────────────────────────────────────────
      case "subscription.created":
      case "subscription.updated":
      case "subscription.active": {
        if (data.status !== "active") break; // wait for active event

        const plan = planForProductId(data.product_id);

        const { data: upgradedRows } = await db
          .from("profiles")
          .update({
            plan,
            polar_subscription_id: data.id,
            polar_customer_id: data.customer_id,
            polar_current_period_end: data.current_period_end ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("email", customerEmail)
          .select("id");

        if (!upgradedRows || upgradedRows.length === 0) {
          console.error(
            `[polar-webhook] CRITICAL: plan upgrade matched 0 profiles for email=${customerEmail}. ` +
            `Customer paid but plan was NOT updated. Manual intervention required. ` +
            `subscription_id=${data.id} product_id=${data.product_id}`
          );
        } else {
          console.info(`[polar-webhook] ✅ Upgraded ${customerEmail} → ${plan}`);
        }
        break;
      }

      // ── Canceled (still active until period end) ──────────────────────────
      case "subscription.canceled": {
        await db
          .from("profiles")
          .update({
            polar_current_period_end: data.current_period_end ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("polar_subscription_id", data.id);

        console.info(`[polar-webhook] ⚠️ Canceled — active until ${data.current_period_end}`);
        break;
      }

      // ── Revoked — subscription fully ended ────────────────────────────────
      case "subscription.revoked": {
        await db
          .from("profiles")
          .update({
            plan: "creator_trial",
            polar_subscription_id: null,
            polar_current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("polar_subscription_id", data.id);

        console.info(`[polar-webhook] ❌ Revoked — downgraded to creator_trial`);
        break;
      }

      // ── One-time order (Lifetime plan) ────────────────────────────────────
      case "order.created": {
        const plan = planForProductId(data.product_id);
        if (plan !== "lifetime") {
          console.info(`[polar-webhook] order.created for non-lifetime product — ignored`);
          break;
        }

        // Enforce 500-seat limit — count current lifetime holders
        const { count: lifetimeCount } = await db
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("plan", "lifetime");

        if ((lifetimeCount ?? 0) >= LIFETIME_SEAT_LIMIT) {
          // This shouldn't happen if Polar product stock is set correctly,
          // but we log it for manual review.
          console.error(`[polar-webhook] ⚠️ Lifetime seat limit (${LIFETIME_SEAT_LIMIT}) reached — contact support`);
          // Still acknowledge to avoid Polar retrying
          break;
        }

        const { data: grantedRows } = await db
          .from("profiles")
          .update({
            plan: "lifetime",
            polar_customer_id: data.customer_id,
            polar_subscription_id: null,
            polar_current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("email", customerEmail)
          .select("id");

        if (!grantedRows || grantedRows.length === 0) {
          console.error(
            `[polar-webhook] CRITICAL: lifetime grant matched 0 profiles for email=${customerEmail}. ` +
            `Customer paid $799 but Lifetime plan was NOT assigned. Manual intervention required. ` +
            `customer_id=${data.customer_id} product_id=${data.product_id}`
          );
        } else {
          console.info(`[polar-webhook] 🎉 Lifetime granted to ${customerEmail} (${(lifetimeCount ?? 0) + 1}/${LIFETIME_SEAT_LIMIT})`);
        }
        break;
      }

      default:
        console.info(`[polar-webhook] Unhandled event: ${type}`);
    }
  } catch (err) {
    console.error("[polar-webhook] DB update failed:", err);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
