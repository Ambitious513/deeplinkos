'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MoreHorizontal, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { primaryMobileItems, secondaryMobileItems } from '@/lib/nav'
import { useCreateLink } from '@/components/dashboard/create-link'

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(href + '/')
}

export function MobileNav() {
  const pathname = usePathname()
  const { open } = useCreateLink()
  const [sheetOpen, setSheetOpen] = useState(false)
  const moreActive = secondaryMobileItems.some((i) => isActive(pathname, i.href))

  return (
    <>
      {/* Floating create button */}
      <button
        type="button"
        onClick={open}
        aria-label="Create link"
        className="fixed bottom-20 right-4 z-40 grid size-14 place-items-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/30 transition-transform active:translate-y-px lg:hidden"
      >
        <Plus className="size-6" />
      </button>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
        <ul className="flex items-stretch justify-around px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {primaryMobileItems.map((item) => {
            const active = isActive(pathname, item.href)
            const Icon = item.icon
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-colors',
                    active ? 'text-brand' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-[22px]" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className={cn(
                'flex w-full flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-colors',
                moreActive ? 'text-brand' : 'text-muted-foreground',
              )}
            >
              <MoreHorizontal className="size-[22px]" />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* More sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">More</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close menu"
                className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {secondaryMobileItems.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border border-border p-3.5 text-sm font-semibold transition-colors',
                        active ? 'bg-brand-soft text-brand' : 'hover:bg-muted',
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
