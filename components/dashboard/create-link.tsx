'use client'

import { createContext, type FormEvent, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, Link2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/dashboard/modal'
import { Field, TextInput, SelectInput } from '@/components/dashboard/form'
import type { Database } from '@/lib/database.types'

type DomainRow = Database['public']['Tables']['domains']['Row']
type CreateLinkContextValue = { open: () => void }
const CreateLinkContext = createContext<CreateLinkContextValue | undefined>(undefined)

const DEFAULT_DOMAIN_LABEL = 'deeplinkos.com (default)'

// ─── UTM field definitions ────────────────────────────────────────────────────

const UTM_FIELDS = [
  { key: 'utmSource',   param: 'utm_source',   label: 'Source',   placeholder: 'instagram',     tip: 'Where the traffic comes from' },
  { key: 'utmMedium',   param: 'utm_medium',   label: 'Medium',   placeholder: 'social',        tip: 'Marketing channel' },
  { key: 'utmCampaign', param: 'utm_campaign', label: 'Campaign', placeholder: 'spring-sale',   tip: 'Campaign name or promotion' },
  { key: 'utmTerm',     param: 'utm_term',     label: 'Term',     placeholder: 'running+shoes', tip: 'Paid search keywords' },
  { key: 'utmContent',  param: 'utm_content',  label: 'Content',  placeholder: 'hero-banner',   tip: 'Which ad or element was clicked' },
] as const

type UtmKey = (typeof UTM_FIELDS)[number]['key']
type UtmValues = Record<UtmKey, string>

const EMPTY_UTM: UtmValues = {
  utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '',
}

// ─── UTM helpers ──────────────────────────────────────────────────────────────

function parseUtmFromUrl(url: string): Partial<UtmValues> | null {
  try {
    const u = new URL(url)
    const result: Partial<UtmValues> = {}
    let found = false
    for (const f of UTM_FIELDS) {
      const v = u.searchParams.get(f.param)
      if (v) { result[f.key] = v; found = true }
    }
    return found ? result : null
  } catch { return null }
}

function stripUtmFromUrl(url: string): string {
  try {
    const u = new URL(url)
    for (const f of UTM_FIELDS) u.searchParams.delete(f.param)
    // Remove trailing ? if nothing left
    return u.toString()
  } catch { return url }
}

function buildFinalUrl(base: string, utm: UtmValues): string {
  try {
    const u = new URL(base)
    for (const f of UTM_FIELDS) {
      const v = utm[f.key].trim()
      if (v) u.searchParams.set(f.param, v)
      else u.searchParams.delete(f.param)
    }
    return u.toString()
  } catch { return base }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CreateLinkProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isOpen, setIsOpen]       = useState(false)
  const [created, setCreated]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [createdUrl, setCreatedUrl] = useState<string | null>(null)

  // Domain
  const [domains, setDomains]               = useState<DomainRow[]>([])
  const [domainsLoading, setDomainsLoading] = useState(false)
  const [selectedDomainId, setSelectedDomainId] = useState('')

  // Form fields
  const [slug, setSlug]               = useState('')
  const [destUrl, setDestUrl]         = useState('')
  const [utm, setUtmState]            = useState<UtmValues>(EMPTY_UTM)
  const [utmOpen, setUtmOpen]         = useState(false)
  const [detectedUtm, setDetectedUtm] = useState<Partial<UtmValues> | null>(null)

  const utmCount    = Object.values(utm).filter(Boolean).length
  const hasUtm      = utmCount > 0
  const activeDomain = domains.find((d) => d.id === selectedDomainId)
  const previewHost  = activeDomain ? activeDomain.domain_name : 'deeplinkos.com'
  const previewSlug  = slug.trim().length >= 3 ? slug.trim() : '<auto>'
  const finalDestUrl = hasUtm && destUrl ? buildFinalUrl(destUrl, utm) : destUrl

  // ── Domain loading ────────────────────────────────────────────────────────
  const loadDomains = useCallback(async () => {
    setDomainsLoading(true)
    try {
      const res = await fetch('/api/dashboard/domains', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { demo?: boolean; domains?: DomainRow[] }
      if (!data.demo && data.domains) {
        setDomains(data.domains.filter((d) => d.status === 'active'))
      }
    } catch { /* use platform default */ }
    finally { setDomainsLoading(false) }
  }, [])

  const open = useCallback(() => {
    setCreated(false); setError(null); setCreatedUrl(null)
    setSlug(''); setDestUrl(''); setUtmState(EMPTY_UTM)
    setUtmOpen(false); setDetectedUtm(null); setSelectedDomainId('')
    setIsOpen(true)
    void loadDomains()
  }, [loadDomains])

  // ── Smart UTM detection ───────────────────────────────────────────────────
  const handleDestChange = (value: string) => {
    setDestUrl(value)
    setDetectedUtm(parseUtmFromUrl(value))
  }

  const applyDetectedUtm = () => {
    if (!detectedUtm) return
    setDestUrl(stripUtmFromUrl(destUrl))
    setUtmState((prev) => ({ ...prev, ...detectedUtm }))
    setUtmOpen(true)
    setDetectedUtm(null)
  }

  const setUtm = (key: UtmKey, value: string) =>
    setUtmState((prev) => ({ ...prev, [key]: value }))

  // ── Submit ────────────────────────────────────────────────────────────────
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const payload = {
      title:       String(form.get('title') || '').trim(),
      slug:        slug.trim(),
      destinationUrl: destUrl.trim(),
      domainId:    selectedDomainId || '',
      utmSource:   utm.utmSource.trim()   || undefined,
      utmMedium:   utm.utmMedium.trim()   || undefined,
      utmCampaign: utm.utmCampaign.trim() || undefined,
      utmTerm:     utm.utmTerm.trim()     || undefined,
      utmContent:  utm.utmContent.trim()  || undefined,
    }

    try {
      const res  = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to create link.')
      setCreatedUrl(data.shortUrl || `${previewHost}/${data.link?.slug || slug}`)
      setCreated(true)
      // Notify sidebar and any other listeners to re-fetch link count instantly
      window.dispatchEvent(new CustomEvent('deeplinkos:link-created'))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create link.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <CreateLinkContext.Provider value={{ open }}>
      {children}
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create smart link"
        description="Shorten, brand, and track every click with UTM attribution."
        footer={
          created ? (
            <Button onClick={() => setIsOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                <X className="size-4" /> Cancel
              </Button>
              <Button form="dashboard-create-link-form" type="submit" disabled={submitting}>
                <Link2 className="size-4" /> {submitting ? 'Creating…' : 'Create link'}
              </Button>
            </>
          )
        }
      >
        {created ? (
          /* ── Success ── */
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-success-soft text-success">
              <Check className="size-6" />
            </span>
            <p className="text-sm font-semibold">Smart link created!</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Your link is live at{' '}
              <a
                href={`https://${createdUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand hover:underline"
              >
                {createdUrl}
              </a>
            </p>
          </div>
        ) : (
          /* ── Form ── */
          <form id="dashboard-create-link-form" onSubmit={submit} className="grid gap-4">
            {error && (
              <p className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
                {error}
              </p>
            )}

            {/* Title */}
            <Field label="Link title">
              <TextInput name="title" placeholder="Spring Sale Landing" required />
            </Field>

            {/* Domain + Slug */}
            <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr]">
              <Field label="Domain">
                <SelectInput
                  value={selectedDomainId}
                  onChange={(e) => setSelectedDomainId(e.target.value)}
                  disabled={domainsLoading}
                >
                  <option value="">{domainsLoading ? 'Loading…' : DEFAULT_DOMAIN_LABEL}</option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>{d.domain_name}</option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="Slug (optional)">
                <TextInput
                  name="slug"
                  placeholder="spring-sale"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                {slug.length > 0 && slug.length < 3 && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Min. 3 characters — shorter slugs are auto-generated.
                  </p>
                )}
              </Field>
            </div>

            {/* Short URL preview pill */}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
              <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-mono text-xs text-muted-foreground">
                {previewHost}/{previewSlug}
              </span>
            </div>

            {/* Destination URL */}
            <Field label="Destination URL">
              <TextInput
                name="destinationUrl"
                placeholder="https://shop.yourband.com/spring"
                type="url"
                value={destUrl}
                onChange={(e) => handleDestChange(e.target.value)}
                required
              />
            </Field>

            {/* UTM detection banner */}
            {detectedUtm && (
              <div className="flex items-start gap-3 rounded-xl border border-brand/30 bg-brand/5 px-3.5 py-3">
                <Sparkles className="mt-px size-4 shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-brand">UTM parameters detected</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    Your URL contains tracking tags. Apply them to the UTM fields below for a cleaner short link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={applyDetectedUtm}
                  className="mt-px shrink-0 rounded-lg bg-brand px-2.5 py-1 text-[11px] font-bold text-white transition-opacity hover:opacity-85 active:scale-95"
                >
                  Apply
                </button>
              </div>
            )}

            {/* UTM Parameters accordion */}
            <div className="overflow-hidden rounded-xl border border-border">
              {/* Toggle header */}
              <button
                type="button"
                onClick={() => setUtmOpen((o) => !o)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">UTM Parameters</span>
                  {utmCount > 0 && (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                      {utmCount}
                    </span>
                  )}
                  {utmCount === 0 && (
                    <span className="text-xs text-muted-foreground">optional</span>
                  )}
                </div>
                <ChevronDown
                  className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${utmOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Expanded panel */}
              {utmOpen && (
                <div className="border-t border-border bg-muted/20 px-4 pb-4 pt-3">
                  {/* Source / Medium / Campaign — 3 columns on sm+ */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    {UTM_FIELDS.slice(0, 3).map((f) => (
                      <Field key={f.key} label={f.label}>
                        <TextInput
                          placeholder={f.placeholder}
                          value={utm[f.key]}
                          onChange={(e) => setUtm(f.key, e.target.value)}
                          title={f.tip}
                        />
                      </Field>
                    ))}
                  </div>

                  {/* Term / Content — 2 columns */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {UTM_FIELDS.slice(3).map((f) => (
                      <Field key={f.key} label={f.label}>
                        <TextInput
                          placeholder={f.placeholder}
                          value={utm[f.key]}
                          onChange={(e) => setUtm(f.key, e.target.value)}
                          title={f.tip}
                        />
                      </Field>
                    ))}
                  </div>

                  {/* Live final URL preview — only shown when dest + UTMs are set */}
                  {hasUtm && destUrl && (
                    <div className="mt-4 rounded-xl border border-border bg-card px-3.5 py-3">
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Final destination URL
                      </p>
                      <p className="break-all font-mono text-[11px] leading-relaxed text-foreground">
                        {finalDestUrl}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        )}
      </Modal>
    </CreateLinkContext.Provider>
  )
}

export function useCreateLink() {
  const ctx = useContext(CreateLinkContext)
  if (!ctx) throw new Error('useCreateLink must be used within CreateLinkProvider')
  return ctx
}
