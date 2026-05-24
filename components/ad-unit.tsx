"use client";

import { useEffect } from "react";

type AdFormat = "leaderboard" | "rectangle" | "half-page" | "responsive";

interface AdUnitProps {
  slot?: string;
  format?: AdFormat;
  className?: string;
}

const AD_META: Record<AdFormat, { label: string; w?: number; h?: number }> = {
  leaderboard: { label: "728×90",  w: 728, h: 90  },
  rectangle:   { label: "300×250", w: 300, h: 250 },
  "half-page": { label: "300×600", w: 300, h: 600 },
  responsive:  { label: "Responsive" },
};

export function AdUnit({ slot, format = "responsive", className = "" }: AdUnitProps) {
  const isDev = process.env.NODE_ENV === "development";
  const meta  = AD_META[format];

  /* In production push the ad unit after mount */
  useEffect(() => {
    if (!isDev && typeof window !== "undefined") {
      try {
        // @ts-expect-error — adsbygoogle injected by external script
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* noop */
      }
    }
  }, [isDev]);

  /* ── Development placeholder ── */
  if (isDev) {
    return (
      <div
        className={`ad-unit ad-unit--${format} ad-unit--placeholder ${className}`}
        style={
          meta.w && meta.h
            ? { width: "100%", maxWidth: meta.w, height: meta.h }
            : { width: "100%", height: 90 }
        }
        role="presentation"
        aria-hidden="true"
      >
        <span>Ad Unit ({meta.label})</span>
      </div>
    );
  }

  /* ── Production AdSense unit ── */
  return (
    <div className={`ad-unit ad-unit--${format} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format === "responsive" ? "auto" : undefined}
        data-full-width-responsive={format === "responsive" ? "true" : undefined}
      />
    </div>
  );
}
