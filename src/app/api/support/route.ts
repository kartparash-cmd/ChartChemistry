import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[GET /api/support]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subject, description } = body;

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject: subject.trim(),
        description: description.trim(),
      },
    });

    return NextResponse.json(
      {
        ticket: {
          ...ticket,
          createdAt: ticket.createdAt.toISOString(),
          updatedAt: ticket.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/support]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
