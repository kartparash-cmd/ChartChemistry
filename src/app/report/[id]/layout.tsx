import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

/**
 * Extract the Sun sign from a BirthProfile's chartData JSON.
 */
function getSunSign(chartData: unknown): string | null {
  if (!chartData || typeof chartData !== "object") return null;
  const data = chartData as {
    planets?: Array<{ planet: string; sign: string }>;
  };
  if (!Array.isArray(data.planets)) return null;
  const sun = data.planets.find(
    (p) => p.planet?.toLowerCase() === "sun"
  );
  return sun?.sign ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  // Default/fallback metadata
  const fallback: Metadata = {
    title: "Compatibility Report | ChartChemistry",
    description:
      "View your detailed astrological compatibility report with scores, insights, and relationship guidance.",
  };

  try {
    const report = await prisma.compatibilityReport.findUnique({
      where: { id },
      select: {
        overallScore: true,
        person1: { select: { name: true, chartData: true } },
        person2: { select: { name: true, chartData: true } },
      },
    });

    if (!report) return fallback;

    const p1Name = report.person1.name;
    const p2Name = report.person2.name;
    const score = report.overallScore;
    const p1Sun = getSunSign(report.person1.chartData);
    const p2Sun = getSunSign(report.person2.chartData);

    const title = `${p1Name} & ${p2Name} Compatibility Report | ChartChemistry`;

    const signInfo =
      p1Sun && p2Sun ? ` ${p1Sun} + ${p2Sun} --` : " --";
    const description = `${score}% compatible${signInfo} powered by full birth chart analysis on ChartChemistry.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        images: [
          {
            url: `/report/${id}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: `${p1Name} & ${p2Name} - ${score}% Compatibility`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`/report/${id}/opengraph-image`],
      },
    };
  } catch (error) {
    console.error("[generateMetadata] Failed to fetch report:", error);
    return fallback;
  }
}

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
