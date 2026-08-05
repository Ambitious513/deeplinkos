/**
 * Polar.sh integration for DeepLinkOS billing.
 *
 * Plan structure:
 *   creator_trial  — auto-assigned on signup, 3 free links, no CC required
 *   creator        — $29/mo, 30-day free trial on first subscribe
 *   scale          — $79/mo
 *   enterprise     — $199/mo
 *   lifetime       — $799 one-time, limited to 500 spots
 *
 * Env vars required:
 *   POLAR_WEBHOOK_SECRET            — from Polar dashboard → Webhooks
 *   POLAR_CHECKOUT_URL_CREATOR      — static Polar checkout URL (Creator)
 *   POLAR_CHECKOUT_URL_SCALE        — static Polar checkout URL (Scale)
 *   POLAR_CHECKOUT_URL_ENTERPRISE   — static Polar checkout URL (Enterprise)
 *   POLAR_CHECKOUT_URL_LIFETIME     — static Polar checkout URL (Lifetime)
 *   POLAR_PRODUCT_ID_CREATOR        — Polar product ID for Creator
 *   POLAR_PRODUCT_ID_SCALE          — Polar product ID for Scale
 *   POLAR_PRODUCT_ID_ENTERPRISE     — Polar product ID for Enterprise
 *   POLAR_PRODUCT_ID_LIFETIME       — Polar product ID for Lifetime
 *   POLAR_PORTAL_URL                — Polar customer portal URL
 *   LIFETIME_PLAN_LIMIT             — max lifetime seats (default: 500)
 */

// ── Plan IDs ──────────────────────────────────────────────────────────────────

export type PlanId = "creator_trial" | "creator" | "scale" | "enterprise" | "lifetime";

/** Plans the user can subscribe to (excludes the auto-assigned trial) */
export type PaidPlanId = Exclude<PlanId, "creator_trial">;

// ── Free trial limits ─────────────────────────────────────────────────────────

export const TRIAL_LINK_LIMIT = 3; // links allowed before CC is required
export const LIFETIME_SEAT_LIMIT = parseInt(process.env.LIFETIME_PLAN_LIMIT ?? "500", 10);

// ── Plan definitions ──────────────────────────────────────────────────────────

export type PlanDef = {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  priceMonthly: number;
  isOneTime: boolean;
  trialDays: number;
  clicks: number | null;
  links: number | null;
  domains: number;
  features: string[];
  /** Whether this plan unlocks all gated features */
  isPaid: boolean;
};

export const PLANS: Record<PlanId, PlanDef> = {
  creator_trial: {
    id: "creator_trial",
    name: "Creator",
    tagline: "Free trial — no credit card needed",
    price: "Free",
    priceMonthly: 0,
    isOneTime: false,
    trialDays: 30,
    clicks: 50_000,
    links: TRIAL_LINK_LIMIT,
    domains: 1,
    isPaid: false,
    features: [
      `${TRIAL_LINK_LIMIT} smart links (free trial)`,
      "50,000 clicks / month",
      "1 custom domain",
      "QR code generator",
      "Smart IAB routing",
      "Basic analytics",
    ],
  },

  creator: {
    id: "creator",
    name: "Creator",
    tagline: "Perfect for content creators & influencers",
    price: "$29 / month",
    priceMonthly: 29,
    isOneTime: false,
    trialDays: 30,
    clicks: 50_000,
    links: 250,
    domains: 3,
    isPaid: true,
    features: [
      "250 smart links",
      "50,000 clicks / month",
      "3 custom domains",
      "Smart IAB routing",
      "Advanced analytics",
      "Password-protected links",
      "Link expiration",
      "UTM builder",
      "QR code generator",
    ],
  },

  scale: {
    id: "scale",
    name: "Scale",
    tagline: "For growing brands & marketing teams",
    price: "$79 / month",
    priceMonthly: 79,
    isOneTime: false,
    trialDays: 30,
    clicks: 500_000,
    links: 1_000,
    domains: 10,
    isPaid: true,
    features: [
      "1,000 smart links",
      "500,000 clicks / month",
      "10 custom domains",
      "Everything in Creator",
      "A/B split testing",
      "Pixel integrations (Meta, TikTok, GA4)",
      "Priority support",
      "Team members (coming soon)",
    ],
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Unlimited power for agencies & large teams",
    price: "$199 / month",
    priceMonthly: 199,
    isOneTime: false,
    trialDays: 30,
    clicks: null, // unlimited
    links: null,  // unlimited
    domains: 25,
    isPaid: true,
    features: [
      "Unlimited smart links",
      "Unlimited clicks",
      "25 custom domains",
      "Everything in Scale",
      "White-label reports",
      "Dedicated account manager",
      "Custom integrations",
      "SLA uptime guarantee",
    ],
  },

  lifetime: {
    id: "lifetime",
    name: "Lifetime",
    tagline: "Pay once. Yours forever. Limited to 500 seats.",
    price: "$799",
    priceMonthly: 0,
    isOneTime: true,
    trialDays: 0,
    clicks: null, // unlimited
    links: null,  // unlimited
    domains: 15,
    isPaid: true,
    features: [
      "Unlimited smart links — forever",
      "Unlimited clicks — forever",
      "15 custom domains",
      "Everything in Scale",
      "All future updates included",
      "No recurring payments — ever",
      "Priority support for life",
      "Founding member badge",
    ],
  },
};

/** Ordered list for pricing page display */
export const PRICING_PLAN_ORDER: PaidPlanId[] = ["creator", "scale", "enterprise", "lifetime"];

// ── Plan gating helpers ───────────────────────────────────────────────────────

/**
 * Returns true if the user is on the free trial AND has reached the 3-link limit.
 * Used by the link creation API to gate further link creation.
 */
export function isTrialLinkLimitReached(planId: PlanId, currentLinkCount: number): boolean {
  return planId === "creator_trial" && currentLinkCount >= TRIAL_LINK_LIMIT;
}

/**
 * Returns the link limit for a given plan.
 * null = unlimited.
 */
export function getLinkLimit(planId: PlanId): number | null {
  return PLANS[planId].links;
}

// ── Checkout URL builder ──────────────────────────────────────────────────────

const CHECKOUT_ENV_KEYS: Partial<Record<PaidPlanId, string>> = {
  creator:    "POLAR_CHECKOUT_URL_CREATOR",
  scale:      "POLAR_CHECKOUT_URL_SCALE",
  enterprise: "POLAR_CHECKOUT_URL_ENTERPRISE",
  lifetime:   "POLAR_CHECKOUT_URL_LIFETIME",
};

/**
 * Builds a Polar checkout URL prefilled with the customer's email.
 * Returns null if the env var is not configured.
 */
export function buildCheckoutUrl(plan: PaidPlanId, customerEmail: string): string | null {
  const envKey = CHECKOUT_ENV_KEYS[plan];
  if (!envKey) return null;
  const base = process.env[envKey];
  if (!base) return null;

  try {
    const url = new URL(base);
    url.searchParams.set("customer_email", customerEmail);
    return url.toString();
  } catch {
    return base;
  }
}

/** Polar customer portal URL — for managing/canceling subscriptions & downloading invoices. */
export function getPortalUrl(): string {
  return process.env.POLAR_PORTAL_URL ?? "https://polar.sh";
}

// ── Webhook signature verification ────────────────────────────────────────────
// Polar uses Standard Webhooks (standardwebhooks.com).
// Signed message = "{webhook-id}.{webhook-timestamp}.{raw-body}"

export async function verifyPolarWebhook(
  rawBody: string,
  webhookId: string,
  webhookTimestamp: string,
  signatureHeader: string,
): Promise<boolean> {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) return false;

  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;

  try {
    const encoder = new TextEncoder();
    const keyMaterial = Uint8Array.from(atob(rawSecret), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const toSign = `${webhookId}.${webhookTimestamp}.${rawBody}`;
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(toSign));
    const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    const providedSignatures = signatureHeader
      .split(" ")
      .map((s) => s.replace(/^v\d+,/, "").trim());

    return providedSignatures.some((sig) => sig === computedSignature);
  } catch {
    return false;
  }
}

// ── Webhook event types ───────────────────────────────────────────────────────

export type PolarEventType =
  | "subscription.created"
  | "subscription.updated"
  | "subscription.revoked"
  | "subscription.active"
  | "subscription.canceled"
  | "order.created";

export type PolarWebhookPayload = {
  type: PolarEventType;
  data: {
    id: string;
    status: "active" | "canceled" | "incomplete" | "past_due" | "unpaid" | "free";
    customer_id: string;
    customer_email?: string;
    product_id: string;
    product?: { name: string };
    current_period_end?: string | null;
    cancel_at_period_end?: boolean;
  };
};

/**
 * Maps a Polar product_id to our internal PlanId.
 * Falls back to "creator_trial" if unrecognised.
 */
export function planForProductId(productId: string): PlanId {
  if (productId === process.env.POLAR_PRODUCT_ID_LIFETIME)   return "lifetime";
  if (productId === process.env.POLAR_PRODUCT_ID_ENTERPRISE) return "enterprise";
  if (productId === process.env.POLAR_PRODUCT_ID_SCALE)      return "scale";
  if (productId === process.env.POLAR_PRODUCT_ID_CREATOR)    return "creator";
  return "creator_trial";
}
