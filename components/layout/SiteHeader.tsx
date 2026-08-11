"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/logo-mark";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "AI Tools", href: "/tools" },
];

type SiteHeaderProps = {
  onLogin?: () => void;
  onSignup?: () => void;
};

export function SiteHeader({ onLogin, onSignup }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("dlos-theme");
    const next = saved === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("dlos-theme", next);
  }

  function handleAuth(kind: "login" | "signup") {
    if (kind === "login") onLogin?.();
    if (kind === "signup") onSignup?.();
    setMenuOpen(false);
  }

  return (
    <>
      <header className="site-header">
        <Link href="/" className="logo" aria-label="DeepLinkOS home">
          <span
            style={{
              display: 'grid',
              width: 36,
              height: 36,
              flexShrink: 0,
              placeItems: 'center',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
            }}
          >
            <LogoMark className="size-[22px]" />
          </span>
          <span className="logo-name">DeepLinkOS</span>
        </Link>

        <nav className="nav-center" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <SunIcon /> : <MoonIcon />}
          </button>
          {onLogin ? (
            <button className="btn btn-secondary desktop-action" type="button" onClick={() => handleAuth("login")}>
              Log in
            </button>
          ) : (
            <Link className="btn btn-secondary desktop-action" href="/login">
              Log in
            </Link>
          )}
          {onSignup ? (
            <button className="btn btn-primary desktop-action" type="button" onClick={() => handleAuth("signup")}>
              Create Free Link
            </button>
          ) : (
            <Link className="btn btn-primary desktop-action" href="/signup">
              Create Free Link
            </Link>
          )}
          <button
            className="menu-toggle"
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <div className="mobile-menu" data-open={menuOpen}>
        <nav className="mobile-menu-inner" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link" onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          {onLogin ? (
            <button className="btn btn-secondary" type="button" onClick={() => handleAuth("login")}>
              Log in
            </button>
          ) : (
            <Link className="btn btn-secondary" href="/login" onClick={() => setMenuOpen(false)}>
              Log in
            </Link>
          )}
          {onSignup ? (
            <button className="btn btn-primary" type="button" onClick={() => handleAuth("signup")}>
              Create Free Link
            </button>
          ) : (
            <Link className="btn btn-primary" href="/signup" onClick={() => setMenuOpen(false)}>
              Create Free Link
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

