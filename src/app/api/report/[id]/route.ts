/**
 * GET /api/report/[id]
 *
 * Fetch a single compatibility report by ID.
 * - If `?token=<shareToken>` is present, return a LIMITED public preview
 *   (no auth required).
 * - Otherwise, requires authentication; user must own the report.
 *
 * POST /api/report/[id]
 *
 * Generate (or return existing) share token for a report.
 * Requires authentication; user must own the report.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ============================================================
// GET — fetch report (authenticated owner OR public via token)
// ============================================================

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Check for a public share-token in query string
    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get("token");

    // ----------------------------------------------------------
    // Public (token-based) access — limited preview
    // ----------------------------------------------------------
    if (shareToken) {
      const report = await prisma.compatibilityReport.findUnique({
        where: { id: reportId },
        include: {
          person1: {
            select: {
              name: true,
              birthDate: true,
              birthCity: true,
              chartData: true,
            },
          },
          person2: {
            select: {
              name: true,
              birthDate: true,
              birthCity: true,
              chartData: true,
            },
          },
        },
      });

      if (!report || report.shareToken !== shareToken) {
        return NextResponse.json(
          { error: "Invalid or expired share link" },
          { status: 404 }
        );
      }

      // Extract sun signs from chartData if available
      const getSunSign = (chartData: unknown): string | null => {
        try {
          const data = chartData as { planets?: { name: string; sign: string }[] };
          const sun = data?.planets?.find(
            (p: { name: string }) => p.name.toLowerCase() === "sun"
          );
          return sun?.sign ?? null;
        } catch {
          return null;
        }
      };

      // Return LIMITED public preview
      return NextResponse.json({
        id: report.id,
        isPublicPreview: true,
        scores: {
          overall: report.overallScore,
        },
        summaryNarrative: report.summaryNarrative,
        person1: {
          name: report.person1.name,
          sunSign: getSunSign(report.person1.chartData),
        },
        person2: {
          name: report.person2.name,
          sunSign: getSunSign(report.person2.chartData),
        },
        createdAt: report.createdAt.toISOString(),
      });
    }

    // ----------------------------------------------------------
    // Authenticated (owner) access — full report
    // ----------------------------------------------------------
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
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

    // Verify ownership or shared access
    const isOwner = report.userId === session.user.id;
    const isSharedPartner = report.sharedWithUserId === session.user.id;

    if (!isOwner && !isSharedPartner) {
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
      shareToken: report.shareToken ?? null,
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

// ============================================================
// POST — generate a share token for a report (owner only)
// ============================================================

export async function POST(
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

    // Fetch the report to verify ownership
    const report = await prisma.compatibilityReport.findUnique({
      where: { id: reportId },
      select: { userId: true, shareToken: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    if (report.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have access to this report" },
        { status: 403 }
      );
    }

    // Re-use existing token if one already exists
    let token = report.shareToken;

    if (!token) {
      token = randomBytes(16).toString("hex");
      await prisma.compatibilityReport.update({
        where: { id: reportId },
        data: { shareToken: token },
      });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/report/${reportId}?token=${token}`;

    return NextResponse.json({ shareToken: token, shareUrl });
  } catch (error) {
    console.error("[POST /api/report/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
