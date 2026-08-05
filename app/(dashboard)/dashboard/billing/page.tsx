'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  CreditCard, Download, Sparkles, Check, ExternalLink,
  Loader2, ArrowUpRight, Zap, Crown, Rocket, Infinity
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Panel, PanelHeader, ProgressBar } from '@/components/dashboard/primitives'
import { Button } from '@/components/ui/button'
import { PLANS, PRICING_PLAN_ORDER, type PlanId, type PaidPlanId } from '@/lib/polar'
import type { LinkRecord } from '@/lib/types'
import type { Database } from '@/lib/database.types'

type DomainRow = Database['public']['Tables']['domains']['Row']

type SubscriptionState = {
  planId: PlanId
  plan: (typeof PLANS)[PlanId]
  subscriptionId: string | null
  currentPeriodEnd: string | null
  isActive: boolean
  isTrial: boolean
  trialLinksUsed: number
  trialLinkLimit: number
}

type LifetimeSeats = {
  claimed: number
  total: number
  available: number
  isSoldOut: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SkeletonLine({ w = 'w-24' }: { w?: string }) {
  return <div className={`h-3 ${w} animate-pulse rounded-full bg-muted`} />
}

async function startCheckout(plan: PaidPlanId): Promise<void> {
  const res = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
  if (!res.ok) throw new Error('Checkout unavailable')
  const { url } = await res.json()
  window.location.href = url
}

async function openPortal(): Promise<void> {
  const res = await fetch('/api/billing/checkout')
  if (!res.ok) throw new Error('Portal unavailable')
  const { url } = await res.json()
  window.open(url, '_blank', 'noopener,noreferrer')
}

const PLAN_ICONS: Record<PaidPlanId, React.ReactNode> = {
  creator:    <Zap className="size-5" />,
  scale:      <Rocket className="size-5" />,
  enterprise: <Crown className="size-5" />,
  lifetime:   <Infinity className="size-5" />,
}

const PLAN_ACCENT: Record<PaidPlanId, string> = {
  creator:    'from-blue-500 to-indigo-600',
  scale:      'from-brand to-orange-500',
  enterprise: 'from-purple-500 to-pink-600',
  lifetime:   'from-yellow-400 to-amber-500',
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  planId,
  currentPlanId,
  onUpgrade,
  upgrading,
  lifetimeSeats,
}: {
  planId: PaidPlanId
  currentPlanId: PlanId
  onUpgrade: (p: PaidPlanId) => void
  upgrading: string | null
  lifetimeSeats: LifetimeSeats | null
}) {
  const plan = PLANS[planId]
  const isCurrent = planId === currentPlanId
  const isPopular = planId === 'scale'
  const isLifetime = planId === 'lifetime'
  const isLoading = upgrading === planId
  const isSoldOut = isLifetime && (lifetimeSeats?.isSoldOut ?? false)

  const planOrder: Record<string, number> = { creator_trial: 0, creator: 1, scale: 2, enterprise: 3, lifetime: 4 }
  const isDowngrade = !isCurrent && planOrder[planId] < planOrder[currentPlanId]

  const accentGradient = PLAN_ACCENT[planId]

  return (
    <div
      className={[
        'relative flex flex-col gap-5 rounded-2xl border p-6 transition-all duration-200',
        isCurrent
          ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10'
          : isPopular
            ? 'border-border shadow-md ring-2 ring-brand/20'
            : 'border-border bg-card hover:border-brand/40',
        isLifetime ? 'bg-gradient-to-br from-amber-50/40 to-yellow-50/20 dark:from-amber-950/20 dark:to-yellow-950/10' : '',
      ].join(' ')}
    >
      {/* Badges */}
      {isCurrent && (
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold text-white">
          <Check className="size-3" /> Current plan
        </span>
      )}
      {isPopular && !isCurrent && (
        <span className="absolute right-4 top-4 rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-bold text-brand">
          Most popular
        </span>
      )}
      {isLifetime && !isCurrent && !isSoldOut && lifetimeSeats && (
        <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
          {lifetimeSeats.available} left
        </span>
      )}

      {/* Header */}
      <div>
        <div className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${accentGradient} text-white shadow-sm`}>
          {PLAN_ICONS[planId]}
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{plan.name}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{plan.price}</p>
        {!plan.isOneTime && plan.priceMonthly > 0 && (
          <p className="text-xs text-muted-foreground">per month · 30-day free trial</p>
        )}
        {plan.isOneTime && (
          <p className="text-xs text-muted-foreground">one-time payment · no subscription</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>
      </div>

      {/* Features */}
      <ul className="grid gap-2 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* Lifetime seat progress */}
      {isLifetime && lifetimeSeats && !isSoldOut && (
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-700 dark:text-amber-400">Seats claimed</span>
            <span className="tabular-nums text-muted-foreground">{lifetimeSeats.claimed} / {lifetimeSeats.total}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all"
              style={{ width: `${Math.round((lifetimeSeats.claimed / lifetimeSeats.total) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto">
        {isCurrent && !plan.isOneTime ? (
          <Button variant="outline" className="w-full gap-2" onClick={openPortal}>
            <ExternalLink className="size-4" /> Manage on Polar
          </Button>
        ) : isCurrent && plan.isOneTime ? (
          <Button variant="outline" className="w-full" disabled>
            <Check className="size-4" /> You own this
          </Button>
        ) : isSoldOut ? (
          <Button variant="outline" className="w-full" disabled>
            Sold out
          </Button>
        ) : isDowngrade ? (
          <Button variant="outline" className="w-full gap-2" onClick={openPortal}>
            Downgrade via portal
          </Button>
        ) : (
          <Button
            className={`w-full gap-2 ${isPopular ? '' : ''}`}
            variant={isPopular || isLifetime ? 'default' : 'outline'}
            onClick={() => onUpgrade(planId)}
            disabled={isLoading || upgrading !== null}
          >
            {isLoading
              ? <Loader2 className="size-4 animate-spin" />
              : plan.isOneTime
                ? <Infinity className="size-4" />
                : <Sparkles className="size-4" />
            }
            {plan.priceMonthly === 0 && !plan.isOneTime
              ? 'Get started free'
              : plan.isOneTime
                ? 'Claim lifetime access'
                : `Start free trial`
            }
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Trial progress banner ────────────────────────────────────────────────────

function TrialBanner({ used, limit, onUpgrade, upgrading }: {
  used: number
  limit: number
  onUpgrade: () => void
  upgrading: boolean
}) {
  const pct = Math.round((used / limit) * 100)
  const isAtLimit = used >= limit

  return (
    <div className={`rounded-2xl border p-5 ${isAtLimit ? 'border-destructive/40 bg-destructive/5' : 'border-brand/30 bg-brand/5'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <p className={`text-sm font-bold ${isAtLimit ? 'text-destructive' : 'text-brand'}`}>
            {isAtLimit ? '🔒 Free trial limit reached' : '⚡ Free Creator trial active'}
          </p>
          <p className="text-sm text-muted-foreground">
            {isAtLimit
              ? 'You\'ve created 3 free links. Start your trial to unlock unlimited links — no charge for 30 days.'
              : `You've used ${used} of ${limit} free links. No credit card needed until you need more.`
            }
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0 gap-2"
          variant={isAtLimit ? 'default' : 'outline'}
          onClick={onUpgrade}
          disabled={upgrading}
        >
          {upgrading ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
          Start free trial
        </Button>
      </div>
      <div className="mt-3 grid gap-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{used} links used</span>
          <span>{limit} free limit</span>
        </div>
        <ProgressBar value={pct} tone={isAtLimit ? 'danger' : 'brand'} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [subscription,  setSubscription]  = useState<SubscriptionState | null>(null)
  const [subLoading,    setSubLoading]    = useState(true)
  const [lifetimeSeats, setLifetimeSeats] = useState<LifetimeSeats | null>(null)
  const [linkCount,     setLinkCount]     = useState<number | null>(null)
  const [domainCount,   setDomainCount]   = useState<number | null>(null)
  const [usageLoading,  setUsageLoading]  = useState(true)
  const [upgrading,     setUpgrading]     = useState<string | null>(null)
  const [upgradeError,  setUpgradeError]  = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    // Subscription + trial state
    fetch('/api/billing/subscription', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: SubscriptionState) => { if (alive) setSubscription(d) })
      .catch(() => {
        if (alive) setSubscription({
          planId: 'creator_trial',
          plan: PLANS.creator_trial,
          subscriptionId: null,
          currentPeriodEnd: null,
          isActive: false,
          isTrial: true,
          trialLinksUsed: 0,
          trialLinkLimit: 3,
        })
      })
      .finally(() => { if (alive) setSubLoading(false) })

    // Lifetime seat counter (public endpoint)
    fetch('/api/billing/lifetime-seats')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: LifetimeSeats) => { if (alive) setLifetimeSeats(d) })
      .catch(() => {})

    // Usage
    const linksReq = fetch('/api/links', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: { links?: LinkRecord[] }) => { if (alive) setLinkCount(d.links?.length ?? 0) })
      .catch(() => { if (alive) setLinkCount(0) })

    const domainsReq = fetch('/api/dashboard/domains', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: { demo?: boolean; domains?: DomainRow[] }) => {
        if (alive) setDomainCount(d.demo ? 0 : (d.domains?.length ?? 0))
      })
      .catch(() => { if (alive) setDomainCount(0) })

    Promise.allSettled([linksReq, domainsReq]).finally(() => { if (alive) setUsageLoading(false) })

    return () => { alive = false }
  }, [])

  const handleUpgrade = useCallback(async (plan: PaidPlanId) => {
    setUpgrading(plan)
    setUpgradeError(null)
    try {
      await startCheckout(plan)
    } catch {
      setUpgradeError('Checkout is not available right now. Please try again shortly.')
    } finally {
      setUpgrading(null)
    }
  }, [])

  const currentPlan   = subscription?.plan   ?? PLANS.creator_trial
  const currentPlanId = subscription?.planId ?? 'creator_trial'

  const usageRows = useMemo(() => [
    { label: 'Active links',    used: linkCount,   limit: currentPlan.links,   tone: 'info'    as const },
    { label: 'Custom domains',  used: domainCount, limit: currentPlan.domains, tone: 'success' as const },
  ], [linkCount, domainCount, currentPlan])

  const periodEndLabel = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Settings"
        title="Billing & Plans"
        description="Manage your plan, trial usage, and subscription."
      />

      {upgradeError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {upgradeError}{' '}
          <button className="underline underline-offset-2" onClick={() => setUpgradeError(null)}>Dismiss</button>
        </div>
      )}

      {/* ── Trial banner ───────────────────────────────────────────────── */}
      {!subLoading && subscription?.isTrial && (
        <TrialBanner
          used={subscription.trialLinksUsed}
          limit={subscription.trialLinkLimit}
          onUpgrade={() => handleUpgrade('creator')}
          upgrading={upgrading !== null}
        />
      )}

      {/* ── Current plan + usage ───────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">

        <Panel className="p-6 lg:col-span-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current plan</p>
          {subLoading ? (
            <div className="mt-3 grid gap-2"><SkeletonLine w="w-20" /><SkeletonLine w="w-32" /></div>
          ) : (
            <>
              <p className="mt-2 text-2xl font-bold tracking-tight">{currentPlan.name}</p>
              <p className="text-sm text-muted-foreground">
                {subscription?.isTrial ? 'Free trial · no CC needed' : currentPlan.price}
              </p>
              {periodEndLabel && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {subscription?.subscriptionId ? `Renews ${periodEndLabel}` : `Active until ${periodEndLabel}`}
                </p>
              )}
              <div className="mt-5">
                {currentPlanId !== 'creator_trial' && !PLANS[currentPlanId].isOneTime ? (
                  <Button variant="outline" className="w-full gap-2" onClick={openPortal}>
                    <ExternalLink className="size-4" /> Manage on Polar
                  </Button>
                ) : currentPlanId === 'creator_trial' ? (
                  <Button className="w-full gap-2" onClick={() => handleUpgrade('creator')} disabled={upgrading !== null}>
                    {upgrading === 'creator' ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    Start free trial
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <Check className="size-4" /> Lifetime member
                  </Button>
                )}
              </div>
            </>
          )}
        </Panel>

        <Panel className="p-6 lg:col-span-2">
          <PanelHeader title="Usage this cycle" subtitle="Resets on the 1st of each month" />
          <div className="mt-5 grid gap-5">
            {usageRows.map((u) => {
              const isLoading  = usageLoading && u.used === null
              const unlimited  = u.limit === null
              const numLimit   = typeof u.limit === 'number' ? u.limit : 1
              const pct        = !unlimited && u.used !== null ? Math.min(Math.round(((u.used ?? 0) / numLimit) * 100), 100) : 0

              return (
                <div key={u.label} className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{u.label}</span>
                    {isLoading ? <SkeletonLine w="w-20" /> : unlimited ? (
                      <span className="text-xs text-success font-semibold">Unlimited</span>
                    ) : (
                      <span className="tabular-nums text-muted-foreground">
                        {(u.used ?? 0).toLocaleString()} / {numLimit.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {isLoading
                    ? <div className="h-2 animate-pulse rounded-full bg-muted" />
                    : <ProgressBar value={unlimited ? 100 : pct} tone={unlimited ? 'success' : u.tone} />
                  }
                </div>
              )
            })}

            <p className="text-xs text-muted-foreground">
              Monthly click analytics are visible on the{' '}
              <a href="/dashboard/analytics" className="underline underline-offset-2">Analytics page</a>.
            </p>
          </div>
        </Panel>
      </div>

      {/* ── Plan comparison ────────────────────────────────────────────── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">All plans</h2>
          <p className="text-sm text-muted-foreground">30-day free trial · cancel anytime · no hidden fees</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {PRICING_PLAN_ORDER.map((p) => (
            <PlanCard
              key={p}
              planId={p}
              currentPlanId={currentPlanId}
              onUpgrade={handleUpgrade}
              upgrading={upgrading}
              lifetimeSeats={lifetimeSeats}
            />
          ))}
        </div>
      </div>

      {/* ── Invoices ───────────────────────────────────────────────────── */}
      <Panel className="overflow-hidden">
        <div className="p-6 pb-0">
          <PanelHeader title="Invoices & receipts" subtitle="All billing managed securely on Polar" />
        </div>
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <Download className="size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">Receipts live on Polar</p>
          <p className="max-w-sm text-xs text-muted-foreground/60">
            Download invoices, update your card, and manage your subscription in the Polar customer portal. We never store your payment details.
          </p>
          {currentPlanId !== 'creator_trial' && (
            <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={openPortal}>
              Open Polar portal <ExternalLink className="size-3" />
            </Button>
          )}
        </div>
      </Panel>
    </div>
  )
}
