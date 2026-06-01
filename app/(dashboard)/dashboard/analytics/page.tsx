import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://deeplinkos.com").split(",")[0].trim().replace(/\/+$/, "");

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let aggregateClicks = 0;
  let topLinks: { title: string; slug: string; clicks: number }[] = [];
  let deviceBreakdown: { device: string; count: number }[] = [];
  let topReferrers: { referrer: string; count: number }[] = [];

  if (user) {
    // Fetch user's links
    const { data: links } = await supabase
      .from("deep_links")
      .select("id, title, slug")
      .eq("user_id", user.id);

    const allLinks = links ?? [];
    const linkIds = allLinks.map((l) => l.id);

    if (linkIds.length > 0) {
      // Aggregate clicks
      const { count } = await supabase
        .from("clicks")
        .select("id", { count: "exact", head: true })
        .in("link_id", linkIds);
      aggregateClicks = count ?? 0;

      // All clicks for analysis
      const { data: clickRows } = await supabase
        .from("clicks")
        .select("link_id, device, referrer")
        .in("link_id", linkIds);

      const rows = clickRows ?? [];

      // Top links by click count
      const linkClickMap: Record<string, number> = {};
      for (const row of rows) {
        linkClickMap[row.link_id] = (linkClickMap[row.link_id] ?? 0) + 1;
      }
      topLinks = allLinks
        .map((l) => ({ title: l.title || "Untitled", slug: l.slug, clicks: linkClickMap[l.id] ?? 0 }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);

      // Device breakdown
      const deviceMap: Record<string, number> = {};
      for (const row of rows) {
        const d = row.device || "unknown";
        deviceMap[d] = (deviceMap[d] ?? 0) + 1;
      }
      deviceBreakdown = Object.entries(deviceMap)
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count);

      // Top referrers
      const refMap: Record<string, number> = {};
      for (const row of rows) {
        const r = row.referrer || "Direct";
        refMap[r] = (refMap[r] ?? 0) + 1;
      }
      topReferrers = Object.entries(refMap)
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }
  }

  const fmt = (n: number) => n.toLocaleString();
  const deviceEmoji: Record<string, string> = { ios: "🍎", android: "🤖", desktop: "🖥️", unknown: "❓" };

  return (
    <>
      <DashboardHeader title="Global Analytics" />

      <div className="panel" style={{ marginBottom: 24, padding: "16px 24px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontWeight: 600, marginRight: "auto" }}>Global Filters:</div>
        <select className="input-field" style={{ width: "auto", padding: "8px 16px" }}>
          <option>All Time</option>
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
        </select>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-title">Aggregate Clicks</div>
          <div className="stat-value">{fmt(aggregateClicks)}</div>
          <div className="stat-change">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active Links</div>
          <div className="stat-value">{fmt(topLinks.length)}</div>
          <div className="stat-change">With traffic</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Top Device</div>
          <div className="stat-value">{deviceBreakdown[0]?.device || "—"}</div>
          <div className="stat-change">{deviceBreakdown[0] ? `${fmt(deviceBreakdown[0].count)} clicks` : "No data"}</div>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header" style={{ marginBottom: 12 }}>
          <div className="panel-title">Global Traffic Trend</div>
        </div>
        <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border)", borderRadius: 8 }}>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>Chart.js Integration Pending...</p>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="content-grid">
        {/* Top Links */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Top Links</div>
          </div>
          <div className="table-responsive">
            {topLinks.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Link</th>
                    <th style={{ textAlign: "right" }}>Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {topLinks.map((link) => (
                    <tr key={link.slug}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{link.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-2)" }}>{siteUrl}/r/{link.slug}</div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(link.clicks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>
                {user ? "No click data yet. Share your links to see analytics!" : "Sign in to view analytics."}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Device + Referrers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Device Breakdown */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Device Breakdown</div>
            </div>
            {deviceBreakdown.length > 0 ? (
              <div style={{ display: "grid", gap: 10 }}>
                {deviceBreakdown.map((d) => (
                  <div key={d.device} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{deviceEmoji[d.device] || "🌐"}</span>
                      <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{d.device}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 80, height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: "var(--blue)", width: `${aggregateClicks > 0 ? (d.count / aggregateClicks * 100) : 0}%` }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", minWidth: 40, textAlign: "right" }}>{fmt(d.count)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>No device data yet.</div>
            )}
          </div>

          {/* Top Referrers */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Top Referrers</div>
            </div>
            {topReferrers.length > 0 ? (
              <div style={{ display: "grid", gap: 8 }}>
                {topReferrers.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                    <span style={{ color: "var(--text)", fontWeight: 500, maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.referrer}</span>
                    <span style={{ fontWeight: 600, color: "var(--text-2)" }}>{fmt(r.count)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>No referrer data yet.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
