import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Users can only see their own tickets
    if (ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    console.error("[GET /api/support/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    if (ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: id,
        userId: session.user.id,
        message: message.trim(),
        isAdmin: false,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Re-open ticket if it was resolved/closed
    if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: "OPEN" },
      });
    }

    return NextResponse.json({
      reply: { ...reply, createdAt: reply.createdAt.toISOString() },
    });
  } catch (error) {
    console.error("[POST /api/support/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
