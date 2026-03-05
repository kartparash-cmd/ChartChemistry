/**
 * Achievement awarding logic (server-only).
 *
 * Definitions live in ./achievement-defs.ts so client components can
 * import them without pulling in Prisma.
 */

import { prisma } from "@/lib/prisma";

export { ACHIEVEMENTS } from "@/lib/achievement-defs";
export type { AchievementDef } from "@/lib/achievement-defs";

/**
 * Check the user's data and award any achievements they have earned but
 * do not yet have recorded in the database.
 *
 * @returns Array of newly awarded achievement type keys (e.g. ["STREAK_7"])
 */
export async function checkAndAwardAchievements(
  userId: string
): Promise<string[]> {
  // Gather the user's current data in a single set of queries
  const [user, profileCount, reportCount, existingAchievements] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { streakCount: true, plan: true },
      }),
      prisma.birthProfile.count({ where: { userId } }),
      prisma.compatibilityReport.count({ where: { userId } }),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementType: true },
      }),
    ]);

  if (!user) return [];

  const alreadyEarned = new Set(existingAchievements.map((a) => a.achievementType));

  // Determine which achievements should be awarded
  const eligible: string[] = [];

  if (profileCount >= 1 && !alreadyEarned.has("FIRST_CHART")) {
    eligible.push("FIRST_CHART");
  }

  if (reportCount >= 1 && !alreadyEarned.has("FIRST_COMPATIBILITY")) {
    eligible.push("FIRST_COMPATIBILITY");
  }

  if (user.streakCount >= 7 && !alreadyEarned.has("STREAK_7")) {
    eligible.push("STREAK_7");
  }

  if (user.streakCount >= 30 && !alreadyEarned.has("STREAK_30")) {
    eligible.push("STREAK_30");
  }

  if (
    (user.plan === "PREMIUM" || user.plan === "ANNUAL") &&
    !alreadyEarned.has("PREMIUM_MEMBER")
  ) {
    eligible.push("PREMIUM_MEMBER");
  }

  // Award all eligible achievements
  if (eligible.length > 0) {
    await Promise.all(
      eligible.map((achievementType) =>
        prisma.userAchievement.create({
          data: { userId, achievementType },
        })
      )
    );
  }

  return eligible;
}
