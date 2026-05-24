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

export default function HomePage() {
  return (
    <>
      {/* Fixed nav */}
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="hero"
        id="home"
        aria-labelledby="hero-heading"
      >
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
            <LinkGenerator />
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <StatsBar />

      {/* ── Ad: after stats / before How It Works ────────────────── */}
      <div className="ad-between-sections">
        <AdUnit format="leaderboard" slot="after-stats" />
      </div>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Platforms ────────────────────────────────────────────── */}
      <PlatformsSection />

      {/* ── Ad: between Features and Routing ─────────────────────── */}
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
