import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
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
            <a href="https://x.com" aria-label="DeepLinkOS on X">
              X
            </a>
            <a href="https://github.com" aria-label="DeepLinkOS on GitHub">
              GH
            </a>
          </div>
        </div>

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

      <div className="footer-bottom">
        <span>&copy; 2026 DeepLinkOS. All rights reserved.</span>
        <span className="footer-status">
          <span className="dot" /> All systems operational
        </span>
      </div>
    </footer>
  );
}
