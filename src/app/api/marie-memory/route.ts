/**
 * GET  /api/marie-memory — List all Marie memory entries for the authenticated user
 * DELETE /api/marie-memory — Delete a specific memory entry by key
 *
 * Requires authenticated user with PREMIUM or ANNUAL plan.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ============================================================
// GET — List all memories
// ============================================================

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const isPremium =
      session.user.plan === "PREMIUM" || session.user.plan === "ANNUAL";

    if (!isPremium) {
      return NextResponse.json(
        { error: "Premium plan required" },
        { status: 403 }
      );
    }

    const memories = await prisma.marieMemory.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        key: true,
        value: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ memories });
  } catch (error) {
    console.error("[GET /api/marie-memory] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE — Remove a specific memory by key
// ============================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const isPremium =
      session.user.plan === "PREMIUM" || session.user.plan === "ANNUAL";

    if (!isPremium) {
      return NextResponse.json(
        { error: "Premium plan required" },
        { status: 403 }
      );
    }

    const { key } = await request.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "key is required and must be a string" },
        { status: 400 }
      );
    }

    await prisma.marieMemory.delete({
      where: {
        userId_key: {
          userId: session.user.id,
          key,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/marie-memory] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
