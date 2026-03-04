import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
      where.status = status;
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          subject: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, email: true, name: true } },
          _count: { select: { replies: true } },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/admin/tickets]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
