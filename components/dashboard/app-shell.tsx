'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { CreateLinkProvider } from '@/components/dashboard/create-link'
import type { DashboardUser } from '@/lib/dashboard-user'

const STORAGE_KEY = 'dlos-sidebar-collapsed'

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: DashboardUser
}) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setCollapsed(stored === 'true')
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  return (
    <div className="dlos-dashboard-theme flex h-dvh overflow-hidden bg-background font-sans text-foreground">
      <CreateLinkProvider>
        <Sidebar collapsed={collapsed} onToggle={toggle} user={user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
        <MobileNav />
      </CreateLinkProvider>
    </div>
  )
}
