"use client";

import { useState, useMemo } from "react";
import { TimeFilter, DateRange, getRange } from "@/components/dashboard/time-filter";
import { LineChart } from "@/components/dashboard/charts/line-chart";

interface ClickRow {
  link_id: string;
  device: string | null;
  referrer: string | null;
  timestamp: string;
}

interface LinkItem {
  id: string;
  title: string;
  slug: string;
  is_active: boolean;
}

interface Props {
  allLinks: LinkItem[];
  allClicks: ClickRow[];
  siteUrl: string;
}

const deviceEmoji: Record<string, string> = {
  ios: "🍎", android: "🤖", desktop: "🖥️", unknown: "❓",
};

const fmt = (n: number) => n.toLocaleString();

export function AnalyticsClient({ allLinks, allClicks, siteUrl }: Props) {
  const [range, setRange] = useState<DateRange>(getRange("all"));

  const filtered = useMemo(() =>
    allClicks.filter((r) => {
      const ts = new Date(r.timestamp);
      return ts >= range.from && ts <= range.to;
    }),
    [allClicks, range]
  );

  // Aggregate clicks
  const aggregateClicks = filtered.length;

  // Link click map
  const linkClickMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of filtered) m[r.link_id] = (m[r.link_id] ?? 0) + 1;
    return m;
  }, [filtered]);

  const topLinks = useMemo(() =>
    allLinks
      .map((l) => ({ title: l.title || "Untitled", slug: l.slug, clicks: linkClickMap[l.id] ?? 0 }))
      .filter((l) => l.clicks > 0)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5),
    [allLinks, linkClickMap]
  );

  // Active links with traffic
  const activeWithTraffic = allLinks.filter((l) => l.is_active && (linkClickMap[l.id] ?? 0) > 0).length;

  // Device breakdown
  const deviceBreakdown = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of filtered) {
      const d = r.device || "unknown";
      m[d] = (m[d] ?? 0) + 1;
    }
    return Object.entries(m).map(([device, count]) => ({ device, count })).sort((a, b) => b.count - a.count);
  }, [filtered]);

  // Top referrers
  const topReferrers = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of filtered) {
      const ref = r.referrer || "Direct";
      m[ref] = (m[ref] ?? 0) + 1;
    }
    return Object.entries(m).map(([referrer, count]) => ({ referrer, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filtered]);

  // Chart data — build day buckets from range.from to range.to
  const { chartLabels, chartData } = useMemo(() => {
    const dayMap: Record<string, number> = {};
    const start = new Date(range.from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(range.to);
    // Compute how many days in range
    const diffDays = Math.min(Math.round((end.getTime() - start.getTime()) / 86400000) + 1, 90);

    for (let i = 0; i < diffDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dayMap[key] = 0;
    }
    for (const r of filtered) {
      const key = new Date(r.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (key in dayMap) dayMap[key]++;
    }
    return { chartLabels: Object.keys(dayMap), chartData: Object.values(dayMap) };
  }, [filtered, range]);

  return (
    <>
      {/* Filter bar */}
      <div className="panel" style={{ marginBottom: 24, padding: "16px 24px" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginRight: "auto" }}>
            Global Filters:
          </div>
          <TimeFilter value={range} onChange={setRange} />
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-title">Aggregate Clicks</div>
          <div className="stat-value">{fmt(aggregateClicks)}</div>
          <div className="stat-change">{range.label === "all" ? "All time" : "In selected range"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active Links w/ Traffic</div>
          <div className="stat-value">{fmt(activeWithTraffic)}</div>
          <div className="stat-change">With traffic</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Top Device</div>
          <div className="stat-value">{deviceBreakdown[0]?.device || "—"}</div>
          <div className="stat-change">
            {deviceBreakdown[0] ? `${fmt(deviceBreakdown[0].count)} clicks` : "No data"}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header" style={{ marginBottom: 12 }}>
          <div className="panel-title">Global Traffic Trend</div>
          <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>
            {chartLabels[0]} – {chartLabels[chartLabels.length - 1]}
          </span>
        </div>
        <div style={{ height: 300 }}>
          {chartLabels.length > 0 && chartData.some((v) => v > 0) ? (
            <LineChart labels={chartLabels} data={chartData} />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border)", borderRadius: 8 }}>
              <p style={{ color: "var(--text-2)", fontSize: 14 }}>No click data for the selected range.</p>
            </div>
          )}
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
                No click data in this range.
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
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
              <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>No device data for this range.</div>
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
              <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>No referrer data for this range.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
