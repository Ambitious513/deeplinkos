import type { Metadata } from "next";
import NextTopLoader from 'nextjs-toploader';
import { GoogleOneTap } from "@/components/auth/google-one-tap";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://deeplinkos.com"
  ),
  title: {
    default:  "DeepLinkOS: Free Deep Link Generator for iOS, Android & Web",
    template: "%s | DeepLinkOS",
  },
  description:
    "Create smart deep links in seconds. Paste any YouTube, Instagram, TikTok, or WhatsApp URL. DeepLinkOS detects the platform automatically and generates a free deep link that opens the right app on iOS, Android, or desktop.",
  keywords: [
    "deep link generator", "free deep link generator", "smart link generator",
    "deep link creator", "create deep link", "app deep linking",
    "mobile deep linking", "iOS deep linking", "Android deep link",
    "deferred deep linking", "universal links", "deep link tool",
    "deeplink generator free",
  ],
  authors:  [{ name: "DeepLinkOS", url: "https://deeplinkos.com" }],
  creator:  "DeepLinkOS",
  manifest: "/manifest.webmanifest",
  icons: {
    icon:             [
      { url: "/icon.png",  sizes: "512x512", type: "image/png" },
    ],
    apple:            [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    shortcut:         "/icon.png",
  },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://deeplinkos.com",
    siteName:    "DeepLinkOS",
    title:       "DeepLinkOS: Free Deep Link Generator for iOS, Android & Web",
    description: "Paste one URL. DeepLinkOS detects the platform, generates the smart link, and routes users into the right app on iOS, Android, or desktop.",
    images: [{
      url:    "/og-image.png",
      width:  1200,
      height: 630,
      alt:    "DeepLinkOS: Free Deep Link Generator for iOS, Android and Web",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "DeepLinkOS: Free Deep Link Generator",
    description: "Paste one URL. Auto-detect platform. Get a smart deep link in under 60 seconds. Free forever.",
    images:      ["/og-image.png"],
  },
  robots: {
    index: true, follow: true,
    googleBot: {
      index: true, follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
  alternates: { canonical: "https://deeplinkos.com" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light">
      <head>
        {/* Anti-flash theme script — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('dlos-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`
          }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "DeepLinkOS",
              description: "Free deep link generator that auto-detects platforms and routes users to the right app on iOS, Android, or desktop.",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              url: "https://deeplinkos.com",
              author: { "@type": "Organization", name: "DeepLinkOS" }
            })
          }}
        />

        {/* Organization schema — helps Google Knowledge Graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type":    "Organization",
              name:       "DeepLinkOS",
              url:        "https://deeplinkos.com",
              logo:       "https://deeplinkos.com/icon.png",
              description: "Free deep link generator for iOS, Android, and web.",
              contactPoint: {
                "@type":          "ContactPoint",
                email:            "contact@deeplinkos.com",
                contactType:      "customer support",
                availableLanguage: "English",
              },
              sameAs: [],
            })
          }}
        />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
      </head>
      <body>
        <NextTopLoader color="#3b82f6" showSpinner={false} />
        <GoogleOneTap />
        {children}
      </body>
    </html>
  );
}
