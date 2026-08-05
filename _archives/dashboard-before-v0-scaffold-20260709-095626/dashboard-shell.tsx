"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOutButton } from "@/components/auth/signout-button";
import {
  OverviewIcon,
  LinksIcon,
  AnalyticsIcon,
  QrIcon,
  ProfileIcon,
  BillingIcon,
  DomainsIcon,
  PixelsIcon,
  CollapseIcon,
  ExpandIcon,
  MenuIcon,
  PlusIcon,
  SunIcon,
  MoonIcon,
  SearchIcon,
  MoreHorizIcon,
  CloseIcon,
} from "@/components/dashboard/icons";
import { useCreateLink } from "@/components/dashboard/create-link-modal";

/* ─── Nav definition ───────────────────────────────────────────── */

const sidebarGroups = [
  {
    label: "Dashboard",
    items: [
      { href: "/dashboard", label: "Overview", Icon: OverviewIcon, exact: true },
      { href: "/dashboard/links", label: "Links", Icon: LinksIcon },
      { href: "/dashboard/analytics", label: "Analytics", Icon: AnalyticsIcon },
      { href: "/dashboard/qr", label: "QR Designer", Icon: QrIcon },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/dashboard/profile", label: "Profile", Icon: ProfileIcon },
      { href: "/dashboard/billing", label: "Billing", Icon: BillingIcon },
    ],
  },
  {
    label: "Features",
    items: [
      { href: "/dashboard/domains", label: "Custom Domains", Icon: DomainsIcon },
      { href: "/dashboard/pixels", label: "Pixels", Icon: PixelsIcon },
    ],
  },
];

const primaryMobileItems = [
  { href: "/dashboard", label: "Overview", Icon: OverviewIcon, exact: true },
  { href: "/dashboard/links", label: "Links", Icon: LinksIcon },
  { href: "/dashboard/analytics", label: "Analytics", Icon: AnalyticsIcon },
  { href: "/dashboard/qr", label: "QR", Icon: QrIcon },
];

const secondaryMobileItems = [
  { href: "/dashboard/profile", label: "Profile", Icon: ProfileIcon },
  { href: "/dashboard/billing", label: "Billing", Icon: BillingIcon },
  { href: "/dashboard/domains", label: "Domains", Icon: DomainsIcon },
  { href: "/dashboard/pixels", label: "Pixels", Icon: PixelsIcon },
];

const SIDEBAR_STORAGE_KEY = "dlos-sidebar-collapsed";
const THEME_STORAGE_KEY = "dlos-theme";

/* ─── Helpers ─────────────────────────────────────────────────────── */

function isActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function currentPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Overview";
  if (pathname.startsWith("/dashboard/links")) return "Links";
  if (pathname.startsWith("/dashboard/analytics")) return "Analytics";
  if (pathname.startsWith("/dashboard/qr")) return "QR Designer";
  if (pathname.startsWith("/dashboard/profile")) return "Profile";
  if (pathname.startsWith("/dashboard/billing")) return "Billing";
  if (pathname.startsWith("/dashboard/domains")) return "Custom Domains";
  if (pathname.startsWith("/dashboard/pixels")) return "Pixels";
  return "Overview";
}

/* ─── Shell types ─────────────────────────────────────────────────── */

type DashboardShellProps = {
  children: React.ReactNode;
  workspaceName: string;
  userEmail: string | null;
};

/* ─── Main component ──────────────────────────────────────────────── */

export function DashboardShell({ children, workspaceName, userEmail }: DashboardShellProps) {
  const pathname = usePathname();
  const { open: openCreateLink } = useCreateLink();

  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = currentPageTitle(pathname);
  const initials = getInitials(workspaceName || userEmail || "D");

  /* Restore theme */
  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const next = stored === "dark" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  /* Restore sidebar collapsed state */
  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  /* Body scroll lock for overlays */
  useEffect(() => {
    document.body.style.overflow = mobileMoreOpen || sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMoreOpen, sidebarOpen]);

  /* Close mobile More drawer on route change */
  useEffect(() => {
    setMobileMoreOpen(false);
    setSidebarOpen(false);
  }, [pathname]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try { window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }

  return (
    <div
      className={[
        "dashboard-shell",
        collapsed ? "is-collapsed" : "",
        sidebarOpen ? "is-sidebar-open" : "",
      ].filter(Boolean).join(" ")}
    >
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className={`dashboard-sidebar${collapsed ? " is-collapsed" : ""}`}>

        {/* Brand row */}
        <div className="sidebar-brand-row">
          <Link
            href="/dashboard"
            className="dashboard-sidebar__brand"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="dashboard-sidebar__mark">D</span>
            {!collapsed && <span>DeepLinkOS</span>}
          </Link>
          <button
            type="button"
            className="sidebar-collapse-btn"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapse}
          >
            {collapsed ? <ExpandIcon /> : <CollapseIcon />}
          </button>
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, overflowY: "auto", display: "grid", gap: 8, alignContent: "start" }}>
          {sidebarGroups.map((group) => (
            <div key={group.label} className="sidebar-group">
              {!collapsed && (
                <div className="sidebar-group__label">{group.label}</div>
              )}
              {group.items.map(({ href, label, Icon, exact }) => {
                const active = isActive(pathname, href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`sidebar-link${active ? " is-active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? label : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="sidebar-link__icon">
                      <Icon />
                    </span>
                    {!collapsed && <span>{label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: user account */}
        <div style={{ marginTop: "auto" }}>
          <div className="dashboard-sidebar__account" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="sidebar-user-avatar">{initials}</span>
            {!collapsed && (
              <div className="sidebar-user-info">
                <strong>{workspaceName}</strong>
                {userEmail && <small>{userEmail}</small>}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Shell body ───────────────────────────────────────────── */}
      <div className="dashboard-shell__body">

        {/* Topbar */}
        <header className="shell-topbar">
          <div className="topbar-left">
            {/* Hamburger — mobile only, also works on tablet when sidebar hidden */}
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </button>
            <div>
              <div className="eyebrow">Dashboard / {title}</div>
              <h1 style={{ margin: "4px 0 0", fontFamily: "var(--font-display)", letterSpacing: "-0.04em", fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)" }}>
                {title}
              </h1>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-search">
              <SearchIcon aria-hidden />
              <input placeholder="Search links, campaigns, referrers..." aria-label="Search dashboard" />
            </div>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "dark" ? <MoonIcon /> : <SunIcon />}
            </button>
            {/* Single global primary CTA — desktop only */}
            <button
              className="btn btn-primary"
              type="button"
              id="topbar-create-link"
              onClick={openCreateLink}
            >
              <PlusIcon />
              Create link
            </button>
            <SignOutButton />
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────── */}
      <nav className="mobile-bottom-nav" aria-label="Dashboard sections">
        {primaryMobileItems.map(({ href, label, Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`mobile-bottom-nav__item${isActive(pathname, href, exact) ? " is-active" : ""}`}
            aria-current={isActive(pathname, href, exact) ? "page" : undefined}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
        <button
          className={`mobile-bottom-nav__item${secondaryMobileItems.some((i) => isActive(pathname, i.href)) ? " is-active" : ""}`}
          type="button"
          onClick={() => setMobileMoreOpen(true)}
          aria-label="More navigation options"
        >
          <MoreHorizIcon />
          <span>More</span>
        </button>
      </nav>

      {/* ── Mobile FAB — single global mobile CTA ─────────────── */}
      <button
        className="btn btn-primary dashboard-mobile-create"
        type="button"
        id="mobile-create-link"
        aria-label="Create link"
        onClick={openCreateLink}
      >
        <PlusIcon />
        <span>Create</span>
      </button>

      {/* ── Mobile More drawer ────────────────────────────────── */}
      {mobileMoreOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setMobileMoreOpen(false)}
          aria-hidden="true"
        >
          <div
            className="drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="More navigation"
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="eyebrow">More</div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setMobileMoreOpen(false)}
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="drawer-grid">
              {secondaryMobileItems.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="drawer-link"
                  onClick={() => setMobileMoreOpen(false)}
                >
                  <Icon />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile sidebar slide-in overlay ──────────────────── */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 55,
          }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
