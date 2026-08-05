import { PageFrame } from "@/components/dashboard/page-frame";

/* Mock domain data — replace with real domain API responses when wired */
const MOCK_DOMAINS = [
  {
    id: "1",
    domain: "go.acme.com",
    status: "active" as const,
    ssl: "valid",
    dnsRecords: [
      { type: "CNAME", name: "go", value: "cname.dlos.io", ttl: "3600" },
    ],
  },
  {
    id: "2",
    domain: "links.acme.io",
    status: "pending" as const,
    ssl: "pending",
    dnsRecords: [
      { type: "CNAME", name: "links", value: "cname.dlos.io", ttl: "3600" },
    ],
  },
  {
    id: "3",
    domain: "jump.acme.co",
    status: "error" as const,
    ssl: "failed",
    dnsRecords: [
      { type: "A", name: "@", value: "76.76.21.21", ttl: "3600" },
    ],
  },
];

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  pending: "Pending DNS",
  error: "Failed",
};

const STATUS_CLASS: Record<string, string> = {
  active: "badge--active",
  pending: "badge--pending",
  error: "badge--error",
};

const SSL_LABEL: Record<string, string> = {
  valid: "SSL Valid",
  pending: "SSL Pending",
  failed: "SSL Failed",
};

const SSL_CLASS: Record<string, string> = {
  valid: "badge--active",
  pending: "badge--pending",
  failed: "badge--error",
};

/* Inline copy icon */
function CopyBtn({ value }: { value: string }) {
  return (
    <button
      type="button"
      className="btn-table-action btn-table-action--primary"
      aria-label={`Copy ${value}`}
      title={`Copy ${value}`}
      style={{ fontSize: "0.74rem", padding: "0.3rem 0.6rem" }}
      onClick={undefined}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      Copy
    </button>
  );
}

export default function DomainsPage() {
  return (
    <PageFrame
      eyebrow="Features"
      title="Custom Domains"
      description="Connect your own domains to DeepLinkOS. DNS records, SSL status, and verification all in one place."
      action={
        <button className="btn btn-primary" type="button" aria-label="Add custom domain">
          + Add domain
        </button>
      }
    >
      {/* Domain list */}
      <div style={{ display: "grid", gap: 14 }}>
        {MOCK_DOMAINS.map((d) => (
          <div key={d.id} className="domain-row panel">
            {/* Domain header */}
            <div className="domain-row__head">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden style={{ flexShrink: 0, color: "var(--text-soft)" }}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a15 15 0 0 1 0 18M3 12h18" />
                <path d="M12 3c-2.5 3-4 5.7-4 9s1.5 6 4 9" />
                <path d="M12 3c2.5 3 4 5.7 4 9s-1.5 6-4 9" />
              </svg>
              <span className="domain-name">{d.domain}</span>
              <span className={`badge ${STATUS_CLASS[d.status]}`}>
                <span className="badge-dot" />
                {STATUS_LABELS[d.status]}
              </span>
              <span className={`badge ${SSL_CLASS[d.ssl]}`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {SSL_LABEL[d.ssl]}
              </span>
            </div>

            {/* DNS records */}
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--text-soft)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                DNS Records
              </div>
              {d.dnsRecords.map((rec) => (
                <div key={rec.type + rec.name} className="dns-record-chip">
                  <span className="dns-record-chip__key">{rec.type}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-soft)" }}>
                      Name: <code style={{ fontSize: "0.78rem" }}>{rec.name}</code>
                    </span>
                    <span className="dns-record-chip__value">
                      {rec.value}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-soft)" }}>TTL: {rec.ttl}</span>
                  </div>
                  <CopyBtn value={rec.value} />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
              {d.status !== "active" && (
                <button type="button" className="btn btn-primary" style={{ fontSize: "0.84rem", padding: "0.6rem 1rem" }} aria-label={`Verify ${d.domain}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Verify DNS
                </button>
              )}
              <button type="button" className="btn-table-action btn-table-action--danger" aria-label={`Remove ${d.domain}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* Empty state (shown when no domains) */}
        {MOCK_DOMAINS.length === 0 && (
          <div className="panel">
            <div className="empty-state">
              <div className="empty-state__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3a15 15 0 0 1 0 18M3 12h18" />
                </svg>
              </div>
              <p className="empty-state__title">No custom domains yet</p>
              <p className="empty-state__desc">
                Add a domain to route your smart links through your own branded URL. Point a CNAME to <code>cname.dlos.io</code>.
              </p>
              <button className="btn btn-primary" type="button">+ Add your first domain</button>
            </div>
          </div>
        )}

        {/* Mock data notice */}
        <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(44,107,237,0.08)", border: "1px solid rgba(44,107,237,0.18)", fontSize: "0.82rem", color: "var(--blue)", lineHeight: 1.55 }}>
          <strong>Mock data</strong> — Replace <code>MOCK_DOMAINS</code> at the top of <code>domains/page.tsx</code> with real domain records from your Supabase table.
        </div>
      </div>
    </PageFrame>
  );
}
