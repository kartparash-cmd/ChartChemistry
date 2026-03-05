import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ChartChemistry - AI-Powered Astrology Compatibility";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: "#FFFFFF", marginBottom: 16, display: "flex" }}>
          ChartChemistry
        </div>
        <div style={{ fontSize: 32, color: "#A78BFA", marginBottom: 32, display: "flex" }}>
          AI-Powered Astrology Compatibility
        </div>
        <div style={{ fontSize: 20, color: "#94A3B8", display: "flex" }}>
          Go 10 layers deeper than sun signs
        </div>
      </div>
    ),
    { ...size }
  );
}
