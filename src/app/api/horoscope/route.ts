/**
 * GET /api/horoscope
 *
 * Returns a personalized daily horoscope for the authenticated user.
 * Uses their natal chart data + current transits to generate via Claude AI.
 * Caches the result per user per day to avoid redundant AI calls.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { calculateTransits } from "@/lib/astro-client";
import { generateDailyHoroscope } from "@/lib/claude";
import type { NatalChart, NatalChartInput } from "@/types/astrology";

// In-memory cache for horoscopes (per deployment — good enough for MVP)
const horoscopeCache = new Map<string, { data: unknown; expiresAt: number }>();

function getCacheKey(userId: string, date: string): string {
  return `${userId}:${date}`;
}

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

    const today = new Date().toISOString().split("T")[0];
    const cacheKey = getCacheKey(session.user.id, today);

    // Check cache
    const cached = horoscopeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    // Find user's owner profile (or first profile with chart data)
    const profile = await prisma.birthProfile.findFirst({
      where: {
        userId: session.user.id,
        chartData: { not: Prisma.JsonNull },
      },
      orderBy: [{ isOwner: "desc" }, { createdAt: "asc" }],
    });

    if (!profile || !profile.chartData) {
      return NextResponse.json(
        {
          error: "No birth profile found",
          message: "Create a birth profile with your birth details to get your personalized daily horoscope.",
        },
        { status: 404 }
      );
    }

    const chartData = profile.chartData as unknown as NatalChart;

    // Calculate today's transits
    const chartInput: NatalChartInput = {
      birthDate: profile.birthDate.toISOString().split("T")[0],
      birthTime: profile.birthTime || undefined,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
    };

    let transitData;
    try {
      transitData = await calculateTransits(chartInput, today);
    } catch (error) {
      console.warn("[GET /api/horoscope] Transit calculation failed, generating without transits:", error);
      // Generate without transit data — still useful with natal chart alone
      transitData = {
        aspectsToNatal: [],
        transitingPositions: [],
        date: today,
      };
    }

    // Generate horoscope
    const horoscope = await generateDailyHoroscope(
      chartData,
      transitData,
      profile.name,
      today
    );

    const response = {
      date: today,
      userName: profile.name,
      ...horoscope,
    };

    // Cache until midnight (approximately — good enough for MVP)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    horoscopeCache.set(cacheKey, {
      data: response,
      expiresAt: midnight.getTime(),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/horoscope] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate horoscope" },
      { status: 500 }
    );
  }
}
