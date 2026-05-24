import Link from "next/link";

export function CtaSection() {
  return (
    <section className="cta-section" id="cta" aria-labelledby="cta-heading">
      <div className="container--sm">
        <div className="cta-inner">
          <h2 className="section-h2" id="cta-heading">
            Start Generating{" "}
            <span className="grad-text">Free Deep Links</span>{" "}
            Today
          </h2>
          <p>
            No account required for your first link. Paste a URL, get a smart deep link, share it. Your users will land in the right app every single time.
          </p>

          <div className="cta-btns">
            <a href="#composer" className="btn-primary" id="cta-try-btn">
              Try the Free Generator
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7H11.5M8 3.5L11.5 7L8 10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <Link href="/blog" className="btn-ghost" id="cta-blog-btn">
              Read the Deep Linking Guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
