"use client";

import { motion } from "framer-motion";
import { Lock, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompatibilityScoreCard } from "@/components/compatibility-score-card";
import { CompatibilityRadarChart } from "@/components/radar-chart";
import { ScoreBar } from "@/components/score-bar";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface CompatibilityResult {
  personA: {
    name: string;
    sunSign: string;
  };
  personB: {
    name: string;
    sunSign: string;
  };
  overallScore: number;
  dimensions: {
    emotional: number;
    chemistry: number;
    communication: number;
    stability: number;
    harmony: number;
  };
  narrative: string;
}

interface CompatibilityResultsProps {
  result: CompatibilityResult;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "\u2648",
  Taurus: "\u2649",
  Gemini: "\u264A",
  Cancer: "\u264B",
  Leo: "\u264C",
  Virgo: "\u264D",
  Libra: "\u264E",
  Scorpio: "\u264F",
  Sagittarius: "\u2650",
  Capricorn: "\u2651",
  Aquarius: "\u2652",
  Pisces: "\u2653",
};

function getZodiacSymbol(sign: string): string {
  return ZODIAC_SYMBOLS[sign] ?? "";
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* -------------------------------------------------------------------------- */
/*  Blurred Premium Section                                                    */
/* -------------------------------------------------------------------------- */

function LockedSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Blurred placeholder content */}
      <div className="glass-card select-none rounded-2xl p-6 blur-sm">
        <h3 className="mb-3 text-lg font-semibold">{title}</h3>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted/30" />
          <div className="h-4 w-5/6 rounded bg-muted/30" />
          <div className="h-4 w-4/6 rounded bg-muted/30" />
          <div className="h-4 w-full rounded bg-muted/30" />
          <div className="h-4 w-3/6 rounded bg-muted/30" />
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cosmic-purple/20">
          <Lock className="h-5 w-5 text-cosmic-purple-light" />
        </div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-xs text-center text-xs text-muted-foreground">
          {description}
        </p>
        <Button
          size="sm"
          className="mt-1 rounded-full bg-gradient-to-r from-cosmic-purple to-gold px-6 text-sm font-semibold text-white hover:brightness-110"
        >
          Unlock with Premium
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Results Component                                                     */
/* -------------------------------------------------------------------------- */

export function CompatibilityResults({
  result,
  className,
}: CompatibilityResultsProps) {
  const radarData = [
    { dimension: "Emotional", score: result.dimensions.emotional },
    { dimension: "Chemistry", score: result.dimensions.chemistry },
    { dimension: "Communication", score: result.dimensions.communication },
    { dimension: "Stability", score: result.dimensions.stability },
    { dimension: "Harmony", score: result.dimensions.harmony },
  ];

  const dimensionBars = [
    { label: "Emotional Connection", score: result.dimensions.emotional },
    { label: "Chemistry & Attraction", score: result.dimensions.chemistry },
    { label: "Communication Style", score: result.dimensions.communication },
    { label: "Long-Term Stability", score: result.dimensions.stability },
    { label: "Harmony & Flow", score: result.dimensions.harmony },
  ];

  const handleShare = async () => {
    const shareText = `${result.personA.name} ${getZodiacSymbol(result.personA.sunSign)} & ${result.personB.name} ${getZodiacSymbol(result.personB.sunSign)} scored ${result.overallScore}/100 on ChartChemistry!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "ChartChemistry Compatibility Results",
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(
        `${shareText}\n${window.location.href}`
      );
    }
  };

  return (
    <div className={cn("mx-auto max-w-3xl space-y-10", className)}>
      {/* Names & Signs */}
      <motion.div
        className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-8"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">
            {getZodiacSymbol(result.personA.sunSign)}
          </span>
          <p className="text-lg font-semibold">{result.personA.name}</p>
          <p className="text-sm text-muted-foreground">
            {result.personA.sunSign}
          </p>
        </div>

        <span className="text-2xl text-cosmic-purple-light">&amp;</span>

        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl">
            {getZodiacSymbol(result.personB.sunSign)}
          </span>
          <p className="text-lg font-semibold">{result.personB.name}</p>
          <p className="text-sm text-muted-foreground">
            {result.personB.sunSign}
          </p>
        </div>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        className="flex justify-center"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CompatibilityScoreCard
          score={result.overallScore}
          label="Overall Compatibility"
          size="lg"
        />
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        className="glass-card rounded-2xl p-4 sm:p-6"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="mb-2 text-center text-lg font-semibold">
          Dimension Breakdown
        </h3>
        <CompatibilityRadarChart data={radarData} />
      </motion.div>

      {/* Individual Score Bars */}
      <motion.div
        className="glass-card space-y-5 rounded-2xl p-6"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold">Detailed Scores</h3>
        {dimensionBars.map((dim, i) => (
          <ScoreBar
            key={dim.label}
            label={dim.label}
            score={dim.score}
            delay={0.7 + i * 0.1}
          />
        ))}
      </motion.div>

      {/* The Big Picture - AI Narrative */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h3 className="mb-4 text-lg font-semibold">The Big Picture</h3>
        <div className="prose prose-sm prose-invert max-w-none">
          <p className="leading-relaxed text-muted-foreground">
            {result.narrative}
          </p>
        </div>
      </motion.div>

      {/* Locked Premium Sections */}
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <LockedSection
          title="Full Synastry Report"
          description="Detailed analysis of every planetary aspect between your charts, house overlays, and composite chart interpretation."
        />
        <LockedSection
          title="Red Flags & Green Flags"
          description="Specific patterns in your charts that indicate potential challenges and natural strengths in your connection."
        />
        <LockedSection
          title="Growth Areas"
          description="Personalized recommendations for how to nurture your connection and navigate difficult transits together."
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <Button
          onClick={handleShare}
          variant="outline"
          className="w-full rounded-full sm:w-auto"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Your Results
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-full sm:w-auto"
          onClick={() => {
            // Prompt auth if not logged in - for now just alert
            alert("Please sign in to save your report.");
          }}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Save This Report
        </Button>
      </motion.div>
    </div>
  );
}
