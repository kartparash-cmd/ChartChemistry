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

  // Fallback: generic ChartChemistry card
  if (!found) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #0f0a1a 0%, #1a1040 50%, #0f0a1a 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#FFFFFF",
              marginBottom: 16,
              display: "flex",
            }}
          >
            ChartChemistry
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#7c3aed",
              marginBottom: 32,
              display: "flex",
            }}
          >
            AI-Powered Astrological Compatibility
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#94A3B8",
              display: "flex",
            }}
          >
            Discover your cosmic connection
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // Determine score color
  const scoreColor =
    overallScore >= 70
      ? "#10B981"
      : overallScore >= 50
        ? "#d4a017"
        : "#EF4444";

  // Format person labels
  const person1Label = person1Sun
    ? `${person1Name} (${person1Sun})`
    : person1Name;
  const person2Label = person2Sun
    ? `${person2Name} (${person2Sun})`
    : person2Name;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f0a1a 0%, #1a1040 50%, #0f0a1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative top bar */}
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

        {/* Logo */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#7c3aed",
            marginBottom: 48,
            letterSpacing: -0.5,
            display: "flex",
          }}
        >
          ChartChemistry
        </div>

        {/* Person 1 and Person 2 with arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 40,
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
            {person1Label}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#d4a017",
              display: "flex",
            }}
          >
            &harr;
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#FFFFFF",
              display: "flex",
            }}
          >
            {person2Label}
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
            marginBottom: 40,
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

        {/* Tagline */}
        <div
          style={{
            fontSize: 20,
            color: "#94A3B8",
            display: "flex",
          }}
        >
          Discover your cosmic connection
        </div>

        {/* Decorative bottom bar */}
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
