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
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        plan: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        birthProfiles: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            birthCity: true,
            birthCountry: true,
            isOwner: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        reports: {
          select: {
            id: true,
            overallScore: true,
            tier: true,
            createdAt: true,
            person1: { select: { name: true } },
            person2: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        supportTickets: {
          select: {
            id: true,
            subject: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        birthProfiles: user.birthProfiles.map((p) => ({
          ...p,
          birthDate: p.birthDate.toISOString().split("T")[0],
          createdAt: p.createdAt.toISOString(),
        })),
        reports: user.reports.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
        supportTickets: user.supportTickets.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/users/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
