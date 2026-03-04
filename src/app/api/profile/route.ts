/**
 * /api/profile
 *
 * Birth profile CRUD endpoints (all require authentication):
 *   GET  — list the authenticated user's birth profiles
 *   POST — create a new birth profile (optionally calculates natal chart)
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNatalChart } from "@/lib/astro-client";
import type { CreateProfileRequest, NatalChartInput } from "@/types/astrology";
import { Prisma } from "@/generated/prisma/client";

// ============================================================
// GET — list user's birth profiles
// ============================================================

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const profiles = await prisma.birthProfile.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        birthDate: true,
        birthTime: true,
        birthCity: true,
        birthCountry: true,
        latitude: true,
        longitude: true,
        timezone: true,
        isOwner: true,
        chartData: true,
        createdAt: true,
      },
    });

    // Format dates for JSON serialization
    const formatted = profiles.map((p) => ({
      ...p,
      birthDate: p.birthDate.toISOString().split("T")[0],
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ profiles: formatted });
  } catch (error) {
    console.error("[GET /api/profile] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================
// POST — create a new birth profile
// ============================================================

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse body
    let body: CreateProfileRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    if (
      !body.birthDate ||
      typeof body.birthDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate)
    ) {
      return NextResponse.json(
        { error: "birthDate is required in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    if (
      body.birthTime !== undefined &&
      body.birthTime !== null &&
      (typeof body.birthTime !== "string" ||
        !/^\d{2}:\d{2}$/.test(body.birthTime))
    ) {
      return NextResponse.json(
        { error: "birthTime must be in HH:MM format if provided" },
        { status: 400 }
      );
    }

    if (!body.birthCity || typeof body.birthCity !== "string") {
      return NextResponse.json(
        { error: "birthCity is required" },
        { status: 400 }
      );
    }

    if (!body.birthCountry || typeof body.birthCountry !== "string") {
      return NextResponse.json(
        { error: "birthCountry is required" },
        { status: 400 }
      );
    }

    if (
      typeof body.latitude !== "number" ||
      body.latitude < -90 ||
      body.latitude > 90
    ) {
      return NextResponse.json(
        { error: "latitude must be a number between -90 and 90" },
        { status: 400 }
      );
    }

    if (
      typeof body.longitude !== "number" ||
      body.longitude < -180 ||
      body.longitude > 180
    ) {
      return NextResponse.json(
        { error: "longitude must be a number between -180 and 180" },
        { status: 400 }
      );
    }

    if (!body.timezone || typeof body.timezone !== "string") {
      return NextResponse.json(
        { error: "timezone is required" },
        { status: 400 }
      );
    }

    // Limit number of profiles per user (prevent abuse)
    const profileCount = await prisma.birthProfile.count({
      where: { userId: session.user.id },
    });

    if (profileCount >= 20) {
      return NextResponse.json(
        {
          error: "Profile limit reached",
          message: "You can save up to 20 birth profiles. Please delete some before adding more.",
        },
        { status: 400 }
      );
    }

    // Calculate natal chart
    const chartInput: NatalChartInput = {
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      latitude: body.latitude,
      longitude: body.longitude,
      timezone: body.timezone,
      houseSystem: body.houseSystem,
    };

    let chartData: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue = Prisma.JsonNull;
    try {
      const chart = await calculateNatalChart(chartInput);
      chartData = JSON.parse(JSON.stringify(chart)) as Prisma.InputJsonValue;
    } catch (error) {
      // Log but don't fail — the profile can exist without cached chart data
      console.warn(
        "[POST /api/profile] Failed to calculate natal chart, saving profile without chart data:",
        error instanceof Error ? error.message : error
      );
    }

    // Create the profile
    const profile = await prisma.birthProfile.create({
      data: {
        userId: session.user.id,
        name: body.name.trim(),
        birthDate: new Date(body.birthDate + "T00:00:00.000Z"),
        birthTime: body.birthTime || null,
        birthCity: body.birthCity,
        birthCountry: body.birthCountry,
        latitude: body.latitude,
        longitude: body.longitude,
        timezone: body.timezone,
        isOwner: body.isOwner ?? false,
        chartData,
      },
    });

    return NextResponse.json(
      {
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
          chartData: profile.chartData,
          createdAt: profile.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/profile] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE — delete a birth profile
// ============================================================

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get profile ID from search params
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("id");

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile id is required as a query parameter" },
        { status: 400 }
      );
    }

    // Verify the profile exists and belongs to this user
    const profile = await prisma.birthProfile.findUnique({
      where: { id: profileId },
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

    // Delete the profile (cascade will handle related reports)
    await prisma.birthProfile.delete({
      where: { id: profileId },
    });

    return NextResponse.json({ success: true, deletedId: profileId });
  } catch (error) {
    console.error("[DELETE /api/profile] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
