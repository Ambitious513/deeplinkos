import { PageFrame } from "@/components/dashboard/page-frame";
import { listLinksForUser } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function shortUrl(slug: string) {
  return `${siteUrl()}/r/${slug}`;
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return parts.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/* ── Inline mini sparkline SVG ─────────────────────────────────── */
function SparklineSVG({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <div style={{ width: "100%", height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-soft)", fontSize: "0.88rem" }}>
        Click data will appear once traffic flows through your links.
      </div>
    );
  }
  const W = 640;
  const H = 130;
  const padX = 6;
  const padY = 12;
  const max = Math.max(...values) * 1.15 || 1;
  const pts = values.map((v, i) => ({
    x: padX + (i / (values.length - 1)) * (W - padX * 2),
    y: padY + (1 - v / max) * (H - padY * 2),
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const area = `${d} L ${pts[pts.length - 1].x} ${H - padY} L ${pts[0].x} ${H - padY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="trend-sparkline" role="img" aria-label="Traffic trend">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={padX} x2={W - padX}
          y1={padY + g * (H - padY * 2)} y2={padY + g * (H - padY * 2)}
          stroke="var(--border)" strokeWidth="1" strokeDasharray="3 7"
        />
      ))}
      <path d={area} fill="url(#sparkGrad)" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--surface-strong)" stroke="var(--accent)" strokeWidth="2" />
      ))}
    </svg>
  );
}

/* ── Trend arrow SVGs ─────────────────────────────────────────── */
function TrendUp() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const links = user ? await listLinksForUser(user.id) : [];

  const activeLinks = links.filter((l) => l.isActive);
  const pausedLinks = links.filter((l) => !l.isActive);
  const recentLinks = links.slice(0, 5);

  // Created in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentCreated = links.filter((l) =>
    l.createdAt ? new Date(l.createdAt) > sevenDaysAgo : false
  ).length;

  const topPlatform = activeLinks[0]?.preset
    ? activeLinks[0].preset.split("-").map((p: string) => p[0].toUpperCase() + p.slice(1)).join(" ")
    : "None yet";

  // Sparkline mock — 7 data points proportional to link count
  const total = links.length;
  const mockSparkline = total > 0
    ? [0, Math.floor(total * 0.3), Math.floor(total * 0.5), Math.floor(total * 0.4), Math.floor(total * 0.7), Math.floor(total * 0.9), total]
    : [];

  const kpiCards = [
    {
      label: "Total links",
      value: String(links.length),
      badge: "Owned",
      delta: recentCreated > 0 ? `+${recentCreated} this week` : null,
      up: true,
      featured: false,
    },
    {
      label: "Active links",
      value: String(activeLinks.length),
      badge: "Live",
      delta: links.length > 0 ? `${Math.round((activeLinks.length / links.length) * 100)}% active` : null,
      up: true,
      featured: true,
    },
    {
      label: "Paused links",
      value: String(pausedLinks.length),
      badge: "Review",
      delta: pausedLinks.length > 0 ? "Needs attention" : "All clear",
      up: pausedLinks.length === 0,
      featured: false,
    },
    {
      label: "Top platform",
      value: topPlatform,
      badge: "Detected",
      delta: activeLinks.length > 0 ? "Auto-routed" : "Create a link",
      up: true,
      featured: false,
    },
    {
      label: "Added this week",
      value: String(recentCreated),
      badge: "New",
      delta: recentCreated > 0 ? "Since Monday" : "No new links",
      up: recentCreated > 0,
      featured: false,
    },
  ];

  return (
    <PageFrame
      eyebrow="Dashboard"
      title="Overview"
      description="A faster read on link health, campaign traffic, and the work that needs attention."
    >
      {/* KPI grid */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`card kpi-card${card.featured ? " kpi-card--featured" : ""}`}
          >
            <div className="kpi-card__label">{card.label}</div>
            <div className="kpi-card__value">{card.value}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="metric-pill">{card.badge}</span>
              {card.delta && (
                <span className={`kpi-trend-delta${card.up ? " kpi-trend-delta--up" : " kpi-trend-delta--down"}`}>
                  <TrendUp />
                  {card.delta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Left column */}
        <div className="stack">
          {/* Top links table */}
          <div className="table-card">
            <table className="table">
              <thead>
                <tr>
                  <th>Top links</th>
                  <th>Short URL</th>
                  <th>Platform</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLinks.map((link) => {
                  const platform = link.preset
                    ? link.preset.split("-").map((p: string) => p[0].toUpperCase() + p.slice(1)).join(" ")
                    : "Smart";
                  return (
                    <tr key={link.slug}>
                      <td>
                        <strong style={{ display: "block" }}>{link.title || link.slug}</strong>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "var(--text-soft)" }}>
                          {shortUrl(link.slug)}
                        </span>
                      </td>
                      <td>
                        <span className="platform-badge">{platform}</span>
                      </td>
                      <td>
                        <span className={`badge${link.isActive ? " badge--active" : " badge--paused"}`}>
                          <span className="badge-dot" />
                          {link.isActive ? "Active" : "Paused"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!recentLinks.length && (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state" style={{ padding: "32px 16px" }}>
                        <div className="empty-state__icon">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        </div>
                        <p className="empty-state__title">No links yet</p>
                        <p className="empty-state__desc">Create your first smart link to populate this table.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Attention panel */}
          <div className="panel">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Attention</div>
            {pausedLinks.length > 0 ? (
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14, background: "rgba(184,117,3,0.08)", border: "1px solid rgba(184,117,3,0.2)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b87503" strokeWidth="2" aria-hidden>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span style={{ fontSize: "0.88rem" }}>
                    <strong>{pausedLinks.length}</strong> link{pausedLinks.length > 1 ? "s are" : " is"} paused — visit Links to resume.
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--text-soft)", fontSize: "0.88rem", margin: 0, lineHeight: 1.65 }}>
                Pending DNS, weak fallbacks, or links needing review will appear here once connected. All looks good.
              </p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="stack">
          {/* Traffic trend */}
          <div className="panel">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Traffic Trend</div>
            <SparklineSVG values={mockSparkline} />
            <p style={{ fontSize: "0.78rem", color: "var(--text-soft)", marginTop: 8, marginBottom: 0 }}>
              Trend based on active link count. Live click data appears once traffic flows.
            </p>
          </div>

          {/* Next actions */}
          <div className="panel">
            <div className="eyebrow" style={{ marginBottom: 12 }}>Next Actions</div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { text: "Create links for your top social and affiliate destinations", done: links.length > 0 },
                { text: "Copy short URLs into campaigns, bios, and ad creatives", done: activeLinks.length > 0 },
                { text: "Visit your links to validate redirect and click tracking", done: false },
              ].map(({ text, done }) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: done ? "rgba(29,154,108,0.07)" : "color-mix(in srgb, var(--surface-strong) 78%, transparent)",
                    border: `1px solid ${done ? "rgba(29,154,108,0.18)" : "var(--border)"}`,
                  }}
                >
                  <span style={{ flexShrink: 0, marginTop: 1 }}>
                    {done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" aria-hidden>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid var(--border)", display: "inline-block" }} />
                    )}
                  </span>
                  <span style={{ fontSize: "0.86rem", color: done ? "var(--text-soft)" : "var(--text)", lineHeight: 1.55 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
