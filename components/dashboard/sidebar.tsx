"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreateLinkModal } from "@/components/dashboard/create-link-modal";
import { useState } from "react";

const HomeIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const LinkIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>;
const ChartIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;
const EyeIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;
const GearIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const PlusIcon = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>;

const navItems = [
  { href: "/dashboard",            label: "Dashboard", icon: HomeIcon,  exact: true  },
  { href: "/dashboard/links",      label: "Links",     icon: LinkIcon,  exact: false },
  { href: "/dashboard/analytics",  label: "Analytics", icon: ChartIcon, exact: true  },
  { href: "/dashboard/pixels",     label: "Pixels",    icon: EyeIcon,   exact: true  },
  { href: "/dashboard/settings",   label: "Settings",  icon: GearIcon,  exact: true  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [fabModalOpen, setFabModalOpen] = useState(false);

  function isActive(item: typeof navItems[0]) {
    return item.exact ? pathname === item.href : pathname?.startsWith(item.href);
  }

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">D</div>
          DeepLinkOS
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href as any}
              className={`nav-item${isActive(item) ? " active" : ""}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────────────── */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href as any}
            className={`bottom-nav__item${isActive(item) ? " active" : ""}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Mobile FAB ───────────────────────────────────────────── */}
      <button
        className="mobile-fab"
        onClick={() => setFabModalOpen(true)}
        aria-label="Create new link"
      >
        <PlusIcon />
      </button>

      {/* Modal for FAB */}
      <CreateLinkModal isOpen={fabModalOpen} onClose={() => setFabModalOpen(false)} />
    </>
  );
}
