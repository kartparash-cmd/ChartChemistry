import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const SIGN_GLYPHS: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

const VALID_SIGNS = new Set(Object.keys(SIGN_GLYPHS));
const VALID_ELEMENTS = new Set(["Fire", "Earth", "Air", "Water"]);

const ELEMENT_COLORS: Record<string, { primary: string; glow: string; bg: string }> = {
  Fire:  { primary: "#F97316", glow: "rgba(249, 115, 22, 0.25)", bg: "rgba(249, 115, 22, 0.08)" },
  Earth: { primary: "#10B981", glow: "rgba(16, 185, 129, 0.25)", bg: "rgba(16, 185, 129, 0.08)" },
  Air:   { primary: "#38BDF8", glow: "rgba(56, 189, 248, 0.25)", bg: "rgba(56, 189, 248, 0.08)" },
  Water: { primary: "#3B82F6", glow: "rgba(59, 130, 246, 0.25)", bg: "rgba(59, 130, 246, 0.08)" },
};

const ELEMENT_EMOJI: Record<string, string> = {
  Fire: "\uD83D\uDD25",
  Earth: "\uD83C\uDF0D",
  Air: "\uD83D\uDCA8",
  Water: "\uD83C\uDF0A",
};

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name") || "Cosmic Soul";
  const sun = searchParams.get("sun") || "";
  const moon = searchParams.get("moon") || "";
  const rising = searchParams.get("rising") || "";
  const format = searchParams.get("format"); // "square" for 1080x1080
  const elementParam = searchParams.get("element");

  // Validate signs
  if (!VALID_SIGNS.has(sun)) {
    return new Response("Invalid or missing sun sign", { status: 400 });
  }

  const element = elementParam && VALID_ELEMENTS.has(elementParam)
    ? elementParam
    : SIGN_ELEMENTS[sun] || "Fire";

  const colors = ELEMENT_COLORS[element];
  const isSquare = format === "square";
  const width = isSquare ? 1080 : 1200;
  const height = isSquare ? 1080 : 630;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(145deg, #020617 0%, #0c1222 30%, #111827 60%, #0F172A 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow circles */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-60px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
          }}
        />

        {/* Subtle star dots */}
        {[
          { top: "8%", left: "12%", size: 3, opacity: 0.4 },
          { top: "15%", right: "20%", size: 2, opacity: 0.3 },
          { top: "35%", left: "8%", size: 2, opacity: 0.25 },
          { top: "72%", right: "15%", size: 3, opacity: 0.35 },
          { top: "85%", left: "25%", size: 2, opacity: 0.3 },
          { top: "22%", right: "8%", size: 2, opacity: 0.2 },
          { top: "60%", left: "5%", size: 3, opacity: 0.3 },
          { top: "45%", right: "6%", size: 2, opacity: 0.25 },
        ].map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: star.top,
              left: "left" in star ? star.left : undefined,
              right: "right" in star ? star.right : undefined,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: "50%",
              background: "white",
              opacity: star.opacity,
            }}
          />
        ))}

        {/* Main card container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: isSquare ? "60px 48px" : "40px 48px",
            maxWidth: isSquare ? "900px" : "1000px",
          }}
        >
          {/* Name */}
          <div
            style={{
              fontSize: isSquare ? "28px" : "22px",
              color: "#94A3B8",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: isSquare ? "16px" : "10px",
            }}
          >
            {name.length > 24 ? name.slice(0, 24) + "..." : name}
          </div>

          {/* "My Cosmic Card" title */}
          <div
            style={{
              fontSize: isSquare ? "22px" : "16px",
              color: "#7C3AED",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: isSquare ? "40px" : "24px",
            }}
          >
            MY COSMIC CARD
          </div>

          {/* Big Three Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isSquare ? "48px" : "40px",
              marginBottom: isSquare ? "40px" : "24px",
            }}
          >
            {/* Sun */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  fontSize: isSquare ? "14px" : "12px",
                  color: "#F59E0B",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                SUN
              </div>
              <div style={{ fontSize: isSquare ? "72px" : "56px", lineHeight: 1 }}>
                {SIGN_GLYPHS[sun] || ""}
              </div>
              <div
                style={{
                  fontSize: isSquare ? "24px" : "20px",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                {sun}
              </div>
            </div>

            {/* Moon */}
            {moon && VALID_SIGNS.has(moon) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: isSquare ? "14px" : "12px",
                    color: "#A78BFA",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  MOON
                </div>
                <div style={{ fontSize: isSquare ? "72px" : "56px", lineHeight: 1 }}>
                  {SIGN_GLYPHS[moon] || ""}
                </div>
                <div
                  style={{
                    fontSize: isSquare ? "24px" : "20px",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  {moon}
                </div>
              </div>
            )}

            {/* Rising */}
            {rising && VALID_SIGNS.has(rising) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: isSquare ? "14px" : "12px",
                    color: "#FCD34D",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  RISING
                </div>
                <div style={{ fontSize: isSquare ? "72px" : "56px", lineHeight: 1 }}>
                  {SIGN_GLYPHS[rising] || ""}
                </div>
                <div
                  style={{
                    fontSize: isSquare ? "24px" : "20px",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  {rising}
                </div>
              </div>
            )}
          </div>

          {/* Element Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: colors.bg,
              border: `1px solid ${colors.primary}33`,
              borderRadius: "24px",
              padding: isSquare ? "10px 28px" : "8px 24px",
              marginBottom: isSquare ? "40px" : "24px",
            }}
          >
            <span style={{ fontSize: isSquare ? "20px" : "16px" }}>
              {ELEMENT_EMOJI[element]}
            </span>
            <span
              style={{
                fontSize: isSquare ? "18px" : "14px",
                color: colors.primary,
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              {element.toUpperCase()} DOMINANT
            </span>
          </div>

          {/* CTA */}
          <div
            style={{
              fontSize: isSquare ? "20px" : "16px",
              color: "#CBD5E1",
              fontWeight: 500,
              marginBottom: "4px",
            }}
          >
            Check your compatibility with me
          </div>
        </div>

        {/* Branding footer */}
        <div
          style={{
            position: "absolute",
            bottom: isSquare ? "36px" : "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: isSquare ? "20px" : "16px",
              fontWeight: 700,
              color: "#7C3AED",
            }}
          >
            ChartChemistry.com
          </span>
        </div>
      </div>
    ),
    { width, height }
  );
}
