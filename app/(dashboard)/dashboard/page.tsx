'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowUpRight,
  Info,
  CheckCircle2,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { KpiGrid } from '@/components/dashboard/kpi-grid'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { DateRangeControl } from '@/components/dashboard/date-range'
import {
  Panel,
  PanelHeader,
  ProgressBar,
  Badge,
  IconTile,
  type Tone,
} from '@/components/dashboard/primitives'
import { shortUrlForSlug } from '@/lib/dashboard-adapters'
import type { DateRange, Kpi, SeriesPoint, DeviceSlice, ReferrerRow, DeepLink, AttentionItem } from '@/lib/dashboard-types'

const deviceIcons = { Mobile: Smartphone, Desktop: Monitor, Tablet: Tablet } as const

const severityTone: Record<string, Tone> = {
  danger: 'danger',
  warning: 'warning',
  info: 'info',
}

/** Normalise DB label ('mobile' / 'MOBILE') → 'Mobile' for icon lookup */
function toTitleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

/** Always returns a valid icon — falls back to Smartphone for unknown types */
function getDeviceIcon(label: string) {
  return deviceIcons[label as keyof typeof deviceIcons] ?? Smartphone
}

/** Derive attention items from real summary data */
function buildAttentionItems(summary: {
  paused_links?: number
  active_links?: number
  top_referrer?: string
}): AttentionItem[] {
  const items: AttentionItem[] = []

  const paused = Number(summary.paused_links ?? 0)
  if (paused > 0) {
    items.push({
      id: 'paused-links',
      severity: 'warning',
      title: `${paused} paused link${paused === 1 ? '' : 's'}`,
      detail: 'These links are not receiving traffic. Resume them when ready.',
    })
  }

  const active = Number(summary.active_links ?? 0)
  if (active === 0 && paused === 0) {
    items.push({
      id: 'no-links',
      severity: 'info',
      title: 'No links yet',
      detail: 'Create your first smart link to start tracking clicks and performance.',
    })
  }

  return items
}

export default function OverviewPage() {
  const [range, setRange] = useState<DateRange>('7d')
  const [loading, setLoading] = useState(true)   // true on first mount — prevents mock flash
  const [live, setLive] = useState<{
    kpis: Kpi[]
    clicksByDay: SeriesPoint[]
    devices: DeviceSlice[]
    referrers: ReferrerRow[]
    topLinks: DeepLink[]
    attentionItems: AttentionItem[]
    isLive: boolean
  } | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dashboard/analytics?range=${range}`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Analytics unavailable')
        return response.json()
      })
      .then((data) => {
        // Only go demo-mode when the server explicitly says so (unauthenticated)
        if (data.demo) {
          setLive(null)
          return
        }

        // summary may be null for a brand-new user with 0 clicks — treat as zeros
        const summary = data.summary || {}
        const global = data.global || {}
        const totalClicks     = Number(summary.total_clicks    || 0)
        const uniqueVisitors  = Number(summary.unique_visitors || 0)
        const totalDeviceClicks = (global.devices || []).reduce(
          (sum: number, row: { clicks: number }) => sum + Number(row.clicks || 0), 0
        )
        const totalRefClicks = (global.referrers || []).reduce(
          (sum: number, row: { clicks: number }) => sum + Number(row.clicks || 0), 0
        )
        // Engagement rate = unique visitors / total clicks × 100
        const engagementRate  = totalClicks > 0 ? Math.round((uniqueVisitors / totalClicks) * 1000) / 10 : 0

        setLive({
          isLive: true,
          kpis: [
            { id: 'clicks',   label: 'Total clicks',    value: totalClicks.toLocaleString(),                           delta: 'live',                                         trend: 'up', featured: true },
            { id: 'visitors', label: 'Unique visitors', value: uniqueVisitors.toLocaleString(),                        delta: 'tracked',                                      trend: 'up' },
            { id: 'active',   label: 'Active links',    value: Number(summary.active_links || 0).toLocaleString(),    delta: `${Number(summary.paused_links || 0)} paused`,   trend: 'up' },
            { id: 'referrer', label: 'Top referrer',    value: summary.top_referrer || 'Direct',                      delta: 'source',                                       trend: 'up' },
            { id: 'success',  label: 'Open success',    value: totalClicks > 0 ? `${engagementRate}%` : '—',          delta: 'engagement',                                   trend: 'up' },
          ],
          clicksByDay: (data.clicksByDay || []).map((row: { click_date: string; click_count: number; unique_visitors: number }) => ({
            label:   new Date(row.click_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            value:   Number(row.click_count    || 0),
            compare: Number(row.unique_visitors || 0),
          })),
          devices: (global.devices || []).slice(0, 3).map((row: { label: string; clicks: number }, index: number) => ({
            label:    toTitleCase(row.label || 'unknown'),
            sessions: Number(row.clicks || 0),
            share:    totalDeviceClicks ? Math.round((Number(row.clicks || 0) / totalDeviceClicks) * 1000) / 10 : 0,
            tone:     index === 0 ? 'brand' : index === 1 ? 'info' : 'success',
          })),
          referrers: (global.referrers || []).slice(0, 5).map((row: { label: string; clicks: number }) => ({
            source: row.label || 'Direct',
            visits: Number(row.clicks || 0),
            share:  totalRefClicks ? Math.round((Number(row.clicks || 0) / totalRefClicks) * 1000) / 10 : 0,
          })),
          topLinks: (global.top_links || []).slice(0, 5).map((row: { id: string; title: string; slug: string; clicks: number }) => ({
            id:          row.id,
            title:       row.title,
            slug:        row.slug,
            destination: '',
            platform:    'Smart link',
            status:      'active' as const,
            clicks:      Number(row.clicks || 0),
            openRate:    0,
            createdAt:   '',
          })),
          attentionItems: buildAttentionItems(summary),
        })
      })
      .catch(() => setLive(null))
      .finally(() => setLoading(false))
  }, [range])

  const view = useMemo(
    () => ({
      // live !== null  → authenticated user (may have 0 data) → show real values
      // live === null  → not authenticated / API error         → show empty states
      kpis:           loading ? [] : (live?.kpis ?? []),
      clicksByDay:    loading ? [] : (live?.clicksByDay ?? []),
      devices:        loading ? [] : (live?.devices ?? []),
      referrers:      loading ? [] : (live?.referrers ?? []),
      topLinks:       loading ? [] : (live?.topLinks ?? []),
      attentionItems: loading ? [] : (live?.attentionItems ?? []),
      isLive:         live?.isLive ?? false,
    }),
    [live, loading],
  )

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Workspace"
        title="Overview"
        description="A real-time snapshot of clicks, audiences, and links that need your attention."
        action={<DateRangeControl value={range} onChange={setRange} />}
      />

      <KpiGrid items={view.kpis} loading={loading} />

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        {/* Trend chart */}
        <Panel className="p-5">
          <PanelHeader
            title="Traffic trend"
            subtitle="Clicks vs. previous period"
            action={
              <div className="hidden items-center gap-3 text-xs font-medium text-muted-foreground sm:flex">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-brand" /> This period
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-muted-foreground/50" /> Previous
                </span>
              </div>
            }
          />
          <div className="mt-4">
            {loading ? (
              <div className="h-40 animate-pulse rounded-xl bg-muted" />
            ) : (
              <TrendChart data={view.clicksByDay} />
            )}
          </div>
        </Panel>

        {/* Device breakdown */}
        <Panel className="p-5">
          <PanelHeader title="Device breakdown" subtitle="Sessions by device type" />
          <div className="mt-4 grid gap-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="grid gap-2">
                  <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 animate-pulse rounded-xl bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-16 animate-pulse rounded-full bg-muted" />
                      <div className="h-2.5 w-12 animate-pulse rounded-full bg-muted" />
                    </div>
                    <div className="h-4 w-8 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-1.5 animate-pulse rounded-full bg-muted" />
                </div>
              ))
            ) : (
              view.devices.map((d) => {
                const Icon = getDeviceIcon(d.label)
                return (
                  <div key={d.label} className="grid gap-2">
                    <div className="flex items-center gap-3">
                      <IconTile tone={d.tone}>
                        <Icon className="size-[18px]" />
                      </IconTile>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{d.label}</p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {d.sessions.toLocaleString()} sessions
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums">{d.share}%</span>
                    </div>
                    <ProgressBar value={d.share} tone={d.tone} />
                  </div>
                )
              })
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Top links */}
        <Panel className="p-5 xl:col-span-2">
          <PanelHeader
            title="Top performing links"
            subtitle="Highest click volume this period"
          />
          <ul className="mt-2">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
                  <div className="size-7 shrink-0 animate-pulse rounded-lg bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
                    <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-3 w-10 animate-pulse rounded-full bg-muted" />
                </li>
              ))
            ) : (
              view.topLinks.map((link, i) => (
                <li
                  key={link.id}
                  className="flex items-center gap-3 border-b border-border py-3 last:border-0"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{link.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {shortUrlForSlug(link.slug)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums">
                      {link.clicks.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Panel>

        {/* Referrers */}
        <Panel className="p-5">
          <PanelHeader title="Top sources" subtitle="Where clicks come from" />
          <ul className="mt-2">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <li key={i} className="grid gap-1.5 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-3 w-8 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-1.5 animate-pulse rounded-full bg-muted" />
                </li>
              ))
            ) : (
              view.referrers.map((r) => (
                <li key={r.source} className="grid gap-1.5 py-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{r.source}</span>
                    <span className="font-bold tabular-nums">{r.share}%</span>
                  </div>
                  <ProgressBar value={r.share} tone="brand" />
                </li>
              ))
            )}
          </ul>
        </Panel>
      </div>

      {/* Attention items */}
      <Panel className="p-5">
        <PanelHeader
          title="Needs attention"
          subtitle="Links and domains flagged for review"
          action={
            <Link href="/dashboard/links" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
              View all <ArrowUpRight className="size-4" />
            </Link>
          }
        />

        {loading ? (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 rounded-2xl border border-border bg-background/60 p-4">
                <div className="size-10 shrink-0 animate-pulse rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
                  <div className="h-2.5 w-32 animate-pulse rounded-full bg-muted" />
                  <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : view.isLive && view.attentionItems.length === 0 ? (
          /* All-clear state when live and no issues */
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-success-soft/40 p-4">
            <IconTile tone="success">
              <CheckCircle2 className="size-[18px]" />
            </IconTile>
            <div>
              <p className="text-sm font-semibold">All links healthy</p>
              <p className="text-xs text-muted-foreground">No issues detected across your workspace.</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {view.attentionItems.map((item) => {
              const tone = severityTone[item.severity]
              const Icon = item.severity === 'info' ? Info : AlertTriangle
              return (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-border bg-background/60 p-4"
                >
                  <IconTile tone={tone}>
                    <Icon className="size-[18px]" />
                  </IconTile>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.detail}
                    </p>
                    <div className="mt-2">
                      <Badge tone={tone}>{item.severity}</Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}
