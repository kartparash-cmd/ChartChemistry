import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      topicDistribution,
      sentimentDistribution,
      questionTypeDistribution,
      avgLengths,
      usageByDayOfWeek,
      usageByHour,
      totalLast7Days,
      totalLast30Days,
      totalAllTime,
    ] = await Promise.all([
      prisma.marieAnalytics.groupBy({
        by: ["topic"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.marieAnalytics.groupBy({
        by: ["sentiment"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.marieAnalytics.groupBy({
        by: ["questionType"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.marieAnalytics.aggregate({
        _avg: { messageLength: true, responseLength: true },
      }),
      prisma.marieAnalytics.groupBy({
        by: ["dayOfWeek"],
        _count: { id: true },
        orderBy: { dayOfWeek: "asc" },
      }),
      prisma.marieAnalytics.groupBy({
        by: ["hourOfDay"],
        _count: { id: true },
        orderBy: { hourOfDay: "asc" },
      }),
      prisma.marieAnalytics.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.marieAnalytics.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.marieAnalytics.count(),
    ]);

    return NextResponse.json({
      topicDistribution: topicDistribution.map((t) => ({
        topic: t.topic,
        count: t._count.id,
      })),
      sentimentDistribution: sentimentDistribution.map((s) => ({
        sentiment: s.sentiment,
        count: s._count.id,
      })),
      questionTypeDistribution: questionTypeDistribution.map((q) => ({
        questionType: q.questionType,
        count: q._count.id,
      })),
      averageLengths: {
        messageLength: Math.round(avgLengths._avg.messageLength || 0),
        responseLength: Math.round(avgLengths._avg.responseLength || 0),
      },
      usageByDayOfWeek: usageByDayOfWeek.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        count: d._count.id,
      })),
      usageByHour: usageByHour.map((h) => ({
        hourOfDay: h.hourOfDay,
        count: h._count.id,
      })),
      totals: {
        last7Days: totalLast7Days,
        last30Days: totalLast30Days,
        allTime: totalAllTime,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/marie-stats]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
