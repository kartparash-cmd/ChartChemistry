import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "ChartChemistry Compatibility Report";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Extract the Sun sign from a BirthProfile's chartData JSON.
 * chartData stores a NatalChart object with a `planets` array of PlanetPosition.
 * Each PlanetPosition has { planet, sign, ... }.
 */
function getSunSign(chartData: unknown): string | null {
  if (!chartData || typeof chartData !== "object") return null;
  const data = chartData as { planets?: Array<{ planet: string; sign: string }> };
  if (!Array.isArray(data.planets)) return null;
  const sun = data.planets.find(
    (p) => p.planet?.toLowerCase() === "sun"
  );
  return sun?.sign ?? null;
}

/** Map zodiac sign names to their Unicode symbols. */
function getSignSymbol(sign: string): string {
  const symbols: Record<string, string> = {
    aries: "\u2648",
    taurus: "\u2649",
    gemini: "\u264A",
    cancer: "\u264B",
    leo: "\u264C",
    virgo: "\u264D",
    libra: "\u264E",
    scorpio: "\u264F",
    sagittarius: "\u2650",
    capricorn: "\u2651",
    aquarius: "\u2652",
    pisces: "\u2653",
  };
  return symbols[sign.toLowerCase()] ?? "";
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let person1Name = "";
  let person2Name = "";
  let person1Sun = "";
  let person2Sun = "";
  let overallScore = 0;
  let found = false;

  try {
    const report = await prisma.compatibilityReport.findUnique({
      where: { id },
      select: {
        overallScore: true,
        person1: {
          select: {
            name: true,
            chartData: true,
          },
        },
        person2: {
          select: {
            name: true,
            chartData: true,
          },
        },
      },
    });

    if (report) {
      found = true;
      person1Name = report.person1.name;
      person2Name = report.person2.name;
      overallScore = report.overallScore;
      person1Sun = getSunSign(report.person1.chartData) ?? "";
      person2Sun = getSunSign(report.person2.chartData) ?? "";
    }
  } catch (error) {
    console.error("[opengraph-image] Failed to fetch report:", error);
  }

  // ----- Fallback: generic ChartChemistry card -----
  if (!found) {
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
            <div style={{ fontSize: 64 }}>&#x2728;</div>
            <div
              style={{
                fontSize: 48,
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
              fontSize: 32,
              color: "#e2e8f0",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            Compatibility Report
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#94a3b8",
              maxWidth: 600,
              textAlign: "center",
            }}
          >
            Discover your cosmic connection through the stars
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // ----- Dynamic report card -----

  // Determine score color based on compatibility level
  const scoreColor =
    overallScore >= 70
      ? "#10B981"
      : overallScore >= 50
        ? "#FBBF24"
        : "#EF4444";

  // Build person labels with zodiac symbol
  const person1Symbol = person1Sun ? getSignSymbol(person1Sun) : "";
  const person2Symbol = person2Sun ? getSignSymbol(person2Sun) : "";

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
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative gradient top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #7c3aed, #d4a017, #7c3aed)",
            display: "flex",
          }}
        />

        {/* Subtle radial glow behind score */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -40%)",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${scoreColor}15 0%, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 44,
          }}
        >
          <div style={{ fontSize: 40 }}>&#x2728;</div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              background: "linear-gradient(90deg, #a78bfa, #c084fc, #e9d5ff)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: -0.5,
            }}
          >
            ChartChemistry
          </div>
        </div>

        {/* Person 1 and Person 2 names with sun signs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 36,
          }}
        >
          {/* Person 1 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "#FFFFFF",
                display: "flex",
              }}
            >
              {person1Name}
            </div>
            {person1Sun && (
              <div
                style={{
                  fontSize: 18,
                  color: "#a78bfa",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {person1Symbol} {person1Sun}
              </div>
            )}
          </div>

          {/* Heart / connector */}
          <div
            style={{
              fontSize: 32,
              color: "#d4a017",
              display: "flex",
              marginTop: -4,
            }}
          >
            &#x2764;
          </div>

          {/* Person 2 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "#FFFFFF",
                display: "flex",
              }}
            >
              {person2Name}
            </div>
            {person2Sun && (
              <div
                style={{
                  fontSize: 18,
                  color: "#a78bfa",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {person2Symbol} {person2Sun}
              </div>
            )}
          </div>
        </div>

        {/* Score circle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: `4px solid ${scoreColor}`,
            marginBottom: 36,
            background: "rgba(255, 255, 255, 0.03)",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: scoreColor,
              lineHeight: 1,
              display: "flex",
            }}
          >
            {overallScore}%
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginTop: 4,
              display: "flex",
            }}
          >
            Compatible
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: 20,
            color: "#c084fc",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          See full report &#x2192;
        </div>

        {/* Decorative gradient bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #7c3aed, #d4a017, #7c3aed)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
