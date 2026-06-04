"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LineChart } from "@/components/dashboard/charts/line-chart";

interface LinkItem {
  id: string;
  title: string;
  slug: string;
  is_active: boolean;
}

interface Precomputed {
  totalClicks: number;
  uniqueVisitors: number;
  activeLinksCount: number;
  topLinks: { title: string; slug: string; clicks: number }[];
  deviceBreakdown: { device: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  chartLabels: string[];
  chartData: number[];
  days: number;
}

interface Props {
  allLinks: LinkItem[];
  precomputed: Precomputed;
  siteUrl: string;
}

const deviceEmoji: Record<string, string> = {
  ios: "🍎", android: "🤖", desktop: "🖥️", unknown: "❓",
};

const fmt = (n: number) => n.toLocaleString();

export function AnalyticsClient({ allLinks, precomputed, siteUrl }: Props) {
  const {
    totalClicks, uniqueVisitors, activeLinksCount,
    topLinks, deviceBreakdown, topReferrers,
    chartLabels, chartData, days,
  } = precomputed;

  const router = useRouter();
  const [selectedDays, setSelectedDays] = useState(String(days));

  function handleDaysChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedDays(e.target.value);
    router.push(`?days=${e.target.value}`);
  }

  const topDevice = deviceBreakdown[0];

  return (
    <>
      {/* Filter bar */}
      <div className="panel" style={{ marginBottom: 24, padding: "16px 24px" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginRight: "auto" }}>
            Time Range:
          </div>
          <select
            className="input-field"
            value={selectedDays}
            onChange={handleDaysChange}
            style={{ width: "auto", padding: "6px 12px", fontSize: 13 }}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last 365 Days</option>
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-title">Total Clicks</div>
          <div className="stat-value">{fmt(totalClicks)}</div>
          <div className="stat-change">Last {days} days</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Unique Visitors</div>
          <div className="stat-value">{fmt(uniqueVisitors)}</div>
          <div className="stat-change">By IP fingerprint</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active Links</div>
          <div className="stat-value">{fmt(activeLinksCount)}</div>
          <div className="stat-change">Currently live</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Top Device</div>
          <div className="stat-value" style={{ fontSize: 28 }}>
            {topDevice ? `${deviceEmoji[topDevice.device] ?? "🌐"} ${topDevice.device}` : "—"}
          </div>
          <div className="stat-change">
            {topDevice ? `${fmt(topDevice.count)} clicks` : "No data yet"}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header" style={{ marginBottom: 12 }}>
          <div className="panel-title">Traffic Trend</div>
          {chartLabels.length > 0 && (
            <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>
              {chartLabels[0]} – {chartLabels[chartLabels.length - 1]}
            </span>
          )}
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
                    <tr
                      key={link.slug}
                      style={{ cursor: "pointer" }}
                      onClick={() => router.push(`/dashboard/links/${link.slug}`)}
                    >
                      <td>
                        <div style={{ fontWeight: 500 }}>{link.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                          {siteUrl}/r/{link.slug}
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(link.clicks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>
                No clicks in this date range.
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
                        <div style={{ height: "100%", borderRadius: 3, background: "var(--blue)", width: `${totalClicks > 0 ? (d.count / totalClicks * 100) : 0}%` }} />
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
                    <span style={{ color: "var(--text)", fontWeight: 500, maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.referrer}
                    </span>
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
