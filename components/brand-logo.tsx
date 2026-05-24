import Link from "next/link";

interface BrandLogoProps {
  /** "nav" uses the header size (30px mark, 1rem text)
   *  "footer" uses the footer size (24px mark, .95rem text) */
  variant?: "nav" | "footer";
  className?: string;
}

/** Shared logo used in SiteHeader and SiteFooter */
export function BrandLogo({ variant = "nav", className }: BrandLogoProps) {
  const isNav    = variant === "nav";
  const markCls  = isNav ? "nav__logo-mark"          : "site-footer__brand-mark";
  const wrapCls  = isNav ? `nav__logo${className ? " " + className : ""}` : `site-footer__brand${className ? " " + className : ""}`;

  return (
    <Link href="/" className={wrapCls} aria-label="DeepLinkOS home">
      <span className={markCls} aria-hidden="true">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          width={isNav ? 16 : 13}
          height={isNav ? 16 : 13}
        >
          <path
            d="M4 8a4 4 0 0 1 4-4h1M8 12H7a4 4 0 0 1 0-8"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="4" r="1.5" fill="#fff" />
          <circle cx="4"  cy="12" r="1.5" fill="#fff" />
        </svg>
      </span>
      <span>DeepLinkOS</span>
    </Link>
  );
}
