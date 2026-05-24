import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/contact-form";
import Link from "next/link";

export const metadata: Metadata = {
  title:       "Contact Us",
  description: "Get in touch with the DeepLinkOS team. Send us a message and we'll get back to you within 24 to 48 hours.",
  alternates:  { canonical: "https://deeplinkos.com/contact" },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    siteName:    "DeepLinkOS",
    url:         "https://deeplinkos.com/contact",
    title:       "Contact Us | DeepLinkOS",
    description: "Have a question or feedback? Get in touch with the DeepLinkOS team.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contact DeepLinkOS" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Contact Us | DeepLinkOS",
    description: "Have a question or feedback? Get in touch with the DeepLinkOS team.",
    images:      ["/og-image.png"],
  },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main className="contact-page" id="main-content">
        <div className="contact-orb contact-orb--1" aria-hidden="true" />
        <div className="contact-orb contact-orb--2" aria-hidden="true" />

        <div className="container">

          {/* Hero */}
          <div className="contact-hero">
            <span className="section-kicker">Get In Touch</span>
            <h1 className="contact-hero__h1">
              We&apos;re Here to <span className="grad-text">Help</span>
            </h1>
            <p className="contact-hero__sub">
              Have a question, found a bug, or want to share feedback?
              Fill in the form and we&apos;ll respond within 24 to 48 hours.
            </p>
          </div>

          {/* Two-column layout: Form | Info */}
          <div className="contact-grid">

            {/* LEFT: Form panel */}
            <div className="contact-form-panel">
              <h2 className="contact-form-panel__heading">Send Us a Message</h2>
              <ContactForm />
            </div>

            {/* RIGHT: Info panel */}
            <aside className="contact-info-panel" aria-label="Contact information">

              {/* Email card */}
              <a
                href="mailto:contact@deeplinkos.com"
                className="contact-card contact-card--primary"
                id="contact-email-link"
                aria-label="Email us at contact@deeplinkos.com"
              >
                <div className="contact-card__icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="8" fill="url(#email-grad)" />
                    <defs>
                      <linearGradient id="email-grad" x1="0" y1="0" x2="28" y2="28">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M6 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z"
                      stroke="#fff" strokeWidth="1.6" fill="none"
                    />
                    <path d="M6 9l8 6 8-6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="contact-card__body">
                  <p className="contact-card__label">Direct Email</p>
                  <p className="contact-card__value">contact@deeplinkos.com</p>
                  <p className="contact-card__hint">Response within 24 to 48 hours</p>
                </div>
                <svg
                  className="contact-card__arrow"
                  width="18" height="18" viewBox="0 0 18 18" fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 9H14.5M10 4.5L14.5 9L10 13.5"
                    stroke="currentColor" strokeWidth="1.7"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </a>

              {/* Topics */}
              <div className="contact-topics">
                <h2 className="contact-topics__heading">What Can We Help With?</h2>
                <ul className="contact-topics__list">
                  {[
                    { emoji: "🐛", label: "Bug Reports",         desc: "Something not working as expected?" },
                    { emoji: "💡", label: "Feature Requests",    desc: "Ideas to make DeepLinkOS better" },
                    { emoji: "🤝", label: "Partnerships",        desc: "Integrations, affiliates or collaborations" },
                    { emoji: "📖", label: "Blog Contributions",  desc: "Want to write a guest post?" },
                    { emoji: "📣", label: "General Feedback",    desc: "Tell us what you think" },
                  ].map(({ emoji, label, desc }) => (
                    <li className="contact-topic-item" key={label}>
                      <span className="contact-topic-item__emoji" aria-hidden="true">{emoji}</span>
                      <div>
                        <strong className="contact-topic-item__label">{label}</strong>
                        <p className="contact-topic-item__desc">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          {/* Footer note */}
          <p className="contact-note">
            Looking for more info? Browse our{" "}
            <Link href="/blog">deep linking blog</Link> or review our{" "}
            <Link href="/privacy">Privacy Policy</Link> and{" "}
            <Link href="/terms">Terms of Service</Link>.
          </p>

        </div>
      </main>

      <SiteFooter />
    </>
  );
}
