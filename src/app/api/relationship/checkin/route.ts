/**
 * POST /api/relationship/checkin — Save a monthly relationship check-in
 * GET  /api/relationship/checkin — Get check-in history (last 12 months)
 *
 * Premium-gated.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardAchievement } from "@/lib/achievements";

const VALID_MOODS = [
  "hopeful",
  "stressed",
  "connected",
  "distant",
  "growing",
  "uncertain",
] as const;

type ValidMood = (typeof VALID_MOODS)[number];

// ============================================================
// POST — Save a check-in
// ============================================================

export async function POST(request: Request) {
  try {
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
        { error: "Premium plan required for relationship check-ins" },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    const { connectionScore, conflictNote, positiveNote, growthGoal, overallMood } = body;

    // Validate connectionScore
    if (
      typeof connectionScore !== "number" ||
      !Number.isInteger(connectionScore) ||
      connectionScore < 1 ||
      connectionScore > 5
    ) {
      return NextResponse.json(
        { error: "connectionScore must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate overallMood
    if (!overallMood || !VALID_MOODS.includes(overallMood as ValidMood)) {
      return NextResponse.json(
        {
          error: `overallMood must be one of: ${VALID_MOODS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate optional text fields (if provided, must be strings)
    for (const [key, value] of Object.entries({
      conflictNote,
      positiveNote,
      growthGoal,
    })) {
      if (value !== undefined && value !== null && typeof value !== "string") {
        return NextResponse.json(
          { error: `${key} must be a string` },
          { status: 400 }
        );
      }
    }

    const checkIn = await prisma.relationshipCheckIn.create({
      data: {
        userId: session.user.id,
        connectionScore,
        conflictNote: conflictNote || null,
        positiveNote: positiveNote || null,
        growthGoal: growthGoal || null,
        overallMood,
      },
    });

    // Fire-and-forget: award FIRST_CHECKIN achievement
    awardAchievement(session.user.id, "FIRST_CHECKIN").catch((err) =>
      console.warn("[POST /api/relationship/checkin] Achievement award failed:", err)
    );

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error("[POST /api/relationship/checkin] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================
// GET — Get check-in history with trend
// ============================================================

export async function GET() {
  try {
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
        { error: "Premium plan required for relationship check-ins" },
        { status: 403 }
      );
    }

    const checkIns = await prisma.relationshipCheckIn.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    // Calculate month-over-month connectionScore trend
    let trend: number | null = null;
    if (checkIns.length >= 2) {
      trend = checkIns[0].connectionScore - checkIns[1].connectionScore;
    }

    return NextResponse.json({
      checkIns,
      trend,
      count: checkIns.length,
    });
  } catch (error) {
    console.error("[GET /api/relationship/checkin] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
