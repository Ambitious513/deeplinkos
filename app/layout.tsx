import type { Metadata } from "next";
import type { ReactNode } from "react";
import NextTopLoader from "nextjs-toploader";

import { ThemeProvider } from "@/components/theme-provider";
import { validateServerEnv } from "@/lib/env";

// Validate all required env vars on cold start — throws clearly if anything is missing
validateServerEnv();

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://deeplinkos.com"),
  title: {
    default: "DeepLinkOS — Smart Deep Links & Click Analytics",
    template: "%s | DeepLinkOS",
  },
  description:
    "DeepLinkOS builds smart deep links, QR flows, and real-time click analytics for modern app growth teams. Route every link intelligently.",
  keywords: ["deep links", "smart links", "QR codes", "click analytics", "mobile attribution", "link routing"],
  authors: [{ name: "DeepLinkOS" }],
  creator: "DeepLinkOS",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://deeplinkos.com",
    siteName: "DeepLinkOS",
    title: "DeepLinkOS — Smart Deep Links & Click Analytics",
    description:
      "Smart deep links, QR flows, and real-time click analytics for modern app growth teams.",
    images: [
      {
        url: "/og/og-default.png",
        width: 1200,
        height: 630,
        alt: "DeepLinkOS — Smart deep links. Better results.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepLinkOS — Smart Deep Links & Click Analytics",
    description:
      "Smart deep links, QR flows, and real-time click analytics for modern app growth teams.",
    images: ["/og/og-default.png"],
    creator: "@deeplinkos",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('dlos-theme') || 'light';
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (error) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <NextTopLoader color="#2563eb" showSpinner={false} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
