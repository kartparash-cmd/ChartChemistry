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
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { calculateTransits } from "@/lib/astro-client";
import { generateDailyHoroscope } from "@/lib/claude";
import { sendHoroscopeDigest } from "@/lib/emails";
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

  for (const user of users) {
    const profile = user.birthProfiles[0];
    if (!profile) {
      // Shouldn't happen given the query, but guard anyway.
      continue;
    }

    try {
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

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push({
          userId: user.id,
          error: "Email send returned success: false (likely missing RESEND_API_KEY)",
        });
      }
    } catch (err) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[daily-digest] Failed for user ${user.id}:`,
        message
      );
      errors.push({ userId: user.id, error: message });
    }
  }

  // ---------------------------------------------------------------
  // 5. Return summary
  // ---------------------------------------------------------------
  console.log(
    `[daily-digest] Complete: ${sent} sent, ${failed} failed out of ${users.length} users`
  );

  return NextResponse.json({
    date: today,
    totalEligible: users.length,
    sent,
    failed,
    errors: errors.length > 0 ? errors : undefined,
  });
}
