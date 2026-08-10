'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Monitor, Save } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Panel, PanelHeader, Badge } from '@/components/dashboard/primitives'
import { Field, TextInput, Toggle } from '@/components/dashboard/form'
import { Button } from '@/components/ui/button'
import type { AuthProfile } from '@/lib/auth/session'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NOTIF_STORAGE_KEY = 'dlos:notif_prefs'

function defaultNotif() {
  if (typeof window === 'undefined') return { weekly: true, alerts: true, product: false }
  try {
    const stored = localStorage.getItem(NOTIF_STORAGE_KEY)
    if (stored) return JSON.parse(stored) as { weekly: boolean; alerts: boolean; product: boolean }
  } catch { /* ignore */ }
  return { weekly: true, alerts: true, product: false }
}

function initialsFor(name: string, email?: string) {
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (email ?? '?').slice(0, 2).toUpperCase()
}

function SkeletonLine({ w = 'w-32', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${h} ${w} animate-pulse rounded-full bg-muted`} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [loading, setLoading]   = useState(true)
  const [profile, setProfile]   = useState<AuthProfile | null>(null)
  const [email, setEmail]       = useState<string>('')
  const [notif, setNotif]       = useState(defaultNotif)
  const [notifSaved, setNotifSaved] = useState(false)

  // ── Fetch real profile ──────────────────────────────────────────────────
  useEffect(() => {
    let alive = true
    fetch('/api/auth/state', { cache: 'no-store' })
      .then((r) => r.json())
      .then((state) => {
        if (!alive) return
        setProfile(state.profile ?? null)
        setEmail(state.user?.email ?? state.profile?.email ?? '')
      })
      .catch(() => { /* leave null — show empty state */ })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  // ── Derived display values ──────────────────────────────────────────────
  const user = useMemo(() => {
    const firstName = profile?.first_name ?? ''
    const lastName  = profile?.last_name  ?? ''
    const name = [firstName, lastName].filter(Boolean).join(' ').trim()
      || email.split('@')[0]
      || 'Your Account'
    return {
      name,
      initials:  initialsFor(name, email),
      email:     email || '—',
      workspace: profile?.workspace_name || 'Default workspace',
      role:      profile ? 'Workspace owner' : '—',
    }
  }, [profile, email])

  // ── Notification save ───────────────────────────────────────────────────
  const saveNotif = () => {
    try { localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notif)) } catch { /* ignore */ }
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2000)
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Settings"
        title="Profile"
        description="Manage your identity, notifications, API access, and security."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ── Identity card ───────────────────────────────────────────── */}
        <Panel className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            {loading ? (
              <div className="size-20 animate-pulse rounded-full bg-muted" />
            ) : (
              <span className="grid size-20 place-items-center rounded-full bg-brand text-2xl font-bold text-brand-foreground">
                {user.initials}
              </span>
            )}

            {/* Name + role */}
            <div className="mt-3 space-y-1">
              {loading ? (
                <>
                  <SkeletonLine w="w-28" h="h-4" />
                  <SkeletonLine w="w-20" h="h-3" />
                </>
              ) : (
                <>
                  <p className="text-lg font-bold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </>
              )}
            </div>

            {/* Workspace badge */}
            <div className="mt-2">
              {loading ? (
                <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
              ) : (
                <Badge tone="brand">{user.workspace}</Badge>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="mt-6 grid gap-4">
            <Field label="Full name">
              {loading
                ? <div className="h-10 animate-pulse rounded-xl bg-muted" />
                : <TextInput value={user.name} readOnly />}
            </Field>
            <Field label="Email">
              {loading
                ? <div className="h-10 animate-pulse rounded-xl bg-muted" />
                : <TextInput value={user.email} type="email" readOnly />}
            </Field>
            <Field label="Role">
              {loading
                ? <div className="h-10 animate-pulse rounded-xl bg-muted" />
                : <TextInput value={user.role} readOnly />}
            </Field>
          </div>
        </Panel>

        <div className="grid gap-4 lg:col-span-2">
          {/* ── Notification prefs ───────────────────────────────────── */}
          <Panel className="p-6">
            <PanelHeader
              title="Notification preferences"
              subtitle="Choose what lands in your inbox"
              action={
                <Button variant="outline" size="sm" onClick={saveNotif}>
                  {notifSaved
                    ? <><Check className="size-4" /> Saved</>
                    : <><Save className="size-4" /> Save</>}
                </Button>
              }
            />
            <div className="mt-4 grid gap-1">
              {[
                { key: 'weekly',  label: 'Weekly performance summary', desc: 'A digest of clicks and top links every Monday.' },
                { key: 'alerts',  label: 'Link health alerts',         desc: 'Get notified when a link needs attention.' },
                { key: 'product', label: 'Product updates',            desc: 'New features and changelog announcements.' },
              ].map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.desc}</p>
                  </div>
                  <Toggle
                    checked={notif[row.key as keyof typeof notif]}
                    onChange={(v) => setNotif((p) => ({ ...p, [row.key]: v }))}
                    label={row.label}
                  />
                </div>
              ))}
            </div>
          </Panel>

          {/* ── API access — coming soon ──────────────────────────── */}
          <Panel className="p-6">
            <PanelHeader
              title="API access"
              subtitle="Programmatic link management via REST API"
            />
            <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold">API keys — coming soon</p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  REST API access is on our roadmap. You&apos;ll be able to create, update, and delete links programmatically. Stay tuned.
                </p>
              </div>
            </div>
          </Panel>

          {/* ── Sessions ─────────────────────────────────────────────── */}
          <Panel className="p-6">
            <PanelHeader title="Active sessions" subtitle="Devices currently signed in" />
            <div className="mt-3 grid gap-1">
              {loading ? (
                [1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
                    <div className="size-10 shrink-0 animate-pulse rounded-xl bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonLine w="w-28" />
                      <SkeletonLine w="w-20" h="h-2.5" />
                    </div>
                    <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Monitor className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Current browser</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge tone="success">This device</Badge>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
