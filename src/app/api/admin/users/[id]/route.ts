import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/sanitize";

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

const VALID_PLANS = ["FREE", "PREMIUM", "ANNUAL"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    const { plan, amountPaid, note } = body;

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be FREE, PREMIUM, or ANNUAL." },
        { status: 400 }
      );
    }

    const amount = typeof amountPaid === "number" ? amountPaid : 0;
    const sanitizedNote = note ? sanitizeInput(String(note)).slice(0, 500) : "";

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const previousPlan = user.plan;

    const updated = await prisma.user.update({
      where: { id },
      data: { plan },
      select: { id: true, email: true, plan: true },
    });

    // Log the plan change for audit trail (server logs)
    console.log(
      `[ADMIN PLAN CHANGE] Admin: ${auth.session.user.email} | User: ${user.email} | ${previousPlan} → ${plan} | Amount: $${amount.toFixed(2)} | Note: ${sanitizedNote || "—"}`
    );

    return NextResponse.json({
      success: true,
      user: updated,
      change: {
        previousPlan,
        newPlan: plan,
        amountPaid: amount,
        note: sanitizedNote,
        changedBy: auth.session.user.email,
        changedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[PATCH /api/admin/users/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
