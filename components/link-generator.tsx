"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { presetMeta } from "@/lib/constants";
import { detectPresetFromUrl, inferLinkFromDestination } from "@/lib/inference";
import type { CreateLinkInput, LinkRecord, PresetKey } from "@/lib/types";

const fallbackLinkBase = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/r/` : "https://deeplinkos.com/r/";

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
  campaign: ""
};

type CreateLinkResponse = { link: LinkRecord; shortUrl: string };

function isErrorResponse(
  payload: CreateLinkResponse | { error: string }
): payload is { error: string } {
  return "error" in payload;
}

/* ─── Composer badge icons — match the mockup exactly.
   Each SVG using a gradient carries its own <defs> (prefix: sig-)
   so url(#id) resolves correctly regardless of DOM position.      ── */

function YoutubeIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect width="52" height="52" rx="14" fill="#FF0000"/>
      <path d="M21 18.5 35 26 21 33.5V18.5Z" fill="#fff"/>
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect width="52" height="52" rx="14" fill="#010101"/>
      <path d="M33.5 13h-4.4v16.6a4.2 4.2 0 1 1-4.2-4.2c.38 0 .75.05 1.1.14V21a8.5 8.5 0 1 0 7.5 8.4V20.8a12.9 12.9 0 0 0 7.5 2.4v-4.3a8.5 8.5 0 0 1-7.5-5.9Z" fill="#fff"/>
      <path d="M33.5 13h-4.4v16.6a4.2 4.2 0 1 1-4.2-4.2c.38 0 .75.05 1.1.14V21a8.5 8.5 0 1 0 7.5 8.4V20.8a12.9 12.9 0 0 0 7.5 2.4v-4.3a8.5 8.5 0 0 1-7.5-5.9Z" fill="#EE1D52" opacity=".55"/>
      <path d="M29.1 13h-4.4v16.6a4.2 4.2 0 1 1-4.2-4.2c.38 0 .75.05 1.1.14V21a8.5 8.5 0 1 0 7.5 8.4V20.8a12.9 12.9 0 0 0 7.5 2.4v-4.3a8.5 8.5 0 0 1-7.5-5.9Z" fill="#69C9D0" opacity=".55"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sig-ig" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#f9ce34"/>
          <stop offset="32%"  stopColor="#ee2a7b"/>
          <stop offset="68%"  stopColor="#6228d7"/>
          <stop offset="100%" stopColor="#4f5bd5"/>
        </linearGradient>
      </defs>
      <rect width="52" height="52" rx="14" fill="url(#sig-ig)"/>
      <rect x="11" y="11" width="30" height="30" rx="9" stroke="#fff" strokeWidth="3.5"/>
      <circle cx="26" cy="26" r="8" stroke="#fff" strokeWidth="3.5"/>
      <circle cx="37" cy="15" r="2.2" fill="#fff"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect width="52" height="52" rx="14" fill="#1877F2"/>
      <path d="M33 26h-5v14h-5V26h-3v-5h3v-3c0-4 2-6.5 6-6.5 1.7 0 3.5.3 3.5.3V17h-2c-2 0-2.5 1-2.5 2.5V21h4.5L33 26Z" fill="#fff"/>
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect width="52" height="52" rx="14" fill="#25D366"/>
      <path d="M26 12a14 14 0 0 0-12 21L12 40l7.2-2A14 14 0 1 0 26 12Zm7.8 19.3c-.3.9-1.8 1.7-2.5 1.8-.7.1-1.5.1-2.4-.2-.6-.2-1.3-.4-2.3-.8-4-1.8-6.6-5.9-6.8-6.2-.2-.3-1.7-2.2-1.7-4.2 0-2 1-3 1.4-3.4.4-.4.8-.5 1.1-.5h.8c.2 0 .5-.1.9.7.3.8 1.1 2.7 1.2 2.9.1.2.2.4 0 .7-.1.3-.2.5-.4.7l-.6.7c-.2.2-.4.4-.2.8.2.4 1 1.6 2 2.5 1.4 1.2 2.6 1.6 3 1.8.4.1.6.1.9-.1.2-.2 1-1.1 1.2-1.5.3-.4.5-.3.9-.2.4.1 2.3 1 2.7 1.3.4.2.7.3.8.5.1.2.1 1.1-.2 2Z" fill="#fff"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect width="52" height="52" rx="14" fill="#229ED9"/>
      <path d="M38.7 14.2 33.6 36c-.3 1.4-1.2 1.7-2.4 1.1l-6.7-4.9-3.2 3.1c-.4.4-.7.7-1.4.7l.5-7 13-11.6c.6-.5-.1-.8-.9-.3L13.6 26.1l-6.5-2c-1.4-.4-1.4-1.4.3-2l23.5-9c1.2-.4 2.2.3 1.8 3.1Z" fill="#fff"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect width="52" height="52" rx="14" fill="#000"/>
      <path d="M10 11h10.5l8 11.3L37.5 11H43L31.5 24.5 44 41H33.5l-8.8-12.4L15 41H9.5L21.5 27 10 11Zm4 2.5 20 26h4.5L18.5 13.5H14Z" fill="#fff"/>
    </svg>
  );
}

function MapsIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect width="52" height="52" rx="14" fill="#0a1628"/>
      <path d="M26 11a10 10 0 0 0-8 16l8 14 8-14a10 10 0 0 0-8-16Zm0 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" fill="#EA4335"/>
      <path d="M26 11a10 10 0 0 1 8 16l-3 5.3A10 10 0 0 0 26 11Z" fill="#FBBC04"/>
      <path d="M22 27l-4 6.5A10 10 0 0 1 16 21l4.5 4.2L22 27Z" fill="#34A853"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sig-cu" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
      </defs>
      <rect width="52" height="52" rx="14" fill="#071228"/>
      <path d="M21 31a6 6 0 0 1 0-8.5l4.5-4.5a6 6 0 0 1 8.5 8.5l-1.5 1.5" stroke="url(#sig-cu)" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M31 21a6 6 0 0 1 0 8.5l-4.5 4.5a6 6 0 0 1-8.5-8.5l1.5-1.5" stroke="url(#sig-cu)" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

function SocialIcon({ preset }: { preset: PresetKey }) {
  switch (preset) {
    case "youtube":    return <YoutubeIcon />;
    case "tiktok":     return <TiktokIcon />;
    case "instagram":  return <InstagramIcon />;
    case "facebook":   return <FacebookIcon />;
    case "whatsapp":   return <WhatsappIcon />;
    case "telegram":   return <TelegramIcon />;
    case "twitter":    return <TwitterIcon />;
    case "google-maps": return <MapsIcon />;
    default:           return <LinkIcon />;
  }
}

/* ─── Main component ─────────────────────────────────────────────── */

export function LinkGenerator({ onViewAnalytics }: { onViewAnalytics?: () => void } = {}) {
  const [form, setForm] = useState<CreateLinkInput>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreateLinkResponse | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");
  const [showCustomize, setShowCustomize] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const inferred = useMemo(
    () => (form.destinationUrl?.trim() ? inferLinkFromDestination(form.destinationUrl) : null),
    [form.destinationUrl]
  );

  const localLinkBase = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/r/`;
    }
    return fallbackLinkBase;
  }, []);

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
      title:          c.title          || inferred.title,
      desktopUrl:     c.desktopUrl     || inferred.desktopUrl,
      iosDeepLink:    c.iosDeepLink    || inferred.iosDeepLink,
      androidDeepLink:c.androidDeepLink|| inferred.androidDeepLink,
      slug:           slugTouched ? c.slug : inferred.slug
    }));
  }, [inferred, slugTouched]);

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

      setCreated({
        ...payload,
        shortUrl: payload.shortUrl
      });
      setShowCustomize(true);
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

  const hasDestination = Boolean(form.destinationUrl?.trim());
  const slugPreview    = form.slug?.trim() || inferred?.slug || "your-custom-slug";

  return (
    <div className="composer-wrap" id="composer">
      <button
        type="button"
        className="customize-pill"
        onClick={() => setShowCustomize((v) => !v)}
        aria-expanded={showCustomize}
        aria-controls="composer-advanced-fields"
      >
        <span className="customize-pill__spark" aria-hidden="true">✦</span>
        <span>{hasDestination ? "Customize Your Link" : "Compose your intelligent deep link"}</span>
      </button>

      <section className="composer-card" aria-label="Deep link generator">
        <form className="composer-form" onSubmit={handleSubmit}>
          {/* URL input row */}
          <div className={`composer-row composer-row--top${hasDestination ? " is-active" : ""}`}>
            {hasDestination && (
              <div className="platform-badge" aria-label={`Detected: ${activePreset.label}`}>
                <SocialIcon preset={activePreset.value} />
              </div>
            )}
            <input
              id="url-input"
              className="composer-input composer-input--primary"
              aria-label="Destination URL"
              placeholder="Paste your YouTube, Instagram, WhatsApp or any URL…"
              value={form.destinationUrl}
              autoComplete="off"
              onChange={(e) => {
                setCreated(null);
                setError(null);
                updateField("destinationUrl", e.target.value);
              }}
              onFocus={() => { if (hasDestination) setShowCustomize(true); }}
            />
          </div>

          {hasDestination && (
            <>
              <div className="composer-divider" />

              <div className="composer-label-row">
                <strong>Customize your deep link</strong>
                <p>
                  Detected <em>{activePreset.label}</em>. Edit the slug below, then hit Compose.
                </p>
              </div>

              <div className="composer-row composer-row--bottom">
                <div className="composer-stack">
                  {/* Slug field */}
                  <div className="slug-field">
                    <span className="slug-prefix" aria-hidden="true">{localLinkBase}</span>
                    <input
                      id="slug-input"
                      className="composer-input composer-input--slug"
                      aria-label="Custom slug"
                      placeholder="your-custom-slug"
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        updateField("slug", e.target.value);
                      }}
                    />
                  </div>

                  {/* Advanced fields */}
                  {showCustomize && (
                    <div
                      id="composer-advanced-fields"
                      className="composer-advanced"
                      role="group"
                      aria-label="Advanced link options"
                    >
                      <input
                        className="composer-input"
                        aria-label="Link title"
                        placeholder={`${activePreset.label} smart link`}
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                      <input
                        className="composer-input"
                        aria-label="Desktop fallback URL"
                        placeholder="Desktop fallback URL (optional)"
                        value={form.desktopUrl}
                        onChange={(e) => updateField("desktopUrl", e.target.value)}
                      />
                      <input
                        className="composer-input"
                        aria-label="App Store fallback"
                        placeholder="App Store URL (optional)"
                        value={form.iosStoreUrl}
                        onChange={(e) => updateField("iosStoreUrl", e.target.value)}
                      />
                      <input
                        className="composer-input"
                        aria-label="Play Store fallback"
                        placeholder="Play Store URL (optional)"
                        value={form.androidStoreUrl}
                        onChange={(e) => updateField("androidStoreUrl", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  id="compose-btn"
                  className="compose-button"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting
                    ? <><span className="spinner" aria-hidden="true" /> Composing…</>
                    : "Compose Link →"
                  }
                </button>
              </div>
            </>
          )}

          {error && (
            <p className="composer-error" role="alert">
              <span aria-hidden="true">⚠</span> {error}
            </p>
          )}
        </form>
      </section>

      {/* Preview banner */}
      {hasDestination && !created && (
        <section className="result-banner result-banner--preview" aria-label="Link preview">
          <div className="result-banner__copy">
            <span className="result-banner__eyebrow">Preview</span>
            <strong>{`${localLinkBase}${slugPreview}`}</strong>
          </div>
        </section>
      )}

      {/* Live result banner */}
      {created && (
        <section className="result-banner result-banner--live" aria-live="polite" aria-label="Generated deep link">
          <div className="result-banner__copy">
            <span className="result-banner__eyebrow">Your smart deep link is live ✓</span>
            <strong>{created.shortUrl}</strong>
          </div>
          <div className="result-banner__actions">
            <button
              type="button"
              id="copy-link-btn"
              className="button button--primary"
              onClick={copyUrl}
              aria-label="Copy deep link to clipboard"
            >
              {copyState === "done" ? "✓ Copied!" : "Copy Link"}
            </button>
            <button
              type="button"
              id="view-analytics-btn"
              className="button button--secondary"
              onClick={onViewAnalytics}
              aria-label="View your link analytics"
            >
              View Analytics →
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
