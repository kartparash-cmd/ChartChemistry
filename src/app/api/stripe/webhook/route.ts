/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events:
 * - checkout.session.completed → upgrade user plan
 * - customer.subscription.updated → sync user plan with subscription status
 * - customer.subscription.deleted → downgrade user to FREE
 * - invoice.payment_failed → flag user with payment failure warning
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendPaymentFailedEmail, sendReceiptEmail } from "@/lib/email";
import type Stripe from "stripe";

// Simple in-memory idempotency set (use DB-backed store in production)
const processedEvents = new Set<string>();
const MAX_PROCESSED = 1000;

function markProcessed(eventId: string) {
  if (processedEvents.size >= MAX_PROCESSED) {
    const first = processedEvents.values().next().value;
    if (first) processedEvents.delete(first);
  }
  processedEvents.add(eventId);
}

/**
 * Map a Stripe Price ID back to the internal plan name.
 * Returns "FREE" if the price ID doesn't match any known plan.
 */
function planFromPriceId(priceId: string): "PREMIUM" | "ANNUAL" | null {
  if (priceId === PLANS.PREMIUM.priceId) return "PREMIUM";
  if (priceId === PLANS.ANNUAL.priceId) return "ANNUAL";
  return null;
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Idempotency check
  if (processedEvents.has(event.id)) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          console.error("[Stripe Webhook] Missing metadata in checkout session:", session.id);
          break;
        }

        // Update user plan
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: plan as "PREMIUM" | "ANNUAL",
            stripeCustomerId: session.customer as string,
          },
        });

        console.log(`[Stripe Webhook] User ${userId} upgraded to ${plan}`);

        // Send receipt email
        const updatedUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });
        if (updatedUser?.email) {
          const amount = plan === "ANNUAL" ? "$79.99/yr" : "$9.99/mo";
          sendReceiptEmail(updatedUser.email, plan, amount).catch(() => {});
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error(`[Stripe Webhook] No user found for Stripe customer ${customerId}`);
          break;
        }

        // If the subscription is no longer active, downgrade to FREE
        if (subscription.status === "canceled" || subscription.status === "unpaid") {
          await prisma.user.update({
            where: { id: user.id },
            data: { plan: "FREE" },
          });
          console.log(`[Stripe Webhook] User ${user.id} downgraded to FREE (subscription status: ${subscription.status})`);
          break;
        }

        // For active/trialing subscriptions, sync the plan from the price ID
        if (subscription.status === "active" || subscription.status === "trialing") {
          const priceId = subscription.items.data[0]?.price?.id;
          if (priceId) {
            const newPlan = planFromPriceId(priceId);
            if (newPlan) {
              await prisma.user.update({
                where: { id: user.id },
                data: { plan: newPlan },
              });
              console.log(`[Stripe Webhook] User ${user.id} plan updated to ${newPlan} (subscription.updated)`);
            } else {
              console.warn(`[Stripe Webhook] Unknown price ID ${priceId} for user ${user.id}`);
            }
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID and downgrade
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { plan: "FREE" },
          });
          console.log(`[Stripe Webhook] User ${user.id} downgraded to FREE (subscription cancelled)`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          // Log the payment failure for monitoring / alerting
          console.warn(
            `[Stripe Webhook] Payment failed for user ${user.id} (email: ${user.email}), ` +
            `invoice ${invoice.id}, attempt ${invoice.attempt_count}`
          );

          // Send dunning email
          sendPaymentFailedEmail(user.email, invoice.attempt_count ?? 1).catch(() => {});
        } else {
          console.warn(`[Stripe Webhook] Payment failed for unknown customer ${customerId}, invoice ${invoice.id}`);
        }

        break;
      }

      default:
        // Unhandled event type — log and acknowledge
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  markProcessed(event.id);
  return NextResponse.json({ received: true });
}
