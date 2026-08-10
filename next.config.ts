import type { NextConfig } from "next";

// ── Security headers applied to every route ───────────────────────────────────
const securityHeaders = [
  // Force HTTPS for 2 years, include subdomains, allow preload list submission
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Prevent clickjacking — allow same-origin iframes only
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // Stop browsers from MIME-sniffing the response content-type
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Only send origin in Referer header (no full URL path), protecting slug privacy
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Disable unnecessary browser APIs — no camera, mic, geolocation needed
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Enable XSS filter in legacy browsers
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig: NextConfig = {
  // Standalone output: self-contained build folder for VPS/Docker deployment.
  // The .next/standalone directory contains everything needed to run the app
  // without copying node_modules to the server.
  output: "standalone",

  outputFileTracingRoot: process.cwd(),

  // Apply security headers to all routes
  async headers() {
    return [
      {
        // Match all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
