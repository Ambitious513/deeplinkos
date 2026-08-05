'use client'

import { useEffect, useMemo, useState } from 'react'
import { Smartphone, Monitor, Tablet } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { DateRangeControl } from '@/components/dashboard/date-range'
import {
  Panel,
  PanelHeader,
  ProgressBar,
  IconTile,
  Segmented,
} from '@/components/dashboard/primitives'
import type { DateRange, SeriesPoint, DeviceSlice, ReferrerRow, CountryRow, CampaignRow } from '@/lib/dashboard-types'

// ─── helpers ─────────────────────────────────────────────────────────────────

const deviceIcons = { Mobile: Smartphone, Desktop: Monitor, Tablet: Tablet } as const

/** Normalise DB label ('mobile' / 'MOBILE') → 'Mobile' for icon lookup */
function toTitleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

/** Always returns a valid icon — falls back to Smartphone for unknown types */
function getDeviceIcon(label: string) {
  return deviceIcons[label as keyof typeof deviceIcons] ?? Smartphone
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function SkeletonLine({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${h} ${w} animate-pulse rounded-full bg-muted`} />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>('30d')
  const [compare, setCompare] = useState<'on' | 'off'>('on')
  const [loading, setLoading] = useState(true) // prevents mock-data flash
  const [live, setLive] = useState<{
    clicksByDay: SeriesPoint[]
    devices: DeviceSlice[]
    referrers: ReferrerRow[]
    countries: CountryRow[]
    campaigns: CampaignRow[]
  } | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/dashboard/analytics?range=${range}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Analytics unavailable')
        return r.json()
      })
      .then((data) => {
        if (data.demo) { setLive(null); return }

        const global = data.global || {}
        const totalDeviceClicks = (global.devices || []).reduce(
          (s: number, row: { clicks: number }) => s + Number(row.clicks || 0), 0
        )
        const totalRefClicks = (global.referrers || []).reduce(
          (s: number, row: { clicks: number }) => s + Number(row.clicks || 0), 0
        )

        setLive({
          clicksByDay: (data.clicksByDay || []).map(
            (row: { click_date: string; click_count: number; unique_visitors: number }) => ({
              label:   new Date(row.click_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              value:   Number(row.click_count    || 0),
              compare: Number(row.unique_visitors || 0),
            })
          ),
          devices: (global.devices || []).slice(0, 3).map(
            (row: { label: string; clicks: number }, idx: number) => ({
              label:    toTitleCase(row.label || 'unknown'),
              sessions: Number(row.clicks || 0),
              share:    totalDeviceClicks
                ? Math.round((Number(row.clicks || 0) / totalDeviceClicks) * 1000) / 10
                : 0,
              tone:     idx === 0 ? 'brand' : idx === 1 ? 'info' : 'success',
            })
          ),
          referrers: (global.referrers || []).slice(0, 5).map(
            (row: { label: string; clicks: number }) => ({
              source: row.label || 'Direct',
              visits: Number(row.clicks || 0),
              share:  totalRefClicks
                ? Math.round((Number(row.clicks || 0) / totalRefClicks) * 1000) / 10
                : 0,
            })
          ),
          // Real country data from the API — shape matches mock-data CountryRow
          countries: (data.countries || []).map((c: { code: string; country: string; flag: string; clicks: number; share: number }) => ({
            country: c.country,
            flag:    c.flag,
            clicks:  c.clicks,
            share:   c.share,
          })) as CountryRow[],
          // Real campaign data from UTM-tagged clicks
          campaigns: (data.campaigns || []).map((c: { name: string; channel: string; clicks: number; conversions: number; convRate: number }) => ({
            name:        c.name,
            channel:     c.channel,
            clicks:      c.clicks,
            conversions: c.conversions,
            convRate:    c.convRate,
          })) as CampaignRow[],
        })
      })
      .catch(() => setLive(null))
      .finally(() => setLoading(false))
  }, [range])

  const view = useMemo(() => ({
    // live !== null → authenticated user (may have 0 data) → show real values / empty states
    // live === null → not authenticated / API error         → show empty states
    clicksByDay: loading ? ([] as SeriesPoint[])  : (live?.clicksByDay ?? []),
    devices:     loading ? ([] as DeviceSlice[])  : (live?.devices     ?? []),
    referrers:   loading ? ([] as ReferrerRow[])  : (live?.referrers   ?? []),
    countries:   loading ? ([] as CountryRow[])   : (live?.countries   ?? []),
    campaigns:   loading ? ([] as CampaignRow[])  : (live?.campaigns   ?? []),
    isLive: !loading && live !== null,
  }), [live, loading])

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Performance"
        title="Analytics"
        description="Deep performance workspace for traffic, devices, geography, and campaigns."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              options={[
                { label: 'Clicks + Visitors', value: 'on'  },
                { label: 'Clicks only',       value: 'off' },
              ]}
              value={compare}
              onChange={setCompare}
              size="sm"
            />
            <DateRangeControl value={range} onChange={setRange} />
          </div>
        }
      />

      {/* ── Trend chart ────────────────────────────────────────── */}
      <Panel className="p-5">
        <PanelHeader
          title="Clicks over time"
          subtitle={compare === 'on' ? 'Total clicks vs unique visitors' : 'Total clicks — current period'}
          action={
            compare === 'on' ? (
              <div className="hidden items-center gap-3 text-xs font-medium text-muted-foreground sm:flex">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-brand" /> Total clicks
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-muted-foreground/50" /> Unique visitors
                </span>
              </div>
            ) : undefined
          }
        />
        <div className="mt-4">
          {loading ? (
            <div className="h-40 animate-pulse rounded-xl bg-muted" />
          ) : (
            <TrendChart data={view.clicksByDay} showCompare={compare === 'on'} />
          )}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Device breakdown ──────────────────────────────────── */}
        <Panel className="p-5">
          <PanelHeader title="Device breakdown" subtitle="Sessions by device type" />
          <div className="mt-4 grid gap-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="grid gap-2">
                  <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 animate-pulse rounded-xl bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonLine w="w-20" />
                      <SkeletonLine w="w-14" h="h-2" />
                    </div>
                    <SkeletonLine w="w-10" h="h-4" />
                  </div>
                  <SkeletonLine h="h-1.5" />
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

        {/* ── Referrers ─────────────────────────────────────────── */}
        <Panel className="p-5">
          <PanelHeader title="Referrers & sources" subtitle="Click distribution by source" />
          <ul className="mt-3">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="border-b border-border py-3 last:border-0 space-y-2">
                  <div className="flex justify-between">
                    <SkeletonLine w="w-28" />
                    <SkeletonLine w="w-10" />
                  </div>
                  <SkeletonLine h="h-1.5" />
                </li>
              ))
            ) : (
              view.referrers.map((r) => (
                <li key={r.source} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{r.source}</span>
                      <span className="text-muted-foreground tabular-nums">{r.visits.toLocaleString()}</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={r.share} tone="brand" />
                    </div>
                  </div>
                  <span className="w-9 text-right text-sm font-bold tabular-nums">{r.share}%</span>
                </li>
              ))
            )}
          </ul>
        </Panel>
      </div>

      {/* ── Locations ─────────────────────────────────────────────── */}
      <Panel className="overflow-hidden">
        <div className="p-5 pb-0">
          <PanelHeader
            title="Locations"
            subtitle="Top countries by clicks"
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[460px] text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5 text-left font-semibold">Country</th>
                <th className="px-5 py-2.5 text-right font-semibold">Clicks</th>
                <th className="px-5 py-2.5 text-left font-semibold">Share</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-5 py-3"><SkeletonLine w="w-32" /></td>
                    <td className="px-5 py-3"><SkeletonLine w="w-12" /></td>
                    <td className="px-5 py-3"><SkeletonLine w="w-24" /></td>
                  </tr>
                ))
              ) : view.countries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No location data yet — clicks will appear here as traffic comes in.
                  </td>
                </tr>
              ) : (
                view.countries.map((c) => (
                  <tr key={c.country} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2.5 font-semibold">
                        <span className="text-lg leading-none">{c.flag ?? '🌐'}</span>
                        {c.country}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {c.clicks.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={c.share * 2.5} tone="info" className="max-w-[160px]" />
                        <span className="w-9 text-right font-bold tabular-nums">{c.share}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ── Campaign performance ──────────────────────────────── */}
      <Panel className="overflow-hidden">
        <div className="p-5 pb-0">
          <PanelHeader
            title="Campaign performance"
            subtitle="Clicks by UTM campaign tag"
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5 text-left font-semibold">Campaign</th>
                <th className="px-5 py-2.5 text-left font-semibold">Channel</th>
                <th className="px-5 py-2.5 text-right font-semibold">Clicks</th>
                <th className="px-5 py-2.5 text-right font-semibold">Conversions</th>
                <th className="px-5 py-2.5 text-right font-semibold">Conv. rate</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-5 py-3"><SkeletonLine w="w-28" /></td>
                    <td className="px-5 py-3"><SkeletonLine w="w-16" /></td>
                    <td className="px-5 py-3 text-right"><SkeletonLine w="w-10" /></td>
                    <td className="px-5 py-3 text-right"><SkeletonLine w="w-8" /></td>
                    <td className="px-5 py-3 text-right"><SkeletonLine w="w-10" /></td>
                  </tr>
                ))
              ) : view.campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No campaign data yet — add <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">?utm_campaign=</code> tags to your links to track campaign performance.
                  </td>
                </tr>
              ) : (
                view.campaigns.map((c) => (
                  <tr key={c.name} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-semibold">{c.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{c.channel}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.clicks.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.conversions.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-bold tabular-nums text-success">
                      {c.convRate > 0 ? `${c.convRate}%` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
