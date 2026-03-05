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
import { checkAndAwardAchievements } from "@/lib/achievements";

/**
 * Normalise a Date to a YYYY-MM-DD string in the server's local timezone.
 * Using UTC-based date comparison so behaviour is consistent.
 */
function toDateString(date: Date): string {
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

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
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

    const todayStr = toDateString(new Date());
    const lastCheckinStr = user.lastCheckinDate
      ? toDateString(user.lastCheckinDate)
      : null;

    let newStreakCount: number;
    let isNewDay: boolean;

    if (lastCheckinStr === todayStr) {
      // Already checked in today — idempotent, no update needed
      newStreakCount = user.streakCount;
      isNewDay = false;
    } else {
      // Calculate yesterday's date string
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayStr = toDateString(yesterday);

      if (lastCheckinStr === yesterdayStr) {
        // Consecutive day — increment streak
        newStreakCount = user.streakCount + 1;
      } else {
        // Gap in visits (or first visit ever) — reset to 1
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
