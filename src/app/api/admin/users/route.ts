import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }
    if (plan && ["FREE", "PREMIUM", "ANNUAL"].includes(plan)) {
      where.plan = plan;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          plan: true,
          role: true,
          createdAt: true,
          _count: { select: { birthProfiles: true, reports: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const { userId, plan } = body;

    if (!userId || !plan || !["FREE", "PREMIUM", "ANNUAL"].includes(plan)) {
      return NextResponse.json(
        { error: "userId and valid plan (FREE, PREMIUM, ANNUAL) required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { plan },
      select: { id: true, email: true, plan: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[PATCH /api/admin/users]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
