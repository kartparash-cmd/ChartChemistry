/**
 * POST /api/relationship/insights
 *
 * Generates AI-powered relationship and dating insights for two birth profiles.
 * Requires authentication. Fetches both profiles from the database, retrieves
 * or calculates their natal charts, then uses Claude to produce structured
 * romantic compatibility insights.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNatalChart } from "@/lib/astro-client";
import { generateRelationshipInsights } from "@/lib/claude";
import type { NatalChart, NatalChartInput } from "@/types/astrology";
import { Prisma } from "@/generated/prisma/client";

// ============================================================
// Helper: build NatalChartInput from a BirthProfile record
// ============================================================

function profileToChartInput(profile: {
  birthDate: Date;
  birthTime: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
}): NatalChartInput {
  return {
    birthDate: profile.birthDate.toISOString().split("T")[0],
    birthTime: profile.birthTime ?? undefined,
    latitude: profile.latitude,
    longitude: profile.longitude,
    timezone: profile.timezone,
  };
}

// ============================================================
// Route handler
// ============================================================

export async function POST(request: Request) {
  try {
    // --- 1. Verify authentication ---
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

    // --- 2. Parse + validate body ---
    let body: { profileId1: string; profileId2: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body.profileId1 || typeof body.profileId1 !== "string") {
      return NextResponse.json(
        { error: "profileId1 is required" },
        { status: 400 }
      );
    }

    if (!body.profileId2 || typeof body.profileId2 !== "string") {
      return NextResponse.json(
        { error: "profileId2 is required" },
        { status: 400 }
      );
    }

    if (body.profileId1 === body.profileId2) {
      return NextResponse.json(
        { error: "Please select two different profiles" },
        { status: 400 }
      );
    }

    // --- 3. Fetch birth profiles from DB ---
    const [profile1, profile2] = await Promise.all([
      prisma.birthProfile.findUnique({ where: { id: body.profileId1 } }),
      prisma.birthProfile.findUnique({ where: { id: body.profileId2 } }),
    ]);

    if (!profile1) {
      return NextResponse.json(
        { error: "Birth profile not found" },
        { status: 404 }
      );
    }

    if (!profile2) {
      return NextResponse.json(
        { error: "Birth profile not found" },
        { status: 404 }
      );
    }

    // Verify ownership — both profiles must belong to this user
    if (profile1.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not own this birth profile (person1)" },
        { status: 403 }
      );
    }

    if (profile2.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not own this birth profile (person2)" },
        { status: 403 }
      );
    }

    // --- 4. Get or calculate natal charts ---
    const input1 = profileToChartInput(profile1);
    const input2 = profileToChartInput(profile2);

    let chart1: NatalChart;
    let chart2: NatalChart;

    // Use cached chart data if available
    if (profile1.chartData) {
      chart1 = profile1.chartData as unknown as NatalChart;
    } else {
      chart1 = await calculateNatalChart(input1);
      // Cache the chart data on the profile
      await prisma.birthProfile.update({
        where: { id: profile1.id },
        data: {
          chartData: JSON.parse(
            JSON.stringify(chart1)
          ) as Prisma.InputJsonValue,
        },
      });
    }

    if (profile2.chartData) {
      chart2 = profile2.chartData as unknown as NatalChart;
    } else {
      chart2 = await calculateNatalChart(input2);
      await prisma.birthProfile.update({
        where: { id: profile2.id },
        data: {
          chartData: JSON.parse(
            JSON.stringify(chart2)
          ) as Prisma.InputJsonValue,
        },
      });
    }

    // --- 5. Generate AI relationship insights ---
    const insights = await generateRelationshipInsights(
      chart1,
      chart2,
      profile1.name,
      profile2.name
    );

    // --- 6. Return response ---
    return NextResponse.json({
      person1: { name: profile1.name, id: profile1.id },
      person2: { name: profile2.name, id: profile2.id },
      ...insights,
    });
  } catch (error) {
    console.error("[POST /api/relationship/insights] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("Astro service")) {
      return NextResponse.json(
        {
          error: "Calculation service unavailable",
          message:
            "Our astrology calculation service is temporarily unavailable. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
