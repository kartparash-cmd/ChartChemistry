"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Users,
  Sparkles,
  Heart,
  Flame,
  MessageCircle,
  Shield,
  Swords,
  TrendingUp,
  Check,
  ArrowRight,
  FileText,
  Layers,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/star-field";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    icon: Calendar,
    title: "Enter Your Birth Details",
    description:
      "Date, time, and place of birth for accurate planetary positions.",
  },
  {
    icon: Users,
    title: "Add Your Person",
    description:
      "Enter the birth details of the person you want to explore compatibility with.",
  },
  {
    icon: Sparkles,
    title: "Get Deep Insights",
    description:
      "Receive AI-powered analysis of your synastry, composite chart, and more.",
  },
];

const DIMENSIONS = [
  {
    icon: Heart,
    title: "Emotional Connection",
    description:
      "Moon compatibility, Venus aspects, and water house overlays that reveal how deeply you connect emotionally.",
  },
  {
    icon: Flame,
    title: "Chemistry & Attraction",
    description:
      "Mars-Venus interaspects, 5th and 8th house activity, and Pluto contacts that fuel passion and desire.",
  },
  {
    icon: MessageCircle,
    title: "Communication Style",
    description:
      "Mercury aspects, air sign emphasis, and 3rd house connections that shape how you talk and listen.",
  },
  {
    icon: Shield,
    title: "Long-Term Stability",
    description:
      "Saturn aspects, fixed sign presence, and 4th/10th house overlays that determine staying power.",
  },
  {
    icon: Swords,
    title: "Conflict Patterns",
    description:
      "Mars-Mars aspects, square tensions, and Pluto dynamics that reveal how you handle disagreements.",
  },
  {
    icon: TrendingUp,
    title: "Growth Potential",
    description:
      "North Node connections, Jupiter aspects, and 9th house overlays that show how you evolve together.",
  },
];

const BETA_STATS = [
  {
    icon: FileText,
    value: "500+",
    label: "Reports Generated",
    description: "Compatibility reports created by early users exploring their cosmic connections.",
  },
  {
    icon: Layers,
    value: "6",
    label: "Dimensions Analyzed",
    description: "Every report examines emotional, physical, communication, stability, conflict, and growth layers.",
  },
  {
    icon: Zap,
    value: "Real-time",
    label: "AI-Powered Insights",
    description: "Claude AI interprets your synastry and composite charts the moment you submit.",
  },
];

const PRICING_TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Get a taste of real compatibility analysis",
    features: [
      "3 compatibility checks per day",
      "Sun, Moon & Rising comparison",
      "Short AI summary",
      "Shareable results link",
    ],
    cta: "Get Started Free",
    href: "/compatibility",
    featured: false,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/mo",
    description: "Full reports with detailed AI analysis",
    features: [
      "Unlimited compatibility checks",
      "Full synastry report (all 7 sections)",
      "AI Astrologer chat",
      "Save unlimited profiles",
      "Red flags & growth insights",
      "Priority support",
    ],
    cta: "Start Premium",
    href: "/pricing",
    featured: true,
  },
  {
    name: "Annual",
    price: "$79.99",
    period: "/yr",
    description: "Best value — save over 30%",
    features: [
      "Everything in Premium",
      "Daily personalized horoscope",
      "Transit alerts & timeline",
      "Wellness insights",
      "Priority support",
    ],
    cta: "Save with Annual",
    href: "/pricing",
    featured: false,
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ========================= HERO ========================= */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 text-center">
        <StarField className="z-0" />

        <motion.div
          className="relative z-10 mx-auto max-w-3xl space-y-6"
          initial={shouldReduceMotion ? "visible" : "hidden"}
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1
            className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            Stop judging compatibility{" "}
            <span className="cosmic-text">by sun signs.</span>
          </motion.h1>

          <motion.p
            className="text-xl font-medium text-cosmic-purple-light sm:text-2xl md:text-3xl"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            Go 10 layers deeper.
          </motion.p>

          <motion.p
            className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            ChartChemistry uses full synastry charts, composite analysis, house
            overlays, and AI to reveal the true dynamics of your connection
            &mdash; beyond what any horoscope can tell you.
          </motion.p>

          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
            <Button
              asChild
              size="lg"
              className="mt-4 h-14 rounded-full bg-gradient-to-r from-cosmic-purple to-gold px-8 text-base font-semibold text-white shadow-lg transition-all hover:shadow-cosmic-purple/40 hover:shadow-xl hover:brightness-110 focus-visible:ring-2 focus-visible:ring-cosmic-purple-light focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Link href="/compatibility">
                Check Your Compatibility &mdash; Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Gradient fade at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ========================= HOW IT WORKS ========================= */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="text-center"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground">
              Three simple steps to understand your cosmic connection.
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="glass-card group relative flex flex-col items-center gap-4 rounded-2xl p-8 text-center transition-all hover:border-cosmic-purple/30"
              >
                {/* Step number */}
                <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-cosmic-purple text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cosmic-purple/10 text-cosmic-purple-light transition-colors group-hover:bg-cosmic-purple/20">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================= WHAT WE ANALYZE ========================= */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="text-center"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">What We Analyze</h2>
            <p className="mt-3 text-muted-foreground">
              Six dimensions of compatibility, powered by real astrological
              techniques.
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {DIMENSIONS.map((dim) => (
              <motion.div
                key={dim.title}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="glass-card group rounded-2xl p-6 transition-all hover:border-cosmic-purple/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cosmic-purple/10 text-cosmic-purple-light transition-colors group-hover:bg-cosmic-purple/20">
                  <dim.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{dim.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {dim.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================= JOIN THE BETA ========================= */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="text-center"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              We&apos;re in Beta
            </h2>
            <p className="mt-3 text-muted-foreground">
              ChartChemistry is growing. Be among the first to explore
              AI-powered compatibility insights.
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {BETA_STATS.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="glass-card group flex flex-col items-center gap-4 rounded-2xl p-8 text-center transition-all hover:border-cosmic-purple/30"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cosmic-purple/10 text-cosmic-purple-light transition-colors group-hover:bg-cosmic-purple/20">
                  <stat.icon className="h-7 w-7" />
                </div>
                <p className="text-3xl font-bold cosmic-text">{stat.value}</p>
                <h3 className="text-lg font-semibold">{stat.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================= PRICING ========================= */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="text-center"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Choose Your Depth
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start free. Go deeper when you&apos;re ready.
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {PRICING_TIERS.map((tier) => (
              <motion.div
                key={tier.name}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className={cn(
                  "relative flex flex-col rounded-2xl p-6",
                  tier.featured
                    ? "border-2 border-cosmic-purple bg-cosmic-purple/5 shadow-lg shadow-cosmic-purple/10"
                    : "glass-card"
                )}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cosmic-purple to-gold px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}

                <h3 className="text-xl font-bold">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tier.description}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cosmic-purple-light" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    "mt-6 w-full rounded-full font-semibold",
                    tier.featured
                      ? "bg-gradient-to-r from-cosmic-purple to-gold text-white hover:brightness-110"
                      : ""
                  )}
                  variant={tier.featured ? "default" : "outline"}
                >
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer is rendered globally in layout.tsx */}
    </div>
  );
}
