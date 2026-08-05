'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { useCreateLink } from '@/components/dashboard/create-link'
import { NotificationBell } from '@/components/dashboard/notifications'
import { allNavItems } from '@/lib/nav'
import { BrandMark } from '@/components/dashboard/brand-mark'

function currentLabel(pathname: string) {
  const match = [...allNavItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) =>
      i.href === '/dashboard'
        ? pathname === '/dashboard'
        : pathname.startsWith(i.href),
    )
  return match?.label ?? 'Overview'
}

export function Topbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const { open } = useCreateLink()
  const label    = currentLabel(pathname)

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = e.currentTarget.value.trim()
      if (q) router.push(`/dashboard/links?q=${encodeURIComponent(q)}`)
    }
  }

  const handleMobileSearch = () => {
    router.push('/dashboard/links')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Mobile brand */}
      <div className="flex items-center gap-2 lg:hidden">
        <BrandMark className="size-8" />
      </div>

      {/* Breadcrumb (desktop) */}
      <div className="hidden items-center gap-2 text-sm font-medium text-muted-foreground lg:flex">
        <span>Dashboard</span>
        <span className="text-border">/</span>
        <span className="font-semibold text-foreground">{label}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Desktop search — navigates to Links page with query pre-filled */}
        <div className="hidden h-10 w-64 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm text-muted-foreground shadow-sm md:flex xl:w-72">
          <Search className="size-4 shrink-0" />
          <input
            type="search"
            placeholder="Search links… (press Enter)"
            onKeyDown={handleSearch}
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Search links"
          />
        </div>

        {/* Mobile search icon */}
        <button
          type="button"
          aria-label="Search"
          onClick={handleMobileSearch}
          className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted md:hidden"
        >
          <Search className="size-[18px]" />
        </button>

        {/* Notification bell — real dropdown */}
        <NotificationBell />

        <ThemeToggle />

        <Button onClick={open} className="hidden h-10 rounded-full px-4 sm:inline-flex">
          <Plus className="size-4" />
          Create link
        </Button>
      </div>
    </header>
  )
}
