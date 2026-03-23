import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ChartChemistry — AI-Powered Astrology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f0a1e 0%, #1a1035 40%, #2d1b69 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
            }}
          >
            ✨
          </div>
          <div
            style={{
              fontSize: "48px",
              fontWeight: 700,
              background: "linear-gradient(90deg, #a78bfa, #c084fc, #e9d5ff)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            ChartChemistry
          </div>
        </div>
        <div
          style={{
            fontSize: "32px",
            color: "#e2e8f0",
            marginBottom: "16px",
            fontWeight: 600,
          }}
        >
          AI-Powered Astrology
        </div>
        <div
          style={{
            fontSize: "20px",
            color: "#94a3b8",
            maxWidth: "600px",
            textAlign: "center",
          }}
        >
          Discover your cosmic connections through the stars
        </div>
      </div>
    ),
    { ...size }
  );
}
