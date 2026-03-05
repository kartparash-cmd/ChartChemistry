import { describe, it, expect, vi } from "vitest";

// Mock the stripe package so it doesn't require a real API key at import time
vi.mock("stripe", () => {
  return {
    default: vi.fn(() => ({})),
  };
});

import { PLANS, isPremiumFeature } from "@/lib/stripe";

describe("PLANS configuration", () => {
  it("has FREE, PREMIUM, and ANNUAL entries", () => {
    expect(PLANS).toHaveProperty("FREE");
    expect(PLANS).toHaveProperty("PREMIUM");
    expect(PLANS).toHaveProperty("ANNUAL");
  });

  it("FREE plan has correct name and zero price", () => {
    expect(PLANS.FREE.name).toBe("Free");
    expect(PLANS.FREE.price).toBe(0);
  });

  it("PREMIUM plan has correct name and price", () => {
    expect(PLANS.PREMIUM.name).toBe("Premium");
    expect(PLANS.PREMIUM.price).toBe(9.99);
  });

  it("ANNUAL plan has correct name and price", () => {
    expect(PLANS.ANNUAL.name).toBe("Annual");
    expect(PLANS.ANNUAL.price).toBe(79.99);
  });

  it("PREMIUM plan has a priceId field", () => {
    expect("priceId" in PLANS.PREMIUM).toBe(true);
  });

  it("ANNUAL plan has a priceId field", () => {
    expect("priceId" in PLANS.ANNUAL).toBe(true);
  });

  it("ANNUAL plan has effectiveMonthly calculated", () => {
    expect(PLANS.ANNUAL.effectiveMonthly).toBe(6.67);
  });

  describe("features arrays", () => {
    it("FREE plan has a non-empty features array", () => {
      expect(Array.isArray(PLANS.FREE.features)).toBe(true);
      expect(PLANS.FREE.features.length).toBeGreaterThan(0);
    });

    it("PREMIUM plan has a non-empty features array", () => {
      expect(Array.isArray(PLANS.PREMIUM.features)).toBe(true);
      expect(PLANS.PREMIUM.features.length).toBeGreaterThan(0);
    });

    it("ANNUAL plan has a non-empty features array", () => {
      expect(Array.isArray(PLANS.ANNUAL.features)).toBe(true);
      expect(PLANS.ANNUAL.features.length).toBeGreaterThan(0);
    });

    it("all features are non-empty strings", () => {
      const allFeatures = [
        ...PLANS.FREE.features,
        ...PLANS.PREMIUM.features,
        ...PLANS.ANNUAL.features,
      ];

      for (const feature of allFeatures) {
        expect(typeof feature).toBe("string");
        expect(feature.length).toBeGreaterThan(0);
      }
    });

    it("PREMIUM plan has more features than FREE plan", () => {
      expect(PLANS.PREMIUM.features.length).toBeGreaterThan(
        PLANS.FREE.features.length
      );
    });
  });
});

describe("isPremiumFeature", () => {
  it("returns true for premium features", () => {
    expect(isPremiumFeature("chat")).toBe(true);
    expect(isPremiumFeature("horoscope")).toBe(true);
    expect(isPremiumFeature("wellness")).toBe(true);
    expect(isPremiumFeature("transits")).toBe(true);
    expect(isPremiumFeature("full-report")).toBe(true);
  });

  it("returns false for non-premium features", () => {
    expect(isPremiumFeature("basic-compatibility")).toBe(false);
    expect(isPremiumFeature("natal-chart")).toBe(false);
    expect(isPremiumFeature("")).toBe(false);
    expect(isPremiumFeature("unknown-feature")).toBe(false);
  });
});
