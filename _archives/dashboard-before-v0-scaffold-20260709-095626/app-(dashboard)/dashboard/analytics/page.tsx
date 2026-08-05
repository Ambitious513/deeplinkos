import { PageFrame } from "@/components/dashboard/page-frame";

/* ── Mock data — replace with real API calls when analytics is wired ── */
const MOCK_CLICKS = [
  { label: "Mon", value: 42, compare: 31 },
  { label: "Tue", value: 67, compare: 44 },
  { label: "Wed", value: 55, compare: 60 },
  { label: "Thu", value: 89, compare: 52 },
  { label: "Fri", value: 120, compare: 88 },
  { label: "Sat", value: 98, compare: 74 },
  { label: "Sun", value: 77, compare: 63 },
];

const MOCK_REFERRERS = [
  { source: "Direct", visits: 340, pct: 38 },
  { source: "Instagram", visits: 210, pct: 24 },
  { source: "TikTok", visits: 145, pct: 16 },
  { source: "YouTube", visits: 112, pct: 13 },
  { source: "Twitter / X", visits: 80, pct: 9 },
];

const MOCK_DEVICES = [
  { device: "iOS", pct: 52 },
  { device: "Android", pct: 31 },
  { device: "Desktop", pct: 14 },
  { device: "Other", pct: 3 },
];

const MOCK_KPIS = [
  { label: "Total clicks", value: "887", delta: "+14%", up: true },
  { label: "Unique visitors", value: "612", delta: "+9%", up: true },
  { label: "Top country", value: "US", delta: "52% of traffic", up: true },
  { label: "Top referrer", value: "Direct", delta: "38% of visits", up: true },
];

/* ── Inline SVG chart ─────────────────────────────────────────── */
function TrendChart({ data, height = 200 }: { data: typeof MOCK_CLICKS; height?: number }) {
  const W = 680;
  const padX = 8;
  const padY = 16;
  const max = Math.max(...data.map((d) => Math.max(d.value, d.compare))) * 1.1;

  const pt = (val: number, i: number) => ({
    x: padX + (i / (data.length - 1)) * (W - padX * 2),
    y: padY + (1 - val / max) * (height - padY * 2),
  });

  const mainPts = data.map((d, i) => pt(d.value, i));
  const compPts = data.map((d, i) => pt(d.compare, i));

  const buildPath = (pts: { x: number; y: number }[]) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cx = (pts[i - 1].x + pts[i].x) / 2;
      d += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
    }
    return d;
  };

  const mainPath = buildPath(mainPts);
  const compPath = buildPath(compPts);
  const areaPath = `${mainPath} L ${mainPts[mainPts.length - 1].x} ${height - padY} L ${mainPts[0].x} ${height - padY} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      preserveAspectRatio="none"
      role="img"
      aria-label="Weekly click trend"
    >
      <defs>
        <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={padX} x2={W - padX}
          y1={padY + g * (height - padY * 2)} y2={padY + g * (height - padY * 2)}
          stroke="var(--border)" strokeWidth="1" strokeDasharray="3 8"
        />
      ))}
      <path d={compPath} fill="none" stroke="var(--text-soft)" strokeWidth="2" strokeDasharray="5 7" opacity="0.4" />
      <path d={areaPath} fill="url(#analyticsGrad)" />
      <path d={mainPath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      {mainPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--surface-strong)" stroke="var(--accent)" strokeWidth="2" />
      ))}
    </svg>
  );
}

/* ── Date range control (client state hoisted to server stub) ─── */
function DateRangeBar() {
  // Non-interactive stub — client interactivity would require "use client"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <div className="segmented-control">
        {["7d", "30d", "90d"].map((v, i) => (
          <button key={v} className={`segmented-control__btn${i === 0 ? " is-active" : ""}`} type="button">
            {v}
          </button>
        ))}
      </div>
      <span style={{ fontSize: "0.78rem", color: "var(--text-soft)" }}>Compare to prior period</span>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <PageFrame
      eyebrow="Dashboard"
      title="Analytics"
      description="Track link performance, traffic sources, device breakdown, and campaign impact."
      action={<DateRangeBar />}
    >
      {/* KPI row */}
      <div className="analytics-kpi-grid">
        {MOCK_KPIS.map((kpi) => (
          <div key={kpi.label} className="card kpi-card">
            <div className="kpi-card__label">{kpi.label}</div>
            <div className="kpi-card__value" style={{ fontSize: "1.7rem" }}>{kpi.value}</div>
            <span
              className={`kpi-trend-delta${kpi.up ? " kpi-trend-delta--up" : " kpi-trend-delta--down"}`}
              style={{ marginTop: 6 }}
            >
              {kpi.delta}
            </span>
          </div>
        ))}
      </div>

      {/* Main analytics grid */}
      <div className="analytics-grid">
        {/* Left: chart + location */}
        <div className="stack">
          <div className="analytics-chart-panel panel">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <span className="analytics-panel-title">Click Trend</span>
              <div style={{ display: "flex", gap: 14, fontSize: "0.78rem", color: "var(--text-soft)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 16, height: 2.5, background: "var(--accent)", display: "inline-block", borderRadius: 2 }} />
                  This period
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 16, height: 2, borderTop: "2px dashed var(--text-soft)", display: "inline-block", opacity: 0.5 }} />
                  Prior period
                </span>
              </div>
            </div>
            <TrendChart data={MOCK_CLICKS} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: "0.75rem", color: "var(--text-soft)" }}>
              {MOCK_CLICKS.map((d) => <span key={d.label}>{d.label}</span>)}
            </div>
          </div>

          {/* Top locations */}
          <div className="panel">
            <p className="analytics-panel-title">Top Locations</p>
            {[
              { country: "United States", pct: 52, flag: "🇺🇸" },
              { country: "United Kingdom", pct: 14, flag: "🇬🇧" },
              { country: "Canada", pct: 11, flag: "🇨🇦" },
              { country: "Australia", pct: 8, flag: "🇦🇺" },
              { country: "Germany", pct: 5, flag: "🇩🇪" },
            ].map((row) => (
              <div key={row.country} className="stat-row">
                <span className="stat-row__label">
                  <span>{row.flag}</span>
                  {row.country}
                </span>
                <div className="stat-row__bar-track">
                  <div className="stat-row__bar-fill" style={{ width: `${row.pct}%` }} />
                </div>
                <span className="stat-row__value">{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: referrers + devices */}
        <div className="stack">
          <div className="panel">
            <p className="analytics-panel-title">Traffic Sources</p>
            {MOCK_REFERRERS.map((row) => (
              <div key={row.source} className="stat-row">
                <span className="stat-row__label">{row.source}</span>
                <div className="stat-row__bar-track">
                  <div className="stat-row__bar-fill" style={{ width: `${row.pct}%` }} />
                </div>
                <span className="stat-row__value">{row.visits.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="panel">
            <p className="analytics-panel-title">Device Breakdown</p>
            {MOCK_DEVICES.map((row) => (
              <div key={row.device} className="stat-row">
                <span className="stat-row__label">{row.device}</span>
                <div className="stat-row__bar-track">
                  <div className="stat-row__bar-fill" style={{ width: `${row.pct}%` }} />
                </div>
                <span className="stat-row__value">{row.pct}%</span>
              </div>
            ))}
          </div>

          {/* Mock data notice */}
          <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(44,107,237,0.08)", border: "1px solid rgba(44,107,237,0.18)", fontSize: "0.82rem", color: "var(--blue)", lineHeight: 1.55 }}>
            <strong>Mock data</strong> — Replace <code>MOCK_CLICKS</code>, <code>MOCK_REFERRERS</code>, and <code>MOCK_DEVICES</code> at the top of <code>analytics/page.tsx</code> with real API responses.
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
