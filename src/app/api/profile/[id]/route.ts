/**
 * /api/profile/[id]
 *
 * GET    — fetch a single birth profile by ID
 * PUT    — update a birth profile
 * PATCH  — lightweight update (name, birthTime)
 * DELETE — delete a birth profile
 */

import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNatalChart } from "@/lib/astro-client";
import type { NatalChartInput } from "@/types/astrology";
import { Prisma } from "@/generated/prisma/client";

// ============================================================
// GET — fetch a single profile
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check for public access request
    const { searchParams } = new URL(request.url);
    const isPublicRequest = searchParams.get("public") === "true";

    if (isPublicRequest) {
      // Public access — no auth required, but profile must have isPublic flag
      const profile = await prisma.birthProfile.findUnique({
        where: { id },
      });

      if (!profile || !profile.isPublic) {
        return NextResponse.json(
          { error: "Profile not found or is not public" },
          { status: 404 }
        );
      }

      // Return limited public info (no birth time, coordinates, timezone)
      return NextResponse.json({
        profile: {
          id: profile.id,
          name: profile.name,
          birthCity: profile.birthCity,
          birthCountry: profile.birthCountry,
          chartData: profile.chartData,
        },
      });
    }

    // Authenticated access — full profile details
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const profile = await prisma.birthProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profile.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not own this profile" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.name,
        birthDate: profile.birthDate.toISOString().split("T")[0],
        birthTime: profile.birthTime,
        birthCity: profile.birthCity,
        birthCountry: profile.birthCountry,
        latitude: profile.latitude,
        longitude: profile.longitude,
        timezone: profile.timezone,
        isOwner: profile.isOwner,
        isPublic: profile.isPublic,
        chartData: profile.chartData,
        createdAt: profile.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[GET /api/profile/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT — update a profile
// ============================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.birthProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not own this profile" },
        { status: 403 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Build update data from allowed fields
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
      }
      updateData.name = (body.name as string).trim();
    }

    if (body.birthDate !== undefined) {
      if (typeof body.birthDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate)) {
        return NextResponse.json({ error: "birthDate must be YYYY-MM-DD" }, { status: 400 });
      }
      updateData.birthDate = new Date(body.birthDate + "T00:00:00.000Z");
    }

    if (body.birthTime !== undefined) {
      if (body.birthTime !== null && (typeof body.birthTime !== "string" || !/^\d{2}:\d{2}$/.test(body.birthTime))) {
        return NextResponse.json({ error: "birthTime must be HH:MM or null" }, { status: 400 });
      }
      updateData.birthTime = body.birthTime;
    }

    if (body.birthCity !== undefined) updateData.birthCity = body.birthCity;
    if (body.birthCountry !== undefined) updateData.birthCountry = body.birthCountry;
    if (body.latitude !== undefined) updateData.latitude = body.latitude;
    if (body.longitude !== undefined) updateData.longitude = body.longitude;
    if (body.timezone !== undefined) updateData.timezone = body.timezone;
    if (body.isOwner !== undefined) updateData.isOwner = body.isOwner;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;

    // Recalculate chart if birth data changed
    const birthDataChanged =
      body.birthDate !== undefined ||
      body.birthTime !== undefined ||
      body.latitude !== undefined ||
      body.longitude !== undefined ||
      body.timezone !== undefined ||
      body.houseSystem !== undefined;

    if (birthDataChanged) {
      const chartInput: NatalChartInput = {
        birthDate: (updateData.birthDate
          ? (body.birthDate as string)
          : existing.birthDate.toISOString().split("T")[0]),
        birthTime: (updateData.birthTime !== undefined
          ? (updateData.birthTime as string | undefined)
          : existing.birthTime) || undefined,
        latitude: (updateData.latitude as number) || existing.latitude,
        longitude: (updateData.longitude as number) || existing.longitude,
        timezone: (updateData.timezone as string) || existing.timezone,
        houseSystem: body.houseSystem as string | undefined,
      };

      try {
        const chart = await calculateNatalChart(chartInput);
        updateData.chartData = JSON.parse(JSON.stringify(chart)) as Prisma.InputJsonValue;
      } catch (error) {
        console.warn("[PUT /api/profile/[id]] Failed to recalculate chart:", error);
      }
    }

    const profile = await prisma.birthProfile.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.name,
        birthDate: profile.birthDate.toISOString().split("T")[0],
        birthTime: profile.birthTime,
        birthCity: profile.birthCity,
        birthCountry: profile.birthCountry,
        latitude: profile.latitude,
        longitude: profile.longitude,
        timezone: profile.timezone,
        isOwner: profile.isOwner,
        isPublic: profile.isPublic,
        chartData: profile.chartData,
        createdAt: profile.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[PUT /api/profile/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH — lightweight update (name, birthTime)
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const { id } = await params;
    const profile = await prisma.birthProfile.findUnique({ where: { id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    if (profile.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name && typeof body.name === "string") updateData.name = body.name.trim().substring(0, 100);
    if (body.birthTime && typeof body.birthTime === "string" && /^\d{2}:\d{2}$/.test(body.birthTime)) {
      updateData.birthTime = body.birthTime;
      // Clear cached chart data so it gets recalculated with the new time
      updateData.chartData = null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.birthProfile.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("[PATCH /api/profile/[id]] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ============================================================
// DELETE — delete a profile
// ============================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const profile = await prisma.birthProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profile.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not own this profile" },
        { status: 403 }
      );
    }

    if (profile.isOwner) {
      return NextResponse.json(
        { error: "Cannot delete your owner profile" },
        { status: 400 }
      );
    }

    await prisma.birthProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("[DELETE /api/profile/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
