/**
 * /api/chat/sessions/[id]
 *
 * PATCH  — update a chat session (rename, pin, archive)
 * DELETE — soft delete a chat session
 */

import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ============================================================
// PATCH — update session (rename, pin, archive)
// ============================================================

export async function PATCH(
  request: NextRequest,
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

    if (session.user.plan === "FREE") {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify ownership and not soft-deleted
    const chatSession = await prisma.chatSession.findUnique({
      where: { id },
    });

    if (!chatSession || chatSession.deletedAt !== null) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (chatSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not own this session" },
        { status: 403 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        body.title.trim().length === 0 ||
        body.title.trim().length > 100
      ) {
        return NextResponse.json(
          { error: "title must be a non-empty string of 100 characters or fewer" },
          { status: 400 }
        );
      }
      updateData.title = body.title.trim();
    }

    if (body.pinned !== undefined) {
      if (typeof body.pinned !== "boolean") {
        return NextResponse.json(
          { error: "pinned must be a boolean" },
          { status: 400 }
        );
      }
      updateData.pinned = body.pinned;
    }

    if (body.archived !== undefined) {
      if (typeof body.archived !== "boolean") {
        return NextResponse.json(
          { error: "archived must be a boolean" },
          { status: 400 }
        );
      }
      updateData.archived = body.archived;
    }

    const updated = await prisma.chatSession.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error("[PATCH /api/chat/sessions/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE — soft delete a session
// ============================================================

export async function DELETE(
  _request: NextRequest,
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

    if (session.user.plan === "FREE") {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify ownership and not already soft-deleted
    const chatSession = await prisma.chatSession.findUnique({
      where: { id },
    });

    if (!chatSession || chatSession.deletedAt !== null) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (chatSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not own this session" },
        { status: 403 }
      );
    }

    await prisma.chatSession.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/chat/sessions/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
