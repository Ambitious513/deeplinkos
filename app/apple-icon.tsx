import { ImageResponse } from "next/og";

export const size        = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180, height: 180, background: "transparent",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >
        <div
          style={{
            width: 180, height: 180, borderRadius: 40,
            background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(59,130,246,0.5)",
          }}
        >
        <svg
          viewBox="0 0 16 16"
          width="110" height="110"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 8a4 4 0 0 1 4-4h1M8 12H7a4 4 0 0 1 0-8" />
          <circle cx="12" cy="4" r="1.5" fill="white" stroke="none" />
          <circle cx="4"  cy="12" r="1.5" fill="white" stroke="none" />
        </svg>
        </div>
      </div>
    ),
    { ...size },
  );
}
