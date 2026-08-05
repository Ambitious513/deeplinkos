import { PageFrame } from "@/components/dashboard/page-frame";

const INTEGRATIONS = [
  {
    id: "ga4",
    name: "Google Analytics 4",
    abbr: "GA",
    color: "#f9ab00",
    description: "Track link clicks as GA4 events. Requires a Measurement ID and API secret.",
    status: "not_configured" as const,
    checklist: [
      "Create a GA4 property and note the Measurement ID",
      "Generate a Measurement Protocol API secret in GA4",
      "Enter both values in DeepLinkOS Pixel settings",
    ],
    events: ["page_view", "link_click", "custom_event"],
  },
  {
    id: "meta",
    name: "Meta Pixel",
    abbr: "fb",
    color: "#0866ff",
    description: "Send conversion events to Meta for ads attribution. Requires a Pixel ID and access token.",
    status: "not_configured" as const,
    checklist: [
      "Create or locate your Meta Pixel in Events Manager",
      "Generate a Conversions API access token",
      "Enter your Pixel ID and token in DeepLinkOS",
    ],
    events: ["PageView", "ViewContent", "Lead"],
  },
  {
    id: "tiktok",
    name: "TikTok Pixel",
    abbr: "TK",
    color: "#010101",
    description: "Attribute TikTok ad conversions to your smart links. Requires a Pixel ID and Events API access token.",
    status: "not_configured" as const,
    checklist: [
      "Create a TikTok Pixel in TikTok Ads Manager",
      "Enable Events API and generate an access token",
      "Add your Pixel ID and access token to DeepLinkOS",
    ],
    events: ["ViewContent", "ClickButton", "CompletePayment"],
  },
];

function CheckDot({ done }: { done: boolean }) {
  return done ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <span
      style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid var(--border)", display: "inline-block", flexShrink: 0 }}
      aria-hidden
    />
  );
}

export default function PixelsPage() {
  return (
    <PageFrame
      eyebrow="Features"
      title="Pixels"
      description="Connect tracking pixels to send link events to your ad platforms and analytics tools."
      badge={<span className="badge badge--beta">Beta</span>}
    >
      {/* Intro callout */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(239,122,34,0.08), rgba(44,107,237,0.07))",
          border: "1px solid rgba(239,122,34,0.22)",
          marginBottom: 20,
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" aria-hidden style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <strong style={{ fontSize: "0.92rem" }}>Pixels are in beta.</strong>
          <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: "var(--text-soft)", lineHeight: 1.6 }}>
            Server-side pixel firing is being built. Configure your integration details now so you are ready to activate when it launches. No data is sent yet.
          </p>
        </div>
      </div>

      {/* Integration cards */}
      <div style={{ display: "grid", gap: 14, marginBottom: 24 }}>
        {INTEGRATIONS.map((integration) => (
          <div key={integration.id} className="pixel-card panel">
            <div className="pixel-card__head">
              <div
                className="pixel-card__logo"
                style={{ background: integration.color, color: "#fff", fontFamily: "var(--font-display)" }}
                aria-label={`${integration.name} logo`}
              >
                {integration.abbr}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{integration.name}</strong>
                  <span className="badge badge--pending">Not configured</span>
                </div>
                <p style={{ margin: "3px 0 0", fontSize: "0.84rem", color: "var(--text-soft)", lineHeight: 1.55 }}>
                  {integration.description}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
              {/* Setup checklist */}
              <div>
                <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--text-soft)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                  Setup steps
                </div>
                <div className="pixel-checklist">
                  {integration.checklist.map((step, i) => (
                    <div key={i} className="pixel-checklist__item">
                      <CheckDot done={false} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event preview */}
              <div>
                <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--text-soft)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                  Events tracked
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {integration.events.map((ev) => (
                    <code
                      key={ev}
                      style={{
                        fontSize: "0.74rem",
                        padding: "3px 8px",
                        borderRadius: 8,
                        background: "color-mix(in srgb, var(--surface-strong) 76%, transparent)",
                        border: "1px solid var(--border)",
                        color: "var(--text-soft)",
                      }}
                    >
                      {ev}
                    </code>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 4 }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: "0.84rem", opacity: 0.6, cursor: "not-allowed" }}
                disabled
                aria-disabled="true"
              >
                Configure — coming soon
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Roadmap */}
      <div className="panel" style={{ padding: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Roadmap</div>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { item: "Server-side pixel firing via DeepLinkOS redirect edge", done: false },
            { item: "GA4 Measurement Protocol integration", done: false },
            { item: "Meta Conversions API integration", done: false },
            { item: "TikTok Events API integration", done: false },
            { item: "Real-time event stream preview in this panel", done: false },
          ].map(({ item, done }) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 12,
                background: "color-mix(in srgb, var(--surface-strong) 72%, transparent)",
                border: "1px solid var(--border)",
                fontSize: "0.86rem",
              }}
            >
              <CheckDot done={done} />
              <span style={{ color: done ? "var(--text-soft)" : "var(--text)" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}
