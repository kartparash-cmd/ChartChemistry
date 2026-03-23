/**
 * /api/streak
 *
 * Daily check-in streak endpoints (all require authentication):
 *   GET  — return the user's current streak
 *   POST — record a daily check-in, updating the streak in the DB
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAndAwardAchievements, checkStreakAchievements } from "@/lib/achievements";

/**
 * Get "today" as a YYYY-MM-DD string in the user's timezone.
 * Falls back to UTC if no timezone is provided.
 */
function getUserToday(timezone?: string): string {
  const now = new Date();
  if (timezone) {
    try {
      return now.toLocaleDateString("en-CA", { timeZone: timezone }); // "YYYY-MM-DD"
    } catch {
      // Invalid timezone — fall back to UTC
    }
  }
  return now.toISOString().split("T")[0];
}

/**
 * Format a stored Date as YYYY-MM-DD in the user's timezone (or UTC fallback).
 */
function toDateString(date: Date, timezone?: string): string {
  if (timezone) {
    try {
      return date.toLocaleDateString("en-CA", { timeZone: timezone });
    } catch {
      // Invalid timezone — fall back to UTC
    }
  }
  return date.toISOString().split("T")[0];
}

// ============================================================
// GET — return current streak
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

    const [user, achievements] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { streakCount: true, lastCheckinDate: true },
      }),
      prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        select: { achievementType: true, unlockedAt: true },
        orderBy: { unlockedAt: "desc" },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      streakCount: user.streakCount,
      lastCheckinDate: user.lastCheckinDate
        ? user.lastCheckinDate.toISOString()
        : null,
      achievements: achievements.map((a) => ({
        achievementType: a.achievementType,
        unlockedAt: a.unlockedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[GET /api/streak] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================
// POST — record a daily check-in
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

    // Parse optional timezone from request body
    let timezone: string | undefined;
    try {
      const body = await request.json();
      if (body?.timezone && typeof body.timezone === "string") {
        timezone = body.timezone;
      }
    } catch {
      // Empty body or invalid JSON — use UTC fallback
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { streakCount: true, lastCheckinDate: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const todayStr = getUserToday(timezone);
    const lastCheckinStr = user.lastCheckinDate
      ? toDateString(user.lastCheckinDate, timezone)
      : null;

    let newStreakCount: number;
    let isNewDay: boolean;
    let graceUsed = false;

    if (lastCheckinStr === todayStr) {
      // Already checked in today — idempotent, no update needed
      newStreakCount = user.streakCount;
      isNewDay = false;
    } else {
      // Calculate day gap using timezone-aware date arithmetic
      const todayDate = new Date(todayStr + "T12:00:00Z"); // noon to avoid DST edge cases
      const yesterday = new Date(todayDate);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const twoDaysAgo = new Date(todayDate);
      twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);
      const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0];

      if (lastCheckinStr === yesterdayStr) {
        // Consecutive day — increment streak
        newStreakCount = user.streakCount + 1;
      } else if (lastCheckinStr === twoDaysAgoStr) {
        // Missed exactly 1 day — grace period saves the streak
        // Continue streak without incrementing (no credit for missed day)
        newStreakCount = user.streakCount;
        graceUsed = true;
      } else {
        // Gap of 3+ days (or first visit ever) — reset to 1
        newStreakCount = 1;
      }

      isNewDay = true;

      // Persist the updated streak to the database
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          streakCount: newStreakCount,
          lastCheckinDate: new Date(todayStr + "T00:00:00.000Z"),
        },
      });
    }

    // Check and award achievements after streak update
    const newAchievements = await checkAndAwardAchievements(session.user.id);

    // Return all earned achievements for display
    const allAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      select: { achievementType: true, unlockedAt: true },
      orderBy: { unlockedAt: "desc" },
    });

    return NextResponse.json({
      streakCount: newStreakCount,
      lastCheckinDate: todayStr,
      isNewDay,
      graceUsed,
      newAchievements,
      achievements: allAchievements.map((a) => ({
        achievementType: a.achievementType,
        unlockedAt: a.unlockedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[POST /api/streak] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
