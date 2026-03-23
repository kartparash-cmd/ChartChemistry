import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        birthProfiles: true,
        reports: {
          include: {
            person1: { select: { name: true, birthDate: true, birthCity: true } },
            person2: { select: { name: true, birthDate: true, birthCity: true } },
          },
        },
        chatSessions: true,
        achievements: true,
        marieMemories: {
          select: {
            key: true,
            value: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        relationshipCheckIns: {
          select: {
            connectionScore: true,
            conflictNote: true,
            positiveNote: true,
            growthGoal: true,
            overallMood: true,
            createdAt: true,
          },
        },
        supportTickets: {
          include: {
            replies: {
              select: {
                message: true,
                isAdmin: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Strip sensitive fields
    const { password: _, stripeCustomerId: __, ...safeUser } = user;

    return new NextResponse(JSON.stringify(safeUser, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="chartchemistry-data-${session.user.id}.json"`,
      },
    });
  } catch (error) {
    console.error("[Data Export] Error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
