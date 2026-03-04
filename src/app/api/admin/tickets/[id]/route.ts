import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({
      ticket: {
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        replies: ticket.replies.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/tickets/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status required (OPEN, IN_PROGRESS, RESOLVED, CLOSED)" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("[PATCH /api/admin/tickets/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Verify ticket exists
    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const adminId = auth.session.user.realId || auth.session.user.id;

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: id,
        userId: adminId,
        message: message.trim(),
        isAdmin: true,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    // Auto-move to IN_PROGRESS if it was OPEN
    if (ticket.status === "OPEN") {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
      });
    }

    return NextResponse.json({
      reply: { ...reply, createdAt: reply.createdAt.toISOString() },
    });
  } catch (error) {
    console.error("[POST /api/admin/tickets/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
