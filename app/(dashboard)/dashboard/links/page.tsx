'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Copy,
  Pencil,
  QrCode,
  Pause,
  Play,
  Search,
  Check,
  Trash2,
  X,
  Link2,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Panel, Badge, Segmented, type Tone } from '@/components/dashboard/primitives'
import { TextInput, Field, SelectInput } from '@/components/dashboard/form'
import { Modal } from '@/components/dashboard/modal'
import { Button } from '@/components/ui/button'
import { type DeepLink, type LinkStatus } from '@/lib/dashboard-types'
import { mapLinkRecordToDashboardLink, shortUrlForSlug } from '@/lib/dashboard-adapters'
import type { LinkRecord } from '@/lib/types'

type Filter = 'all' | 'active' | 'paused' | 'attention'

const statusMeta: Record<LinkStatus, { label: string; tone: Tone }> = {
  active: { label: 'Active', tone: 'success' },
  paused: { label: 'Paused', tone: 'neutral' },
  attention: { label: 'Needs attention', tone: 'warning' },
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

type EditState = {
  link: DeepLink
  title: string
  destinationUrl: string
  preset: string
}

function EditModal({
  state,
  onClose,
  onSaved,
}: {
  state: EditState | null
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState('')
  const [dest, setDest] = useState('')
  const [preset, setPreset] = useState('custom')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync form values when a different link is opened for editing
  useEffect(() => {
    if (state) {
      setTitle(state.title)
      setDest(state.destinationUrl)
      setPreset(state.preset)
      setError(null)
    }
  }, [state])

  const close = () => { setError(null); onClose() }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!state) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/links/${state.link.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          destinationUrl: dest.trim(),
          preset,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not update link.')
      onSaved()
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update link.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={!!state}
      onClose={close}
      title="Edit smart link"
      description={state ? shortUrlForSlug(state.link.slug) : ''}
      footer={
        <>
          <Button variant="outline" onClick={close}>
            <X className="size-4" /> Cancel
          </Button>
          <Button form="edit-link-form" type="submit" disabled={busy}>
            <Link2 className="size-4" /> {busy ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form id="edit-link-form" onSubmit={(e) => void submit(e)} className="grid gap-4">
        {error && (
          <p className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <Field label="Link title">
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Spring Sale Landing"
            required
          />
        </Field>
        <Field label="Destination URL">
          <TextInput
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="https://yoursite.com/page"
            type="url"
            required
          />
        </Field>
        <Field label="Platform routing">
          <SelectInput value={preset} onChange={(e) => setPreset(e.target.value)}>
            <option value="custom">Smart (auto-detect)</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="amazon">Amazon</option>
            <option value="walmart">Walmart</option>
          </SelectInput>
        </Field>
      </form>
    </Modal>
  )
}

// ─── Row actions ──────────────────────────────────────────────────────────────

function LinkActions({
  link,
  onChanged,
  onEdit,
}: {
  link: DeepLink
  onChanged: () => void
  onEdit: (link: DeepLink) => void
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const copy = async () => {
    try { await navigator.clipboard.writeText(shortUrlForSlug(link.slug)) } catch { /* blocked */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const toggle = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/links/${link.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: link.status !== 'active' }),
      })
      if (res.ok) onChanged()
    } finally { setBusy(false) }
  }

  const remove = async () => {
    if (!window.confirm(`Delete "${link.title}"? This cannot be undone.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/links/${link.slug}`, { method: 'DELETE' })
      if (res.ok) onChanged()
    } finally { setBusy(false) }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <IconBtn label="Copy link" onClick={copy} disabled={busy}>
        {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      </IconBtn>
      <IconBtn label="Edit link" onClick={() => onEdit(link)} disabled={busy}>
        <Pencil className="size-4" />
      </IconBtn>
      <IconBtn label="QR code" onClick={() => router.push(`/dashboard/qr?slug=${link.slug}`)}>
        <QrCode className="size-4" />
      </IconBtn>
      {link.status === 'paused' ? (
        <IconBtn label="Resume" onClick={toggle} disabled={busy}>
          <Play className="size-4" />
        </IconBtn>
      ) : (
        <IconBtn label="Pause" onClick={toggle} disabled={busy}>
          <Pause className="size-4" />
        </IconBtn>
      )}
      <IconBtn label="Delete" onClick={remove} disabled={busy} danger>
        <Trash2 className="size-4" />
      </IconBtn>
    </div>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
  disabled,
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={
        'grid size-8 place-items-center rounded-lg border border-border bg-card transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 ' +
        (danger
          ? 'text-muted-foreground hover:border-danger/40 hover:text-danger'
          : 'text-muted-foreground hover:text-foreground')
      }
    >
      {children}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LinksPage() {
  const router        = useRouter()
  const searchParams   = useSearchParams()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery]   = useState(searchParams.get('q') ?? '')
  const [items, setItems] = useState<DeepLink[]>([])
  const [error, setError]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [editState, setEditState] = useState<EditState | null>(null)

  const loadLinks = async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await fetch('/api/links', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load links')
      const data = (await response.json()) as {
        links?: LinkRecord[]
        clickCounts?: Record<string, number>
      }
      const counts = data.clickCounts ?? {}
      setItems((data.links ?? []).map((l) => mapLinkRecordToDashboardLink(l, counts[l.id] ?? 0)))
    } catch {
      setError(true)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadLinks() // Initial load

    // Refetch instantly when a link is created (same event fired by create-link modal)
    window.addEventListener('deeplinkos:link-created', loadLinks)
    // Also catch edits/changes made in other tabs
    window.addEventListener('focus', loadLinks)

    return () => {
      window.removeEventListener('deeplinkos:link-created', loadLinks)
      window.removeEventListener('focus', loadLinks)
    }
  }, [])

  const openEdit = (link: DeepLink) => {
    setEditState({
      link,
      title: link.title,
      destinationUrl: link.destination,
      preset: link.platform?.toLowerCase() ?? 'custom',
    })
  }

  const filtered = useMemo(() => {
    return items.filter((l) => {
      const matchesFilter = filter === 'all' || l.status === filter
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.slug.toLowerCase().includes(q) ||
        l.destination.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [filter, items, query])

  const counts = useMemo(
    () => ({
      all: items.length,
      active: items.filter((l) => l.status === 'active').length,
      paused: items.filter((l) => l.status === 'paused').length,
      attention: items.filter((l) => l.status === 'attention').length,
    }),
    [items],
  )

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Manage"
        title="Links"
        description={
          error
            ? 'Could not load links — check your connection and try again.'
            : 'Search, filter, and manage every smart link in your workspace.'
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented
          options={[
            { label: `All (${counts.all})`, value: 'all' },
            { label: `Active (${counts.active})`, value: 'active' },
            { label: `Paused (${counts.paused})`, value: 'paused' },
            { label: `Attention (${counts.attention})`, value: 'attention' },
          ]}
          value={filter}
          onChange={setFilter}
          size="sm"
        />
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={loading ? 'Loading links…' : 'Search links…'}
            className="pl-9"
            aria-label="Search links"
          />
        </div>
      </div>

      {/* Desktop table */}
      <Panel className="hidden overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 text-left font-semibold">Smart link</th>
                <th className="px-5 py-3 text-left font-semibold">Platform</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Clicks</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton rows while fetching
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="h-3.5 w-40 animate-pulse rounded-full bg-muted" />
                      <div className="mt-1.5 h-2.5 w-28 animate-pulse rounded-full bg-muted" />
                    </td>
                    <td className="px-5 py-3.5"><div className="h-3 w-16 animate-pulse rounded-full bg-muted" /></td>
                    <td className="px-5 py-3.5"><div className="h-5 w-14 animate-pulse rounded-full bg-muted" /></td>
                    <td className="px-5 py-3.5 text-right"><div className="ml-auto h-3 w-10 animate-pulse rounded-full bg-muted" /></td>
                    <td className="px-5 py-3.5"><div className="h-8 w-24 animate-pulse rounded-lg bg-muted" /></td>
                  </tr>
                ))
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{shortUrlForSlug(l.slug)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{l.platform}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={statusMeta[l.status].tone}>
                        {statusMeta[l.status].label}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                      {l.clicks.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <LinkActions link={l} onChanged={loadLinks} onEdit={openEdit} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && <EmptyState />}
      </Panel>

      {/* Mobile cards */}
      <div className="grid gap-3 lg:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Panel key={i} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-36 animate-pulse rounded-full bg-muted" />
                  <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
              </div>
            </Panel>
          ))
        ) : (
          <>
            {filtered.map((l) => (
              <Panel key={l.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{l.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{shortUrlForSlug(l.slug)}</p>
                  </div>
                  <Badge tone={statusMeta[l.status].tone}>{statusMeta[l.status].label}</Badge>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span>
                    <span className="font-bold tabular-nums">{l.clicks.toLocaleString()}</span>{' '}
                    <span className="text-muted-foreground">clicks</span>
                  </span>
                  <span className="text-muted-foreground">{l.platform}</span>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  <LinkActions link={l} onChanged={loadLinks} onEdit={openEdit} />
                </div>
              </Panel>
            ))}
            {filtered.length === 0 && (
              <Panel className="p-4"><EmptyState /></Panel>
            )}
          </>
        )}
      </div>

      {/* Edit modal */}
      <EditModal
        state={editState}
        onClose={() => setEditState(null)}
        onSaved={loadLinks}
      />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="grid place-items-center gap-2 px-6 py-14 text-center">
      <p className="text-sm font-semibold">No links match your filters</p>
      <p className="text-sm text-muted-foreground">
        Try a different search term or status filter.
      </p>
    </div>
  )
}
