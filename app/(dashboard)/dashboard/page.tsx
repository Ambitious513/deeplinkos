import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";
import { LineChart } from "@/components/dashboard/charts/line-chart";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://deeplinkos.com").split(",")[0].trim().replace(/\/+$/, "");

export default async function DashboardOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let totalClicks30d = 0;
  let uniqueVisitors = 0;
  let activeLinks = 0;
  let recentLinks: { title: string; slug: string; clickCount: number }[] = [];
  let labels7d: string[] = [];
  let data7d: number[] = [];

  if (user) {
    // ── All 3 queries in parallel — ~3× faster than sequential ──
    const [summaryResult, chartResult, top5Result] = await Promise.all([
      supabase.rpc("get_dashboard_analytics", {
        user_uuid: user.id,
        days_ago: 30,
      }),
      supabase.rpc("get_clicks_by_day", {
        user_uuid: user.id,
        days_ago: 7,
      }),
      supabase
        .from("deep_links")
        .select("id, title, slug")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (summaryResult.data && summaryResult.data.length > 0) {
      const summary = summaryResult.data[0];
      totalClicks30d = Number(summary.total_clicks || 0);
      uniqueVisitors = Number(summary.unique_visitors || 0);
      activeLinks = Number(summary.active_links || 0);
    }

    // Initialize 7 days of empty data
    const dayMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dayMap[dateStr] = 0;
    }

    if (chartResult.data && chartResult.data.length > 0) {
      chartResult.data.forEach((row: any) => {
        const d = new Date(row.click_date);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (dayMap[dateStr] !== undefined) {
          dayMap[dateStr] = Number(row.click_count);
        }
      });
    }

    labels7d = Object.keys(dayMap);
    data7d = Object.values(dayMap);

    const top5 = top5Result.data ?? [];
    if (top5.length > 0) {
      const top5Ids = top5.map((l) => l.id);
      const { data: clickCounts } = await supabase
        .from("clicks")
        .select("link_id, count:link_id.count()")
        .in("link_id", top5Ids);

      const clickMap: Record<string, number> = {};
      if (clickCounts) {
        for (const row of clickCounts as any[]) {
          clickMap[row.link_id] = Number(row.count);
        }
      }

      recentLinks = top5.map((l) => ({
        title: l.title || "Untitled",
        slug: l.slug,
        clickCount: clickMap[l.id] ?? 0,
      }));
    }
  }

  const formatNumber = (n: number) => n.toLocaleString();

  return (
    <>
      <DashboardHeader title="Overview" />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Clicks (30d)</div>
          <div className="stat-value">{formatNumber(totalClicks30d)}</div>
          <div className="stat-change">Last 30 days</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Unique Visitors</div>
          <div className="stat-value">{formatNumber(uniqueVisitors)}</div>
          <div className="stat-change">Last 30 days</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Avg. Click-Through Rate</div>
          <div className="stat-value">N/A</div>
          <div className="stat-change">Coming soon</div>
        </div>
        <Link href="/dashboard/links?filter=active" style={{ textDecoration: "none", display: "block" }}>
          <div className="stat-card stat-card--clickable">
            <div className="stat-title">Active Smart Links</div>
            <div className="stat-value">{formatNumber(activeLinks)}</div>
            <div className="stat-change" style={{ color: "var(--blue)" }}>View active links →</div>
          </div>
        </Link>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header" style={{ marginBottom: "12px" }}>
            <div className="panel-title">Click Analytics</div>
            <select
              className="input-field"
              style={{ width: "auto", padding: "6px 12px" }}
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="chart-container" style={{ height: "300px" }}>
            {labels7d.length > 0 ? (
              <LineChart labels={labels7d} data={data7d} />
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border)", borderRadius: "8px" }}>
                <p style={{ color: "var(--text-2)", fontSize: "14px" }}>No click data for the last 7 days.</p>
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Quick Links</div>
            <Link
              href="/dashboard/links"
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "13px" }}
            >
              View All
            </Link>
          </div>
          <div className="table-responsive">
            {recentLinks.length > 0 ? (
              <table className="table">
                <tbody>
                  {recentLinks.map((link) => (
                    <tr key={link.slug}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{link.title}</div>
                        <div
                          style={{ fontSize: "12px", color: "var(--text-2)" }}
                        >
                          {siteUrl}/r/{link.slug}
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {formatNumber(link.clickCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "var(--text-2)",
                  fontSize: "14px",
                }}
              >
                {user
                  ? "No links yet. Create your first smart link!"
                  : "Sign in to see your links."}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
