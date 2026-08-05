import { cn } from '@/lib/utils'
import { LogoMark } from '@/components/brand/logo-mark'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground shadow-sm',
        className,
      )}
      style={{ backgroundColor: '#2563eb', color: '#fff' }}
      aria-hidden
    >
      <LogoMark className="size-5" />
    </span>
  )
}
