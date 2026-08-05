'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PanelLeftClose, PanelLeft, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navGroups } from '@/lib/nav'
import type { DashboardUser } from '@/lib/dashboard-user'
import { BrandMark } from '@/components/dashboard/brand-mark'
import { useCreateLink } from '@/components/dashboard/create-link'
import { PLANS, TRIAL_LINK_LIMIT, type PlanId } from '@/lib/polar'

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(href + '/')
}

export function Sidebar({
  collapsed,
  onToggle,
  user,
}: {
  collapsed: boolean
  onToggle: () => void
  user: DashboardUser
}) {
  const pathname = usePathname()
  const { open } = useCreateLink()

  const planId = (user.planId ?? 'creator_trial') as PlanId
  const isTrial = planId === 'creator_trial'
  const linkLimit = isTrial ? TRIAL_LINK_LIMIT : (PLANS[planId]?.links ?? null)

  // Real link count for usage widget — refetches on creation event and window focus
  const [linkCount, setLinkCount] = useState<number | null>(null)
  useEffect(() => {
    const fetchCount = () => {
      fetch('/api/links', { cache: 'no-store' })
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((data: { links?: unknown[] }) => setLinkCount(data.links?.length ?? 0))
        .catch(() => {})
    }

    fetchCount() // Initial load

    // Update instantly after a link is created (fired by create-link.tsx)
    window.addEventListener('deeplinkos:link-created', fetchCount)
    // Also update when user returns to the tab
    window.addEventListener('focus', fetchCount)

    return () => {
      window.removeEventListener('deeplinkos:link-created', fetchCount)
      window.removeEventListener('focus', fetchCount)
    }
  }, [])

  const usagePct = linkCount !== null && linkLimit !== null
    ? Math.min(Math.round((linkCount / linkLimit) * 100), 100)
    : null

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[76px]' : 'w-[264px]',
      )}
    >
      {/* Brand + collapse */}
      <div
        className={cn(
          'flex h-16 items-center gap-2.5 px-4',
          collapsed && 'justify-center px-0',
        )}
      >
        <BrandMark />
        {!collapsed && (
          <span className="text-[15px] font-bold tracking-tight">DeepLinkOS</span>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="ml-auto grid size-7 place-items-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <PanelLeftClose className="size-[18px]" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Expand sidebar"
          className="mx-auto mb-2 grid size-9 place-items-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <PanelLeft className="size-[18px]" />
        </button>
      )}

      {/* Create link CTA — the single global primary action */}
      <div className={cn('px-3 pb-1', collapsed && 'px-0')}>
        <button
          type="button"
          onClick={open}
          aria-label="Create link"
          title="Create link"
          className={cn(
            'flex h-11 items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-brand-foreground shadow-sm transition-transform hover:brightness-105 active:translate-y-px',
            collapsed ? 'mx-auto w-11' : 'w-full',
          )}
        >
          <Plus className="size-[18px]" />
          {!collapsed && <span>Create link</span>}
        </button>
      </div>

      {/* Nav */}
      <nav className="no-scrollbar mt-2 flex-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="px-3 pb-1.5 pt-2 text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
            )}
            <ul className="grid gap-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors',
                        collapsed && 'justify-center px-0',
                        active
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                      )}
                    >
                      <Icon className="size-[18px] shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="ml-auto rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn('border-t border-sidebar-border p-3', collapsed && 'px-2')}>
        {!collapsed && (
          <div className="mb-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-brand" />
                {isTrial ? 'Creator trial' : `${user.plan} plan`}
              </div>
              <Link
                href="/dashboard/billing"
                className="text-[11px] font-semibold text-brand hover:underline"
              >
                {isTrial ? 'Start trial' : 'Upgrade'}
              </Link>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sidebar-border">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-500"
                style={{ width: usagePct !== null ? `${usagePct}%` : '0%' }}
              />
            </div>
            <p className="mt-1.5 text-xs text-sidebar-foreground/60">
              {linkCount !== null && linkLimit !== null
                ? `${linkCount} / ${linkLimit} links used`
                : linkCount !== null && linkLimit === null
                  ? `${linkCount} links · unlimited`
                  : 'Loading usage…'}
            </p>
          </div>
        )}
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-xl p-1.5',
            collapsed && 'justify-center',
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
            {user.initials}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/55">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
