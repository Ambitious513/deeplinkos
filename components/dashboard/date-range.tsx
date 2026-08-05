'use client'

import type { DateRange } from '@/lib/dashboard-types'
import { Segmented } from '@/components/dashboard/primitives'

const options: { label: string; value: DateRange }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: 'All time', value: 'all' },
]

export function DateRangeControl({
  value,
  onChange,
}: {
  value: DateRange
  onChange: (value: DateRange) => void
}) {
  return <Segmented options={options} value={value} onChange={onChange} size="sm" />
}
