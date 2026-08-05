"use client";

import { useState } from "react";
import { PageFrame } from "@/components/dashboard/page-frame";
import { DownloadIcon } from "@/components/dashboard/icons";

const FG_PRESETS = [
  { label: "Charcoal", value: "#11131a" },
  { label: "Orange", value: "#ef7a22" },
  { label: "Navy", value: "#1a2744" },
  { label: "Forest", value: "#1d5c3a" },
];

/* ── QR block art (SVG grid placeholder) ────────────────────── */
function QrPreviewSvg({ fg, bg, size }: { fg: string; bg: string; size: number }) {
  // A static 9x9 QR-like pattern — purely decorative placeholder
  const PATTERN = [
    [1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0],
    [1,0,1,1,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,0],
    [1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0],
    [1,1,1,1,1,1,1,0,1],
    [0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,0,1],
  ];
  const cell = size / 11;
  const pad = cell;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="QR code preview"
      style={{ display: "block", borderRadius: 8 }}
    >
      <rect width={size} height={size} fill={bg} />
      {PATTERN.map((row, ri) =>
        row.map((cell_, ci) =>
          cell_ ? (
            <rect
              key={`${ri}-${ci}`}
              x={pad + ci * cell}
              y={pad + ri * cell}
              width={cell - 1}
              height={cell - 1}
              rx={2}
              fill={fg}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function DownloadButton({ fg, bg, size }: { fg: string; bg: string; size: number }) {
  function handleDownload() {
    // In production: render to canvas and export. Here we export the SVG.
    const svgEl = document.querySelector("[aria-label='QR code preview']");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-code-${size}px.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={handleDownload}
      id="qr-download"
      data-testid="qr-download"
      aria-label="Download QR code as PNG"
    >
      <DownloadIcon />
      Download PNG
    </button>
  );
}

export default function QrPage() {
  const [fg, setFg] = useState(FG_PRESETS[0].value);
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState(256);
  const [selectedLink, setSelectedLink] = useState("");

  return (
    <PageFrame
      eyebrow="Dashboard"
      title="QR Designer"
      description="Generate a branded QR code for any smart link. Choose colors, size, and export."
    >
      <div className="qr-layout">
        {/* Preview panel */}
        <div className="qr-preview-frame panel">
          <div className="qr-svg-block" style={{ width: Math.min(size, 240), height: Math.min(size, 240) }}>
            <QrPreviewSvg fg={fg} bg={bg} size={Math.min(size, 240)} />
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.92rem" }}>
              {selectedLink ? selectedLink : "No link selected"}
            </p>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-soft)" }}>
              {size}×{size}px · {fg} on {bg}
            </p>
          </div>

          {/* Single Download PNG action — only here, not in topbar */}
          <DownloadButton fg={fg} bg={bg} size={size} />
        </div>

        {/* Controls panel */}
        <div className="qr-controls panel">
          <div className="form-field">
            <label className="form-label" htmlFor="qr-link-select">Smart link</label>
            <select
              id="qr-link-select"
              className="form-input"
              value={selectedLink}
              onChange={(e) => setSelectedLink(e.target.value)}
            >
              <option value="">— Select a link —</option>
              <option value="go.dlos.io/amazon">go.dlos.io/amazon</option>
              <option value="go.dlos.io/summer">go.dlos.io/summer</option>
              <option value="go.dlos.io/affiliate">go.dlos.io/affiliate</option>
            </select>
            <p style={{ fontSize: "0.78rem", color: "var(--text-soft)", margin: "4px 0 0" }}>
              Your live smart links will appear here once connected.
            </p>
          </div>

          <div className="form-field">
            <span className="form-label">Foreground color</span>
            <div className="qr-color-swatches">
              {FG_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`qr-color-swatch${fg === preset.value ? " is-selected" : ""}`}
                  style={{ background: preset.value }}
                  onClick={() => setFg(preset.value)}
                  aria-label={`Set foreground to ${preset.label}`}
                  title={preset.label}
                />
              ))}
              <input
                type="color"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                title="Custom foreground color"
                aria-label="Custom foreground color"
                style={{ width: 34, height: 34, padding: 2, borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer" }}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="qr-bg-color">Background color</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id="qr-bg-color"
                type="color"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                style={{ width: 40, height: 40, padding: 2, borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer" }}
                aria-label="Background color picker"
              />
              <input
                className="form-input"
                style={{ flex: 1 }}
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                placeholder="#ffffff"
                maxLength={7}
                aria-label="Background hex color"
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="qr-size-slider">
              Size — {size}px
            </label>
            <input
              id="qr-size-slider"
              type="range"
              min={128}
              max={512}
              step={32}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="qr-size-slider"
              aria-label={`QR code size: ${size}px`}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "var(--text-soft)" }}>
              <span>128px</span><span>512px</span>
            </div>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: 14, background: "rgba(44,107,237,0.08)", border: "1px solid rgba(44,107,237,0.18)", fontSize: "0.82rem", color: "var(--blue)", lineHeight: 1.55 }}>
            <strong>Note:</strong> Downloading exports as SVG in this preview. PNG export requires a canvas-based library wired to your live data.
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
