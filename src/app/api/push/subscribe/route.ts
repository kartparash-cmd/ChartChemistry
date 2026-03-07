/**
 * /api/push/subscribe
 *
 * POST — Save a push notification subscription for the authenticated user.
 *
 * Accepts a PushSubscription JSON object (endpoint, keys) and persists it
 * to the User record in the database.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const subscription = await request.json();

    // Validate the subscription object has the expected shape
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Invalid push subscription. Expected endpoint and keys." },
        { status: 400 }
      );
    }

    if (!subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json(
        { error: "Invalid push subscription keys. Expected p256dh and auth." },
        { status: 400 }
      );
    }

    // Persist the subscription to the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushSubscription: {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime ?? null,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        },
        pushEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Push subscription registered successfully.",
    });
  } catch (error) {
    console.error("[Push Subscribe] Error:", error);
    return NextResponse.json(
      { error: "Failed to register push subscription" },
      { status: 500 }
    );
  }
}
