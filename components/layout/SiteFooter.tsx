import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

const compareLinks = [
  { label: "vs Firebase Dynamic Links", href: "/vs/firebase-dynamic-links" },
  { label: "vs Linktree", href: "/vs/linktree" },
];

const companyLinks = [
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      {/* Newsletter row */}
      <div className="footer-newsletter">
        <div className="footer-newsletter-inner">
          <p className="footer-newsletter-label">
            Get weekly growth playbooks
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="footer-grid">
        <div>
          <Link href="/" className="logo" aria-label="DeepLinkOS home">
            <span
              style={{
                display: 'grid',
                width: 34,
                height: 34,
                flexShrink: 0,
                placeItems: 'center',
                borderRadius: 9,
                background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
              }}
            >
              <LogoMark className="size-5" />
            </span>
            <span className="logo-name">DeepLinkOS</span>
          </Link>
          <p className="footer-tagline">
            Growth infrastructure for creators, stores, marketers, and agencies who refuse to lose high-intent clicks.
          </p>
          <div className="footer-socials" aria-label="Social links">
            <a href="https://x.com/deeplinkos" target="_blank" rel="noopener noreferrer" aria-label="DeepLinkOS on X">
              <XIcon />
            </a>
            <a href="https://github.com/deeplinkos" target="_blank" rel="noopener noreferrer" aria-label="DeepLinkOS on GitHub">
              <GitHubIcon />
            </a>
          </div>
        </div>

        {/* Always side-by-side: Product + Company + Compare */}
        <div className="footer-nav-row">
          <nav aria-label="Product">
            <h2 className="footer-heading">Product</h2>
            <div className="footer-links">
              {productLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="Compare">
            <h2 className="footer-heading">Compare</h2>
            <div className="footer-links">
              {compareLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="Company">
            <h2 className="footer-heading">Company</h2>
            <div className="footer-links">
              {companyLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; 2026 DeepLinkOS. All rights reserved.</span>
        <a
          href="https://status.deeplinkos.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-status"
          aria-label="System status"
        >
          <span className="dot" />
          All systems operational
        </a>
      </div>
    </footer>
  );
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.254 5.622 5.91-5.622Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}
