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
  // All blog content is now published as MDX files in content/blog/posts/
  // and loaded via getAllMdxPosts() in app/(public)/blog/page.tsx.
  // Add future "Coming soon" placeholder cards here if needed.
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
  {
    rank: "01",
    title: "How to Create Instagram Deep Links That Actually Work",
    meta: "Tutorial Â· 8 min read",
    slug: "how-to-create-instagram-deep-links",
  },
  {
    rank: "02",
    title: "TikTok Deep Links: Bypass the In-App Browser",
    meta: "Tutorial Â· 9 min read",
    slug: "how-to-create-tiktok-deep-links",
  },
  {
    rank: "03",
    title: "WhatsApp Deep Links: The Complete wa.me Guide",
    meta: "Tutorial Â· 7 min read",
    slug: "whatsapp-deep-links-complete-guide",
  },
  {
    rank: "04",
    title: "iOS Universal Links: Complete Setup Guide",
    meta: "Engineering Â· 11 min read",
    slug: "ios-universal-links-complete-guide",
  },
];

export const popularPosts = [
  {
    rank: "A",
    title: "Link-in-Bio Conversion Strategy: 2.5Ã— Higher Conversions",
    meta: "Growth Â· 8 min read",
    slug: "link-in-bio-conversion-strategy",
  },
  {
    rank: "B",
    title: "UTM vs Smart Attribution: Why Mobile Loses 60% of Data",
    meta: "Case Study Â· 9 min read",
    slug: "utm-vs-smart-attribution",
  },
  {
    rank: "C",
    title: "Android App Links: Eliminate the 'Open With' Dialog",
    meta: "Engineering Â· 10 min read",
    slug: "android-app-links-setup-guide",
  },
];
