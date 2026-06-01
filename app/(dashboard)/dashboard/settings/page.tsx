"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardHeader } from "@/components/dashboard/header";

type Domain = {
  id: string;
  domain_name: string;
  status: string;
  created_at: string;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return <span className="badge-active">Active</span>;
  }
  return (
    <span style={{
      padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600,
      display: "inline-block", background: "rgba(245,158,11,.1)",
      color: "#f59e0b", border: "1px solid rgba(245,158,11,.2)"
    }}>
      {status === "pending" ? "Pending DNS" : status}
    </span>
  );
}

function AddDomainModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [domainInput, setDomainInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleAdd() {
    const val = domainInput.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!val) { setError("Please enter a domain name."); return; }
    setSaving(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not signed in."); setSaving(false); return; }
    const { error: dbErr } = await supabase.from("domains").insert({
      user_id: user.id, domain_name: val, status: "pending"
    });
    if (dbErr) { setError(dbErr.message); setSaving(false); return; }
    onAdded();
    onClose();
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-card)",
        borderRadius: 20, width: "min(480px,92vw)", overflow: "hidden"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text)" }}>Add Custom Domain</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: "var(--text-2)", cursor: "pointer" }}>×</button>
        </div>
        <div style={{ padding: 24, display: "grid", gap: 16 }}>
          <p style={{ color: "var(--text-2)", fontSize: ".9rem", lineHeight: 1.6, margin: 0 }}>
            Enter your custom domain (e.g. <strong>link.yourbrand.com</strong>). After adding, point a <strong>CNAME</strong> DNS record to <code style={{ background: "var(--blue-dim)", color: "var(--blue)", padding: "2px 6px", borderRadius: 4 }}>deeplinkos.com</code>.
          </p>
          <div>
            <label style={{ fontSize: ".835rem", fontWeight: 700, color: "var(--text)", display: "block", marginBottom: 6 }}>Domain Name</label>
            <input
              className="cf__input"
              placeholder="link.yourbrand.com"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              autoFocus
            />
          </div>
          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,.09)", border: "1px solid rgba(239,68,68,.28)", borderRadius: 10, fontSize: ".855rem", color: "#ef4444" }}>
              ⚠ {error}
            </div>
          )}
          <button className="btn-primary" onClick={handleAdd} disabled={saving} style={{ width: "100%", justifyContent: "center", padding: "13px 24px" }}>
            {saving ? "Adding…" : "Add Domain"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const supabase = createClient();

  async function loadDomains() {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u);
    if (!u) { setLoading(false); return; }
    const { data } = await supabase
      .from("domains")
      .select("id, domain_name, status, created_at")
      .eq("user_id", u.id)
      .order("created_at", { ascending: false });
    setDomains(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadDomains(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Remove this domain?")) return;
    await supabase.from("domains").delete().eq("id", id);
    setDomains((prev) => prev.filter((d) => d.id !== id));
  }

  function copyApiKey() {
    navigator.clipboard.writeText("dl_live_••••••••••••••••");
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <>
      <DashboardHeader title="Settings" />
      {showAddModal && (
        <AddDomainModal
          onClose={() => setShowAddModal(false)}
          onAdded={loadDomains}
        />
      )}

      {/* Custom Domains */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <div className="panel-title">Custom Domains</div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Domain</button>
        </div>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24, maxWidth: 600 }}>
          Use your own brand name for shortened links (e.g., <strong>link.yourbrand.com</strong>). Point a CNAME DNS record to <code style={{ background: "var(--blue-dim)", color: "var(--blue)", padding: "2px 5px", borderRadius: 4 }}>deeplinkos.com</code> to verify.
        </p>

        {loading ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>Loading…</div>
        ) : !user ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>Sign in to manage custom domains.</div>
        ) : domains.length === 0 ? (
          <div style={{
            padding: "40px 16px", textAlign: "center",
            border: "1px dashed var(--border)", borderRadius: 12
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌐</div>
            <p style={{ color: "var(--text-2)", fontSize: 14, margin: 0 }}>
              No custom domains yet. Add one to brand your links!
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 500 }}>{d.domain_name}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>{formatDate(d.created_at)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {d.status === "pending" && (
                          <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: 13 }}>
                            Verify DNS
                          </button>
                        )}
                        <button
                          className="btn-secondary"
                          style={{ padding: "4px 10px", fontSize: 13, color: "#ef4444", borderColor: "rgba(239,68,68,.3)" }}
                          onClick={() => handleDelete(d.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* API Keys */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">API Keys</div>
        </div>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>
          Use these keys to authenticate API requests and integrate DeepLink OS into your own applications.
        </p>
        <div style={{
          padding: "16px 20px", background: "var(--bg)",
          border: "1px solid var(--border)", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap"
        }}>
          <code style={{ fontFamily: "monospace", fontSize: 14, color: "var(--text-2)", letterSpacing: ".05em" }}>
            dl_live_••••••••••••••••
          </code>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 13 }} onClick={copyApiKey}>
              {keyCopied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-3)" }}>
          🔒 Full API key management coming soon. Contact support for early access.
        </p>
      </div>
    </>
  );
}
