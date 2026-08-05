/**
 * Dashboard UI types for DeepLinkOS.
 *
 * These are view-layer types used by dashboard pages and components.
 * DB-level types (LinkRecord, etc.) live in lib/types.ts.
 * Previously co-located with mock data in lib/mock-data.ts.
 */

export type DateRange = '7d' | '30d' | 'all'

export type LinkStatus = 'active' | 'paused' | 'attention'

export type DeepLink = {
  id: string
  title: string
  slug: string
  destination: string
  platform: string
  status: LinkStatus
  clicks: number
  openRate: number // percentage
  createdAt: string
}

export type KpiTrend = 'up' | 'down'

export type Kpi = {
  id: string
  label: string
  value: string
  delta: string
  trend: KpiTrend
  featured?: boolean
}

export type SeriesPoint = { label: string; value: number; compare: number }

export type DeviceSlice = {
  label: string
  sessions: number
  share: number
  tone: 'brand' | 'success' | 'info'
}

export type ReferrerRow = { source: string; visits: number; share: number }

export type CountryRow = { country: string; flag: string; clicks: number; share: number }

export type CampaignRow = {
  name: string
  channel: string
  clicks: number
  conversions: number
  convRate: number
}

export type AttentionItem = {
  id: string
  title: string
  detail: string
  severity: 'warning' | 'danger' | 'info'
}

export type DomainStatus = 'active' | 'pending' | 'failed'

export type Domain = {
  id: string
  domain: string
  status: DomainStatus
  links: number
  ssl: 'issued' | 'pending' | 'error'
  addedAt: string
}

export type PixelIntegration = {
  id: string
  name: string
  description: string
  status: 'connected' | 'available'
}
