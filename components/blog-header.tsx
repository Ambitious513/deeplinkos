"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { AuthModal } from "@/components/auth/auth-modal";

type Theme = "light" | "dark";

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Real page links — no anchor #hash links that only work on homepage
const blogNavLinks = [
  { href: "/",          label: "Home"     },
  { href: "/#features", label: "Features" },
  { href: "/blog",      label: "Blog"     },
  { href: "/contact",   label: "Contact"  },
];

export function BlogHeader() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [theme,     setTheme]     = useState<Theme>("light");
  const [authOpen,  setAuthOpen]  = useState(false);

  useEffect(() => {
    const stored = document.documentElement.getAttribute("data-theme") as Theme | null;
    setTheme(stored === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("dlos-theme", next); } catch { /* noop */ }
  }, [theme]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        className={`nav${scrolled ? " nav--scrolled" : ""}`}
        role="navigation"
        aria-label="Blog navigation"
      >
        <div className="container">
          <div className="nav__inner">
            <BrandLogo variant="nav" />

            {/* Desktop nav — real links, no hash anchors */}
            <div className="nav__links" aria-label="Site sections">
              {blogNavLinks.map((l) => (
                <Link key={l.href} href={l.href as any}>{l.label}</Link>
              ))}
            </div>

            <div className="nav__right">
              <button
                id="blog-theme-toggle-btn"
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <MoonIcon /> : <SunIcon />}
              </button>

              <button
                className="nav__cta"
                id="blog-nav-cta-btn"
                onClick={() => setAuthOpen(true)}
              >
                Try for Free
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ marginLeft: 6 }}>
                  <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                id="blog-mobile-menu-btn"
                className={`nav__hamburger${menuOpen ? " is-open" : ""}`}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="blog-mobile-nav-menu"
              >
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="blog-mobile-nav-menu"
        className={`nav__mobile-menu${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <nav className="nav__mobile-links" aria-label="Mobile site navigation">
          {blogNavLinks.map((l) => (
            <Link key={l.href} href={l.href as any} onClick={closeMenu}>{l.label}</Link>
          ))}
        </nav>
        <button
          className="nav__mobile-cta"
          onClick={() => { closeMenu(); setAuthOpen(true); }}
          id="blog-mobile-cta-btn"
        >
          Try for Free →
        </button>
      </div>

      {menuOpen && (
        <div className="nav__backdrop" onClick={closeMenu} aria-hidden="true" />
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultSignUp />
    </>
  );
}
