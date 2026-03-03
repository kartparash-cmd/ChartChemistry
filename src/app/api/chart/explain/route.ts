/**
 * POST /api/chart/explain
 *
 * Returns an AI explanation for a specific chart element (planet, aspect, house).
 * Requires authentication. Premium feature.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { explainChartElement } from "@/lib/claude";
import type { NatalChart } from "@/types/astrology";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let body: { profileId: string; element: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    if (!body.profileId || !body.element) {
      return NextResponse.json(
        { error: "profileId and element are required" },
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

    if (!profile.chartData) {
      return NextResponse.json(
        { error: "No chart data available for this profile" },
        { status: 400 }
      );
    }

    const chartData = profile.chartData as unknown as NatalChart;
    const explanation = await explainChartElement(
      body.element,
      chartData,
      profile.name
    );

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("[POST /api/chart/explain] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
