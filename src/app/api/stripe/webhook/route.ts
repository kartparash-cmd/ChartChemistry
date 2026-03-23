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
import * as Sentry from "@sentry/nextjs";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendPaymentFailedEmail, sendReceiptEmail, sendCancellationEmail } from "@/lib/email";
import { logServerEvent } from "@/lib/server-analytics";
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
    console.error(JSON.stringify({ event: "webhook_error", error: "STRIPE_WEBHOOK_SECRET is not set", timestamp: new Date().toISOString() }));
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ event: "webhook_error", error: "Signature verification failed", detail: errMsg, timestamp: new Date().toISOString() }));
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

        if (!userId) {
          console.error(JSON.stringify({ event: "webhook_error", type: event.type, error: "Missing metadata in checkout session", sessionId: session.id, timestamp: new Date().toISOString() }));
          break;
        }

        // --- Handle one-time single report purchase ---
        if (session.mode === "payment" && session.metadata?.type === "single_report") {
          // Idempotency: check if credit already granted for this checkout session
          const existingCredit = await prisma.userAchievement.findFirst({
            where: { userId, achievementType: `single_report_paid:${session.id}` },
          });
          if (existingCredit) {
            console.log(JSON.stringify({ event: "webhook_skipped_already_applied", type: event.type, userId, purchaseType: "single_report", sessionId: session.id, timestamp: new Date().toISOString() }));
            return NextResponse.json({ received: true });
          }

          // Grant a report credit by creating a UserAchievement record
          // The "single_report_credit" achievementType is what the report route checks for
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementType: "single_report_credit",
            },
          });

          // Also record that this specific checkout session was processed (for idempotency)
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementType: `single_report_paid:${session.id}`,
            },
          });

          // Also ensure the Stripe customer ID is stored
          if (session.customer) {
            await prisma.user.update({
              where: { id: userId },
              data: { stripeCustomerId: session.customer as string },
            });
          }

          console.log(JSON.stringify({ event: "webhook_processed", type: event.type, userId, purchaseType: "single_report", sessionId: session.id, timestamp: new Date().toISOString() }));

          // Log revenue event
          logServerEvent("revenue_single_report", { userId, amount: 499, sessionId: session.id });

          // Send receipt email
          const singleReportUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
          });
          if (singleReportUser?.email) {
            sendReceiptEmail(singleReportUser.email, "Single Report", "$4.99").catch((err) => console.warn("[webhook] Email send failed:", err instanceof Error ? err.message : "unknown"));
          }
          break;
        }

        // --- Handle subscription checkout ---
        // Verify plan against actual price paid
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;
        let plan: "PREMIUM" | "ANNUAL" = "PREMIUM";
        if (priceId === PLANS.ANNUAL.priceId) {
          plan = "ANNUAL";
        } else if (priceId === PLANS.PREMIUM.priceId) {
          plan = "PREMIUM";
        }

        // Plan-based idempotency: skip if user already has the correct plan and customer ID
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (existingUser && existingUser.plan === plan && existingUser.stripeCustomerId === (session.customer as string)) {
          console.log(JSON.stringify({ event: "webhook_skipped_already_applied", type: event.type, userId, plan, timestamp: new Date().toISOString() }));
          return NextResponse.json({ received: true });
        }

        // Update user plan
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeCustomerId: session.customer as string,
          },
        });

        console.log(JSON.stringify({ event: "webhook_processed", type: event.type, userId, plan, timestamp: new Date().toISOString() }));

        // Log revenue event for server-side analytics
        const amount = plan === "ANNUAL" ? 7999 : 999;
        logServerEvent("revenue_upgrade", { userId, plan, amount, priceId: priceId ?? "unknown" });

        // Send receipt email
        const updatedUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });
        if (updatedUser?.email) {
          const amount = plan === "ANNUAL" ? "$79.99/yr" : "$9.99/mo";
          sendReceiptEmail(updatedUser.email, plan, amount).catch((err) => console.warn("[webhook] Email send failed:", err instanceof Error ? err.message : "unknown"));
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
          console.error(JSON.stringify({ event: "webhook_error", type: event.type, error: "No user found for Stripe customer", customerId, timestamp: new Date().toISOString() }));
          break;
        }

        // If the subscription is cancelled or unpaid, downgrade to FREE
        if (subscription.status === "canceled" || subscription.status === "unpaid") {
          await prisma.user.update({
            where: { id: user.id },
            data: { plan: "FREE" },
          });
          console.log(JSON.stringify({ event: "webhook_processed", type: event.type, userId: user.id, plan: "FREE", reason: subscription.status, timestamp: new Date().toISOString() }));
          break;
        }

        // For past_due, let Stripe's retry cycle + dunning emails handle it — don't downgrade yet
        if (subscription.status === "past_due") {
          console.log(JSON.stringify({ event: "webhook_grace_period", type: event.type, userId: user.id, status: "past_due", note: "Retaining premium access during Stripe retry cycle", timestamp: new Date().toISOString() }));
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
              console.log(JSON.stringify({ event: "webhook_processed", type: event.type, userId: user.id, plan: newPlan, timestamp: new Date().toISOString() }));
            } else {
              console.warn(JSON.stringify({ event: "webhook_warning", type: event.type, error: "Unknown price ID", priceId, userId: user.id, timestamp: new Date().toISOString() }));
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
          console.log(JSON.stringify({ event: "webhook_processed", type: event.type, userId: user.id, plan: "FREE", reason: "subscription_deleted", timestamp: new Date().toISOString() }));

          // Log churn event for server-side analytics
          logServerEvent("revenue_churn", { userId: user.id, reason: "subscription_deleted" });

          // Fire-and-forget cancellation email
          if (user.email) {
            sendCancellationEmail(user.email).catch((err) => console.warn("[webhook] Cancellation email send failed:", err instanceof Error ? err.message : "unknown"));
          }
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
          console.warn(JSON.stringify({ event: "webhook_warning", type: event.type, userId: user.id, invoiceId: invoice.id, attemptCount: invoice.attempt_count, timestamp: new Date().toISOString() }));

          // Log payment failure for server-side analytics
          logServerEvent("revenue_payment_failed", { userId: user.id, attemptCount: invoice.attempt_count ?? 1, invoiceId: invoice.id });

          // Send dunning email
          sendPaymentFailedEmail(user.email, invoice.attempt_count ?? 1).catch((err) => console.warn("[webhook] Email send failed:", err instanceof Error ? err.message : "unknown"));
        } else {
          console.warn(JSON.stringify({ event: "webhook_warning", type: event.type, error: "Payment failed for unknown customer", customerId, invoiceId: invoice.id, timestamp: new Date().toISOString() }));
        }

        break;
      }

      default:
        // Unhandled event type — log and acknowledge
        console.log(JSON.stringify({ event: "webhook_received", type: event.type, status: "unhandled", timestamp: new Date().toISOString() }));
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);

    // Prisma "not found" errors should return 200 — retrying won't help
    const isPrismaNotFound =
      error instanceof Error &&
      error.name === "PrismaClientKnownRequestError" &&
      "code" in error &&
      (error as { code: string }).code === "P2025";

    if (isPrismaNotFound) {
      console.warn(JSON.stringify({ event: "webhook_warning", type: event.type, error: "Record not found", detail: errMsg, timestamp: new Date().toISOString() }));
      return NextResponse.json({ received: true });
    }

    Sentry.captureException(error);
    console.error(JSON.stringify({ event: "webhook_error", type: event.type, error: errMsg, timestamp: new Date().toISOString() }));
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
