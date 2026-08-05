'use client'

import { Eye, MousePointerClick, ShoppingCart, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Panel, PanelHeader, Badge } from '@/components/dashboard/primitives'
import { Button } from '@/components/ui/button'
import type { PixelIntegration } from '@/lib/dashboard-types'

const events = [
  { id: 'pv', name: 'Page view', desc: 'Fires when a destination loads', icon: Eye, tone: 'info' as const },
  { id: 'open', name: 'App open', desc: 'Fires on successful deep link open', icon: MousePointerClick, tone: 'brand' as const },
  { id: 'conv', name: 'Conversion', desc: 'Fires on purchase or signup', icon: ShoppingCart, tone: 'success' as const },
]

// Static integration catalogue — real connection state will come from DB in Phase 3
const pixels: PixelIntegration[] = [
  { id: 'ga4',     name: 'Google Analytics 4', description: 'Send page views and conversions to GA4 measurement IDs.', status: 'available' },
  { id: 'meta',    name: 'Meta Pixel',          description: 'Track app opens and purchases across Meta ad accounts.',  status: 'available' },
  { id: 'tiktok',  name: 'TikTok Pixel',        description: 'Attribute creator-driven traffic to TikTok campaigns.',  status: 'available' },
]

const toneTile: Record<string, string> = {
  info: 'bg-info-soft text-info',
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
}

export default function PixelsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Features"
        title="Pixels"
        description="Attach tracking pixels to your smart links and forward conversion events to your ad platforms."
        action={<Badge tone="brand">Beta</Badge>}
      />

      {/* Hero / readiness */}
      <Panel className="overflow-hidden border-transparent bg-success p-6 text-white sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              <Sparkles className="size-3.5" /> Coming soon
            </div>
            <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
              Conversion tracking, built into every link
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              We&apos;re finishing GA4, Meta, and TikTok pixel forwarding. Join the
              beta to start firing events the moment it ships.
            </p>
          </div>
          <Button className="h-11 shrink-0 rounded-xl bg-white px-5 text-success hover:bg-white/90">
            Join the beta
          </Button>
        </div>
      </Panel>

      {/* Integrations */}
      <div>
        <h3 className="mb-3 text-base font-semibold tracking-tight">Planned integrations</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pixels.map((p) => (
            <Panel key={p.id} className="flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-muted font-bold text-foreground">
                  {p.name.slice(0, 2).toUpperCase()}
                </span>
                <Badge tone="neutral">Available soon</Badge>
              </div>
              <p className="mt-3 font-semibold">{p.name}</p>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
              <Button variant="outline" className="mt-4 w-full" disabled>
                Connect
              </Button>
            </Panel>
          ))}
        </div>
      </div>

      {/* Event preview */}
      <Panel className="p-5">
        <PanelHeader
          title="Event preview"
          subtitle="Events that will be forwarded once a pixel is connected"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {events.map((e) => {
            const Icon = e.icon
            return (
              <div key={e.id} className="rounded-2xl border border-border bg-background/60 p-4">
                <span
                  className={`grid size-10 place-items-center rounded-xl ${toneTile[e.tone]}`}
                >
                  <Icon className="size-[18px]" />
                </span>
                <p className="mt-3 text-sm font-semibold">{e.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{e.desc}</p>
                <code className="mt-3 block truncate rounded-lg bg-muted/60 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                  dlos.track(&apos;{e.id}&apos;)
                </code>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
