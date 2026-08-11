import Image from "next/image";
import { HeroGeneratorPanel } from "@/components/home/HeroGeneratorPanel";
import { SocialProofStrip } from "@/components/home/SocialProofStrip";

export function HomeHero() {
  return (
    <section className="home-hero">
      <div className="container">
        <div className="home-hero-inner">
          <Image
            src="/hero-3d-element-floaty.png"
            alt=""
            aria-hidden="true"
            width={720}
            height={518}
            priority
            className="hero-asset"
          />
          <div className="hero-copy-block">
            <div className="hero-badge">
              <span className="hero-badge-dot" /> Links that open the right app, every time
            </div>
            <h1 className="hero-headline">
              Free <span className="grad-text">DeepLink</span>
              <br />
              Generator
            </h1>
            <p className="hero-sub">
              Link-in-bio tools show a list of links. DeepLinkOS makes social links open the right app, product, chat,
              or map on iOS, Android, and desktop in under 60 seconds.
            </p>
            <HeroGeneratorPanel />
            <SocialProofStrip />
            <div className="stats-bar" aria-label="DeepLinkOS quick stats">
              <div className="stat-item">
                <div className="stat-val">8+</div>
                <div className="stat-lbl">Platforms</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">60s</div>
                <div className="stat-lbl">Setup</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">Free</div>
                <div className="stat-lbl">Forever</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">0</div>
                <div className="stat-lbl">SDK Needed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
