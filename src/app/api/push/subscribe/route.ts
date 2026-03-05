/**
 * /api/push/subscribe
 *
 * POST — Save a push notification subscription for the authenticated user.
 *
 * Accepts a PushSubscription JSON object (endpoint, keys) and associates it
 * with the current user. For now, the subscription is logged to the server
 * console since full VAPID-based push sending is not yet configured.
 *
 * Once VAPID keys are set up and a pushSubscription column is added to the
 * User model, this route will persist the subscription to the database.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // Log the subscription for now.
    // TODO: Persist to database once the pushSubscription field is added to the
    // User model and VAPID keys are configured.
    console.log(
      `[Push Subscribe] User ${session.user.id} (${session.user.email}) registered push subscription:`,
      {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime ?? null,
        // Log key prefixes only for security
        keys: {
          p256dh: subscription.keys.p256dh.substring(0, 20) + "...",
          auth: subscription.keys.auth.substring(0, 10) + "...",
        },
      }
    );

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
