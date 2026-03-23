import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  startImpersonation,
  stopImpersonation,
} from "@/lib/impersonation";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    const { targetUserId, stop } = body;

    // The real admin ID — use realId if already impersonating, otherwise id
    const adminId = auth.session.user.realId || auth.session.user.id;

    if (stop) {
      stopImpersonation(adminId);
      return NextResponse.json({ impersonating: null });
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 }
      );
    }

    // Prevent impersonating yourself
    if (targetUserId === adminId) {
      return NextResponse.json(
        { error: "Cannot impersonate yourself" },
        { status: 400 }
      );
    }

    // Verify target exists
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, name: true },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    startImpersonation(adminId, targetUserId);

    return NextResponse.json({ impersonating: target });
  } catch (error) {
    console.error("[POST /api/admin/impersonate]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
