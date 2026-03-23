/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for subscription upgrades.
 * Requires authentication. Returns the checkout URL for client-side redirect.
 */

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, PLANS, SINGLE_REPORT_PRICE } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { createRateLimiter } from "@/lib/rate-limit";

const checkoutLimiter = createRateLimiter(5, 60 * 60 * 1000, "checkout");

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Rate limit: 5 checkout attempts per hour per user
    const rateLimitResult = await checkoutLimiter.check(session.user.id);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again later." },
        { status: 429 }
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

    if (plan !== "PREMIUM" && plan !== "ANNUAL" && plan !== "SINGLE_REPORT") {
      return NextResponse.json(
        { error: "Invalid plan. Must be PREMIUM, ANNUAL, or SINGLE_REPORT." },
        { status: 400 }
      );
    }

    // For subscription plans, validate price ID
    if (plan !== "SINGLE_REPORT") {
      const planConfig = PLANS[plan];
      if (!planConfig.priceId) {
        return NextResponse.json(
          { error: `Price ID not configured for ${plan} plan. Set STRIPE_${plan}_PRICE_ID in environment.` },
          { status: 500 }
        );
      }
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

    // Single report: one-time payment with inline price_data
    if (plan === "SINGLE_REPORT") {
      const singleReportSuccessPath = callbackUrl && callbackUrl.startsWith("/")
        ? `${callbackUrl}${callbackUrl.includes("?") ? "&" : "?"}report_purchased=true`
        : "/dashboard?report_purchased=true";

      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Single Compatibility Report",
                description: "One full 7-section premium compatibility report",
              },
              unit_amount: SINGLE_REPORT_PRICE,
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}${singleReportSuccessPath}`,
        cancel_url: `${origin}/pricing?cancelled=true`,
        metadata: {
          userId: session.user.id,
          type: "single_report",
        },
      });

      return NextResponse.json({ url: checkoutSession.url });
    }

    // Subscription plans
    const planConfig = PLANS[plan];
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      allow_promotion_codes: true,
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
    Sentry.captureException(error);
    console.error(JSON.stringify({ event: "checkout_error", error: error instanceof Error ? error.message : "Unknown error", timestamp: new Date().toISOString() }));
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
