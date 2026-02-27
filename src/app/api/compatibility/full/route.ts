/**
 * POST /api/compatibility/full
 *
 * Premium full compatibility report endpoint.
 * Requires authenticated user with PREMIUM or ANNUAL plan.
 *
 * Accepts birth profile IDs, fetches data from DB, calculates synastry
 * and composite charts, generates a comprehensive 7-section AI report,
 * and saves the result as a CompatibilityReport.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateNatalChart,
  calculateSynastry,
  calculateComposite,
} from "@/lib/astro-client";
import { generatePremiumReport } from "@/lib/claude";
import type {
  NatalChartInput,
  NatalChart,
  FullCompatibilityRequest,
} from "@/types/astrology";
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
    // --- 1. Verify auth + plan ---
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const isPremium =
      session.user.plan === "PREMIUM" || session.user.plan === "ANNUAL";

    if (!isPremium) {
      return NextResponse.json(
        {
          error: "Premium plan required",
          message:
            "Full compatibility reports are available to Premium and Annual subscribers.",
        },
        { status: 403 }
      );
    }

    // --- 2. Parse + validate body ---
    let body: FullCompatibilityRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body.person1Id || typeof body.person1Id !== "string") {
      return NextResponse.json(
        { error: "person1Id is required" },
        { status: 400 }
      );
    }

    if (!body.person2Id || typeof body.person2Id !== "string") {
      return NextResponse.json(
        { error: "person2Id is required" },
        { status: 400 }
      );
    }

    // --- 3. Fetch birth profiles from DB ---
    const [profile1, profile2] = await Promise.all([
      prisma.birthProfile.findUnique({ where: { id: body.person1Id } }),
      prisma.birthProfile.findUnique({ where: { id: body.person2Id } }),
    ]);

    if (!profile1) {
      return NextResponse.json(
        { error: `Birth profile not found: ${body.person1Id}` },
        { status: 404 }
      );
    }

    if (!profile2) {
      return NextResponse.json(
        { error: `Birth profile not found: ${body.person2Id}` },
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

    // --- 4. Check for existing report ---
    const existingReport = await prisma.compatibilityReport.findUnique({
      where: {
        person1Id_person2Id: {
          person1Id: body.person1Id,
          person2Id: body.person2Id,
        },
      },
    });

    if (existingReport && existingReport.tier === "PREMIUM") {
      // Return the existing report instead of regenerating
      return NextResponse.json({
        id: existingReport.id,
        scores: {
          overall: existingReport.overallScore,
          communication: existingReport.communicationScore,
          emotional: existingReport.emotionalScore,
          chemistry: existingReport.chemistryScore,
          stability: existingReport.stabilityScore,
          conflict: existingReport.conflictScore,
        },
        sections: JSON.parse(existingReport.fullNarrative),
        redFlags: existingReport.redFlags,
        growthAreas: existingReport.growthAreas,
        synastryData: existingReport.synastryData,
        compositeData: existingReport.compositeData,
        person1: { name: profile1.name, id: profile1.id },
        person2: { name: profile2.name, id: profile2.id },
        createdAt: existingReport.createdAt.toISOString(),
        cached: true,
      });
    }

    // --- 5. Get or calculate natal charts ---
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
        data: { chartData: JSON.parse(JSON.stringify(chart1)) as Prisma.InputJsonValue },
      });
    }

    if (profile2.chartData) {
      chart2 = profile2.chartData as unknown as NatalChart;
    } else {
      chart2 = await calculateNatalChart(input2);
      await prisma.birthProfile.update({
        where: { id: profile2.id },
        data: { chartData: JSON.parse(JSON.stringify(chart2)) as Prisma.InputJsonValue },
      });
    }

    // --- 6. Calculate synastry + composite in parallel ---
    const [synastryResult, compositeResult] = await Promise.all([
      calculateSynastry(input1, input2),
      calculateComposite(input1, input2),
    ]);

    // --- 7. Generate AI report ---
    const aiReport = await generatePremiumReport(
      synastryResult,
      profile1.name,
      profile2.name,
      chart1,
      chart2,
      compositeResult
    );

    // --- 8. Save to database ---
    const scores = synastryResult.scores;

    const report = await prisma.compatibilityReport.upsert({
      where: {
        person1Id_person2Id: {
          person1Id: body.person1Id,
          person2Id: body.person2Id,
        },
      },
      create: {
        userId: session.user.id,
        person1Id: body.person1Id,
        person2Id: body.person2Id,
        overallScore: Math.round(scores.overall),
        communicationScore: Math.round(scores.communication),
        emotionalScore: Math.round(scores.emotional),
        chemistryScore: Math.round(scores.chemistry),
        stabilityScore: Math.round(scores.stability),
        conflictScore: Math.round(scores.conflict),
        summaryNarrative: aiReport.sections.theBigPicture || "",
        fullNarrative: JSON.stringify(aiReport.sections),
        redFlags: aiReport.redFlags as Prisma.InputJsonValue,
        growthAreas: aiReport.growthAreas as Prisma.InputJsonValue,
        synastryData: JSON.parse(JSON.stringify(synastryResult)) as Prisma.InputJsonValue,
        compositeData: JSON.parse(JSON.stringify(compositeResult)) as Prisma.InputJsonValue,
        tier: "PREMIUM",
      },
      update: {
        overallScore: Math.round(scores.overall),
        communicationScore: Math.round(scores.communication),
        emotionalScore: Math.round(scores.emotional),
        chemistryScore: Math.round(scores.chemistry),
        stabilityScore: Math.round(scores.stability),
        conflictScore: Math.round(scores.conflict),
        summaryNarrative: aiReport.sections.theBigPicture || "",
        fullNarrative: JSON.stringify(aiReport.sections),
        redFlags: aiReport.redFlags as Prisma.InputJsonValue,
        growthAreas: aiReport.growthAreas as Prisma.InputJsonValue,
        synastryData: JSON.parse(JSON.stringify(synastryResult)) as Prisma.InputJsonValue,
        compositeData: JSON.parse(JSON.stringify(compositeResult)) as Prisma.InputJsonValue,
        tier: "PREMIUM",
      },
    });

    // --- 9. Return response ---
    return NextResponse.json({
      id: report.id,
      scores: {
        overall: report.overallScore,
        communication: report.communicationScore,
        emotional: report.emotionalScore,
        chemistry: report.chemistryScore,
        stability: report.stabilityScore,
        conflict: report.conflictScore,
      },
      sections: aiReport.sections,
      redFlags: aiReport.redFlags,
      growthAreas: aiReport.growthAreas,
      synastryData: synastryResult,
      compositeData: compositeResult,
      person1: { name: profile1.name, id: profile1.id },
      person2: { name: profile2.name, id: profile2.id },
      createdAt: report.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("[POST /api/compatibility/full] Error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    if (message.includes("Astro service")) {
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
      { error: "Internal server error", message },
      { status: 500 }
    );
  }
}
