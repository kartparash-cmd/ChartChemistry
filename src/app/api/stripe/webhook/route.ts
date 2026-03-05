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
import type Stripe from "stripe";

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

          // After multiple failed attempts, Stripe will eventually cancel the
          // subscription (handled by customer.subscription.deleted). For now we
          // log a warning so operators can follow up proactively.
          // Future enhancement: send an in-app notification or email to the user.
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

  return NextResponse.json({ received: true });
}
