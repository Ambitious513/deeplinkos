"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePublicAuth } from "@/components/auth/public-auth-shell";
import type { DetectedPlatform, LinkGeneratorAdapter } from "@/lib/types";

type HeroGeneratorPanelProps = {
  adapter?: LinkGeneratorAdapter;
};

const fallbackDetector = (url: string): DetectedPlatform => {
  const lower = url.toLowerCase();
  if (lower.includes("youtu")) return { name: "YouTube Smart Link", color: "#FF0000", hint: "Video route ready" };
  if (lower.includes("instagram")) return { name: "Instagram Smart Link", color: "#E1306C", hint: "Profile route ready" };
  if (lower.includes("tiktok")) return { name: "TikTok Smart Link", color: "#010101", hint: "Creator route ready" };
  if (lower.includes("whatsapp") || lower.includes("wa.me")) {
    return { name: "WhatsApp Smart Link", color: "#25D366", hint: "Chat route ready" };
  }
  if (lower.includes("maps.google") || lower.includes("goo.gl/maps")) {
    return { name: "Maps Smart Link", color: "#0F1C2E", hint: "Location route ready" };
  }
  return { name: "Universal Smart Link", color: "#3b82f6", hint: "Fallback route ready" };
};

export function HeroGeneratorPanel({ adapter }: HeroGeneratorPanelProps) {
  const { ensureGeneratorAccess } = usePublicAuth();
  const [url, setUrl] = useState("");
  const [hasError, setHasError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DEMO_LINK = "https://deeplinkos.com/r/campaign-preview";

  const detected = useMemo(() => {
    if (!url.trim()) return null;
    return adapter?.detectPlatform?.(url) ?? fallbackDetector(url);
  }, [adapter, url]);

  function handleCopy() {
    navigator.clipboard.writeText(DEMO_LINK).catch(() => {});
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
  }

  async function completeGeneration(destinationUrl: string) {
    if (adapter?.generate) {
      await adapter.generate(destinationUrl);
      return;
    }

    setSuccess(true);
  }

  useEffect(() => {
    async function handleAuthorized(event: Event) {
      const detail = (event as CustomEvent<{ url?: string }>).detail;
      if (!detail?.url || detail.url !== url) return;
      setHasError(false);
      await completeGeneration(detail.url);
    }

    window.addEventListener("deeplinkos:generator-authorized", handleAuthorized);
    return () => window.removeEventListener("deeplinkos:generator-authorized", handleAuthorized);
  }, [adapter, url]);

  async function handleGenerate() {
    const valid = isValidUrl(url);
    setHasError(!valid);
    setSuccess(false);
    if (!valid) return;

    const canGenerate = await ensureGeneratorAccess(url);
    if (!canGenerate) return;
    await completeGeneration(url);
  }

  function handleAdvanced() {
    if (!url || !isValidUrl(url)) {
      setHasError(true);
      return;
    }
    adapter?.openCompose?.(url);
  }

  return (
    <div className="hero-generator" aria-label="Generate a smart link">
      <div className={hasError ? "hero-url-row has-error" : "hero-url-row"}>
        <input
          type="url"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setHasError(false);
            setSuccess(false);
          }}
          placeholder="Paste any URL: YouTube, Instagram, WhatsApp, TikTok..."
          aria-label="Destination URL"
        />
        <button className="hero-gen-btn" type="button" onClick={handleGenerate}>
          Generate
        </button>
      </div>
      {hasError ? <div className="hero-error-msg">Please enter a valid URL.</div> : null}
      <div className="hero-hint">
        <span className="hero-hint-icon">!</span>
        Platform detected - App-opening routes configured instantly
      </div>

      {detected && !success ? (
        <div className="hero-expanded">
          <div className="h-detected-row">
            <span className="h-det-icon" style={{ background: detected.color }}>
              Go
            </span>
            <div>
              <div className="h-det-name">{detected.name}</div>
              <div className="h-det-hint">{detected.hint}</div>
            </div>
          </div>
          <button className="locked-card" type="button" onClick={handleAdvanced}>
            <span className="locked-card-icon">*</span>
            <span className="locked-card-copy">
              <span className="locked-card-title">Fallbacks, UTMs and link preview</span>
              <span className="locked-card-sub">Open the compose flow to configure advanced routing.</span>
            </span>
            <span className="locked-card-cta">Configure</span>
          </button>
        </div>
      ) : null}

      {success ? (
        <div className="hero-success">
          <div className="success-icon">✓</div>
          <strong>Your smart link is ready</strong>
          <p>Paste this link in your bio, campaign, or QR code. It routes each device to the right destination automatically.</p>
          <div className="short-link-row">
            <div className="short-link-pill">{DEMO_LINK}</div>
            <button
              className={`copy-btn${copied ? " copy-btn--copied" : ""}`}
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Copied!" : "Copy link"}
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <button className="success-reset" type="button" onClick={() => { setSuccess(false); setCopied(false); }}>
            Create another
          </button>
        </div>
      ) : null}
    </div>
  );
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
