import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LineChart } from "@/components/dashboard/charts/line-chart";
import { LinkActions } from "@/components/dashboard/link-actions";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://deeplinkos.com")
  .split(",")[0].trim().replace(/\/+$/, "");

const deviceEmoji: Record<string, string> = {
  ios: "🍎", android: "🤖", desktop: "🖥️", unknown: "❓",
};

const fmt = (n: number) => n.toLocaleString();

export default async function SingleLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return notFound();

  // Fetch full link record
  const { data: link } = await supabase
    .from("deep_links")
    .select("id, title, slug, user_id, is_active, desktop_url, ios_deep_link, ios_store_url, android_deep_link, android_store_url, created_at")
    .eq("slug", slug)
    .single();

  if (!link || link.user_id !== user.id) return notFound();

  const shortUrl = `${siteUrl}/r/${link.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`;

  // ── Parallel aggregated queries — no raw rows ──────────────────
  const [totalResult, deviceResult, referrerResult, chartResult] = await Promise.all([
    // Total + unique clicks (all time)
    supabase
      .from("clicks")
      .select("count:id.count(), unique_visitors:ip_hash.count()")
      .eq("link_id", link.id),

    // Device breakdown
    supabase
      .from("clicks")
      .select("device, count:device.count()")
      .eq("link_id", link.id),

    // Top referrers
    supabase
      .from("clicks")
      .select("referrer, count:referrer.count()")
      .eq("link_id", link.id)
      .order("count", { ascending: false })
      .limit(8),

    // Daily clicks (last 30 days) via RPC
    supabase.rpc("get_link_clicks_by_day", {
      link_uuid: link.id,
      days_ago: 30,
    }),
  ]);

  const totalClicks = Number((totalResult.data as any)?.[0]?.count ?? 0);
  const uniqueVisitors = Number((totalResult.data as any)?.[0]?.unique_visitors ?? 0);

  const deviceBreakdown = ((deviceResult.data ?? []) as any[])
    .map((r) => ({ device: r.device || "unknown", count: Number(r.count) }))
    .sort((a, b) => b.count - a.count);

  const topReferrers = ((referrerResult.data ?? []) as any[])
    .map((r) => ({ referrer: r.referrer || "direct", count: Number(r.count) }))
    .sort((a, b) => b.count - a.count);

  // Build 30-day chart
  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayMap[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
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

  return (
    <>
      {/* Back nav */}
      <Link
        href="/dashboard/links"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-2)", fontSize: 14, fontWeight: 500, marginBottom: 24, textDecoration: "none" }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back to Links
      </Link>

      {/* Header card */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{link.title || "Untitled"}</h2>
              <span style={{
                padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: link.is_active ? "rgba(34,197,94,.12)" : "var(--border)",
                color: link.is_active ? "#22c55e" : "var(--text-3)",
              }}>
                {link.is_active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-short"
              style={{ fontSize: 15 }}
            >
              {shortUrl.replace(/^https?:\/\//, "")}
            </a>
          </div>

          {/* Actions — client component for copy/edit/QR */}
          <LinkActions
            slug={link.slug}
            shortUrl={shortUrl}
            qrUrl={qrUrl}
            linkData={{
              title: link.title,
              desktopUrl: link.desktop_url,
              iosDeepLink: link.ios_deep_link,
              iosStoreUrl: link.ios_store_url,
              androidDeepLink: link.android_deep_link,
              androidStoreUrl: link.android_store_url,
              isActive: link.is_active,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-title">Total Clicks</div>
          <div className="stat-value">{fmt(totalClicks)}</div>
          <div className="stat-change">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Unique Visitors</div>
          <div className="stat-value">{fmt(uniqueVisitors)}</div>
          <div className="stat-change">By IP fingerprint</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Top Device</div>
          <div className="stat-value" style={{ fontSize: 26 }}>
            {deviceBreakdown[0] ? `${deviceEmoji[deviceBreakdown[0].device] ?? "🌐"} ${deviceBreakdown[0].device}` : "—"}
          </div>
          <div className="stat-change">
            {deviceBreakdown[0] ? `${fmt(deviceBreakdown[0].count)} clicks` : "No data"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Top Referrer</div>
          <div className="stat-value" style={{ fontSize: 18, wordBreak: "break-all" }}>
            {topReferrers[0]?.referrer ?? "—"}
          </div>
          <div className="stat-change">
            {topReferrers[0] ? `${fmt(topReferrers[0].count)} clicks` : "No data"}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header" style={{ marginBottom: 12 }}>
          <div className="panel-title">Traffic — Last 30 Days</div>
        </div>
        <div style={{ height: 280 }}>
          {chartData.some((v) => v > 0) ? (
            <LineChart labels={chartLabels} data={chartData} />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border)", borderRadius: 8 }}>
              <p style={{ color: "var(--text-2)", fontSize: 14 }}>No clicks in the last 30 days.</p>
            </div>
          )}
        </div>
      </div>

      {/* Device + Referrer */}
      <div className="content-grid">
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Device Breakdown</div></div>
          {deviceBreakdown.length > 0 ? (
            <div>
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
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", minWidth: 36, textAlign: "right" }}>{fmt(d.count)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>No device data yet.</div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header"><div className="panel-title">Top Referrers</div></div>
          {topReferrers.length > 0 ? (
            <div>
              {topReferrers.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                  <span style={{ fontWeight: 500, maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.referrer}</span>
                  <span style={{ fontWeight: 600, color: "var(--text-2)" }}>{fmt(r.count)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>No referrer data yet.</div>
          )}
        </div>
      </div>
    </>
  );
}
