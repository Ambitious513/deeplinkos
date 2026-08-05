import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Kpi } from '@/lib/dashboard-types'

// ─── Skeleton shimmer card ────────────────────────────────────────────────────

function KpiSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4 shadow-sm',
        featured ? 'border-transparent bg-brand/80' : 'border-border bg-card',
      )}
    >
      {/* label placeholder */}
      <div className={cn('h-3 w-24 rounded-full', featured ? 'bg-white/20' : 'bg-muted animate-pulse')} />
      {/* value placeholder */}
      <div className={cn('mt-3 h-8 w-28 rounded-lg', featured ? 'bg-white/20' : 'bg-muted animate-pulse')} />
      {/* delta placeholder */}
      <div className={cn('mt-3 h-5 w-16 rounded-full', featured ? 'bg-white/20' : 'bg-muted animate-pulse')} />
      {/* decorative ring on featured */}
      {featured && (
        <span
          className="pointer-events-none absolute -bottom-12 -right-10 size-36 rounded-full border-[20px] border-white/10"
          aria-hidden
        />
      )}
    </div>
  )
}

// ─── Main grid ────────────────────────────────────────────────────────────────

export function KpiGrid({ items, loading = false }: { items: Kpi[]; loading?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {loading ? (
        // Show 5 skeleton cards matching the expected layout
        <>
          <KpiSkeleton featured />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </>
      ) : (
        items.map((kpi) => {
          const featured = kpi.featured
          return (
            <div
              key={kpi.id}
              className={cn(
                'relative overflow-hidden rounded-2xl border p-4 shadow-sm',
                featured
                  ? 'border-transparent bg-brand text-white'
                  : 'border-border bg-card',
              )}
            >
              <p
                className={cn(
                  'text-xs font-semibold',
                  featured ? 'text-white/75' : 'text-muted-foreground',
                )}
              >
                {kpi.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-[1.7rem]">
                {kpi.value}
              </p>
              <span
                className={cn(
                  'mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
                  featured
                    ? 'bg-white/15 text-white'
                    : kpi.trend === 'up'
                      ? 'bg-success-soft text-success'
                      : 'bg-danger-soft text-danger',
                )}
              >
                {kpi.trend === 'up' ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {kpi.delta}
              </span>
              {featured && (
                <span
                  className="pointer-events-none absolute -bottom-12 -right-10 size-36 rounded-full border-[20px] border-white/10"
                  aria-hidden
                />
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
