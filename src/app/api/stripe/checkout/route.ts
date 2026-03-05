/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for subscription upgrades.
 * Requires authentication. Returns the checkout URL for client-side redirect.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let body: { plan: string; callbackUrl?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { plan, callbackUrl } = body;

    if (plan !== "PREMIUM" && plan !== "ANNUAL") {
      return NextResponse.json(
        { error: "Invalid plan. Must be PREMIUM or ANNUAL." },
        { status: 400 }
      );
    }

    const planConfig = PLANS[plan];
    if (!planConfig.priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for ${plan} plan. Set STRIPE_${plan}_PRICE_ID in environment.` },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true },
    });

    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id },
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Build success URL: use callbackUrl if provided (must be a relative path for security),
    // otherwise default to /dashboard?upgraded=true
    let successPath = "/dashboard?upgraded=true";
    if (callbackUrl && callbackUrl.startsWith("/")) {
      const separator = callbackUrl.includes("?") ? "&" : "?";
      successPath = `${callbackUrl}${separator}upgraded=true`;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}/pricing?cancelled=true`,
      metadata: {
        userId: session.user.id,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[POST /api/stripe/checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
