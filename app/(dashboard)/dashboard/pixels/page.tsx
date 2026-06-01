"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";

const integrations = [
  {
    id: "ga4",
    name: "Google Analytics (GA4)",
    desc: "Fire events on every link redirect to track user journeys and conversions.",
    bg: "#ea4335",
    letter: "G",
  },
  {
    id: "meta",
    name: "Meta Pixel",
    desc: "Track Facebook and Instagram ad conversions through your deep links.",
    bg: "#1877F2",
    letter: "f",
  },
  {
    id: "tiktok",
    name: "TikTok Pixel",
    desc: "Measure TikTok campaign performance and retarget link visitors.",
    bg: "#010101",
    letter: "♪",
  },
  {
    id: "snapchat",
    name: "Snapchat Pixel",
    desc: "Connect Snapchat Ads to your deep link traffic for accurate attribution.",
    bg: "#FFFC00",
    letter: "👻",
  },
];

function ComingSoonBadge() {
  return (
    <span style={{
      background: "rgba(59,130,246,.1)", color: "var(--blue)",
      padding: "4px 12px", borderRadius: 999,
      fontSize: 12, fontWeight: 700, flexShrink: 0,
      letterSpacing: ".03em"
    }}>
      Coming Soon
    </span>
  );
}

export default function PixelsPage() {
  const [notify, setNotify] = useState(false);

  return (
    <>
      <DashboardHeader title="Tracking Pixels" />

      {/* Hero banner */}
      <div className="panel" style={{
        marginBottom: 28, textAlign: "center", padding: "40px 24px",
        background: "var(--bg-card)",
        backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,.08) 0%, transparent 70%)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📡</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-.03em", marginBottom: 8, color: "var(--text)" }}>
          Tracking Pixels — Coming Soon
        </h2>
        <p style={{ color: "var(--text-2)", maxWidth: 520, margin: "0 auto 24px", lineHeight: 1.7, fontSize: ".95rem" }}>
          Connect your favourite ad platforms to your deep links. Fire conversion events, build retargeting audiences, and measure exactly which clicks turn into customers.
        </p>

        {!notify ? (
          <button
            className="btn-primary"
            style={{ padding: "12px 28px", fontSize: ".95rem" }}
            onClick={() => setNotify(true)}
          >
            Notify Me When It&apos;s Ready
          </button>
        ) : (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 24px", background: "rgba(16,185,129,.1)",
            borderRadius: 999, color: "#10b981", fontWeight: 700, fontSize: ".9rem"
          }}>
            ✓ You&apos;re on the list!
          </div>
        )}
      </div>

      {/* Integrations grid */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Planned Integrations</div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {integrations.map((intg) => (
            <div key={intg.id} style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "18px 20px",
              border: "1px solid var(--border)", borderRadius: 14,
              background: "var(--bg)", transition: "border-color .2s",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: intg.bg, display: "flex", alignItems: "center",
                justifyContent: "center", fontWeight: 800, fontSize: 18, color: intg.id === "snapchat" ? "#000" : "#fff"
              }}>
                {intg.letter}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{intg.name}</div>
                <div style={{ fontSize: ".83rem", color: "var(--text-2)", lineHeight: 1.5 }}>{intg.desc}</div>
              </div>
              <ComingSoonBadge />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
