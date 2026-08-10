export type BlogCategory = "all" | "growth" | "engineering" | "tutorials" | "tools" | "deals";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Exclude<BlogCategory, "all">;
  categoryLabel: string;
  visual: Exclude<BlogCategory, "all">;
  tags: Array<{ label: string; tone?: "blue" | "coral" | "gold" | "violet" }>;
  author: string;
  readTime: string;
  publishedAt: string;
  searchTerms: string[];
  seoTitle: string;
  seoDescription: string;
  image?: string | null;
};

export type PartnerCard = {
  id: string;
  href: string;
  eyebrow: string;
  brand: string;
  title: string;
  description: string;
  mediaTone: "seo" | "social" | "email" | "analytics" | "design" | "automation";
  tags: Array<{ label: string; tone?: "blue" | "coral" | "gold" | "violet" }>;
  meta: string[];
  cta: string;
};

export const blogCategories: Array<{ id: BlogCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "growth", label: "Creator Growth" },
  { id: "engineering", label: "Tracking Setup" },
  { id: "tutorials", label: "Playbooks" },
  { id: "tools", label: "Free Tools" },
  { id: "deals", label: "Deals" },
];

export const blogPosts: BlogPost[] = [
  {
    id: "post_creator_funnel",
    slug: "perfect-creator-deep-link",
    title: "The anatomy of a high-converting creator funnel: what top TikTok accounts do differently",
    excerpt:
      "We audited 200 creator accounts across TikTok, Instagram, and YouTube to find the patterns behind stronger tap-to-conversion rates.",
    category: "growth",
    categoryLabel: "Growth",
    visual: "growth",
    tags: [{ label: "Growth" }, { label: "Case Study", tone: "blue" }],
    author: "Sarah R.",
    readTime: "11 min read",
    publishedAt: "2026-06-02",
    searchTerms: ["tiktok", "creator funnel", "link bio", "conversion rate", "audience", "smart link"],
    seoTitle: "High-Converting Creator Funnel Playbook | DeepLinkOS",
    seoDescription: "Learn how top creator funnels turn social clicks into app opens, leads, and sales.",
  },
  {
    id: "post_smart_links_redirects",
    slug: "native-deep-links-vs-redirects",
    title: "Why smart links beat slow redirect chains for mobile campaigns",
    excerpt:
      "A practical look at link resolution latency across iOS and Android, including where redirects quietly break conversion.",
    category: "engineering",
    categoryLabel: "Engineering",
    visual: "engineering",
    tags: [{ label: "Engineering", tone: "blue" }],
    author: "Dev Team",
    readTime: "9 min read",
    publishedAt: "2026-05-29",
    searchTerms: ["ios universal links", "smart links", "mobile campaign", "redirects", "latency"],
    seoTitle: "Smart Links vs Redirect Chains for Mobile Campaigns | DeepLinkOS",
    seoDescription: "Compare smart links and redirect chains for mobile campaign routing across iOS and Android.",
  },
  {
    id: "post_attribution_utm",
    slug: "smart-attribution-vs-utm",
    title: "UTM vs smart attribution: what founders and marketers actually need to know",
    excerpt:
      "A practical breakdown of the moments UTM parameters miss, and how campaign-level attribution fills in the gaps.",
    category: "growth",
    categoryLabel: "Attribution",
    visual: "growth",
    tags: [{ label: "Strategy", tone: "gold" }],
    author: "Alix L.",
    readTime: "6 min read",
    publishedAt: "2026-05-22",
    searchTerms: ["utm", "analytics", "tracking", "attribution", "campaign links"],
    seoTitle: "UTM vs Smart Attribution for Growth Campaigns | DeepLinkOS",
    seoDescription: "Understand where UTM tracking stops and how smart attribution helps teams measure clicks.",
  },
  {
    id: "post_youtube_whatsapp",
    slug: "youtube-whatsapp-app-one-link",
    title: "YouTube to WhatsApp to app: one link for every audience path",
    excerpt:
      "Create a multi-platform smart link that detects device, app availability, and the best destination for each visitor.",
    category: "tutorials",
    categoryLabel: "Tutorial",
    visual: "tutorials",
    tags: [{ label: "Tutorial", tone: "gold" }],
    author: "Mark T.",
    readTime: "4 min read",
    publishedAt: "2026-05-18",
    searchTerms: ["setup guide", "walkthrough", "youtube", "whatsapp", "telegram", "app", "smart link"],
    seoTitle: "One Smart Link for YouTube, WhatsApp, and App Campaigns | DeepLinkOS",
    seoDescription: "Build one smart link that routes YouTube, WhatsApp, and app visitors to the right destination.",
  },
  {
    id: "post_free_qr",
    slug: "free-qr-code-generator-deep-link-fallbacks",
    title: "Free QR code generator with smart fallback destinations",
    excerpt:
      "Download a QR template kit built to send shoppers, event visitors, and subscribers to the right destination.",
    category: "tools",
    categoryLabel: "Free tool",
    visual: "tools",
    tags: [{ label: "Free Tool", tone: "violet" }],
    author: "Design",
    readTime: "Free",
    publishedAt: "2026-05-14",
    searchTerms: ["qr code generator", "free tool", "brand", "deep link", "fallback"],
    seoTitle: "Free QR Code Generator With Smart Fallbacks | DeepLinkOS",
    seoDescription: "Generate QR codes with mobile-friendly fallback destinations for campaigns and events.",
  },
  {
    id: "post_agency_workflow",
    slug: "agency-campaign-workflow",
    title: "How a 3-person agency manages campaigns for 24 ecommerce clients",
    excerpt:
      "The workflow, templates, and quality checks Bloom Agency uses to run large-scale campaigns across Shopify, WooCommerce, and custom apps.",
    category: "growth",
    categoryLabel: "Agency",
    visual: "growth",
    tags: [{ label: "Case Study", tone: "blue" }, { label: "Strategy", tone: "gold" }],
    author: "Bloom Agency",
    readTime: "14 min read",
    publishedAt: "2026-05-09",
    searchTerms: ["agency", "ecommerce", "shopify", "campaign links", "branding", "client workflow"],
    seoTitle: "Agency Campaign Workflow for Ecommerce Clients | DeepLinkOS",
    seoDescription: "See how a small agency manages smart links, attribution, and campaigns for ecommerce clients.",
  },
  {
    id: "post_android_intents",
    slug: "android-intent-filters-uri-schemes",
    title: "Android intent filters vs URI schemes: when technical setup affects growth",
    excerpt:
      "Stop guessing which mobile link format works. This guide compares the spec with real-device test results.",
    category: "engineering",
    categoryLabel: "Android",
    visual: "engineering",
    tags: [{ label: "Engineering", tone: "blue" }],
    author: "Ryan T.",
    readTime: "12 min read",
    publishedAt: "2026-05-05",
    searchTerms: ["android intent filter", "custom scheme", "fallback uri", "guide"],
    seoTitle: "Android Intent Filters vs URI Schemes | DeepLinkOS",
    seoDescription: "Compare Android intent filters and URI schemes for campaign routing and mobile growth.",
  },
  {
    id: "post_hypefury_deal",
    slug: "hypefury-deeplinkos-template",
    title: "40% off Hypefury plus a free campaign link template",
    excerpt:
      "A reader deal for teams scheduling Twitter/X threads with smart links that preserve attribution from post to conversion.",
    category: "deals",
    categoryLabel: "Partner deal",
    visual: "deals",
    tags: [{ label: "Partner Deal", tone: "coral" }],
    author: "Partnerships",
    readTime: "Deal",
    publishedAt: "2026-04-28",
    searchTerms: ["partner", "affiliate tool", "discount offer", "hypefury", "template", "twitter", "x"],
    seoTitle: "Hypefury Campaign Link Template Deal | DeepLinkOS",
    seoDescription: "A partner template for scheduling social posts with smart links and preserved attribution.",
  },
];

export const partnerCards: PartnerCard[] = [
  {
    id: "semrush",
    href: "/partners/semrush",
    eyebrow: "Partner deal",
    brand: "SEMrush",
    title: "SEMrush growth suite for campaign research",
    description:
      "Keyword, competitor, and content gap research for teams planning creator pages, partner pages, and intent-led campaigns.",
    mediaTone: "seo",
    tags: [{ label: "SEO", tone: "gold" }, { label: "Affiliate", tone: "blue" }],
    meta: ["Growth teams", "Research"],
    cta: "View partner offer",
  },
  {
    id: "hypefury",
    href: "/partners/hypefury",
    eyebrow: "Creator workflow",
    brand: "Hypefury",
    title: "Schedule creator posts with smart-link templates",
    description:
      "Plan threads, repurpose posts, and attach campaign links that preserve attribution from social click to app open.",
    mediaTone: "social",
    tags: [{ label: "Social", tone: "violet" }, { label: "Deal", tone: "coral" }],
    meta: ["Creators", "Scheduling"],
    cta: "Get the template",
  },
  {
    id: "kit",
    href: "/partners/convertkit",
    eyebrow: "Email growth",
    brand: "Kit",
    title: "Email campaigns that route subscribers to the right app path",
    description:
      "Build creator newsletters, product drips, and launch sequences with links that adapt by device and destination.",
    mediaTone: "email",
    tags: [{ label: "Lifecycle" }, { label: "Recommended", tone: "blue" }],
    meta: ["Email", "Automation"],
    cta: "Explore setup",
  },
  {
    id: "hotjar",
    href: "/partners/hotjar",
    eyebrow: "Analytics",
    brand: "Hotjar",
    title: "Find where mobile visitors hesitate before converting",
    description:
      "Use recordings and heatmaps to spot broken landing paths, confusing CTAs, and link-in-bio friction.",
    mediaTone: "analytics",
    tags: [{ label: "UX", tone: "coral" }, { label: "Insight", tone: "gold" }],
    meta: ["UX audit", "Funnels"],
    cta: "Audit the flow",
  },
  {
    id: "framer",
    href: "/partners/framer",
    eyebrow: "Landing pages",
    brand: "Framer",
    title: "Launch fast campaign pages for every partner channel",
    description:
      "Create lightweight pages for QR campaigns, creator drops, and paid tests without slowing the growth team down.",
    mediaTone: "design",
    tags: [{ label: "Design", tone: "violet" }, { label: "Pages", tone: "blue" }],
    meta: ["No-code", "Landing pages"],
    cta: "See page kit",
  },
  {
    id: "zapier",
    href: "/partners/zapier",
    eyebrow: "Automation",
    brand: "Zapier",
    title: "Send high-intent clicks into your CRM and reporting stack",
    description:
      "Trigger alerts, update sheets, enrich leads, and route campaign data without adding engineering work.",
    mediaTone: "automation",
    tags: [{ label: "Ops" }, { label: "Workflow", tone: "gold" }],
    meta: ["Ops", "Attribution"],
    cta: "Build automation",
  },
];

export const blogTopics = [
  "Creator Funnels",
  "Ecommerce",
  "Mobile UX",
  "UTM Tracking",
  "Smart Links",
  "QR Codes",
  "Link-in-Bio",
  "Attribution",
  "Shopify",
  "Landing Pages",
];

export const trendingPosts = [
  { rank: "01", title: "The $0 creator funnel that beat our paid campaign", meta: "Case Study - 6 min read", slug: "zero-dollar-deep-link-strategy" },
  { rank: "02", title: "TikTok bio audit: 12 mistakes killing conversions", meta: "Growth - 4 min read", slug: "tiktok-bio-link-audit" },
  { rank: "03", title: "Build a campaign link in under 60 seconds", meta: "Tutorial - 3 min read", slug: "build-smart-link-60-seconds" },
  { rank: "04", title: "Why mobile visitors fall out of ecommerce funnels", meta: "Mobile UX - 7 min read", slug: "ios-universal-links-fix" },
];

export const popularPosts = [
  { rank: "A", title: "5 campaign patterns that scale to 1M clicks", meta: "Growth - 8 min read", slug: "deep-link-patterns-1m-clicks" },
  { rank: "B", title: "Smart links vs landing pages: when to use each", meta: "Strategy - 6 min read", slug: "universal-links-vs-deep-links" },
  { rank: "C", title: "Attribution windows explained for non-engineers", meta: "Strategy - 5 min read", slug: "attribution-windows-explained" },
];
