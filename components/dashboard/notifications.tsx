'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle2, Link2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LinkRecord } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = 'link_created' | 'link_paused' | 'all_clear'

interface Notification {
  id:       string
  type:     NotifType
  title:    string
  subtitle: string
  href:     string
  time:     string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60)   return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60)   return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)   return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function buildNotifications(links: LinkRecord[]): Notification[] {
  const items: Notification[] = []

  // Paused / inactive links come first (attention)
  const paused = links.filter((l) => !l.isActive).slice(0, 2)
  for (const l of paused) {
    items.push({
      id:       `paused-${l.id}`,
      type:     'link_paused',
      title:    `Link paused: ${l.title}`,
      subtitle: 'Click to review on the Links page',
      href:     '/dashboard/links',
      time:     timeAgo(new Date(l.updatedAt ?? l.createdAt)),
    })
  }

  // Most recently created links
  const recent = [...links]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
  for (const l of recent) {
    items.push({
      id:       `created-${l.id}`,
      type:     'link_created',
      title:    `Link created: ${l.title}`,
      subtitle: `/${l.slug}`,
      href:     '/dashboard/links',
      time:     timeAgo(new Date(l.createdAt)),
    })
  }

  return items.slice(0, 6)
}

// ─── Notification item ────────────────────────────────────────────────────────

function NotifItem({
  n, onClose,
}: { n: Notification; onClose: () => void }) {
  const Icon   = n.type === 'link_paused' ? AlertTriangle : Link2
  const iconCn = n.type === 'link_paused'
    ? 'bg-warning-soft text-warning'
    : 'bg-brand-soft text-brand'

  return (
    <li>
      <Link
        href={n.href}
        onClick={onClose}
        className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 border-b border-border last:border-0"
      >
        <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl', iconCn)}>
          <Icon className="size-[15px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug">{n.title}</p>
          <p className="truncate text-xs text-muted-foreground">{n.subtitle}</p>
        </div>
        <span className="shrink-0 pt-0.5 text-[10px] tabular-nums text-muted-foreground">
          {n.time}
        </span>
      </Link>
    </li>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NotificationBell() {
  const [open, setOpen]                     = useState(false)
  const [loading, setLoading]               = useState(true)
  const [notifications, setNotifications]   = useState<Notification[]>([])
  const [hasUnread, setHasUnread]           = useState(true)   // dot visible until opened
  const panelRef                            = useRef<HTMLDivElement>(null)

  // ── Fetch real activity ──────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/links', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { links?: LinkRecord[] }) => {
        setNotifications(buildNotifications(data.links ?? []))
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toggle = () => {
    setOpen((o) => !o)
    setHasUnread(false) // clear dot when opened
  }

  const close = () => setOpen(false)

  return (
    <div ref={panelRef} className="relative">
      {/* ── Bell trigger ────────────────────────────────────────────── */}
      <button
        type="button"
        id="notification-bell"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={toggle}
        className="relative grid size-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted"
      >
        <Bell className="size-[18px]" />
        {hasUnread && !loading && notifications.length > 0 && (
          <span
            aria-hidden
            className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand ring-2 ring-card"
          />
        )}
      </button>

      {/* ── Dropdown panel ──────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-labelledby="notification-bell"
          className={cn(
            'absolute right-0 top-[calc(100%+8px)] z-50 w-80 rounded-2xl border border-border',
            'bg-card shadow-xl shadow-black/10 dark:shadow-black/30',
            'animate-in fade-in slide-in-from-top-2 duration-150',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-bold">Notifications</p>
            {!loading && notifications.length > 0 && (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand">
                {notifications.length}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="size-8 shrink-0 animate-pulse rounded-xl bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-36 animate-pulse rounded-full bg-muted" />
                      <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <CheckCircle2 className="size-9 text-muted-foreground/30" />
                <p className="text-sm font-semibold">You're all caught up</p>
                <p className="text-xs text-muted-foreground">No activity yet — create your first link!</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <NotifItem key={n.id} n={n} onClose={close} />
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <Link
              href="/dashboard/links"
              onClick={close}
              className="block text-center text-xs font-semibold text-brand hover:underline"
            >
              View all links →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
