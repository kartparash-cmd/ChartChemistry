"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompatibilityScoreCard } from "@/components/compatibility-score-card";
import { ScoreBar } from "@/components/score-bar";
import { cn } from "@/lib/utils";

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

export default function SharedResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SharedResults />
    </Suspense>
  );
}

function SharedResults() {
  const prefersReducedMotion = useReducedMotion();
  const searchParams = useSearchParams();

  const nameA = searchParams.get("a") || "Person 1";
  const signA = searchParams.get("as") || "";
  const nameB = searchParams.get("b") || "Person 2";
  const signB = searchParams.get("bs") || "";
  const overall = Number(searchParams.get("o")) || 0;
  const emotional = Number(searchParams.get("e")) || 0;
  const chemistry = Number(searchParams.get("ch")) || 0;
  const communication = Number(searchParams.get("co")) || 0;
  const stability = Number(searchParams.get("st")) || 0;
  const harmony = Number(searchParams.get("h")) || 0;

  // If no score data, redirect to compatibility tool
  if (!overall && !searchParams.get("o")) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No results to display.</p>
          <Button asChild>
            <Link href="/compatibility">Check Your Compatibility</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isHighScore = overall >= 85;
  const emojiA = ZODIAC_SYMBOLS[signA] || "";
  const emojiB = ZODIAC_SYMBOLS[signB] || "";

  const dimensions = [
    { label: "Emotional Connection", score: emotional },
    { label: "Chemistry & Attraction", score: chemistry },
    { label: "Communication Style", score: communication },
    { label: "Long-Term Stability", score: stability },
    { label: "Harmony", score: harmony },
  ];

  return (
    <div className="min-h-screen px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cosmic-purple/30 bg-cosmic-purple/10 px-4 py-1.5 mb-6">
            <Heart className="h-3.5 w-3.5 text-cosmic-purple-light" />
            <span className="text-xs font-semibold text-cosmic-purple-light">Shared Results</span>
          </div>
          <h1 className="font-heading text-3xl font-bold sm:text-4xl mb-2">
            Compatibility Results
          </h1>
          <p className="text-muted-foreground">
            See how {nameA} & {nameB} match up in the stars
          </p>
        </motion.div>

        {/* Names & Signs */}
        <motion.div
          className="flex items-center justify-center gap-6 sm:gap-8"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2 }}
        >
          <div className="text-center">
            <span className="text-3xl">{emojiA}</span>
            <p className="text-lg font-semibold mt-1">{nameA}</p>
            {signA && <p className="text-sm text-muted-foreground">{signA}</p>}
          </div>
          <span className="text-2xl text-cosmic-purple-light">&amp;</span>
          <div className="text-center">
            <span className="text-3xl">{emojiB}</span>
            <p className="text-lg font-semibold mt-1">{nameB}</p>
            {signB && <p className="text-sm text-muted-foreground">{signB}</p>}
          </div>
        </motion.div>

        {/* High score badge */}
        {isHighScore && (
          <motion.div
            className="flex justify-center"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3, type: "spring" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2">
              <Sparkles className="h-5 w-5 text-gold animate-pulse" />
              <span className="text-sm font-semibold text-gold">Cosmic Connection!</span>
              <Sparkles className="h-5 w-5 text-gold animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* Overall Score */}
        <motion.div
          className="flex justify-center"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.4 }}
        >
          <CompatibilityScoreCard
            score={overall}
            label="Overall Compatibility"
            size="lg"
          />
        </motion.div>

        {/* Dimension Scores */}
        <motion.div
          className="glass-card rounded-2xl p-6 space-y-5"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold">Detailed Scores</h3>
          {dimensions.map((dim, i) => (
            <div key={dim.label}>
              <ScoreBar label={dim.label} score={dim.score} delay={0.7 + i * 0.1} />
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="glass-card rounded-2xl p-8 text-center border border-cosmic-purple/30"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 1 }}
        >
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-cosmic-purple-light" />
          <h3 className="font-heading text-xl font-bold mb-2">
            Curious about your own compatibility?
          </h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Go beyond sun signs. Get a full birth chart compatibility analysis powered by AI
            — with detailed scores, synastry aspects, and personalized insights.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              className="rounded-full bg-gradient-to-r from-cosmic-purple to-gold px-8 text-white font-semibold hover:brightness-110 shadow-lg"
            >
              <Link href="/compatibility">
                Check Your Compatibility
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/10">
              <Link href="/quick-match">
                <Users className="mr-2 h-4 w-4" />
                Quick Sun Sign Match
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
