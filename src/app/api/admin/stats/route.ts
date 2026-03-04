import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const [
      totalUsers,
      freeUsers,
      premiumUsers,
      annualUsers,
      totalReports,
      totalProfiles,
      openTickets,
      totalTickets,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: "FREE" } }),
      prisma.user.count({ where: { plan: "PREMIUM" } }),
      prisma.user.count({ where: { plan: "ANNUAL" } }),
      prisma.compatibilityReport.count(),
      prisma.birthProfile.count(),
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      planBreakdown: { free: freeUsers, premium: premiumUsers, annual: annualUsers },
      totalReports,
      totalProfiles,
      openTickets,
      totalTickets,
      recentSignups: recentSignups.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
