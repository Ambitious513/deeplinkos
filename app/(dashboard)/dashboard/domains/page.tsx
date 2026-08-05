'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Check,
  Copy,
  Globe,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Panel, PanelHeader, Badge, StatusDot, type Tone } from '@/components/dashboard/primitives'
import { Button } from '@/components/ui/button'
import { Field, TextInput } from '@/components/dashboard/form'
import { Modal } from '@/components/dashboard/modal'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/database.types'

type DomainRow = Database['public']['Tables']['domains']['Row']
type DomainStatus = 'active' | 'pending' | 'failed'

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Apex domain = brand.com (2 parts separated by 1 dot, ignoring ccTLDs for
 * simplicity). Subdomain = go.brand.com, links.brand.com, etc.
 * Brands using apex domains want: apple.com/promo → we handle the redirect.
 * Brands using subdomains want: go.apple.com/promo → we handle the redirect.
 */
function isApexDomain(domain: string): boolean {
  const parts = domain.split('.')
  // Simple heuristic: 2 parts = apex (brand.com), 3+ = subdomain (go.brand.com)
  // Works for most cases; ccTLDs (co.uk) are rare for custom deep link domains
  return parts.length === 2
}

function getSubdomainLabel(domain: string): string {
  const parts = domain.split('.')
  // e.g. go.brand.com → "go"
  if (parts.length >= 3) return parts.slice(0, parts.length - 2).join('.')
  return '@'
}

// The IP address brands point their A-record to for apex routing.
// For subdomain routing, we use a CNAME instead.
const APEX_A_RECORD_IP = '76.76.21.21' // Update to your actual server IP / Vercel edge IP

type DnsRecord = {
  type: 'A' | 'CNAME' | 'TXT'
  name: string
  value: string
  ttl: string
}

function buildDnsRecords(domain: DomainRow): DnsRecord[] {
  const isApex = isApexDomain(domain.domain_name)
  const nameLabel = isApex ? '@' : getSubdomainLabel(domain.domain_name)

  if (isApex) {
    return [
      { type: 'A',   name: '@',     value: APEX_A_RECORD_IP,                              ttl: 'Auto' },
      { type: 'TXT', name: '_dlos', value: domain.verification_token,                     ttl: 'Auto' },
    ]
  }

  return [
    { type: 'CNAME', name: nameLabel, value: domain.cname_target ?? 'cname.deeplinkos.com', ttl: 'Auto' },
    { type: 'TXT',   name: '_dlos',   value: domain.verification_token,                     ttl: 'Auto' },
  ]
}

// ─── status helpers ──────────────────────────────────────────────────────────

const statusMeta: Record<DomainStatus, { label: string; tone: Tone }> = {
  active: { label: 'Active', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  failed: { label: 'Failed', tone: 'danger' },
}

function normalisedStatus(raw: DomainRow['status']): DomainStatus {
  if (raw === 'active') return 'active'
  if (raw === 'failed' || raw === 'disabled') return 'failed'
  return 'pending'
}

// ─── copy button ─────────────────────────────────────────────────────────────

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard.writeText(value).catch(() => null)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy value"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors',
        copied
          ? 'border-success/40 bg-success-soft text-success'
          : 'border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground',
      )}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// ─── DNS records table ────────────────────────────────────────────────────────

function DnsTable({ records }: { records: DnsRecord[] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border">
      {/* Column header */}
      <div className="grid grid-cols-[56px_1fr_56px] gap-x-3 border-b border-border bg-muted/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Type</span>
        <span>Name / Value</span>
        <span className="text-right">TTL</span>
      </div>

      {/* Record rows */}
      {records.map((r, i) => (
        <div
          key={r.type + i}
          className="grid grid-cols-[56px_1fr_56px] gap-x-3 items-start border-b border-border px-4 py-3.5 last:border-0"
        >
          {/* Type badge — left column */}
          <div className="pt-0.5">
            <span
              className={cn(
                'inline-block rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide',
                r.type === 'CNAME' && 'bg-info-soft text-info',
                r.type === 'TXT'   && 'bg-warning-soft text-warning',
                r.type === 'A'     && 'bg-brand-soft text-brand',
              )}
            >
              {r.type}
            </span>
          </div>

          {/* Name + Value — middle column */}
          <div className="min-w-0 space-y-1.5">
            {/* Name */}
            <div className="flex items-center gap-2">
              <span className="w-9 shrink-0 text-[11px] text-muted-foreground">Name</span>
              <code className="truncate rounded bg-muted/60 px-2 py-0.5 font-mono text-xs text-foreground">
                {r.name}
              </code>
            </div>
            {/* Value — full width, truncated */}
            <div className="flex items-center gap-2">
              <span className="w-9 shrink-0 text-[11px] text-muted-foreground">Value</span>
              <code className="flex-1 truncate rounded bg-muted/60 px-2 py-0.5 font-mono text-xs text-foreground min-w-0">
                {r.value}
              </code>
            </div>
          </div>

          {/* TTL + Copy — right column, stacked */}
          <div className="flex flex-col items-end gap-2 pt-0.5">
            <span className="text-[11px] text-muted-foreground">{r.ttl}</span>
            <CopyBtn value={r.value} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="grid place-items-center gap-3 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-muted">
        <Globe className="size-7 text-muted-foreground" />
      </span>
      <p className="text-sm font-semibold">No custom domains yet</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Connect your own domain so links read as{' '}
        <code className="font-mono text-foreground">yourbrand.com/promo</code> instead of{' '}
        <code className="font-mono text-foreground">deeplinkos.com/promo</code>.
      </p>
      <Button size="sm" onClick={onAdd}>
        <Plus className="size-4" /> Add your first domain
      </Button>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function DomainsPage() {
  const [items, setItems] = useState<DomainRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addInput, setAddInput] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [addBusy, setAddBusy] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const active = items.find((d) => d.id === selected) ?? items[0] ?? null
  const activeStatus = active ? normalisedStatus(active.status) : 'pending'
  const sslStatus =
    active?.status === 'active' ? 'issued' : active?.status === 'pending' ? 'pending' : 'error'
  const dnsRecords = active ? buildDnsRecords(active) : []

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/domains', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed')
      const data = (await res.json()) as { demo?: boolean; domains?: DomainRow[] }
      if (!data.demo && data.domains) {
        setItems(data.domains)
        setSelected((prev) => prev ?? data.domains?.[0]?.id ?? null)
      }
    } catch {
      /* keep empty list */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const closeAdd = () => { setAddOpen(false); setAddError(null); setAddInput('') }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddBusy(true)
    setAddError(null)
    try {
      const res = await fetch('/api/dashboard/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainName: addInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not add domain.')
      closeAdd()
      await load()
      setSelected((data as { domain?: DomainRow }).domain?.id ?? null)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Could not add domain.')
    } finally {
      setAddBusy(false)
    }
  }

  async function handleVerify(id: string) {
    setVerifying(id)
    try {
      await fetch(`/api/dashboard/domains/${id}`, { method: 'PATCH' })
      await load()
    } finally {
      setVerifying(null)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Remove ${name}? This cannot be undone.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/dashboard/domains/${id}`, { method: 'DELETE' })
      if (res.ok) { await load(); setSelected(null) }
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Features"
        title="Custom Domains"
        description="Use your own brand domain so every link reads as yourbrand.com/slug, not deeplinkos.com/slug."
        action={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add domain
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,480px)] lg:items-start">
          {/* Skeleton domain list */}
          <Panel className="overflow-hidden">
            <div className="p-5 pb-3">
              <div className="h-4 w-36 animate-pulse rounded-full bg-muted" />
              <div className="mt-1.5 h-3 w-52 animate-pulse rounded-full bg-muted" />
            </div>
            <ul>
              {[1, 2].map((i) => (
                <li key={i} className="border-t border-border border-l-[3px] border-l-transparent px-[17px] py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 animate-pulse rounded-xl bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-32 animate-pulse rounded-full bg-muted" />
                      <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
                    </div>
                    <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          {/* Skeleton DNS panel */}
          <Panel className="p-5 space-y-3">
            <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
            <div className="h-28 animate-pulse rounded-xl bg-muted" />
          </Panel>
        </div>
      ) : items.length === 0 ? (
        <Panel><EmptyState onAdd={() => setAddOpen(true)} /></Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,480px)] lg:items-start">
          {/* Domains list */}
          <Panel className="overflow-hidden">
            <div className="p-5 pb-3">
              <PanelHeader title="Connected domains" subtitle="Select a domain to view DNS records" />
            </div>
            <ul>
              {items.map((d) => {
                const st = normalisedStatus(d.status)
                const meta = statusMeta[st]
                const isSel = d.id === selected
                return (
                  <li
                    key={d.id}
                    className={cn(
                      // Always reserve 3px on the left so layout is stable
                      'border-t border-border border-l-[3px] transition-colors',
                      isSel
                        ? 'border-l-brand bg-brand/[0.06]'          // bold blue bar + tint
                        : 'border-l-transparent hover:bg-muted/40 cursor-pointer', // clear hover
                    )}
                  >
                    <div className={cn(
                      'flex w-full items-center gap-2 py-4 pr-5',
                      // Compensate left padding for the 3px border so text stays aligned
                      isSel ? 'pl-[17px]' : 'pl-[17px]',
                    )}>
                      <button
                        type="button"
                        onClick={() => setSelected(d.id)}
                        className="flex flex-1 min-w-0 items-center gap-3 text-left"
                      >
                        <span className={cn(
                          'grid size-10 shrink-0 place-items-center rounded-xl transition-colors',
                          isSel
                            ? 'bg-brand/15 text-brand'          // blue icon when selected
                            : 'bg-muted text-muted-foreground', // grey when idle
                        )}>
                          <Globe className="size-[18px]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{d.domain_name}</p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <StatusDot tone={meta.tone} />
                            {isApexDomain(d.domain_name) ? 'Apex domain' : 'Subdomain'} ·{' '}
                            {new Date(d.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${d.domain_name}`}
                        disabled={deleting === d.id}
                        onClick={() => void handleDelete(d.id, d.domain_name)}
                        className="ml-1 grid size-7 shrink-0 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:border-danger/40 hover:text-danger disabled:opacity-40"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Panel>

          {/* DNS config panel */}
          {active && (
            <Panel className="p-5">
              <PanelHeader
                title="DNS configuration"
                subtitle={active.domain_name}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={verifying === active.id}
                    onClick={() => void handleVerify(active.id)}
                  >
                    <RefreshCw className={cn('size-4', verifying === active.id && 'animate-spin')} />
                    {verifying === active.id ? 'Checking…' : 'Verify'}
                  </Button>
                }
              />

              {/* SSL status */}
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
                {sslStatus === 'issued'
                  ? <ShieldCheck className="size-5 shrink-0 text-success" />
                  : <ShieldAlert className="size-5 shrink-0 text-warning" />
                }
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">SSL certificate</p>
                  <p className="text-xs text-muted-foreground">
                    {sslStatus === 'issued'
                      ? 'Issued and auto-renewing'
                      : sslStatus === 'pending'
                        ? 'Will provision automatically after DNS verifies'
                        : 'Failed — check DNS records below and re-verify'}
                  </p>
                </div>
                <Badge tone={sslStatus === 'issued' ? 'success' : sslStatus === 'pending' ? 'warning' : 'danger'}>
                  {sslStatus}
                </Badge>
              </div>


              {/* DNS records — clean label only */}
              <p className="mt-5 text-sm font-semibold">Required DNS records</p>

              {/* DNS table */}
              <DnsTable records={dnsRecords} />

              {activeStatus === 'pending' && (
                <p className="mt-3 text-xs text-muted-foreground">
                  DNS changes can take up to 48 hours to propagate. Click{' '}
                  <strong>Verify</strong> after adding the records above.
                </p>
              )}
            </Panel>
          )}
        </div>
      )}

      {/* Add domain modal */}
      <Modal
        open={addOpen}
        onClose={closeAdd}
        title="Add custom domain"
        description="Connect your brand domain so links read as yourbrand.com/slug instead of deeplinkos.com/slug."
        footer={
          <>
            <Button variant="outline" onClick={closeAdd}>
              <X className="size-4" /> Cancel
            </Button>
            <Button form="add-domain-form" type="submit" disabled={addBusy}>
              {addBusy ? 'Adding…' : 'Add domain'}
            </Button>
          </>
        }
      >
        <form id="add-domain-form" onSubmit={(e) => void handleAdd(e)} className="grid gap-4">
          {addError && (
            <p className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
              {addError}
            </p>
          )}
          <Field label="Domain name">
            <TextInput
              value={addInput}
              onChange={(e) => setAddInput(e.target.value)}
              placeholder="yourbrand.com or go.yourbrand.com"
              required
            />
          </Field>

          {/* Explain both options */}
          <div className="grid gap-2 rounded-xl border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Which should I use?</p>
            <p>
              <span className="font-medium text-foreground">Apex domain</span>{' '}
              <code className="font-mono">yourbrand.com</code> — links look like{' '}
              <code className="font-mono">yourbrand.com/promo</code>. Requires an A record.
            </p>
            <p>
              <span className="font-medium text-foreground">Subdomain</span>{' '}
              <code className="font-mono">go.yourbrand.com</code> — links look like{' '}
              <code className="font-mono">go.yourbrand.com/promo</code>. Requires a CNAME record.
            </p>
            <p className="flex items-center gap-1 pt-1 text-[11px]">
              Need a domain?{' '}
              <a
                href="https://www.namecheap.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-brand hover:underline"
              >
                Get one from Namecheap <ExternalLink className="size-2.5" />
              </a>
            </p>
          </div>
        </form>
      </Modal>
    </div>
  )
}
