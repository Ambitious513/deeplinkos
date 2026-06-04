"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdUnit }           from "@/components/ad-unit";
import { CtaSection }        from "@/components/cta-section";
import { FeaturesSection }   from "@/components/features-section";
import { HowItWorks }        from "@/components/how-it-works";
import { LinkGenerator }     from "@/components/link-generator";
import { PlatformsSection }  from "@/components/platforms-section";
import { RoutingSection }    from "@/components/routing-section";
import { SiteFooter }        from "@/components/site-footer";
import { SiteHeader }        from "@/components/site-header";
import { StatsBar }          from "@/components/stats-bar";
import { AuthModal }         from "@/components/auth/auth-modal";

function AuthErrorToast() {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const err = searchParams.get("auth_error");
    const msg = searchParams.get("msg");
    if (err === "true") {
      // Determine if it's the PKCE/in-app browser error
      const isPKCE = msg?.toLowerCase().includes("pkce") || msg?.toLowerCase().includes("verifier");
      const isInApp = msg?.toLowerCase().includes("in-app") || msg?.toLowerCase().includes("browser");

      if (isPKCE || isInApp) {
        setToast("⚠️ Google Sign‑In failed. Please open deeplinkos.com directly in Safari or Chrome — it doesn't work inside Instagram, TikTok or Facebook.");
      } else if (msg === "no_code") {
        setToast("⚠️ Sign‑in was cancelled. Please try again.");
      } else {
        setToast(`⚠️ Sign‑in error: ${decodeURIComponent(msg || "Unknown error")}. Please try again.`);
      }

      // Clean the URL without reloading
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
    }
  }, [searchParams]);

  if (!toast) return null;

  return (
    <div
      onClick={() => setToast(null)}
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        maxWidth: "min(520px, 94vw)",
        width: "100%",
        background: "rgba(239,68,68,0.97)",
        color: "#fff",
        borderRadius: 14,
        padding: "14px 20px",
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.5,
        boxShadow: "0 8px 32px rgba(0,0,0,.25)",
        cursor: "pointer",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        animation: "slideUp .3s ease",
      }}
    >
      <span style={{ flex: 1 }}>{toast}</span>
      <span style={{ fontSize: 18, lineHeight: 1, opacity: 0.7, flexShrink: 0 }}>×</span>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
      ` }} />
    </div>
  );
}

/** Auto-opens the auth modal when middleware redirects with ?auth=required */
function AuthRequiredTrigger({ onTrigger }: { onTrigger: () => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("auth") === "required") {
      onTrigger();
      // Clean URL without reload
      const clean = window.location.pathname;
      window.history.replaceState({}, "", clean);
    }
  }, [searchParams, onTrigger]);

  return null;
}

export default function HomePage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      {/* Fixed nav */}
      <SiteHeader />

      {/* Auth Modal — triggered by homepage CTAs and ?auth=required redirect */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultSignUp={false} />

      {/* Auth error toast — reads ?auth_error=true&msg=... from URL */}
      <Suspense fallback={null}>
        <AuthErrorToast />
      </Suspense>

      {/* Auto-open modal when middleware redirects unauthenticated users here */}
      <Suspense fallback={null}>
        <AuthRequiredTrigger onTrigger={() => setAuthOpen(true)} />
      </Suspense>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero" id="home" aria-labelledby="hero-heading">
        <div className="hero__orb hero__orb--1" aria-hidden="true" />
        <div className="hero__orb hero__orb--2" aria-hidden="true" />
        <div className="hero__orb hero__orb--3" aria-hidden="true" />

        <div className="container">
          <div className="hero__content">
            <div className="hero__badge">
              <span className="hero__badge-dot" aria-hidden="true" />
              Smart Deep Linking for iOS, Android &amp; Web
            </div>

            <h1 className="hero__h1" id="hero-heading">
              Free{" "}
              <span className="grad-text">Deep Link</span>
              <br />
              Generator
            </h1>

            <p className="hero__sub">
              <span className="hero__sub--full">
                Paste any URL: YouTube, TikTok, Instagram, WhatsApp, Telegram and more.
                DeepLinkOS auto-detects the platform and generates a smart deep link that
                opens the right app on <strong>iOS</strong>, <strong>Android</strong>, or
                desktop in under 60 seconds.
              </span>
              <span className="hero__sub--mobile">
                Auto-detect any URL. Smart deep links for iOS, Android and web. Under 60 seconds.
              </span>
            </p>

            {/* ── Composer ── */}
            <LinkGenerator onViewAnalytics={() => setAuthOpen(true)} />
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <StatsBar />

      {/* ── Ad ────────────────────────────────────────────────────── */}
      <div className="ad-between-sections">
        <AdUnit format="leaderboard" slot="after-stats" />
      </div>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Platforms ────────────────────────────────────────────── */}
      <PlatformsSection />

      {/* ── Ad ────────────────────────────────────────────────────── */}
      <div className="ad-between-sections">
        <AdUnit format="leaderboard" slot="mid-page" />
      </div>

      {/* ── Features ─────────────────────────────────────────────── */}
      <FeaturesSection />

      {/* ── Routing diagram ──────────────────────────────────────── */}
      <RoutingSection />

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <CtaSection />

      {/* ── Footer ───────────────────────────────────────────────── */}
      <SiteFooter />
    </>
  );
}
