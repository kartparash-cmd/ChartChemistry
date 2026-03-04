/**
 * /api/natal-chart/recalculate
 *
 * POST — recalculate a natal chart with a different house system.
 *
 * This endpoint is used by the chart page when the user changes the
 * house system selector. It fetches the profile's birth data, calls
 * the astro-service with the requested house system, and returns the
 * updated chart data (without persisting to the database — the house
 * system preference lives in localStorage).
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNatalChart } from "@/lib/astro-client";
import type { NatalChartInput } from "@/types/astrology";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let body: { profileId: string; houseSystem: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body.profileId || typeof body.profileId !== "string") {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 }
      );
    }

    if (!body.houseSystem || typeof body.houseSystem !== "string") {
      return NextResponse.json(
        { error: "houseSystem is required" },
        { status: 400 }
      );
    }

    // Fetch the profile
    const profile = await prisma.birthProfile.findUnique({
      where: { id: body.profileId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profile.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not own this profile" },
        { status: 403 }
      );
    }

    if (!profile.birthTime) {
      return NextResponse.json(
        { error: "Birth time is required for house system calculations" },
        { status: 400 }
      );
    }

    // Recalculate the natal chart with the new house system
    const chartInput: NatalChartInput = {
      birthDate: profile.birthDate.toISOString().split("T")[0],
      birthTime: profile.birthTime,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      houseSystem: body.houseSystem,
    };

    const chartData = await calculateNatalChart(chartInput);

    return NextResponse.json({ chartData });
  } catch (error) {
    console.error("[POST /api/natal-chart/recalculate] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
