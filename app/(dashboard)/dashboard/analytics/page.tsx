import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://deeplinkos.com")
  .split(",")[0].trim().replace(/\/+$/, "");

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <DashboardHeader title="Global Analytics" />
        <div style={{ padding: "64px 16px", textAlign: "center", color: "var(--text-2)" }}>
          Sign in to view your analytics.
        </div>
      </>
    );
  }

  const params = await searchParams;
  const days = Math.min(parseInt(params?.days || "30"), 365);

  // ── Parallel fetch — no raw rows, only aggregated data ──────────
  const [linksResult, summaryResult, chartResult] = await Promise.all([
    // 1. Link metadata (small — just IDs, titles, slugs)
    supabase
      .from("deep_links")
      .select("id, title, slug, is_active")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    // 2. Summary stats via RPC — returns single row with totals
    supabase.rpc("get_dashboard_analytics", {
      user_uuid: user.id,
      days_ago: days,
    }),

    // 3. Per-day chart data via RPC
    supabase.rpc("get_clicks_by_day", {
      user_uuid: user.id,
      days_ago: days,
    }),
  ]);

  const allLinks = linksResult.data ?? [];
  const summary = summaryResult.data?.[0] ?? null;

  // ── Build per-link click counts via a single aggregate query ──
  // Instead of fetching all rows, use COUNT grouped by link_id
  const linkIds = allLinks.map((l) => l.id);
  let linkClickCounts: Record<string, number> = {};
  let deviceBreakdown: { device: string; count: number }[] = [];
  let topReferrers: { referrer: string; count: number }[] = [];

  if (linkIds.length > 0) {
    // Fetch aggregated counts only (no raw rows)
    const [clicksByLink, deviceData, referrerData] = await Promise.all([
      // Clicks per link (aggregate)
      supabase
        .from("clicks")
        .select("link_id, count:link_id.count()")
        .in("link_id", linkIds),

      // Device breakdown (aggregate)
      supabase
        .from("clicks")
        .select("device, count:device.count()")
        .in("link_id", linkIds),

      // Top referrers (aggregate)
      supabase
        .from("clicks")
        .select("referrer, count:referrer.count()")
        .in("link_id", linkIds)
        .order("count", { ascending: false })
        .limit(8),
    ]);

    if (clicksByLink.data) {
      for (const row of clicksByLink.data as any[]) {
        linkClickCounts[row.link_id] = Number(row.count);
      }
    }

    if (deviceData.data) {
      deviceBreakdown = (deviceData.data as any[])
        .map((r) => ({ device: r.device || "unknown", count: Number(r.count) }))
        .sort((a, b) => b.count - a.count);
    }

    if (referrerData.data) {
      topReferrers = (referrerData.data as any[])
        .map((r) => ({ referrer: r.referrer || "direct", count: Number(r.count) }))
        .sort((a, b) => b.count - a.count);
    }
  }

  // ── Build 7/30/90-day chart ──────────────────────────────────
  const dayMap: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dayMap[key] = 0;
  }

  if (chartResult.data) {
    for (const row of chartResult.data as any[]) {
      const d = new Date(row.click_date);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (key in dayMap) dayMap[key] = Number(row.click_count);
    }
  }

  const chartLabels = Object.keys(dayMap);
  const chartData = Object.values(dayMap);

  // ── Top links (using pre-aggregated counts) ──────────────────
  const topLinks = allLinks
    .map((l) => ({
      title: l.title || "Untitled",
      slug: l.slug,
      clicks: linkClickCounts[l.id] ?? 0,
    }))
    .filter((l) => l.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  const totalClicks = Number(summary?.total_clicks ?? 0);
  const uniqueVisitors = Number(summary?.unique_visitors ?? 0);
  const activeLinksCount = Number(summary?.active_links ?? 0);

  return (
    <>
      <DashboardHeader title="Global Analytics" />
      <AnalyticsClient
        allLinks={allLinks}
        // Pass pre-aggregated data — no raw rows
        precomputed={{
          totalClicks,
          uniqueVisitors,
          activeLinksCount,
          topLinks,
          deviceBreakdown,
          topReferrers,
          chartLabels,
          chartData,
          days,
        }}
        siteUrl={siteUrl}
      />
    </>
  );
}
