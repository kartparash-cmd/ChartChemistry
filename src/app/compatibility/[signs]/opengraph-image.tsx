import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Zodiac Compatibility — ChartChemistry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SIGN_EMOJIS: Record<string, string> = {
  aries: "\u2648", taurus: "\u2649", gemini: "\u264A", cancer: "\u264B",
  leo: "\u264C", virgo: "\u264D", libra: "\u264E", scorpio: "\u264F",
  sagittarius: "\u2650", capricorn: "\u2651", aquarius: "\u2652", pisces: "\u2653",
};

const SIGN_ELEMENTS: Record<string, string> = {
  aries: "Fire", taurus: "Earth", gemini: "Air", cancer: "Water",
  leo: "Fire", virgo: "Earth", libra: "Air", scorpio: "Water",
  sagittarius: "Fire", capricorn: "Earth", aquarius: "Air", pisces: "Water",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getElementColor(el: string): string {
  switch (el) {
    case "Fire": return "#EF4444";
    case "Earth": return "#22C55E";
    case "Air": return "#60A5FA";
    case "Water": return "#8B5CF6";
    default: return "#A78BFA";
  }
}

export default async function Image({ params }: { params: { signs: string } }) {
  const parts = params.signs.toLowerCase().split("-");
  const sign1 = parts[0] || "aries";
  const sign2 = parts[1] || "taurus";
  const el1 = SIGN_ELEMENTS[sign1] || "Fire";
  const el2 = SIGN_ELEMENTS[sign2] || "Earth";

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
        {/* Signs */}
        <div style={{ display: "flex", alignItems: "center", gap: "48px", marginBottom: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "96px" }}>{SIGN_EMOJIS[sign1] || ""}</span>
            <span style={{ fontSize: "24px", fontWeight: 700, color: "#e2e8f0", marginTop: "8px" }}>
              {capitalize(sign1)}
            </span>
            <span style={{ fontSize: "14px", color: getElementColor(el1), fontWeight: 600, marginTop: "4px" }}>
              {el1} Sign
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "48px", color: "#A78BFA" }}>+</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "96px" }}>{SIGN_EMOJIS[sign2] || ""}</span>
            <span style={{ fontSize: "24px", fontWeight: 700, color: "#e2e8f0", marginTop: "8px" }}>
              {capitalize(sign2)}
            </span>
            <span style={{ fontSize: "14px", color: getElementColor(el2), fontWeight: 600, marginTop: "4px" }}>
              {el2} Sign
            </span>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: "36px", fontWeight: 800, color: "white", marginBottom: "12px", textAlign: "center" }}>
          {capitalize(sign1)} & {capitalize(sign2)} Compatibility
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: "20px", color: "#94a3b8", textAlign: "center", maxWidth: "600px" }}>
          AI-powered synastry analysis — beyond sun signs
        </div>

        {/* Footer */}
        <div style={{ position: "absolute", bottom: "28px", fontSize: "18px", color: "#7C3AED" }}>
          chartchemistry.com
        </div>
      </div>
    ),
    { ...size }
  );
}
