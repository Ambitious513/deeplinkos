import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DeepLinkOS — Smart deep links. Better results.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 96px",
          background: "linear-gradient(160deg, #081228 0%, #040b1a 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Blue radial glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.45) 0%, transparent 70%)",
          }}
        />

        {/* Blue arc right */}
        <div
          style={{
            position: "absolute",
            right: -100,
            top: "50%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            border: "1.5px solid rgba(37,99,235,0.3)",
            boxShadow: "0 0 80px rgba(37,99,235,0.18)",
            transform: "translateY(-50%)",
          }}
        />

        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {/* Icon badge */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(37,99,235,0.5)",
            }}
          >
            {/* Simplified routing-arrows symbol */}
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
              <path d="M11 18l-6-6 6-6" opacity="0.5" />
            </svg>
          </div>

          {/* Wordmark */}
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.03em",
            }}
          >
            DeepLink
            <span style={{ color: "#60a5fa" }}>OS</span>
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "#fff",
            marginBottom: 28,
            maxWidth: 820,
          }}
        >
          Smart deep links.{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #2563eb, #38bdf8)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Better results.
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.5)",
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: 680,
            marginBottom: 56,
          }}
        >
          Route every link intelligently — QR flows, deep links, and
          real-time click analytics for modern growth teams.
        </div>

        {/* Bottom domain badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 20px",
            borderRadius: 100,
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.3)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
            }}
          />
          <span style={{ color: "#60a5fa", fontSize: 18, fontWeight: 600 }}>
            deeplinkos.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
