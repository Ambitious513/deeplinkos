import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="site-footer__inner">

          {/* Brand — same logo mark as the header */}
          <BrandLogo variant="footer" />

          {/* Site nav */}
          <nav className="site-footer__links" aria-label="Footer site navigation">
            <Link href="/#how-it-works">How It Works</Link>
            <Link href="/#platforms">Platforms</Link>
            <Link href="/#features">Features</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          {/* Legal nav */}
          <nav className="site-footer__links" aria-label="Footer legal navigation">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/disclaimer">Disclaimer</Link>
          </nav>

          {/* Copyright */}
          <p className="site-footer__copy">
            &copy; {year} DeepLinkOS. Free deep link generator.
          </p>
        </div>
      </div>
    </footer>
  );
}
