/**
 * GET /api/transits/personal
 *
 * Returns current planetary transits affecting the authenticated user's natal chart.
 * Used for the dashboard transit timeline widget.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { calculateTransits } from "@/lib/astro-client";
import type { NatalChartInput } from "@/types/astrology";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const isPremium = session.user.plan === "PREMIUM" || session.user.plan === "ANNUAL";
    if (!isPremium) {
      return NextResponse.json(
        { error: "Premium plan required" },
        { status: 403 }
      );
    }

    // Find user's profile with chart data
    const profile = await prisma.birthProfile.findFirst({
      where: {
        userId: session.user.id,
        chartData: { not: Prisma.JsonNull },
      },
      orderBy: [{ isOwner: "desc" }, { createdAt: "asc" }],
    });

    if (!profile) {
      return NextResponse.json(
        { error: "No birth profile found", transits: [] },
        { status: 404 }
      );
    }

    const chartInput: NatalChartInput = {
      birthDate: profile.birthDate.toISOString().split("T")[0],
      birthTime: profile.birthTime || undefined,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
    };

    const today = new Date().toISOString().split("T")[0];

    try {
      const transitData = await calculateTransits(chartInput, today);

      // Categorize transits by significance
      const categorized = transitData.aspectsToNatal.map((t) => {
        const majorPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars"];
        const outerPlanets = ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
        const isTransitOuter = outerPlanets.includes(t.transitingPlanet);
        const isNatalPersonal = majorPlanets.includes(t.natalPlanet);

        let significance: "high" | "medium" | "low" = "low";
        if (isTransitOuter && isNatalPersonal) significance = "high";
        else if (isTransitOuter || isNatalPersonal) significance = "medium";

        return {
          ...t,
          significance,
        };
      });

      // Sort by significance
      const order = { high: 0, medium: 1, low: 2 };
      categorized.sort((a, b) => order[a.significance] - order[b.significance]);

      return NextResponse.json({
        date: today,
        profileName: profile.name,
        transits: categorized,
        transitCount: categorized.length,
        highSignificance: categorized.filter((t) => t.significance === "high").length,
      });
    } catch (error) {
      console.warn("[GET /api/transits/personal] Transit calculation failed:", error);
      return NextResponse.json({
        date: today,
        profileName: profile.name,
        transits: [],
        transitCount: 0,
        highSignificance: 0,
        error: "Transit service temporarily unavailable",
      }, { status: 503 });
    }
  } catch (error) {
    console.error("[GET /api/transits/personal] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
