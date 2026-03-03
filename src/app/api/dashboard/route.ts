/**
 * GET /api/dashboard
 *
 * Returns the authenticated user's dashboard data:
 * - Their "owner" birth profile (or first profile)
 * - Their compatibility reports
 * - Summary stats
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user's profiles, reports, and chat sessions in parallel
    const [profiles, reports] = await Promise.all([
      prisma.birthProfile.findMany({
        where: { userId },
        orderBy: [{ isOwner: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          birthDate: true,
          birthTime: true,
          birthCity: true,
          birthCountry: true,
          isOwner: true,
          chartData: true,
        },
      }),
      prisma.compatibilityReport.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          person1: { select: { name: true } },
          person2: { select: { name: true } },
        },
      }),
    ]);

    // Owner profile (or first profile if none flagged as owner)
    const ownerProfile = profiles.find((p) => p.isOwner) || profiles[0] || null;

    // Format profile dates
    const formattedProfile = ownerProfile
      ? {
          ...ownerProfile,
          birthDate: ownerProfile.birthDate.toISOString().split("T")[0],
        }
      : null;

    // Format reports
    const formattedReports = reports.map((r) => ({
      id: r.id,
      person1: { name: r.person1.name },
      person2: { name: r.person2.name },
      overallScore: r.overallScore,
      tier: r.tier,
      createdAt: r.createdAt.toISOString(),
    }));

    // Stats
    const highestScore =
      reports.length > 0
        ? Math.max(...reports.map((r) => r.overallScore))
        : 0;

    return NextResponse.json({
      profile: formattedProfile,
      profiles: profiles.map((p) => ({
        ...p,
        birthDate: p.birthDate.toISOString().split("T")[0],
      })),
      reports: formattedReports,
      stats: {
        totalReports: reports.length,
        highestScore,
        plan: session.user.plan || "FREE",
      },
    });
  } catch (error) {
    console.error("[GET /api/dashboard] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
