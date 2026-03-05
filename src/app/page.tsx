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
  Star,
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
    title: "Harmony & Conflict",
    description:
      "Mars-Mars aspects, trines, square tensions, and Pluto dynamics that reveal harmony indicators and conflict patterns in your relationship.",
  },
  {
    icon: TrendingUp,
    title: "Growth Potential",
    description:
      "North Node connections, Jupiter aspects, and 9th house overlays that show how you evolve together.",
  },
];

const SOCIAL_PROOF = [
  {
    value: "2,000+",
    label: "Charts Generated",
    description: "Cosmic explorers have mapped their natal charts and discovered their planetary placements.",
  },
  {
    value: "6",
    label: "Dimensions Analyzed",
    description: "Every report examines emotional, physical, communication, stability, conflict, and growth layers.",
  },
  {
    value: "92%",
    label: "Say \"Eerily Accurate\"",
    description: "Users report that our AI-powered synastry insights resonated deeply with their lived experiences.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Chart Chemistry revealed patterns in my relationships I never saw before. The compatibility insights are eerily accurate.",
    name: "Jamie L.",
    sign: "\u264A Gemini",
  },
  {
    quote:
      "I check my dashboard every morning. The transit alerts help me navigate my day with so much more clarity.",
    name: "Alex R.",
    sign: "\u264D Virgo",
  },
  {
    quote:
      "Finally an astrology app that goes beyond sun signs. The full natal chart analysis blew my mind.",
    name: "Taylor M.",
    sign: "\u2652 Aquarius",
  },
];

const PRICING_TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    annualNote: "",
    description: "Get a taste of real compatibility analysis",
    features: [
      "3 compatibility checks per day",
      "Sun, Moon & Rising comparison",
      "Short AI summary",
      "Save up to 3 profiles",
    ],
    cta: "Get Started Free",
    href: "/compatibility",
    featured: false,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/mo",
    annualNote: "or $6.67/mo billed annually",
    description: "Full reports, AI chat, daily horoscope & more",
    features: [
      "Unlimited compatibility checks",
      "Full synastry report (all 7 sections)",
      "AI Astrologer chat & daily horoscope",
      "Transit alerts & wellness insights",
      "Red flags & growth insights",
      "Cancel anytime",
    ],
    cta: "Start Premium",
    href: "/pricing",
    featured: true,
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

          <motion.p
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <Users className="h-4 w-4" />
            Trusted by 2,000+ cosmic explorers
          </motion.p>
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

      {/* ========================= SOCIAL PROOF ========================= */}
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
              Join Thousands Discovering Cosmic Connections
            </h2>
            <p className="mt-3 text-muted-foreground">
              Real charts. Real insights. See why people keep coming back.
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {SOCIAL_PROOF.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="glass-card group flex flex-col items-center gap-4 rounded-2xl p-8 text-center transition-all hover:border-cosmic-purple/30"
              >
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

      {/* ========================= TESTIMONIALS ========================= */}
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
            <h2 className="text-3xl font-bold sm:text-4xl">What Users Say</h2>
            <p className="mt-3 text-muted-foreground">
              Real feedback from our cosmic community.
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-6 grid-cols-1 lg:grid-cols-3"
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {TESTIMONIALS.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="glass-card group flex flex-col gap-4 rounded-2xl p-6 transition-all hover:border-cosmic-purple/30"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="flex-1 text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold">
                    {testimonial.name}
                  </span>
                  <span className="rounded-full bg-cosmic-purple/10 px-3 py-1 text-xs font-medium text-cosmic-purple-light">
                    {testimonial.sign}
                  </span>
                </div>
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
              Simple Pricing
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto"
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
                {tier.annualNote && (
                  <p className="mt-1 text-xs text-cosmic-purple-light">
                    {tier.annualNote}
                  </p>
                )}
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
