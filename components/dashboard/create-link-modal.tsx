"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { presetMeta } from "@/lib/constants";
import { detectPresetFromUrl, inferLinkFromDestination } from "@/lib/inference";
import type { CreateLinkInput, LinkRecord, PresetKey } from "@/lib/types";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deeplinkos.com";
const siteUrl = rawSiteUrl.split(",")[0].trim().replace(/\/+$/, "");

const initialState: CreateLinkInput = {
  destinationUrl: "",
  title: "",
  preset: "custom",
  slug: "",
  iosDeepLink: "",
  iosStoreUrl: "",
  androidDeepLink: "",
  androidStoreUrl: "",
  desktopUrl: "",
  campaign: "",
  password: "",
  expiresAt: "",
  abTestUrl: ""
};

type CreateLinkResponse = { link: LinkRecord; shortUrl: string };

function isErrorResponse(
  payload: CreateLinkResponse | { error: string }
): payload is { error: string } {
  return "error" in payload;
}

/* ─── Platform Icons ─── */

function PlatformIcon({ preset }: { preset: PresetKey }) {
  const iconStyle = { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" } as const;

  const configs: Record<string, { bg: string; label: string }> = {
    youtube:      { bg: "#FF0000", label: "▶" },
    tiktok:       { bg: "#010101", label: "♪" },
    instagram:    { bg: "#E1306C", label: "📷" },
    facebook:     { bg: "#1877F2", label: "f" },
    whatsapp:     { bg: "#25D366", label: "💬" },
    telegram:     { bg: "#229ED9", label: "✈" },
    twitter:      { bg: "#000000", label: "𝕏" },
    "google-maps":{ bg: "#EA4335", label: "📍" },
    custom:       { bg: "linear-gradient(135deg, #3b82f6, #06b6d4)", label: "🔗" },
  };

  const cfg = configs[preset] || configs.custom;
  return (
    <div style={{ ...iconStyle, background: cfg.bg }}>
      {cfg.label}
    </div>
  );
}

/* ─── Modal Component ─── */

export function CreateLinkModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState<CreateLinkInput>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreateLinkResponse | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [enableAbTest, setEnableAbTest] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const router = useRouter();

  const inferred = useMemo(
    () => (form.destinationUrl?.trim() ? inferLinkFromDestination(form.destinationUrl) : null),
    [form.destinationUrl]
  );

  const activePreset = useMemo(
    () => presetMeta[detectPresetFromUrl(form.destinationUrl || "")] || presetMeta.custom,
    [form.destinationUrl]
  );

  useEffect(() => {
    if (!inferred) {
      if (!slugTouched) setForm((c) => ({ ...c, slug: "" }));
      return;
    }
    setForm((c) => ({
      ...c,
      title:           c.title           || inferred.title,
      desktopUrl:      c.desktopUrl      || inferred.desktopUrl,
      iosDeepLink:     c.iosDeepLink     || inferred.iosDeepLink,
      androidDeepLink: c.androidDeepLink || inferred.androidDeepLink,
      slug:            slugTouched ? c.slug : inferred.slug
    }));
  }, [inferred, slugTouched]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setForm(initialState);
      setError(null);
      setCreated(null);
      setCopyState("idle");
      setShowAdvanced(false);
      setEnableAbTest(false);
      setSlugTouched(false);
    }
  }, [isOpen]);

  function updateField<K extends keyof CreateLinkInput>(key: K, value: CreateLinkInput[K]) {
    setForm((c) => ({ ...c, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setCopyState("idle");

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = (await res.json()) as CreateLinkResponse | { error: string };

      if (!res.ok || isErrorResponse(payload)) {
        throw new Error(isErrorResponse(payload) ? payload.error : "Unable to create link.");
      }

      setCreated(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyUrl() {
    if (!created) return;
    await navigator.clipboard.writeText(created.shortUrl);
    setCopyState("done");
    setTimeout(() => setCopyState("idle"), 2500);
  }

  function handleDone() {
    onClose();
    router.refresh(); // Refresh server components to show the new link
  }

  const hasDestination = Boolean(form.destinationUrl?.trim());
  const slugPreview = form.slug?.trim() || inferred?.slug || "your-slug";
  const linkBase = `${siteUrl}/r/`;

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay${isOpen ? " open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(520px, 92vw)",
        maxHeight: "88vh",
        overflowY: "auto",
        overflowX: "hidden",
        borderRadius: 20,
        padding: 0,
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--border)"
        }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.03em", margin: 0, color: "var(--text)" }}>
            {created ? "🎉 Link Created!" : "Create Smart Link"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "var(--text-2)", fontSize: 22,
              cursor: "pointer", lineHeight: 1, padding: "4px 8px", borderRadius: 8
            }}
            aria-label="Close"
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {!created ? (
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
              {/* URL Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: ".835rem", fontWeight: 700, color: "var(--text)" }}>
                  Destination URL <span style={{ color: "var(--blue)" }}>*</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "4px 12px", transition: "border-color .18s" }}>
                  {hasDestination && <PlatformIcon preset={activePreset.value} />}
                  <input
                    style={{
                      flex: 1, border: "none", background: "transparent", color: "var(--text)",
                      fontSize: ".95rem", padding: "10px 0", outline: "none", fontFamily: "inherit"
                    }}
                    placeholder="Paste your YouTube, Instagram, WhatsApp or any URL…"
                    value={form.destinationUrl}
                    autoComplete="off"
                    autoFocus
                    onChange={(e) => {
                      setError(null);
                      updateField("destinationUrl", e.target.value);
                    }}
                  />
                </div>
              </div>

              {hasDestination && (
                <>
                  {/* Platform detected banner */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 14px", background: "var(--blue-dim)", borderRadius: 10,
                    fontSize: ".82rem", fontWeight: 600, color: "var(--blue)"
                  }}>
                    ✦ Detected <em>{activePreset.label}</em>
                  </div>

                  {/* Slug */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: ".835rem", fontWeight: 700, color: "var(--text)" }}>
                      Custom Slug
                    </label>
                    <div style={{
                      display: "flex", alignItems: "center",
                      background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 12,
                      overflow: "hidden"
                    }}>
                      <span style={{
                        padding: "10px 0 10px 14px", fontSize: ".82rem", fontWeight: 600,
                        color: "var(--text-3)", whiteSpace: "nowrap", userSelect: "all",
                        flexShrink: 0
                      }}>
                        {linkBase}
                      </span>
                      <input
                        style={{
                          flex: 1, border: "none", background: "transparent", color: "var(--text)",
                          fontSize: ".95rem", padding: "10px 14px 10px 0", outline: "none",
                          fontFamily: "inherit", minWidth: 0
                        }}
                        placeholder="your-custom-slug"
                        value={form.slug}
                        onChange={(e) => {
                          setSlugTouched(true);
                          updateField("slug", e.target.value);
                        }}
                      />
                    </div>
                    <span style={{ fontSize: ".78rem", color: "var(--text-3)" }}>
                      Preview: {linkBase}{slugPreview}
                    </span>
                  </div>

                  {/* Title */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: ".835rem", fontWeight: 700, color: "var(--text)" }}>
                      Link Title
                    </label>
                    <input
                      className="cf__input"
                      placeholder={`${activePreset.label} smart link`}
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                    />
                  </div>

                  {/* Advanced toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    style={{
                      background: "none", border: "none", color: "var(--blue)",
                      fontSize: ".85rem", fontWeight: 700, cursor: "pointer",
                      textAlign: "left", padding: 0
                    }}
                  >
                    {showAdvanced ? "▾ Hide" : "▸ Show"} advanced options
                  </button>

                  {showAdvanced && (
                    <div style={{ display: "grid", gap: 12, paddingTop: 8, borderTop: "1px dashed var(--border)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: ".835rem", fontWeight: 700, color: "var(--text)" }}>Desktop fallback URL (optional)</label>
                        <input className="cf__input" placeholder="https://..." value={form.desktopUrl} onChange={(e) => updateField("desktopUrl", e.target.value)} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: ".835rem", fontWeight: 700, color: "var(--text)" }}>App Store URL (optional)</label>
                        <input className="cf__input" placeholder="https://apps.apple.com/..." value={form.iosStoreUrl} onChange={(e) => updateField("iosStoreUrl", e.target.value)} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: ".835rem", fontWeight: 700, color: "var(--text)" }}>Play Store URL (optional)</label>
                        <input className="cf__input" placeholder="https://play.google.com/..." value={form.androidStoreUrl} onChange={(e) => updateField("androidStoreUrl", e.target.value)} />
                      </div>
                      
                      {/* New Advanced Settings */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: ".835rem", fontWeight: 700, color: "var(--text)" }}>Password Protection</label>
                        <input type="password" className="cf__input" placeholder="Require a password to access" value={form.password || ""} onChange={(e) => updateField("password", e.target.value)} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: ".835rem", fontWeight: 700, color: "var(--text)" }}>Expiration Date</label>
                        <input type="datetime-local" className="cf__input" value={form.expiresAt || ""} onChange={(e) => updateField("expiresAt", e.target.value)} />
                      </div>
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <input type="checkbox" id="abTest" checked={enableAbTest} onChange={(e) => { setEnableAbTest(e.target.checked); if (!e.target.checked) updateField("abTestUrl", ""); }} style={{ width: 16, height: 16, accentColor: "var(--blue)" }} />
                          <label htmlFor="abTest" style={{ fontSize: ".835rem", color: "var(--text)" }}>Enable A/B Split Testing (Add 2nd Destination)</label>
                        </div>
                        {enableAbTest && (
                          <input type="url" className="cf__input" placeholder="Alternative URL for A/B testing" value={form.abTestUrl || ""} onChange={(e) => updateField("abTestUrl", e.target.value)} />
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div style={{
                  padding: "10px 14px", background: "rgba(239,68,68,.09)",
                  border: "1px solid rgba(239,68,68,.28)", borderRadius: 10,
                  fontSize: ".855rem", fontWeight: 600, color: "#ef4444"
                }}>
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !hasDestination}
                style={{
                  width: "100%", justifyContent: "center",
                  padding: "14px 24px", fontSize: "1rem",
                  opacity: !hasDestination ? 0.5 : 1
                }}
              >
                {isSubmitting ? "Composing…" : "Compose Link →"}
              </button>
            </form>
          ) : (
            /* ─── Success State ─── */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "16px 0" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--grad)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 28, color: "#fff",
                boxShadow: "0 8px 28px rgba(59,130,246,.38)"
              }}>✓</div>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 4, color: "var(--text)" }}>
                  Your smart link is live!
                </p>
                <p style={{ fontSize: ".88rem", color: "var(--text-2)" }}>
                  Share it anywhere — it works on iOS, Android, and desktop.
                </p>
              </div>

              {/* The URL */}
              <div style={{
                width: "100%", padding: "14px 18px",
                background: "var(--blue-dim)", borderRadius: 12,
                textAlign: "center", wordBreak: "break-all",
                fontSize: "1rem", fontWeight: 700, color: "var(--blue)"
              }}>
                {created.shortUrl}
              </div>

              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                <button className="btn-primary" onClick={copyUrl} style={{ flex: 1, justifyContent: "center" }}>
                  {copyState === "done" ? "✓ Copied!" : "Copy Link"}
                </button>
                <a
                  href={created.shortUrl}
                  className="btn-secondary"
                  target="_blank"
                  rel="noreferrer"
                  style={{ flex: 1, justifyContent: "center", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center" }}
                >
                  Test Link ↗
                </a>
              </div>

              <button
                onClick={handleDone}
                style={{
                  background: "none", border: "none", color: "var(--text-2)",
                  fontSize: ".88rem", fontWeight: 600, cursor: "pointer", padding: "8px 0",
                  textDecoration: "underline", textUnderlineOffset: 3
                }}
              >
                Done — return to dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
