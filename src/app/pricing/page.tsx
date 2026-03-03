"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Star,
  Crown,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BillingPeriod = "monthly" | "annual";

interface PricingTier {
  name: string;
  icon: React.ReactNode;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  oneTimePrice?: string;
  isOneTime?: boolean;
  popular?: boolean;
  features: string[];
  cta: string;
  ctaVariant: "outline" | "default" | "secondary";
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    icon: <Star className="h-5 w-5" />,
    description: "Get started with basic compatibility insights",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "1 basic compatibility check per day",
      "Sun, Moon & Rising comparison",
      "Short AI summary",
      "Shareable results link",
    ],
    cta: "Get Started",
    ctaVariant: "outline",
  },
  {
    name: "Premium",
    icon: <Zap className="h-5 w-5" />,
    description: "Full astrological insights and AI guidance",
    monthlyPrice: 9.99,
    annualPrice: 79.99,
    popular: true,
    features: [
      "Unlimited compatibility checks",
      "Full synastry report (all 7 sections)",
      "AI Astrologer chat",
      "Save unlimited profiles",
      "Red flags & growth insights",
      "Priority support",
    ],
    cta: "Start Free Trial",
    ctaVariant: "default",
  },
  {
    name: "Boutique Reports",
    icon: <Crown className="h-5 w-5" />,
    description: "Premium hand-crafted detailed analysis",
    monthlyPrice: 0,
    annualPrice: 0,
    oneTimePrice: "$14.99 - $29.99",
    isOneTime: true,
    features: [
      "Everything in Premium",
      "Composite chart analysis",
      "Downloadable PDF report",
      "Transit forecast for your relationship",
      "Personalized growth roadmap",
      "30-day relationship forecast",
    ],
    cta: "Purchase Report",
    ctaVariant: "secondary",
  },
];

const comparisonFeatures = [
  {
    feature: "Compatibility checks",
    free: "1 per day",
    premium: "Unlimited",
    boutique: "Unlimited",
  },
  {
    feature: "Sun/Moon/Rising comparison",
    free: true,
    premium: true,
    boutique: true,
  },
  {
    feature: "AI summary",
    free: "Short",
    premium: "Full",
    boutique: "Full + Extended",
  },
  {
    feature: "Synastry report sections",
    free: "1 of 7",
    premium: "All 7",
    boutique: "All 7",
  },
  {
    feature: "AI Astrologer chat",
    free: false,
    premium: true,
    boutique: true,
  },
  {
    feature: "Save profiles",
    free: "1",
    premium: "Unlimited",
    boutique: "Unlimited",
  },
  {
    feature: "Red flags & growth insights",
    free: false,
    premium: true,
    boutique: true,
  },
  {
    feature: "Composite chart",
    free: false,
    premium: false,
    boutique: true,
  },
  {
    feature: "PDF download",
    free: false,
    premium: false,
    boutique: true,
  },
  {
    feature: "Transit forecast",
    free: false,
    premium: false,
    boutique: true,
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-4 w-4 text-emerald-400" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/40" />
    );
  }
  return <span className="text-sm">{value}</span>;
}

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [toastVisible, setToastVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCta = async (tierName: string) => {
    if (tierName === "Free") {
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/auth/signup");
      }
      return;
    }

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // For paid tiers, create a Stripe checkout session
    const plan = tierName === "Premium"
      ? (billing === "annual" ? "ANNUAL" : "PREMIUM")
      : "PREMIUM"; // Boutique falls back to Premium for now

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
      }
    } catch {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-purple/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="mb-4 border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Simple Pricing
            </Badge>
            <h1 className="font-heading text-4xl font-bold sm:text-5xl mb-4">
              Find the plan that{" "}
              <span className="cosmic-text">fits your stars</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Start free and upgrade when you are ready for deeper cosmic
              insights into your relationships.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1"
          >
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                billing === "monthly"
                  ? "bg-cosmic-purple text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-2",
                billing === "annual"
                  ? "bg-cosmic-purple text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <Badge className="bg-gold/20 text-gold text-[10px] font-semibold px-1.5 py-0">
                Save 33%
              </Badge>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-6xl grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={itemVariants}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col transition-all hover:border-white/20",
                tier.popular
                  ? "border-cosmic-purple/40 bg-cosmic-purple/[0.03] shadow-xl shadow-cosmic-purple/5"
                  : "border-white/10 bg-white/[0.02]"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-cosmic-purple text-white shadow-lg">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Tier header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      tier.popular
                        ? "bg-cosmic-purple/20 text-cosmic-purple-light"
                        : "bg-white/5 text-muted-foreground"
                    )}
                  >
                    {tier.icon}
                  </div>
                  <h3 className="font-heading text-xl font-semibold">
                    {tier.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tier.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {tier.isOneTime ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{tier.oneTimePrice}</span>
                    <span className="text-sm text-muted-foreground">
                      one-time
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      ${billing === "annual" ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    {tier.monthlyPrice > 0 && (
                      <span className="text-sm text-muted-foreground">
                        /{billing === "annual" ? "year" : "month"}
                      </span>
                    )}
                  </div>
                )}
                {billing === "annual" &&
                  tier.monthlyPrice > 0 &&
                  !tier.isOneTime && (
                    <p className="mt-1 text-xs text-gold">
                      That is ${(tier.annualPrice / 12).toFixed(2)}/month, saving
                      you $
                      {(tier.monthlyPrice * 12 - tier.annualPrice).toFixed(2)}{" "}
                      per year
                    </p>
                  )}
              </div>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={() => handleCta(tier.name)}
                disabled={loading}
                variant={tier.ctaVariant}
                className={cn(
                  "w-full h-11 font-medium transition-all",
                  tier.popular &&
                    "bg-cosmic-purple hover:bg-cosmic-purple-dark text-white shadow-lg shadow-cosmic-purple/20"
                )}
              >
                {loading ? "Redirecting..." : tier.cta}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Comparison Table */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-medium">
                    Free
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-cosmic-purple-light">
                    Premium
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-medium text-gold">
                    Boutique
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-white/5",
                      i % 2 === 0 && "bg-white/[0.01]"
                    )}
                  >
                    <td className="px-4 py-3 text-sm">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <FeatureValue value={row.free} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <FeatureValue value={row.premium} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <FeatureValue value={row.boutique} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Toast */}
      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-navy-light/95 backdrop-blur-xl px-6 py-3 shadow-xl"
        >
          <p className="text-sm font-medium">
            <Sparkles className="inline mr-1 h-3 w-3 text-cosmic-purple-light" />
            Something went wrong. Please try again or contact support.
          </p>
        </motion.div>
      )}
    </div>
  );
}
