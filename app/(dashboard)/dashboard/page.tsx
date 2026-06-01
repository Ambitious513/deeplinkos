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
    // Fetch all user links
    const { data: links } = await supabase
      .from("deep_links")
      .select("id, title, slug, is_active, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const allLinks = links ?? [];
    const linkIds = allLinks.map((l) => l.id);

    // Active links count
    activeLinks = allLinks.filter((l) => l.is_active).length;

    if (linkIds.length > 0) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString();

      // Total clicks in last 30 days
      const { count: clickCount } = await supabase
        .from("clicks")
        .select("id", { count: "exact", head: true })
        .in("link_id", linkIds)
        .gte("timestamp", since);

      totalClicks30d = clickCount ?? 0;

      // Unique visitors (distinct ip_hash) in last 30 days
      const { data: visitorRows } = await supabase
        .from("clicks")
        .select("ip_hash")
        .in("link_id", linkIds)
        .gte("timestamp", since);

      if (visitorRows) {
        const uniqueHashes = new Set(visitorRows.map((r) => r.ip_hash));
        uniqueVisitors = uniqueHashes.size;
      }

      // 7-day chart data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const since7d = sevenDaysAgo.toISOString();

      const { data: chartRows } = await supabase
        .from("clicks")
        .select("timestamp")
        .in("link_id", linkIds)
        .gte("timestamp", since7d);

      if (chartRows) {
        const dayMap: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          dayMap[dateStr] = 0;
        }

        chartRows.forEach((r) => {
          const dateStr = new Date(r.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          if (dayMap[dateStr] !== undefined) {
            dayMap[dateStr]++;
          }
        });

        labels7d = Object.keys(dayMap);
        data7d = Object.values(dayMap);
      }

      // Click counts per link for the 5 most recent links
      const top5 = allLinks.slice(0, 5);
      const top5Ids = top5.map((l) => l.id);

      const { data: clickRows } = await supabase
        .from("clicks")
        .select("link_id")
        .in("link_id", top5Ids);

      const clickMap: Record<string, number> = {};
      if (clickRows) {
        for (const row of clickRows) {
          clickMap[row.link_id] = (clickMap[row.link_id] ?? 0) + 1;
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
