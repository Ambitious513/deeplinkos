import { getPlatformLabel } from "@/lib/platform-registry";
import type { DeepLink, LinkStatus as DashboardLinkStatus } from '@/lib/dashboard-types'
import type { LinkRecord } from "@/lib/types";

export function dashboardStatusFor(link: LinkRecord): DashboardLinkStatus {
  if (!link.isActive || link.status === "paused") return "paused";
  if (link.status === "locked" || link.status === "archived") return "attention";
  return "active";
}

export function shortUrlForSlug(slug: string) {
  if (typeof window === "undefined") return `/r/${slug}`;
  return `${window.location.origin}/r/${slug}`;
}

export function mapLinkRecordToDashboardLink(link: LinkRecord, clickCount = 0): DeepLink {
  return {
    id: link.id,
    title: link.title,
    slug: link.slug,
    destination:
      link.destinationUrl ||
      link.desktopUrl ||
      link.fallbackUrl ||
      link.iosDeepLink ||
      link.androidDeepLink ||
      "",
    platform: getPlatformLabel(link.preset),
    status: dashboardStatusFor(link),
    clicks: clickCount,
    openRate: 0, // Requires impression tracking — will be wired in Phase 2B
    createdAt: link.createdAt,
  };
}
