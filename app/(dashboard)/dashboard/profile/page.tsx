'use client'

import { useEffect, useMemo, useState } from 'react'
import { Copy, Check, KeyRound, LogOut, Monitor } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Panel, PanelHeader, Badge } from '@/components/dashboard/primitives'
import { Field, TextInput, Toggle } from '@/components/dashboard/form'
import { Button } from '@/components/ui/button'
import type { AuthProfile } from '@/lib/auth/session'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initialsFor(name: string, email?: string) {
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  // Fallback to email prefix
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
  const [copied, setCopied]     = useState(false)
  const [notif, setNotif]       = useState({ weekly: true, alerts: true, product: false })

  const apiKey = 'dlos_live_8f3a················2b71'

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

  const copyKey = () => {
    void navigator.clipboard.writeText(apiKey).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
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
            <PanelHeader title="Notification preferences" subtitle="Choose what lands in your inbox" />
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

          {/* ── API key ──────────────────────────────────────────────── */}
          <Panel className="p-6">
            <PanelHeader
              title="API access"
              subtitle="Use this key to manage links programmatically"
              action={
                <Button variant="outline" size="sm">
                  <KeyRound className="size-4" /> Rotate
                </Button>
              }
            />
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
              <code className="flex-1 truncate font-mono text-sm">{apiKey}</code>
              <button
                type="button"
                onClick={copyKey}
                aria-label="Copy API key"
                className="grid size-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              </button>
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
