"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";

interface LinkData {
  title: string | null;
  desktopUrl: string | null;
  iosDeepLink: string | null;
  iosStoreUrl: string | null;
  androidDeepLink: string | null;
  androidStoreUrl: string | null;
  isActive: boolean;
}

interface Props {
  slug: string;
  shortUrl: string;
  qrUrl: string;
  linkData: LinkData;
}

/* ── Icons ────────────────────────────────────────────────────── */
const CopyIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);
const QrIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" />
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

/* ── QR Modal ─────────────────────────────────────────────────── */
function QrModal({ qrUrl, shortUrl, onClose }: { qrUrl: string; shortUrl: string; onClose: () => void }) {
  function download() {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `qr-${shortUrl.replace(/[^a-z0-9]/gi, "-")}.png`;
    a.click();
  }

  return (
    <div className="modal-overlay open" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 320, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>QR Code</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-2)", display: "flex" }}>
            <XIcon />
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="QR Code" width={200} height={200} style={{ borderRadius: 8, marginBottom: 16, display: "block", margin: "0 auto 16px" }} />
        <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 20, wordBreak: "break-all" }}>{shortUrl}</p>
        <button onClick={download} className="btn-primary" style={{ width: "100%" }}>
          Download PNG
        </button>
      </div>
    </div>
  );
}

/* ── Edit Modal ───────────────────────────────────────────────── */
function EditModal({ slug, linkData, onClose, onSaved }: {
  slug: string;
  linkData: LinkData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: linkData.title || "",
    desktopUrl: linkData.desktopUrl || "",
    iosDeepLink: linkData.iosDeepLink || "",
    iosStoreUrl: linkData.iosStoreUrl || "",
    androidDeepLink: linkData.androidDeepLink || "",
    androidStoreUrl: linkData.androidStoreUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { show: toast } = useToast();

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/links/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title || null,
          desktopUrl: form.desktopUrl || null,
          iosDeepLink: form.iosDeepLink || null,
          iosStoreUrl: form.iosStoreUrl || null,
          androidDeepLink: form.androidDeepLink || null,
          androidStoreUrl: form.androidStoreUrl || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save.");
        return;
      }
      toast("Link updated!", "success");
      onSaved();
      onClose();
    } catch {
      setError("Connection error — try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = { width: "100%", marginTop: 4 };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginTop: 14 };

  return (
    <div className="modal-overlay open" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Edit Link</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-2)", display: "flex" }}>
            <XIcon />
          </button>
        </div>

        <label style={labelStyle}>Title</label>
        <input className="input-field" style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="My smart link" />

        <label style={labelStyle}>Destination URL</label>
        <input className="input-field" style={inputStyle} value={form.desktopUrl} onChange={(e) => set("desktopUrl", e.target.value)} placeholder="https://example.com" />

        <label style={{ ...labelStyle, marginTop: 20, color: "var(--blue)", fontSize: 11 }}>🍎 iOS</label>
        <input className="input-field" style={inputStyle} value={form.iosDeepLink} onChange={(e) => set("iosDeepLink", e.target.value)} placeholder="App deep link (vnd.youtube://...)" />
        <input className="input-field" style={{ ...inputStyle, marginTop: 6 }} value={form.iosStoreUrl} onChange={(e) => set("iosStoreUrl", e.target.value)} placeholder="App Store URL (fallback)" />

        <label style={{ ...labelStyle, marginTop: 12, color: "#22c55e", fontSize: 11 }}>🤖 Android</label>
        <input className="input-field" style={inputStyle} value={form.androidDeepLink} onChange={(e) => set("androidDeepLink", e.target.value)} placeholder="App deep link (intent://...)" />
        <input className="input-field" style={{ ...inputStyle, marginTop: 6 }} value={form.androidStoreUrl} onChange={(e) => set("androidStoreUrl", e.target.value)} placeholder="Play Store URL (fallback)" />

        {error && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleSave} className="btn-primary" style={{ flex: 2 }} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export function LinkActions({ slug, shortUrl, qrUrl, linkData }: Props) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const { show: toast } = useToast();
  const router = useRouter();

  async function copy() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast("Link copied!", "success");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={copy} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <CopyIcon /> {copied ? "Copied!" : "Copy URL"}
        </button>
        <button onClick={() => setShowQr(true)} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <QrIcon /> QR Code
        </button>
        <button onClick={() => setShowEdit(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <EditIcon /> Edit
        </button>
      </div>

      {showQr && <QrModal qrUrl={qrUrl} shortUrl={shortUrl} onClose={() => setShowQr(false)} />}
      {showEdit && (
        <EditModal
          slug={slug}
          linkData={linkData}
          onClose={() => setShowEdit(false)}
          onSaved={() => router.refresh()}
        />
      )}
    </>
  );
}
