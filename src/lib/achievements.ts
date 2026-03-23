/**
 * Achievement awarding logic (server-only).
 *
 * Definitions live in ./achievement-defs.ts so client components can
 * import them without pulling in Prisma.
 */

import { prisma } from "@/lib/prisma";

export { ACHIEVEMENTS } from "@/lib/achievement-defs";
export type { AchievementDef } from "@/lib/achievement-defs";

// ============================================================
// Core helper: award a single achievement (idempotent)
// ============================================================

/**
 * Award a single achievement to a user. No-ops if already earned.
 * Uses upsert to avoid unique-constraint errors in concurrent scenarios.
 *
 * @returns true if newly awarded, false if already existed
 */
export async function awardAchievement(
  userId: string,
  achievementType: string
): Promise<boolean> {
  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementType: { userId, achievementType } },
  });
  if (existing) return false;

  await prisma.userAchievement.create({
    data: { userId, achievementType },
  });
  return true;
}

// ============================================================
// Batch checker (original — checks all data-driven achievements)
// ============================================================

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

  // Streak achievements (3, 7, 14, 30, 60, 100)
  if (user.streakCount >= 3 && !alreadyEarned.has("STREAK_3")) {
    eligible.push("STREAK_3");
  }

  if (user.streakCount >= 7 && !alreadyEarned.has("STREAK_7")) {
    eligible.push("STREAK_7");
  }

  if (user.streakCount >= 14 && !alreadyEarned.has("STREAK_14")) {
    eligible.push("STREAK_14");
  }

  if (user.streakCount >= 30 && !alreadyEarned.has("STREAK_30")) {
    eligible.push("STREAK_30");
  }

  if (user.streakCount >= 60 && !alreadyEarned.has("STREAK_60")) {
    eligible.push("STREAK_60");
  }

  if (user.streakCount >= 100 && !alreadyEarned.has("STREAK_100")) {
    eligible.push("STREAK_100");
  }

  if (
    (user.plan === "PREMIUM" || user.plan === "ANNUAL") &&
    !alreadyEarned.has("PREMIUM_MEMBER")
  ) {
    eligible.push("PREMIUM_MEMBER");
  }

  // Profile count achievements
  if (profileCount >= 5 && !alreadyEarned.has("FIVE_PROFILES")) {
    eligible.push("FIVE_PROFILES");
  }

  // Report count achievements
  if (reportCount >= 5 && !alreadyEarned.has("FIVE_REPORTS")) {
    eligible.push("FIVE_REPORTS");
  }

  if (reportCount >= 10 && !alreadyEarned.has("TEN_REPORTS")) {
    eligible.push("TEN_REPORTS");
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

// ============================================================
// Targeted trigger functions (for use in specific API routes)
// ============================================================

/**
 * Check report count and award FIVE_REPORTS / TEN_REPORTS.
 */
export async function checkReportCountAchievements(
  userId: string
): Promise<string[]> {
  const [reportCount, existing] = await Promise.all([
    prisma.compatibilityReport.count({ where: { userId } }),
    prisma.userAchievement.findMany({
      where: { userId, achievementType: { in: ["FIVE_REPORTS", "TEN_REPORTS"] } },
      select: { achievementType: true },
    }),
  ]);

  const alreadyEarned = new Set(existing.map((a) => a.achievementType));
  const awarded: string[] = [];

  if (reportCount >= 5 && !alreadyEarned.has("FIVE_REPORTS")) {
    await awardAchievement(userId, "FIVE_REPORTS");
    awarded.push("FIVE_REPORTS");
  }

  if (reportCount >= 10 && !alreadyEarned.has("TEN_REPORTS")) {
    await awardAchievement(userId, "TEN_REPORTS");
    awarded.push("TEN_REPORTS");
  }

  return awarded;
}

/**
 * Check streak count and award STREAK_3 / 7 / 14 / 30 / 60 / 100.
 */
export async function checkStreakAchievements(
  userId: string,
  streakCount: number
): Promise<string[]> {
  const thresholds: [number, string][] = [
    [3, "STREAK_3"],
    [7, "STREAK_7"],
    [14, "STREAK_14"],
    [30, "STREAK_30"],
    [60, "STREAK_60"],
    [100, "STREAK_100"],
  ];

  // Only check achievement types that the streak qualifies for
  const candidateTypes = thresholds
    .filter(([threshold]) => streakCount >= threshold)
    .map(([, type]) => type);

  if (candidateTypes.length === 0) return [];

  const existing = await prisma.userAchievement.findMany({
    where: { userId, achievementType: { in: candidateTypes } },
    select: { achievementType: true },
  });

  const alreadyEarned = new Set(existing.map((a) => a.achievementType));
  const awarded: string[] = [];

  for (const type of candidateTypes) {
    if (!alreadyEarned.has(type)) {
      await awardAchievement(userId, type);
      awarded.push(type);
    }
  }

  return awarded;
}

/**
 * Check profile count and award FIVE_PROFILES.
 */
export async function checkProfileCountAchievements(
  userId: string
): Promise<string[]> {
  const profileCount = await prisma.birthProfile.count({ where: { userId } });
  const awarded: string[] = [];

  if (profileCount >= 5) {
    const wasNew = await awardAchievement(userId, "FIVE_PROFILES");
    if (wasNew) awarded.push("FIVE_PROFILES");
  }

  return awarded;
}

/**
 * Check referral count and award REFERRED_FRIEND / THREE_REFERRALS.
 */
export async function checkReferralAchievements(
  userId: string,
  referralCount: number
): Promise<string[]> {
  const awarded: string[] = [];

  if (referralCount >= 1) {
    const wasNew = await awardAchievement(userId, "REFERRED_FRIEND");
    if (wasNew) awarded.push("REFERRED_FRIEND");
  }

  if (referralCount >= 3) {
    const wasNew = await awardAchievement(userId, "THREE_REFERRALS");
    if (wasNew) awarded.push("THREE_REFERRALS");
  }

  return awarded;
}
