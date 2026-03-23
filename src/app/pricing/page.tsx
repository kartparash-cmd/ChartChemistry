"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ChevronDown,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

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
    icon: <Star aria-hidden="true" className="h-5 w-5" />,
    description: "Get started with basic compatibility insights",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "3 compatibility checks per day",
      "Sun, Moon & Rising comparison",
      "Short AI summary",
      "1 free premium compatibility report",
      "Save up to 3 profiles",
    ],
    cta: "Get Started",
    ctaVariant: "outline",
  },
  {
    name: "Premium",
    icon: <Zap aria-hidden="true" className="h-5 w-5" />,
    description: "Full astrological insights, AI guidance, and daily updates",
    monthlyPrice: 9.99,
    annualPrice: 79.99,
    popular: true,
    features: [
      "Unlimited compatibility checks",
      "Full synastry report (all 7 sections)",
      "Marie (personal astrologer)",
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
  { feature: "Marie (personal astrologer)", free: false, premium: true },
  { feature: "Save profiles", free: "3", premium: "20" },
  { feature: "Red flags & growth insights", free: false, premium: true },
  { feature: "Daily horoscope", free: false, premium: true },
  { feature: "Transit alerts", free: false, premium: true },
  { feature: "Wellness insights", free: false, premium: true },
];

const faqItems = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription anytime from your dashboard. No cancellation fees.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards through Stripe, our secure payment processor.",
  },
  {
    question: "What's the difference between free and premium?",
    answer:
      "Free gives you 3 compatibility checks/day with a brief AI summary. Premium unlocks full 7-section reports, daily horoscopes, transit tracking, AI chat, wellness insights, and more.",
  },
  {
    question: "Is my birth data secure?",
    answer:
      "Absolutely. Your data is encrypted and stored securely. We never share personal information with third parties.",
  },
  {
    question: "Can I switch between monthly and annual?",
    answer:
      "Yes, you can switch plans anytime from your account settings.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "If you're not satisfied, contact our support team within 7 days of purchase.",
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check aria-hidden="true" className="h-4 w-4 text-emerald-400" />
    ) : (
      <X aria-hidden="true" className="h-4 w-4 text-muted-foreground/40" />
    );
  }
  return <span className="text-sm">{value}</span>;
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PricingContent />
    </Suspense>
  );
}

function PricingContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const cancelled = searchParams.get("cancelled") === "true";
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [toastVisible, setToastVisible] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [showCancelledBanner, setShowCancelledBanner] = useState(cancelled);

  useEffect(() => {
    trackEvent("pricing_view");
  }, []);

  const handleCta = async (tierName: string) => {
    trackEvent("checkout_click", { plan: tierName === "Free" ? "free" : billing });

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
        body: JSON.stringify({
          plan,
          ...(callbackUrl ? { callbackUrl } : {}),
        }),
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

  const handleSingleReport = async () => {
    trackEvent("checkout_click", { plan: "single_report" });

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setLoadingTier("SingleReport");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "SINGLE_REPORT",
          ...(callbackUrl ? { callbackUrl } : {}),
        }),
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
      {/* Cancelled Checkout Banner */}
      {showCancelledBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-auto max-w-3xl mt-20 mb-[-3rem] px-4"
        >
          <div className="relative rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <button
              onClick={() => setShowCancelledBanner(false)}
              className="absolute top-3 right-3 text-muted-foreground/60 hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-sm text-muted-foreground pr-6">
              Changed your mind? No pressure — you can upgrade anytime. Your
              free tier still includes 3 daily compatibility checks.
            </p>
          </div>
        </motion.div>
      )}

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
              <Sparkles aria-hidden="true" className="mr-1 h-3 w-3" />
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
                <Badge className="bg-gold/20 text-gold text-[11px] font-semibold px-1.5 py-0">
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
          <Users aria-hidden="true" className="h-4 w-4 text-cosmic-purple-light" />
          <p className="text-sm font-medium">
            Join stargazers exploring cosmic compatibility
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
                    <Sparkles aria-hidden="true" className="mr-1 h-3 w-3" />
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
                    <Check aria-hidden="true" className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
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
                {loadingTier !== tier.name && <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />}
              </Button>
              {tier.monthlyPrice > 0 && (
                <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Shield aria-hidden="true" className="h-3 w-3" />
                  Secure payment powered by Stripe
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Single Report Option */}
      <section className="px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-auto max-w-4xl"
        >
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/15">
              <FileText aria-hidden="true" className="h-6 w-6 text-gold" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-heading text-lg font-semibold mb-1">
                Just need one report?
              </h3>
              <p className="text-sm text-muted-foreground">
                Get a single full 7-section premium compatibility report without a subscription.
                Perfect for a one-time deep dive into your cosmic connection.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">$4.99</span>
                <span className="text-xs text-muted-foreground">one-time</span>
              </div>
              <Button
                onClick={handleSingleReport}
                disabled={loadingTier !== null}
                variant="outline"
                className="whitespace-nowrap border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
              >
                {loadingTier === "SingleReport" ? "Redirecting..." : "Buy Single Report"}
                {loadingTier !== "SingleReport" && <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
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
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                      Free
                    </span>
                    <FeatureValue value={row.free} />
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-cosmic-purple/[0.05] p-2">
                    <span className="text-[11px] uppercase tracking-wider text-cosmic-purple-light mb-1">
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
                      {billing === "annual" ? "That's $6.67/mo" : "$9.99/mo"}
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

      {/* FAQ */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-heading text-2xl font-bold mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to know about ChartChemistry
            </p>
          </motion.div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20 open:border-cosmic-purple/30 open:bg-cosmic-purple/[0.03]"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium select-none list-none [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">
            What Users Are Saying
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
                  "Marie is like having a personal astrologer on call 24/7. I asked about my Venus opposition and got a nuanced, thoughtful answer instantly. Upgrading to Premium was a no-brainer.",
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
                <Quote aria-hidden="true" className="h-5 w-5 text-cosmic-purple-light/50 mb-3" />
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

      {/* Toast */}
      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 md:bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/10 bg-navy-light/95 backdrop-blur-xl px-6 py-3 shadow-xl"
        >
          <p className="text-sm font-medium">
            <Sparkles aria-hidden="true" className="inline mr-1 h-3 w-3 text-cosmic-purple-light" />
            Something went wrong. Please try again or contact support.
          </p>
        </motion.div>
      )}
    </div>
  );
}
