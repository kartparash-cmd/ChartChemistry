// NOTE: Preferences are stored in-memory for MVP. In production, add
// emailDigest, emailMarketing, and pushEnabled Boolean fields to the
// User model and persist there instead.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const preferencesStore = new Map<string, Record<string, boolean>>();

const DEFAULT_PREFS = {
  emailDigest: true,
  emailMarketing: false,
  pushEnabled: false,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const prefs = preferencesStore.get(session.user.id) ?? DEFAULT_PREFS;
    return NextResponse.json(prefs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const current = preferencesStore.get(session.user.id) ?? { ...DEFAULT_PREFS };

    // Only allow known preference keys
    const allowedKeys = Object.keys(DEFAULT_PREFS);
    for (const key of allowedKeys) {
      if (typeof body[key] === "boolean") {
        current[key] = body[key];
      }
    }

    preferencesStore.set(session.user.id, current);
    return NextResponse.json(current);
  } catch {
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
