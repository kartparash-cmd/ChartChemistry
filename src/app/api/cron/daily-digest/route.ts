/**
 * GET /api/cron/daily-digest
 *
 * Cron-triggered endpoint that sends a personalized daily horoscope
 * digest email to all eligible users (currently: premium/annual plan
 * holders who have at least one birth profile with chart data).
 *
 * Security: Requires a shared secret in the Authorization header so
 * that only Vercel Cron (or an equivalent scheduler) can invoke it.
 *
 * Environment variable: CRON_SECRET
 *
 * Only targets premium users who have opted in via `emailDigest: true`
 * on their User record.
 */

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { calculateTransits } from "@/lib/astro-client";
import { generateDailyHoroscope } from "@/lib/claude";
import {
  sendHoroscopeDigest,
  sendDayOneEmail,
  sendDayThreeEmail,
  sendWeeklyFreeDigest,
  sendBirthdayReminderEmail,
  sendSolarReturnEmail,
  getZodiacSign,
} from "@/lib/emails";
import type { NatalChart, NatalChartInput } from "@/types/astrology";

// Vercel Cron invokes via GET.
// See: https://vercel.com/docs/cron-jobs
export const dynamic = "force-dynamic";
export const maxDuration = 300; // allow up to 5 minutes for batch processing

export async function GET(request: Request) {
  // ---------------------------------------------------------------
  // 1. Authenticate the request
  // ---------------------------------------------------------------
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[daily-digest] CRON_SECRET is not configured");
    return NextResponse.json(
      { error: "Cron endpoint is not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---------------------------------------------------------------
  // 2. Determine today's date string
  // ---------------------------------------------------------------
  const today = new Date().toISOString().split("T")[0];

  // ---------------------------------------------------------------
  // 3. Fetch eligible users
  //    - Plan is PREMIUM or ANNUAL
  //    - Has at least one birth profile with chart data
  //
  //    Only users who opted in to email digests are included.
  // ---------------------------------------------------------------
  const users = await prisma.user.findMany({
    where: {
      plan: { in: ["PREMIUM", "ANNUAL"] },
      emailDigest: true,
      birthProfiles: {
        some: {
          chartData: { not: Prisma.JsonNull },
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      birthProfiles: {
        where: {
          chartData: { not: Prisma.JsonNull },
        },
        orderBy: [{ isOwner: "desc" as const }, { createdAt: "asc" as const }],
        take: 1,
        select: {
          name: true,
          birthDate: true,
          birthTime: true,
          latitude: true,
          longitude: true,
          timezone: true,
          chartData: true,
        },
      },
    },
  });

  console.log(
    `[daily-digest] Found ${users.length} eligible user(s) for ${today}`
  );

  // ---------------------------------------------------------------
  // 4. Process each user: generate horoscope, then send email
  // ---------------------------------------------------------------
  let sent = 0;
  let failed = 0;
  const errors: { userId: string; error: string }[] = [];

  const BATCH_SIZE = 5;
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (user) => {
        const profile = user.birthProfiles[0];
        if (!profile) {
          // Shouldn't happen given the query, but guard anyway.
          return;
        }

        const chartData = profile.chartData as unknown as NatalChart;

        // Build the input required by calculateTransits
        const chartInput: NatalChartInput = {
          birthDate: profile.birthDate.toISOString().split("T")[0],
          birthTime: profile.birthTime || undefined,
          latitude: profile.latitude,
          longitude: profile.longitude,
          timezone: profile.timezone,
        };

        // Calculate transits (fallback to empty if astro-service is down)
        let transitData;
        try {
          transitData = await calculateTransits(chartInput, today);
        } catch (transitError) {
          console.warn(
            `[daily-digest] Transit calculation failed for user ${user.id}, proceeding without transits:`,
            transitError
          );
          transitData = {
            aspectsToNatal: [] as { transitingPlanet: string; natalPlanet: string; aspect: string; orb: number; keywords: string }[],
            transitingPositions: [] as NatalChart["planets"],
            date: today,
          };
        }

        // Generate the horoscope via Claude
        const horoscope = await generateDailyHoroscope(
          chartData,
          transitData,
          profile.name,
          today
        );

        // Send the digest email
        const result = await sendHoroscopeDigest(
          user.email,
          user.name || profile.name,
          horoscope
        );

        if (!result.success) {
          throw new Error("Email send returned success: false (likely missing RESEND_API_KEY)");
        }
      })
    );

    // Tally results and log failures
    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        sent++;
      } else {
        failed++;
        const message = result.reason?.message || "Unknown";
        Sentry.captureException(result.reason);
        console.error(JSON.stringify({
          event: "digest_user_failed",
          userId: batch[idx].id,
          error: message,
          timestamp: new Date().toISOString(),
        }));
        errors.push({ userId: batch[idx].id, error: message });
      }
    });
  }

  // ---------------------------------------------------------------
  // 5. Free-user drip sequence
  //    - Day 1 after signup: "Your chart is ready!"
  //    - Day 3 after signup: "More than your Sun sign"
  //    - Weekly (same weekday as signup): Cosmic weather digest
  // ---------------------------------------------------------------
  let freeSent = 0;
  let freeFailed = 0;
  const freeErrors: { userId: string; error: string }[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Query free users who have opted in to digest or marketing emails
  const freeUsers = await prisma.user.findMany({
    where: {
      plan: "FREE",
      OR: [{ emailDigest: true }, { emailMarketing: true }],
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  console.log(
    `[daily-digest] Found ${freeUsers.length} free user(s) for drip sequence`
  );

  // Determine which email each free user should receive
  type DripTarget = {
    id: string;
    email: string;
    name: string | null;
    type: "day1" | "day3" | "weekly";
  };

  const dripTargets: DripTarget[] = [];

  for (const user of freeUsers) {
    const signupDate = new Date(
      user.createdAt.getFullYear(),
      user.createdAt.getMonth(),
      user.createdAt.getDate()
    );

    const daysSinceSignup = Math.round(
      (todayStart.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceSignup === 1) {
      dripTargets.push({
        id: user.id,
        email: user.email,
        name: user.name,
        type: "day1",
      });
    } else if (daysSinceSignup === 3) {
      dripTargets.push({
        id: user.id,
        email: user.email,
        name: user.name,
        type: "day3",
      });
    } else if (
      daysSinceSignup >= 7 &&
      todayStart.getDay() === signupDate.getDay()
    ) {
      dripTargets.push({
        id: user.id,
        email: user.email,
        name: user.name,
        type: "weekly",
      });
    }
  }

  console.log(
    `[daily-digest] ${dripTargets.length} free user(s) eligible for drip emails today`
  );

  // Process free-user drip emails in batches
  for (let i = 0; i < dripTargets.length; i += BATCH_SIZE) {
    const batch = dripTargets.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (target) => {
        const displayName = target.name || "Stargazer";
        let result: { success: boolean };

        switch (target.type) {
          case "day1":
            result = await sendDayOneEmail(target.email, displayName);
            break;
          case "day3":
            result = await sendDayThreeEmail(target.email, displayName);
            break;
          case "weekly":
            result = await sendWeeklyFreeDigest(target.email, displayName);
            break;
        }

        if (!result.success) {
          throw new Error(
            `${target.type} email send returned success: false (likely missing RESEND_API_KEY)`
          );
        }
      })
    );

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        freeSent++;
      } else {
        freeFailed++;
        const message = result.reason?.message || "Unknown";
        Sentry.captureException(result.reason);
        console.error(
          JSON.stringify({
            event: "drip_user_failed",
            userId: batch[idx].id,
            dripType: batch[idx].type,
            error: message,
            timestamp: new Date().toISOString(),
          })
        );
        freeErrors.push({ userId: batch[idx].id, error: message });
      }
    });
  }

  // ---------------------------------------------------------------
  // 6. Birthday reminders
  //    - Query all BirthProfiles where month+day matches today
  //    - isOwner: false → remind the user about their friend/partner
  //    - isOwner: true  → send a special solar return email to the user
  // ---------------------------------------------------------------
  let birthdaySent = 0;
  let birthdayFailed = 0;
  const birthdayErrors: { userId: string; error: string }[] = [];

  const todayMonth = now.getMonth() + 1; // 1-based
  const todayDay = now.getDate();

  // Find all birth profiles whose birthday (month+day) matches today.
  // Use raw SQL with PostgreSQL EXTRACT to match month+day regardless of year,
  // joined with User to check emailDigest preference.
  const todayBirthdays = await prisma.$queryRaw<
    {
      id: string;
      name: string;
      birthDate: Date;
      isOwner: boolean;
      userId: string;
      userEmail: string;
      userName: string | null;
    }[]
  >`
    SELECT bp.id, bp.name, bp."birthDate", bp."isOwner", bp."userId",
           u.email AS "userEmail", u.name AS "userName"
    FROM "BirthProfile" bp
    JOIN "User" u ON u.id = bp."userId"
    WHERE EXTRACT(MONTH FROM bp."birthDate") = ${todayMonth}
      AND EXTRACT(DAY FROM bp."birthDate") = ${todayDay}
      AND u."emailDigest" = true
  `;

  console.log(
    `[daily-digest] Found ${todayBirthdays.length} birthday profile(s) for today`
  );

  // Separate into friend/partner reminders vs own birthday (solar return)
  type BirthdayTarget = {
    userId: string;
    userEmail: string;
    userName: string;
    profileName: string;
    sign: string;
    type: "reminder" | "solar-return";
  };

  const birthdayTargets: BirthdayTarget[] = todayBirthdays.map((p) => {
    const bd = new Date(p.birthDate);
    const sign = getZodiacSign(bd.getMonth() + 1, bd.getDate());
    return {
      userId: p.userId,
      userEmail: p.userEmail,
      userName: p.userName || "Stargazer",
      profileName: p.name,
      sign,
      type: p.isOwner ? "solar-return" : "reminder",
    };
  });

  // Process birthday emails in batches of 5
  for (let i = 0; i < birthdayTargets.length; i += BATCH_SIZE) {
    const batch = birthdayTargets.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (target) => {
        let result: { success: boolean };

        if (target.type === "solar-return") {
          result = await sendSolarReturnEmail(
            target.userEmail,
            target.userName,
            target.sign
          );
        } else {
          result = await sendBirthdayReminderEmail(
            target.userEmail,
            target.userName,
            target.profileName,
            target.sign
          );
        }

        if (!result.success) {
          throw new Error(
            `${target.type} birthday email send returned success: false`
          );
        }
      })
    );

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        birthdaySent++;
      } else {
        birthdayFailed++;
        const message = result.reason?.message || "Unknown";
        Sentry.captureException(result.reason);
        console.error(
          JSON.stringify({
            event: "birthday_email_failed",
            userId: batch[idx].userId,
            birthdayType: batch[idx].type,
            error: message,
            timestamp: new Date().toISOString(),
          })
        );
        birthdayErrors.push({ userId: batch[idx].userId, error: message });
      }
    });
  }

  // ---------------------------------------------------------------
  // 7. Return summary
  // ---------------------------------------------------------------
  console.log(
    `[daily-digest] Complete: ${sent} premium sent, ${failed} premium failed out of ${users.length} users`
  );
  console.log(
    `[daily-digest] Drip: ${freeSent} sent, ${freeFailed} failed out of ${dripTargets.length} free users`
  );
  console.log(
    `[daily-digest] Birthdays: ${birthdaySent} sent, ${birthdayFailed} failed out of ${birthdayTargets.length} profiles`
  );

  return NextResponse.json({
    date: today,
    premium: {
      totalEligible: users.length,
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    },
    freeDrip: {
      totalEligible: dripTargets.length,
      sent: freeSent,
      failed: freeFailed,
      errors: freeErrors.length > 0 ? freeErrors : undefined,
    },
    birthdays: {
      totalEligible: birthdayTargets.length,
      sent: birthdaySent,
      failed: birthdayFailed,
      errors: birthdayErrors.length > 0 ? birthdayErrors : undefined,
    },
  });
}
