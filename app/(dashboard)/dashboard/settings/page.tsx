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
      color: "#f59e0b", border: "1px solid rgba(245,158,11,.2)",
    }}>
      Pending DNS
    </span>
  );
}

function CopyableCode({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <code style={{
        flex: 1, padding: "6px 10px", borderRadius: 6, fontSize: 13,
        background: "var(--blue-dim)", color: "var(--blue)",
        fontFamily: "monospace", wordBreak: "break-all",
      }}>{value}</code>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true); setTimeout(() => setCopied(false), 2000);
        }}
        style={{
          background: "none", border: "1px solid var(--border)", padding: "5px 10px",
          borderRadius: 6, fontSize: 12, cursor: "pointer", color: "var(--text-2)",
          whiteSpace: "nowrap", fontFamily: "inherit",
        }}
      >{copied ? "✓ Copied" : "Copy"}</button>
    </div>
  );
}

function AddDomainModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [domainInput, setDomainInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleAdd() {
    const val = domainInput.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
    if (!val) { setError("Please enter a domain name."); return; }
    setSaving(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not signed in."); setSaving(false); return; }
    const { error: dbErr } = await supabase.from("domains").insert({
      user_id: user.id, domain_name: val, status: "pending",
    });
    if (dbErr) { setError(dbErr.message); setSaving(false); return; }
    onAdded(); onClose();
  }

  const cleanDomain = domainInput.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "link.yourbrand.com";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border-card)",
        borderRadius: 20, width: "min(520px,92vw)", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Add Custom Domain</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: "var(--text-2)", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ padding: 24, display: "grid", gap: 20 }}>
          {/* Step 1 */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "var(--blue)", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>1</span>
              Enter your domain
            </div>
            <input
              className="cf__input"
              placeholder="link.yourbrand.com"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              autoFocus
            />
          </div>

          {/* Step 2 — DNS instructions */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "var(--blue)", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>2</span>
              Add this DNS record at your registrar
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { label: "Type", value: "CNAME" },
                { label: "Name / Host", value: cleanDomain.split(".").length > 2 ? cleanDomain.split(".")[0] : "@" },
                { label: "Value / Points to", value: "deeplinkos.com" },
                { label: "TTL", value: "3600 (or Auto)" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
                  <CopyableCode value={value} />
                </div>
              ))}
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>
              ⏱ DNS propagation can take up to 48 hours. Click &quot;Verify DNS&quot; after updating your records.
            </p>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,.09)", border: "1px solid rgba(239,68,68,.28)", borderRadius: 10, fontSize: ".855rem", color: "#ef4444" }}>
              ⚠ {error}
            </div>
          )}

          <button className="btn-primary" onClick={handleAdd} disabled={saving} style={{ width: "100%", justifyContent: "center", padding: "13px 24px" }}>
            {saving ? "Adding…" : "Add Domain & Verify Later"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null);
  const supabase = createClient();

  async function loadDomains() {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u ? { id: u.id } : null);
    if (!u) { setLoading(false); return; }
    const { data } = await supabase
      .from("domains")
      .select("id, domain_name, status, created_at")
      .eq("user_id", u.id)
      .order("created_at", { ascending: false });
    setDomains(data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadDomains(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id: string) {
    if (!confirm("Remove this domain?")) return;
    await supabase.from("domains").delete().eq("id", id);
    setDomains((prev) => prev.filter((d) => d.id !== id));
    if (verifyMsg?.id === id) setVerifyMsg(null);
  }

  async function handleVerify(id: string) {
    setVerifyingId(id);
    setVerifyMsg(null);
    try {
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: id }),
      });
      const json = await res.json();
      setVerifyMsg({ id, msg: json.message, ok: json.verified });
      if (json.verified) {
        setDomains((prev) => prev.map((d) => d.id === id ? { ...d, status: "active" } : d));
      }
    } catch {
      setVerifyMsg({ id, msg: "Network error. Please try again.", ok: false });
    } finally {
      setVerifyingId(null);
    }
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
        <AddDomainModal onClose={() => setShowAddModal(false)} onAdded={loadDomains} />
      )}

      {/* Custom Domains */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <div className="panel-title">Custom Domains</div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Domain</button>
        </div>

        <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24, maxWidth: 640, lineHeight: 1.6 }}>
          Use your own brand name for shortened links (e.g.,{" "}
          <strong>link.yourbrand.com</strong>). Point a{" "}
          <code style={{ background: "var(--blue-dim)", color: "var(--blue)", padding: "1px 5px", borderRadius: 4 }}>CNAME</code>{" "}
          DNS record to{" "}
          <code style={{ background: "var(--blue-dim)", color: "var(--blue)", padding: "1px 5px", borderRadius: 4 }}>deeplinkos.com</code>{" "}
          then click &quot;Verify DNS&quot; to activate.
        </p>

        {loading ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>Loading…</div>
        ) : !user ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-2)", fontSize: 14 }}>Sign in to manage custom domains.</div>
        ) : domains.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12 }}>
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
                  <>
                    <tr key={d.id}>
                      <td style={{ fontWeight: 500 }}>{d.domain_name}</td>
                      <td><StatusBadge status={d.status} /></td>
                      <td>{formatDate(d.created_at)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {d.status !== "active" && (
                            <button
                              className="btn-secondary"
                              style={{ padding: "4px 10px", fontSize: 13 }}
                              onClick={() => handleVerify(d.id)}
                              disabled={verifyingId === d.id}
                            >
                              {verifyingId === d.id ? "Checking…" : "Verify DNS"}
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
                    {verifyMsg?.id === d.id && (
                      <tr key={`${d.id}-msg`}>
                        <td colSpan={4} style={{ paddingTop: 0 }}>
                          <div style={{
                            padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                            background: verifyMsg.ok ? "rgba(16,185,129,.08)" : "rgba(245,158,11,.08)",
                            color: verifyMsg.ok ? "#10b981" : "#f59e0b",
                            border: `1px solid ${verifyMsg.ok ? "rgba(16,185,129,.2)" : "rgba(245,158,11,.2)"}`,
                          }}>
                            {verifyMsg.msg}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <code style={{ fontFamily: "monospace", fontSize: 14, color: "var(--text-2)", letterSpacing: ".05em" }}>
            dl_live_••••••••••••••••
          </code>
          <button className="btn-secondary" style={{ padding: "6px 14px", fontSize: 13 }} onClick={copyApiKey}>
            {keyCopied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
        <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-3)" }}>
          🔒 Full API key management coming soon. Contact support for early access.
        </p>
      </div>
    </>
  );
}
