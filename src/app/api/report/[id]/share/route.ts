/**
 * POST /api/report/[id]/share
 *
 * Share a compatibility report with another user by email.
 * Requires authentication; caller must own the report.
 * Accepts { email: string } and sets sharedWithUserId on the report.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
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

    // Parse body
    let body: { email?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    // Fetch the report to verify ownership
    const report = await prisma.compatibilityReport.findUnique({
      where: { id: reportId },
      select: { userId: true, sharedWithUserId: true },
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

    // Look up the partner by email
    const partner = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "No user found with that email address. They may need to create an account first." },
        { status: 404 }
      );
    }

    // Prevent sharing with yourself
    if (partner.id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot share a report with yourself" },
        { status: 400 }
      );
    }

    // Update the report with sharedWithUserId
    await prisma.compatibilityReport.update({
      where: { id: reportId },
      data: { sharedWithUserId: partner.id },
    });

    return NextResponse.json({
      success: true,
      sharedWith: {
        email: partner.email,
        name: partner.name,
      },
    });
  } catch (error) {
    console.error("[POST /api/report/[id]/share] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
