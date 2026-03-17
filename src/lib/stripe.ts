import Stripe from "stripe";

let _stripe: Stripe | null = null;

/** Lazy-initialized Stripe client (build-compatible — won't throw at import time). */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead — kept for backward compat */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    features: [
      "Basic compatibility check (3/day)",
      "Natal chart viewing",
      "Sun, Moon & Rising comparison",
      "Short AI summary",
      "Shareable results link",
    ],
  },
  PREMIUM: {
    name: "Premium",
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    price: 9.99,
    period: "mo" as const,
    features: [
      "Unlimited compatibility checks",
      "Full synastry report (all 7 sections)",
      "Marie (personal astrologer)",
      "Daily personalized horoscope",
      "Wellness insights",
      "Transit tracking & alerts",
      "Save up to 20 profiles",
      "Red flags & growth insights",
      "Priority support",
    ],
  },
  ANNUAL: {
    name: "Annual",
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID,
    price: 79.99,
    period: "yr" as const,
    effectiveMonthly: 6.67,
    features: [
      "Everything in Premium",
      "Best value — $6.67/mo effective",
    ],
  },
} as const;

/**
 * Check whether a given feature key requires a premium (PREMIUM or ANNUAL) plan.
 * Use this in API routes and page guards to gate access.
 */
export function isPremiumFeature(feature: string): boolean {
  const premiumFeatures = ['chat', 'horoscope', 'wellness', 'transits', 'full-report'];
  return premiumFeatures.includes(feature);
}
