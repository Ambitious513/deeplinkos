'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'
import { Download, QrCode } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Panel, PanelHeader } from '@/components/dashboard/primitives'
import { Field, SelectInput, TextInput } from '@/components/dashboard/form'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { mapLinkRecordToDashboardLink, shortUrlForSlug } from '@/lib/dashboard-adapters'
import type { DeepLink } from '@/lib/dashboard-types'
import type { LinkRecord } from '@/lib/types'

// ─── Presets ──────────────────────────────────────────────────────────────────

const presets = [
  { name: 'Sunset',   fg: '#ea6a1c', bg: '#ffffff' },
  { name: 'Forest',   fg: '#168558', bg: '#ffffff' },
  { name: 'Ink',      fg: '#14171d', bg: '#ffffff' },
  { name: 'Ocean',    fg: '#2563eb', bg: '#eaf1ff' },
  { name: 'Inverted', fg: '#ffffff', bg: '#14171d' },
]

// ─── Real QR canvas preview ───────────────────────────────────────────────────

function QrCanvas({
  value, fg, bg, canvasRef,
}: {
  value: string
  fg: string
  bg: string
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}) {
  useEffect(() => {
    if (!canvasRef.current || !value) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: 208,
      margin: 2,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: 'H',
    }).catch(() => {/* ignore */})
  }, [value, fg, bg, canvasRef])

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl"
      style={{ width: 208, height: 208 }}
      aria-label="QR code preview"
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QrDesignerPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
      <QrDesigner />
    </Suspense>
  )
}

function QrDesigner() {
  const searchParams  = useSearchParams()
  const preSlug       = searchParams.get('slug')
  const [links, setLinks]             = useState<DeepLink[]>([])
  const [loading, setLoading]         = useState(true)
  const [linkId, setLinkId]           = useState('')
  const [destination, setDestination] = useState('')
  const [fg, setFg]                   = useState('#ea6a1c')
  const [bg, setBg]                   = useState('#ffffff')
  const [exportSize, setExportSize]   = useState(512)
  const [downloading, setDownloading] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ── Full short URL (needs https:// so scanners resolve it) ───────────────
  const qrValue = destination
    ? destination.startsWith('http')
      ? destination
      : `https://${destination}`
    : ''

  // ── Load real links ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/links', { cache: 'no-store' })
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((data: { links?: LinkRecord[] }) => {
        const live = (data.links || []).map((l) => mapLinkRecordToDashboardLink(l, 0))
        if (live.length) {
          setLinks(live)
          // Pre-select the slug from URL param, or default to first link
          const target = preSlug
            ? (live.find((l) => l.slug === preSlug) ?? live[0])
            : live[0]
          setLinkId(target.id)
          setDestination(shortUrlForSlug(target.slug))
        }
      })
      .catch(() => { /* leave empty */ })
      .finally(() => setLoading(false))
  }, [])

  const handleLinkChange = (id: string) => {
    setLinkId(id)
    const found = links.find((l) => l.id === id)
    if (found) setDestination(shortUrlForSlug(found.slug))
  }

  // ── Download: re-render at full export size, then save PNG ──────────────
  const downloadPng = useCallback(async () => {
    if (!qrValue) return
    setDownloading(true)
    try {
      const dataUrl = await QRCode.toDataURL(qrValue, {
        width: exportSize,
        margin: 2,
        color: { dark: fg, light: bg },
        errorCorrectionLevel: 'H',
        type: 'image/png',
      })
      const a    = document.createElement('a')
      a.href     = dataUrl
      a.download = `qr-${destination.replace(/[^a-z0-9]/gi, '-')}.png`
      a.click()
    } catch (err) {
      console.error('QR export failed', err)
    } finally {
      setDownloading(false)
    }
  }, [qrValue, exportSize, fg, bg, destination])

  const noLinks = !loading && links.length === 0

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Design"
        title="QR Designer"
        description="Generate scannable, branded QR codes for any smart link and export print-ready PNGs."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
        {/* ── Preview panel ───────────────────────────────────────────── */}
        <Panel className="flex flex-col items-center gap-4 p-6">
          <div className="grid w-full place-items-center rounded-2xl border border-dashed border-border bg-muted/40 py-8">
            {loading ? (
              <div className="grid h-[208px] w-[208px] animate-pulse place-items-center rounded-xl bg-muted">
                <QrCode className="size-16 text-muted-foreground/30" />
              </div>
            ) : noLinks ? (
              <div className="grid h-[208px] w-[208px] place-items-center gap-2 rounded-xl border border-border bg-background/60 text-center">
                <QrCode className="size-10 text-muted-foreground/40" />
                <p className="max-w-[140px] text-xs text-muted-foreground">
                  Create a smart link first to generate a QR code.
                </p>
              </div>
            ) : (
              <QrCanvas
                value={qrValue}
                fg={fg}
                bg={bg}
                canvasRef={canvasRef}
              />
            )}
          </div>

          <div className="w-full text-center">
            <p className="truncate text-sm font-semibold">
              {loading ? 'Loading…' : qrValue || 'No link selected'}
            </p>
            <p className="text-xs text-muted-foreground">
              {exportSize} × {exportSize}px • PNG • Error correction: High
            </p>
          </div>

          <Button
            className="h-11 w-full rounded-xl"
            onClick={downloadPng}
            disabled={loading || noLinks || !qrValue || downloading}
          >
            <Download className="size-4" />
            {downloading ? 'Exporting…' : 'Download PNG'}
          </Button>
        </Panel>

        {/* ── Controls panel ──────────────────────────────────────────── */}
        <Panel className="p-6">
          <PanelHeader title="Customize" subtitle="Link, destination, colors and export size" />
          <div className="mt-5 grid gap-5">

            {/* Link selector + custom destination */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Smart link">
                {loading ? (
                  <div className="h-10 animate-pulse rounded-xl bg-muted" />
                ) : noLinks ? (
                  <div className="flex h-10 items-center rounded-xl border border-border px-3 text-sm text-muted-foreground">
                    No links yet
                  </div>
                ) : (
                  <SelectInput value={linkId} onChange={(e) => handleLinkChange(e.target.value)}>
                    {links.map((l) => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </SelectInput>
                )}
              </Field>

              <Field label="Custom URL">
                <TextInput
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="deeplinkos.com/my-link"
                  disabled={loading}
                />
              </Field>
            </div>

            {/* Color presets */}
            <div className="grid gap-2">
              <span className="text-sm font-semibold">Color presets</span>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => {
                  const active = p.fg === fg && p.bg === bg
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => { setFg(p.fg); setBg(p.bg) }}
                      aria-pressed={active}
                      className={cn(
                        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                        active
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border hover:bg-muted',
                      )}
                    >
                      <span
                        className="size-4 rounded-full border border-border"
                        style={{ background: p.fg }}
                      />
                      {p.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color pickers */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Foreground (dark modules)">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fg}
                    onChange={(e) => setFg(e.target.value)}
                    aria-label="Foreground color"
                    className="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent"
                  />
                  <TextInput value={fg} onChange={(e) => setFg(e.target.value)} />
                </div>
              </Field>
              <Field label="Background (light modules)">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    aria-label="Background color"
                    className="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent"
                  />
                  <TextInput value={bg} onChange={(e) => setBg(e.target.value)} />
                </div>
              </Field>
            </div>

            {/* Export size slider */}
            <Field label={`Export size — ${exportSize}px`}>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={256}
                  max={1024}
                  step={64}
                  value={exportSize}
                  onChange={(e) => setExportSize(Number(e.target.value))}
                  className="w-full accent-brand"
                  aria-label="QR export size"
                />
                <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {exportSize}px
                </span>
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>256 (web)</span>
                <span>640 (social)</span>
                <span>1024 (print)</span>
              </div>
            </Field>

            {/* Info note */}
            <p className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Error correction: High (30%)</span> — QR codes remain scannable even if up to 30% of the image is obscured or damaged, ideal for printed materials.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  )
}
