'use client'

import { useId } from 'react'
import type { SeriesPoint } from '@/lib/dashboard-types'

export function TrendChart({
  data,
  showCompare = true,
  height = 240,
}: {
  data: SeriesPoint[]
  showCompare?: boolean
  height?: number
}) {
  const gradientId = useId()
  const compareId  = useId()

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 text-center"
        style={{ height }}
      >
        <p className="text-sm font-medium text-muted-foreground">No traffic yet in this period</p>
        <p className="text-xs text-muted-foreground/60">
          Clicks will appear here as traffic comes in
        </p>
      </div>
    )
  }

  const svgW   = 720
  const padX   = 8
  const padY   = 16
  const chartH = height - padY * 2 - 24  // 24px reserved for date labels
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.compare)), 1)

  const n       = data.length
  const gap     = n > 1 ? 4  : 0
  const barW    = (svgW - padX * 2 - gap * (n - 1)) / n

  // Map index → x centre of bar
  const cx = (i: number) => padX + i * (barW + gap) + barW / 2

  // Map value → y (SVG top = 0)
  const toY = (v: number) => padY + chartH * (1 - v / maxVal)

  // Visitor overlay line points
  const linePts = data.map((d, i) => ({ x: cx(i), y: toY(d.compare) }))
  const linePath = linePts.length === 1
    ? ''  // single point — rendered as circle below
    : linePts.reduce((acc, p, i) =>
        i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '')

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${svgW} ${height}`}
        className="h-[220px] w-full sm:h-[240px]"
        preserveAspectRatio="none"
        role="img"
        aria-label="Traffic trend over time"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={compareId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={padX}
            x2={svgW - padX}
            y1={padY + chartH * (1 - g)}
            y2={padY + chartH * (1 - g)}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray={g === 1 ? 'none' : '3 7'}
          />
        ))}

        {/* Click bars */}
        {data.map((d, i) => {
          const bH  = Math.max(chartH * (d.value / maxVal), d.value > 0 ? 4 : 0)
          const bY  = padY + chartH - bH
          const bX  = padX + i * (barW + gap)
          const r   = Math.min(4, barW / 2)
          return (
            <g key={i}>
              <rect
                x={bX}
                y={bY}
                width={barW}
                height={bH}
                rx={r}
                ry={r}
                fill={`url(#${gradientId})`}
              />
              {/* Tooltip-style hover area (visual only) */}
              <rect
                x={bX}
                y={padY}
                width={barW}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
              >
                <title>{`${d.label}: ${d.value} click${d.value !== 1 ? 's' : ''}`}</title>
              </rect>
            </g>
          )
        })}

        {/* Unique-visitor overlay line */}
        {showCompare && data.some((d) => d.compare > 0) && (
          <>
            {n > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5 5"
                opacity="0.6"
              />
            )}
            {linePts.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={n === 1 ? 5 : 3}
                fill="var(--card)"
                stroke="var(--muted-foreground)"
                strokeWidth="2"
                opacity="0.75"
              />
            ))}
          </>
        )}

        {/* Single-point: brand dot on bar top */}
        {n === 1 && data[0].value > 0 && (
          <circle
            cx={cx(0)}
            cy={toY(data[0].value)}
            r="5"
            fill="var(--brand)"
          />
        )}
      </svg>

      {/* Date labels */}
      <div className="mt-1 flex justify-between px-1 text-[11px] font-medium text-muted-foreground">
        {n <= 10
          ? data.map((d) => <span key={d.label}>{d.label}</span>)
          : // For many points show only first, middle, last
            [data[0], data[Math.floor(n / 2)], data[n - 1]].map((d) => (
              <span key={d.label}>{d.label}</span>
            ))}
      </div>
    </div>
  )
}
