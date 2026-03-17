"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Stars,
  Brain,
  Heart,
  Sparkles,
  Globe,
  Telescope,
  MessageCircle,
  TrendingUp,
  Bell,
  Sun,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const HOW_IT_WORKS = [
  {
    icon: Telescope,
    title: "Birth Chart Calculation",
    description:
      "We use the Swiss Ephemeris — the same astronomical engine trusted by professional astrologers worldwide — to calculate precise planetary positions, house cusps, and aspects for any birth date, time, and location.",
  },
  {
    icon: Brain,
    title: "AI-Powered Interpretation",
    description:
      "Our Claude AI engine analyzes the complex web of planetary aspects, sign placements, and house overlays in your chart. Rather than generic horoscope text, every reading is uniquely generated based on your specific celestial blueprint.",
  },
  {
    icon: Heart,
    title: "Compatibility Analysis",
    description:
      "By comparing two birth charts through synastry, composite analysis, and house overlays, we reveal the true dynamics of your connection — emotional depth, chemistry, communication patterns, and long-term potential.",
  },
];

const TECHNOLOGY = [
  {
    icon: Globe,
    title: "Swiss Ephemeris",
    description:
      "Astronomical precision down to the arc-second. Our calculations use the same ephemeris data relied upon by NASA and professional astronomers, ensuring your planetary positions are exactly right.",
  },
  {
    icon: Sparkles,
    title: "Claude AI",
    description:
      "Anthropic's Claude provides nuanced, context-aware interpretations of your chart. No cookie-cutter paragraphs — every reading reflects the unique interplay of your specific planetary placements.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Transit Tracking",
    description:
      "Planetary transits are calculated in real time against your natal chart, giving you timely insights about current cosmic influences on your relationships and personal growth.",
  },
];

const OFFERINGS = [
  {
    icon: Sun,
    title: "Natal Chart Analysis",
    description:
      "A complete breakdown of your birth chart — planets, signs, houses, and aspects — with AI-generated interpretations tailored to your unique celestial fingerprint.",
  },
  {
    icon: Heart,
    title: "Compatibility Reports",
    description:
      "Full synastry and composite chart analysis across six key dimensions: emotional connection, chemistry, communication, stability, conflict patterns, and growth potential.",
  },
  {
    icon: Stars,
    title: "Daily Horoscopes",
    description:
      "Personalized daily insights based on current planetary transits to your natal chart, going far beyond generic sun sign horoscopes.",
  },
  {
    icon: Bell,
    title: "Transit Tracking",
    description:
      "View current planetary transits against your natal chart in real time, with significance ratings and AI-powered interpretations to help you understand the cosmic climate.",
  },
  {
    icon: MessageCircle,
    title: "Marie — Personal Astrologer",
    description:
      "Ask questions about your chart, your relationships, or upcoming transits. Marie provides thoughtful, personalized guidance on demand.",
  },
];

export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen">
      {/* ========================= HERO ========================= */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-purple/5 via-transparent to-transparent" />
        <motion.div
          initial={shouldReduceMotion ? "visible" : "hidden"}
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <h1 className="font-heading text-4xl font-bold sm:text-5xl mb-4">
            About{" "}
            <span className="cosmic-text">ChartChemistry</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We believe that the cosmos holds profound insights into human
            connection. ChartChemistry bridges ancient astrological wisdom with
            cutting-edge artificial intelligence to deliver compatibility
            readings that are deeply personal, astronomically precise, and
            genuinely illuminating.
          </p>
        </motion.div>
      </section>

      {/* ========================= MISSION ========================= */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-2xl p-8 sm:p-10 text-center"
          >
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-cosmic-purple/10 text-cosmic-purple-light">
              <Stars className="h-7 w-7" />
            </div>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl mb-4">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For thousands of years, astrology has helped people understand
              themselves and their relationships. But traditional chart readings
              require years of study to interpret, and most online tools reduce
              compatibility to a simplistic sun-sign comparison. ChartChemistry
              changes that. We combine the astronomical precision of the Swiss
              Ephemeris with the interpretive depth of Claude AI to make
              professional-grade astrological analysis accessible to everyone —
              no expertise required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================= HOW IT WORKS ========================= */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-muted-foreground">
              From birth data to deep insight in three steps.
            </p>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-6 grid-cols-1 md:grid-cols-3"
          >
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div key={item.title} variants={fadeInUp} transition={{ duration: 0.5 }}>
                <Card
                  className="glass-card border-white/10 bg-transparent"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cosmic-purple text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cosmic-purple/10 text-cosmic-purple-light">
                        <item.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================= OUR TECHNOLOGY ========================= */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Our Technology
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built on the most trusted tools in astronomy and artificial
              intelligence.
            </p>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-6 grid-cols-1 md:grid-cols-3"
          >
            {TECHNOLOGY.map((item) => (
              <motion.div key={item.title} variants={fadeInUp} transition={{ duration: 0.5 }}>
                <Card
                  className="glass-card border-white/10 bg-transparent"
                >
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-cosmic-purple/10 text-cosmic-purple-light">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================= WHAT WE OFFER ========================= */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              What We Offer
            </h2>
            <p className="mt-3 text-muted-foreground">
              A full suite of astrological tools to explore yourself and your
              relationships.
            </p>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-6 grid-cols-1 md:grid-cols-3"
          >
            {OFFERINGS.map((item) => (
              <motion.div key={item.title} variants={fadeInUp} transition={{ duration: 0.5 }}>
                <Card
                  className="glass-card border-white/10 bg-transparent transition-all hover:border-cosmic-purple/30"
                >
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-cosmic-purple/10 text-cosmic-purple-light">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================= DISCLAIMER ========================= */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={shouldReduceMotion ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-2xl p-8 sm:p-10"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold mb-3">
                  Entertainment Disclaimer
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ChartChemistry is designed for entertainment and
                  self-exploration purposes. While our calculations are
                  astronomically precise and our AI interpretations are
                  thoughtfully crafted, astrology is not a science and should not
                  be used as the sole basis for important life decisions.
                  Compatibility reports are meant to inspire reflection and
                  conversation — not to predict the future or replace
                  professional relationship advice. Always use your own judgment
                  and consult qualified professionals when making significant
                  personal decisions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
