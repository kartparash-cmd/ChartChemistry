/**
 * GET /api/report/[id]
 *
 * Fetch a single compatibility report by ID.
 * Requires authentication; user must own the report.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ============================================================
// Route handler
// ============================================================

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: reportId } = await params;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Fetch the report with related profiles
    const report = await prisma.compatibilityReport.findUnique({
      where: { id: reportId },
      include: {
        person1: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            birthTime: true,
            birthCity: true,
            birthCountry: true,
            chartData: true,
          },
        },
        person2: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            birthTime: true,
            birthCity: true,
            birthCountry: true,
            chartData: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (report.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have access to this report" },
        { status: 403 }
      );
    }

    // Parse fullNarrative back into sections if it's a JSON string
    let sections: Record<string, string> = {};
    try {
      sections = JSON.parse(report.fullNarrative);
    } catch {
      // If it's not valid JSON, treat the whole thing as a single narrative
      sections = { fullText: report.fullNarrative };
    }

    // Build response
    const response = {
      id: report.id,
      tier: report.tier,
      scores: {
        overall: report.overallScore,
        communication: report.communicationScore,
        emotional: report.emotionalScore,
        chemistry: report.chemistryScore,
        stability: report.stabilityScore,
        conflict: report.conflictScore,
      },
      summaryNarrative: report.summaryNarrative,
      sections,
      redFlags: report.redFlags,
      growthAreas: report.growthAreas,
      synastryData: report.synastryData,
      compositeData: report.compositeData,
      person1: {
        id: report.person1.id,
        name: report.person1.name,
        birthDate: report.person1.birthDate.toISOString().split("T")[0],
        birthTime: report.person1.birthTime,
        birthCity: report.person1.birthCity,
        birthCountry: report.person1.birthCountry,
        chartData: report.person1.chartData,
      },
      person2: {
        id: report.person2.id,
        name: report.person2.name,
        birthDate: report.person2.birthDate.toISOString().split("T")[0],
        birthTime: report.person2.birthTime,
        birthCity: report.person2.birthCity,
        birthCountry: report.person2.birthCountry,
        chartData: report.person2.chartData,
      },
      createdAt: report.createdAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/report/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
