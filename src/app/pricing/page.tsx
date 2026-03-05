"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Star,
  Zap,
  ArrowRight,
  Users,
  Shield,
  Quote,
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
      "3 compatibility checks per day",
      "Sun, Moon & Rising comparison",
      "Short AI summary",
      "Save up to 3 profiles",
    ],
    cta: "Get Started",
    ctaVariant: "outline",
  },
  {
    name: "Premium",
    icon: <Zap className="h-5 w-5" />,
    description: "Full astrological insights, AI guidance, and daily updates",
    monthlyPrice: 9.99,
    annualPrice: 79.99,
    popular: true,
    features: [
      "Unlimited compatibility checks",
      "Full synastry report (all 7 sections)",
      "AI Astrologer chat",
      "Save up to 20 profiles",
      "Red flags & growth insights",
      "Daily personalized horoscope",
      "Transit alerts & timeline",
      "Wellness insights",
    ],
    cta: "Start Premium",
    ctaVariant: "default",
  },
];

const comparisonFeatures = [
  { feature: "Compatibility checks", free: "3 per day", premium: "Unlimited" },
  { feature: "Sun/Moon/Rising comparison", free: true, premium: true },
  { feature: "AI summary", free: "Short", premium: "Full" },
  { feature: "Synastry report sections", free: "1 of 7", premium: "All 7" },
  { feature: "AI Astrologer chat", free: false, premium: true },
  { feature: "Save profiles", free: "3", premium: "20" },
  { feature: "Red flags & growth insights", free: false, premium: true },
  { feature: "Daily horoscope", free: false, premium: true },
  { feature: "Transit alerts", free: false, premium: true },
  { feature: "Wellness insights", free: false, premium: true },
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
  const [billing, setBilling] = useState<BillingPeriod>("annual");
  const [toastVisible, setToastVisible] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

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

    // For Premium, determine billing period from the toggle
    const plan = billing === "annual" ? "ANNUAL" : "PREMIUM";

    setLoadingTier(tierName);
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
      setLoadingTier(null);
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
            className="mt-8 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1">
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
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Cancel anytime. No commitment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Counter */}
      <section className="px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto max-w-4xl flex items-center justify-center gap-2 text-muted-foreground"
        >
          <Users className="h-4 w-4 text-cosmic-purple-light" />
          <p className="text-sm font-medium">
            Join 2,000+ stargazers exploring cosmic compatibility
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl grid grid-cols-1 gap-6 md:grid-cols-2"
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
                {billing === "annual" && tier.monthlyPrice > 0 && (
                  <>
                    <p className="mt-1 text-xs text-gold">
                      That&apos;s $6.67/month — save 33%
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-emerald-400">
                      You save $39.89/year
                    </p>
                  </>
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
                disabled={loadingTier !== null}
                variant={tier.ctaVariant}
                className={cn(
                  "w-full h-11 font-medium transition-all",
                  tier.popular &&
                    "bg-cosmic-purple hover:bg-cosmic-purple-dark text-white shadow-lg shadow-cosmic-purple/20"
                )}
              >
                {loadingTier === tier.name ? "Redirecting..." : tier.cta}
                {loadingTier !== tier.name && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
              {tier.monthlyPrice > 0 && (
                <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  Secure payment powered by Stripe
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "The full synastry report is worth every cent of Premium. Seven sections of detailed analysis — I finally understood why my Scorpio-Taurus pairing has such intense push and pull. No other app goes this deep.",
                name: "Sarah K.",
                sign: "Scorpio",
              },
              {
                quote:
                  "The AI Astrologer chat is like having a personal astrologer on call 24/7. I asked about my Venus opposition and got a nuanced, thoughtful answer instantly. Upgrading to Premium was a no-brainer.",
                name: "Marcus T.",
                sign: "Leo",
              },
              {
                quote:
                  "I track my daily horoscope every morning and the accuracy is genuinely startling. It flagged an emotionally intense week before it happened. Premium pays for itself in clarity alone.",
                name: "Priya R.",
                sign: "Pisces",
              },
            ].map((testimonial) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl border border-white/10 p-6 flex flex-col"
              >
                <Quote className="h-5 w-5 text-cosmic-purple-light/50 mb-3" />
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-gold text-gold"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground flex-1 mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-cosmic-purple-light">
                    {testimonial.sign}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">
            Feature Comparison
          </h2>
          {/* Mobile Cards */}
          <div className="space-y-3 sm:hidden">
            {comparisonFeatures.map((row) => (
              <div
                key={row.feature}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <p className="text-sm font-medium mb-3">{row.feature}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center rounded-lg bg-white/[0.03] p-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Free
                    </span>
                    <FeatureValue value={row.free} />
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-cosmic-purple/[0.05] p-2">
                    <span className="text-[10px] uppercase tracking-wider text-cosmic-purple-light mb-1">
                      Premium
                    </span>
                    <FeatureValue value={row.premium} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
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
                    <span>Premium</span>
                    <span className="block text-xs font-normal text-emerald-400 mt-0.5">
                      Annual: $6.67/mo
                    </span>
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
          className="fixed bottom-24 md:bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-navy-light/95 backdrop-blur-xl px-6 py-3 shadow-xl"
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
