import type { Feature, Platform, PricingTeaser, Step, Testimonial } from "@/lib/types";

export const platforms: Platform[] = [
  {
    name: "YouTube",
    color: "#FF0000",
    scheme: "youtube://",
    icon: (
      <svg width="22" height="22" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <path d="M21 18.5 35 26 21 33.5V18.5Z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    color: "linear-gradient(135deg,#f9ce34,#ee2a7b 55%,#6228d7)",
    scheme: "instagram://",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="#fff" stroke="none" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    color: "#010101",
    scheme: "tiktok://",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 1 0 0 12.68 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07Z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    color: "#25D366",
    scheme: "wa.me/",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413Z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    color: "#1877F2",
    scheme: "fb://",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    color: "#229ED9",
    scheme: "tg://",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z" />
      </svg>
    ),
  },
  {
    name: "X / Twitter",
    color: "#000000",
    scheme: "twitter://",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.254 5.622 5.91-5.622Z" />
      </svg>
    ),
  },
  {
    name: "Google Maps",
    color: "#0F1C2E",
    scheme: "comgooglemaps://",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="#EA4335" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5Z" />
      </svg>
    ),
  },
];

export const steps: Step[] = [
  {
    label: "01",
    title: "Paste the link you already share",
    description:
      "Drop in a YouTube video, TikTok product, Instagram profile, WhatsApp chat, Telegram channel, Google Maps place, or any campaign URL.",
    gradient: "primary",
  },
  {
    label: "02",
    title: "DeepLinkOS builds the right route",
    description:
      "The platform is detected automatically. Smart paths are prepared for iOS, Android, desktop, installed apps, and fallback pages instantly.",
    gradient: "secondary",
  },
  {
    label: "03",
    title: "Share one link everywhere",
    description:
      "Use it in bios, posts, ads, email, and QR codes. The same link adapts to the clicker by opening the app directly, never just a browser tab.",
    gradient: "green",
  },
];

const featureIcons = {
  link: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13 19.07" />
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <rect x="7" y="11" width="3" height="5" rx="1" />
      <rect x="12" y="8" width="3" height="8" rx="1" />
      <rect x="17" y="4" width="3" height="12" rx="1" />
    </svg>
  ),
  target: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M22 12h-4M12 22v-4M2 12h4" />
    </svg>
  ),
  bolt: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" />
    </svg>
  ),
  lock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  globe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a13 13 0 0 1 0 18" />
      <path d="M12 3a13 13 0 0 0 0 18" />
    </svg>
  ),
};

export const features: Feature[] = [
  {
    title: "App-Opening Smart Links",
    description:
      "Route clicks to the native app when installed, with a clean web fallback when the app is missing. Zero code. Works in 60 seconds.",
    icon: featureIcons.link,
    tag: "Core Feature - Free",
    wide: true,
    hero: true,
  },
  {
    title: "Click Quality Analytics",
    description: "See platforms, devices, referrers, bot-filtered clicks, and whether users reached the intended route.",
    icon: featureIcons.chart,
    tag: "Analytics",
  },
  {
    title: "Creator & Seller Routing",
    description: "Send social traffic to shops, chats, videos, maps, and product pages with fewer wasted taps.",
    icon: featureIcons.target,
    tag: "Growth",
  },
  {
    title: "No-Code Setup",
    description: "Built for people who need links to work without SDKs, attribution teams, or enterprise onboarding.",
    icon: featureIcons.bolt,
    tag: "QR",
  },
  {
    title: "Safe Fallbacks & UTMs",
    description: "Choose what happens when an app is missing. Add UTM params, link expiry, and password protection.",
    icon: featureIcons.lock,
    tag: "Privacy",
  },
  {
    title: "Firebase Dynamic Links Alternative",
    description:
      "A lighter migration path for teams that needed smart links after Firebase Dynamic Links was shut down, without jumping to enterprise tools like Branch or AppsFlyer.",
    icon: featureIcons.globe,
    tag: "Pro Plan",
    wide: true,
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "I was sending everyone to a web page that opened inside Instagram's browser. Half the time they couldn't even check out. Switched to DeepLinkOS and my app opens directly now.",
    author: "Maya R.",
    handle: "@mayasells",
    role: "Shopify seller, 28K Instagram followers",
  },
  {
    quote:
      "My TikTok bio used to link to a Linktree. Now it links to DeepLinkOS and the same URL opens my app on iOS, my store on desktop, and WhatsApp on Android. One link for everything.",
    author: "Jordan K.",
    handle: "@jordancreates",
    role: "Content creator, TikTok & YouTube",
  },
  {
    quote:
      "We moved off Firebase Dynamic Links when it shut down and didn't want to pay for Branch. DeepLinkOS does everything we needed for our app campaigns without the enterprise pricing.",
    author: "Priya M.",
    handle: "@priyagrowth",
    role: "Head of Growth, early-stage startup",
  },
];

export const pricingTeasers: PricingTeaser[] = [
  {
    name: "Starter",
    price: "$0",
    suffix: "",
    description: "Always free. 3 smart links, 50,000 clicks/month, no credit card ever.",
    features: ["Smart IAB routing (iOS & Android)", "QR code generator", "1 custom domain", "Basic analytics"],
    cta: "Get Started Free",
  },
  {
    name: "Creator",
    price: "$29",
    suffix: "/mo",
    description: "250 smart links, advanced analytics & password-protected links.",
    features: ["250 smart links", "50,000 clicks/month", "3 custom domains", "30-day free trial"],
    highlighted: true,
    badge: "MOST POPULAR",
    cta: "Start Free Trial",
  },
  {
    name: "Scale",
    price: "$79",
    suffix: "/mo",
    description: "1,000 links, 500K clicks, A/B testing & pixel integrations.",
    features: ["1,000 smart links", "500,000 clicks/month", "10 custom domains", "30-day free trial"],
    cta: "Start Free Trial",
  },

];

