import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    features: [
      "1 compatibility report per month",
      "Basic synastry overview",
      "Sun/Moon/Rising analysis",
    ],
  },
  PREMIUM: {
    name: "Premium",
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    price: 9.99,
    features: [
      "Unlimited compatibility reports",
      "Full synastry & composite charts",
      "AI chat with astrologer",
      "Detailed narrative reports",
      "Red flags & growth areas",
    ],
  },
  ANNUAL: {
    name: "Annual",
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID,
    price: 79.99,
    features: [
      "Everything in Premium",
      "Priority support",
      "Boutique deep-dive reports",
      "Save 33% vs monthly",
    ],
  },
} as const;
