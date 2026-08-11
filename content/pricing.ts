/**
 * content/pricing.ts
 *
 * Single source of truth for public pricing page content.
 * Prices and features are kept in sync with lib/polar.ts.
 * When updating pricing, update lib/polar.ts first, then mirror here.
 */

// ─── Plan cards ───────────────────────────────────────────────────────────────

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  suffix: string;
  tagline: string;
  cta: string;
  href: string;
  highlighted?: boolean;
  badge?: string;
  isOneTime?: boolean;
  features: Array<{ label: string; highlighted?: boolean }>;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "creator_trial",
    name: "Starter",
    price: "Free",
    suffix: "",
    tagline: "Always free. No credit card, no expiry.",
    cta: "Start free",
    href: "/signup",
    features: [
      { label: "3 smart links", highlighted: true },
      { label: "50,000 clicks / month" },
      { label: "1 custom domain" },
      { label: "Smart IAB routing (iOS & Android)" },
      { label: "QR code generator" },
      { label: "Basic analytics" },
      { label: "PII-free privacy protection" },
    ],
  },
  {
    id: "creator",
    name: "Creator",
    price: "$29",
    suffix: "/mo",
    tagline: "For content creators & influencers who want full control.",
    cta: "Start 30-day free trial",
    href: "/signup?plan=creator",
    features: [
      { label: "250 smart links", highlighted: true },
      { label: "50,000 clicks / month" },
      { label: "3 custom domains" },
      { label: "Smart IAB routing" },
      { label: "Advanced analytics" },
      { label: "Password-protected links" },
      { label: "Link expiration" },
      { label: "UTM builder" },
      { label: "QR code generator" },
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: "$79",
    suffix: "/mo",
    tagline: "For growing brands & marketing teams.",
    cta: "Start 30-day free trial",
    href: "/signup?plan=scale",
    highlighted: true,
    badge: "Most Popular",
    features: [
      { label: "1,000 smart links", highlighted: true },
      { label: "500,000 clicks / month", highlighted: true },
      { label: "10 custom domains" },
      { label: "Everything in Creator" },
      { label: "A/B split testing" },
      { label: "Pixel integrations (Meta, TikTok, GA4)" },
      { label: "Priority support" },
      { label: "Team members (coming soon)" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$199",
    suffix: "/mo",
    tagline: "Unlimited power for agencies & large teams.",
    cta: "Start 30-day free trial",
    href: "/signup?plan=enterprise",
    features: [
      { label: "Unlimited smart links", highlighted: true },
      { label: "Unlimited clicks", highlighted: true },
      { label: "25 custom domains" },
      { label: "Everything in Scale" },
      { label: "White-label reports" },
      { label: "Dedicated account manager" },
      { label: "Custom integrations" },
      { label: "SLA uptime guarantee" },
    ],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "$799",
    suffix: "",
    tagline: "Pay once. Yours forever. Limited to 500 founding seats.",
    cta: "Claim lifetime access",
    href: "/signup?plan=lifetime",
    isOneTime: true,
    badge: "Limited — 500 seats",
    features: [
      { label: "Unlimited smart links — forever", highlighted: true },
      { label: "Unlimited clicks — forever", highlighted: true },
      { label: "15 custom domains" },
      { label: "Everything in Scale" },
      { label: "All future updates included" },
      { label: "No recurring payments — ever", highlighted: true },
      { label: "Priority support for life" },
      { label: "Founding member badge" },
    ],
  },
];

// ─── Feature comparison table ─────────────────────────────────────────────────

export type ComparisonRow = {
  feature: string;
  trial: string | boolean;
  creator: string | boolean;
  scale: string | boolean;
  enterprise: string | boolean;
};

export type ComparisonGroup = {
  title: string;
  rows: ComparisonRow[];
};

export const comparisonGroups: ComparisonGroup[] = [
  {
    title: "Links & Routing",
    rows: [
      { feature: "Smart links",                          trial: "3 (trial)",  creator: "250",       scale: "1,000",     enterprise: "Unlimited" },
      { feature: "Monthly clicks",                       trial: "50,000",     creator: "50,000",    scale: "500,000",   enterprise: "Unlimited" },
      { feature: "iOS & Android deep linking",           trial: true,         creator: true,         scale: true,       enterprise: true },
      { feature: "Smart IAB routing (no page flash)",    trial: true,         creator: true,         scale: true,       enterprise: true },
      { feature: "App Store / Play Store fallback",      trial: true,         creator: true,         scale: true,       enterprise: true },
      { feature: "Auto app-scheme detection",            trial: true,         creator: true,         scale: true,       enterprise: true },
      { feature: "Link expiration & scheduling",         trial: false,        creator: true,         scale: true,       enterprise: true },
      { feature: "Password-protected links",             trial: false,        creator: true,         scale: true,       enterprise: true },
      { feature: "A/B split testing",                   trial: false,        creator: false,        scale: true,       enterprise: true },
    ],
  },
  {
    title: "Branding & Domains",
    rows: [
      { feature: "Custom domains",                       trial: "1",          creator: "3",          scale: "10",       enterprise: "25" },
      { feature: "QR code generator",                   trial: true,         creator: true,          scale: true,       enterprise: true },
      { feature: "UTM campaign builder",                 trial: false,        creator: true,          scale: true,       enterprise: true },
    ],
  },
  {
    title: "Analytics & Privacy",
    rows: [
      { feature: "PII-free IP anonymization",            trial: true,         creator: true,          scale: true,       enterprise: true },
      { feature: "Bot & prefetch filtering",             trial: true,         creator: true,          scale: true,       enterprise: true },
      { feature: "Device, browser & country analytics",  trial: true,         creator: true,          scale: true,       enterprise: true },
      { feature: "Referrer & UTM attribution",           trial: true,         creator: true,          scale: true,       enterprise: true },
      { feature: "Pixel integrations (Meta, TikTok)",   trial: false,        creator: false,         scale: true,       enterprise: true },
      { feature: "White-label reports",                  trial: false,        creator: false,         scale: false,      enterprise: true },
    ],
  },
  {
    title: "Support & Team",
    rows: [
      { feature: "Community support",                    trial: true,         creator: true,          scale: true,       enterprise: true },
      { feature: "Priority support",                     trial: false,        creator: false,         scale: true,       enterprise: true },
      { feature: "Dedicated account manager",            trial: false,        creator: false,         scale: false,      enterprise: true },
      { feature: "Team members",                         trial: "1",          creator: "1",           scale: "Coming soon", enterprise: "Unlimited" },
      { feature: "Custom integrations",                  trial: false,        creator: false,         scale: false,      enterprise: true },
      { feature: "SLA uptime guarantee",                 trial: false,        creator: false,         scale: false,      enterprise: true },
    ],
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export const pricingFaqs = [
  {
    question: "Do I need a credit card to start?",
    answer:
      "No. Sign up and create your first 3 smart links completely free — no payment details needed. Every paid plan also includes a 30-day free trial before your card is charged.",
  },
  {
    question: "What happens to my links if I cancel?",
    answer:
      "Your links never break. They continue to route visitors to the fallback URL indefinitely. Dashboard access and analytics revert to the free trial limits.",
  },
  {
    question: "Do you charge per click like URLgenius?",
    answer:
      "Never. We charge flat monthly rates regardless of click volume. Whether your post gets 100 clicks or 500,000, your plan price never changes.",
  },
  {
    question: "What is the Lifetime plan?",
    answer:
      "A one-time payment of $799 gives you Scale-level features forever — no subscription, no monthly bills, all future updates included. Limited to 500 founding members.",
  },
  {
    question: "Can I connect my own branded domain?",
    answer:
      "Yes. Creator gets 3 custom domains, Scale gets 10, Enterprise gets 25. Your links become go.yourbrand.com/... instead of deeplinkos.com/r/... for maximum trust.",
  },
  {
    question: "What is Smart IAB routing?",
    answer:
      "When someone clicks your link inside Instagram, TikTok, or another in-app browser, our system automatically redirects them directly to the native app (YouTube, Spotify, etc.) using intent:// URIs on Android and URI schemes on iOS — no visible interstitial page.",
  },
];
