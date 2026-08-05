import {
  LayoutDashboard,
  Link2,
  BarChart3,
  QrCode,
  UserCircle,
  CreditCard,
  Globe,
  MousePointerClick,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Links', href: '/dashboard/links', icon: Link2 },
      { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { label: 'QR Designer', href: '/dashboard/qr', icon: QrCode },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Profile', href: '/dashboard/profile', icon: UserCircle },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    ],
  },
  {
    label: 'Features',
    items: [
      { label: 'Custom Domains', href: '/dashboard/domains', icon: Globe },
      {
        label: 'Pixels',
        href: '/dashboard/pixels',
        icon: MousePointerClick,
        badge: 'Beta',
      },
    ],
  },
]

// Flat list used by the mobile bottom-nav (primary) and "More" sheet (rest).
export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items)
export const primaryMobileItems: NavItem[] = allNavItems.slice(0, 4)
export const secondaryMobileItems: NavItem[] = allNavItems.slice(4)
