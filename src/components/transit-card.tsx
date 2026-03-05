"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Zap, Activity, TrendingUp, CircleDot, Sparkles, Loader2, ChevronDown, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Orb-based urgency classification
// ---------------------------------------------------------------------------

type UrgencyLevel = "peak" | "active" | "building" | "approaching";

interface UrgencyConfig {
  label: string;
  icon: typeof Zap;
  badgeClass: string;
  dotClass: string;
}

function getUrgencyLevel(orb: number): UrgencyLevel {
  if (orb < 1) return "peak";
  if (orb <= 3) return "active";
  if (orb <= 5) return "building";
  return "approaching";
}

const urgencyConfigs: Record<UrgencyLevel, UrgencyConfig> = {
  peak: {
    label: "Peak now",
    icon: Zap,
    badgeClass: "border-red-400/40 bg-red-400/15 text-red-300",
    dotClass: "bg-red-400 animate-pulse",
  },
  active: {
    label: "Active",
    icon: Activity,
    badgeClass: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    dotClass: "bg-amber-400",
  },
  building: {
    label: "Building",
    icon: TrendingUp,
    badgeClass: "border-white/15 bg-white/5 text-muted-foreground",
    dotClass: "bg-muted-foreground",
  },
  approaching: {
    label: "Approaching",
    icon: CircleDot,
    badgeClass: "border-white/10 bg-white/[0.03] text-muted-foreground/60",
    dotClass: "bg-muted-foreground/50",
  },
};

// ---------------------------------------------------------------------------
// Duration estimate based on planet speed and orb
// ---------------------------------------------------------------------------

const PLANET_DAYS_PER_DEGREE: Record<string, number> = {
  Sun: 1,
  Moon: 0.083, // ~2 hours per degree
  Mercury: 1.5,
  Venus: 1.5,
  Mars: 2.5,
  Jupiter: 12,
  Saturn: 14,
  Uranus: 20,
  Neptune: 25,
  Pluto: 30,
};

const OUTER_PLANETS = new Set(["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]);

function getDurationLabel(planet: string, orb: number): string {
  const daysPerDeg = PLANET_DAYS_PER_DEGREE[planet] ?? 2;
  const totalDays = orb * daysPerDeg;

  if (planet === "Moon") {
    const hours = Math.max(1, Math.round(totalDays * 24));
    return `~${hours}h remaining`;
  }

  if (OUTER_PLANETS.has(planet)) {
    const weeks = Math.max(1, Math.round(totalDays / 7));
    return `~${weeks}w remaining`;
  }

  const days = Math.max(1, Math.round(totalDays));
  return `~${days}d remaining`;
}

// Planet glyphs for astrological display
const planetGlyphs: Record<string, string> = {
  Sun: "\u2609",
  Moon: "\u263D",
  Mercury: "\u263F",
  Venus: "\u2640",
  Mars: "\u2642",
  Jupiter: "\u2643",
  Saturn: "\u2644",
  Uranus: "\u2645",
  Neptune: "\u2646",
  Pluto: "\u2647",
  "North Node": "\u260A",
  "South Node": "\u260B",
  Chiron: "\u26B7",
};

// Aspect symbols for display
const aspectSymbols: Record<string, string> = {
  conjunction: "\u260C",
  opposition: "\u260D",
  trine: "\u25B3",
  square: "\u25A1",
  sextile: "\u2731",
  quincunx: "\u26BB",
  semisextile: "\u26BA",
  semisquare: "\u2220",
  sesquiquadrate: "\u2A1E",
};

// Brief descriptions for transit aspects
const transitDescriptions: Record<string, Record<string, string>> = {
  conjunction: {
    default: "Intensifies and merges energies, bringing focus and new beginnings.",
    Sun: "Illuminates and energizes, spotlighting this area of life.",
    Moon: "Heightens emotions and instincts around this theme.",
    Mercury: "Sharpens thinking and communication in this domain.",
    Venus: "Enhances harmony, attraction, and creative expression.",
    Mars: "Drives action, ambition, and assertiveness here.",
    Jupiter: "Expands opportunities and brings growth and optimism.",
    Saturn: "Brings structure, responsibility, and long-term lessons.",
    Uranus: "Sparks sudden change, innovation, and breakthroughs.",
    Neptune: "Dissolves boundaries, heightens intuition and idealism.",
    Pluto: "Triggers deep transformation and empowerment.",
  },
  opposition: {
    default: "Creates tension that demands balance and awareness between opposing forces.",
  },
  trine: {
    default: "Flows harmoniously, bringing ease and natural talent to this area.",
  },
  square: {
    default: "Generates friction that pushes growth through challenges and action.",
  },
  sextile: {
    default: "Opens doors for opportunity when effort and initiative are applied.",
  },
  quincunx: {
    default: "Requires adjustment and adaptation to integrate mismatched energies.",
  },
};

function getTransitDescription(aspect: string, transitingPlanet: string): string {
  const aspectDescs = transitDescriptions[aspect];
  if (!aspectDescs) {
    return "A subtle planetary influence shaping your current experience.";
  }
  return aspectDescs[transitingPlanet] || aspectDescs.default;
}

export interface TransitData {
  transitingPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
  keywords: string;
  significance: "high" | "medium" | "low";
}

interface TransitCardProps {
  transit: TransitData;
  index: number;
  isPremium?: boolean;
}

const significanceConfig = {
  high: {
    badge: "High Impact",
    badgeClass: "border-red-400/30 bg-red-400/10 text-red-400",
    cardBorder: "border-red-400/20 hover:border-red-400/40",
    glowClass: "from-red-400/[0.08] via-gold/[0.04] to-transparent",
    dotClass: "bg-red-400",
  },
  medium: {
    badge: "Medium",
    badgeClass: "border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light",
    cardBorder: "border-cosmic-purple/20 hover:border-cosmic-purple/40",
    glowClass: "from-cosmic-purple/[0.06] to-transparent",
    dotClass: "bg-cosmic-purple-light",
  },
  low: {
    badge: "Subtle",
    badgeClass: "border-white/10 bg-white/5 text-muted-foreground",
    cardBorder: "border-white/10 hover:border-white/20",
    glowClass: "from-white/[0.02] to-transparent",
    dotClass: "bg-muted-foreground",
  },
};

export function TransitCard({ transit, index, isPremium = false }: TransitCardProps) {
  const config = significanceConfig[transit.significance];
  const planetGlyph = planetGlyphs[transit.transitingPlanet] || "";
  const natalGlyph = planetGlyphs[transit.natalPlanet] || "";
  const aspectSymbol = aspectSymbols[transit.aspect] || transit.aspect;
  const description = getTransitDescription(transit.aspect, transit.transitingPlanet);

  // Orb-based urgency
  const urgencyLevel = getUrgencyLevel(transit.orb);
  const urgency = urgencyConfigs[urgencyLevel];
  const UrgencyIcon = urgency.icon;
  const durationLabel = getDurationLabel(transit.transitingPlanet, transit.orb);

  // AI explanation state
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleExplain = async () => {
    // If we already have an explanation, just toggle visibility
    if (explanation) {
      setShowExplanation((prev) => !prev);
      return;
    }

    setExplanationLoading(true);
    setExplanationError(null);

    try {
      const res = await fetch("/api/transits/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transitingPlanet: transit.transitingPlanet,
          natalPlanet: transit.natalPlanet,
          aspect: transit.aspect,
          orb: transit.orb,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setExplanationError(
          errData.error || "Failed to generate explanation. Please try again."
        );
        setExplanationLoading(false);
        return;
      }

      const data = await res.json();
      setExplanation(data.explanation);
      setShowExplanation(true);
    } catch {
      setExplanationError("Failed to connect. Please try again.");
    } finally {
      setExplanationLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border bg-white/[0.03] backdrop-blur-sm transition-all duration-300",
          config.cardBorder
        )}
      >
        {/* Subtle gradient background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br pointer-events-none",
            config.glowClass
          )}
        />

        <CardContent className="relative p-5">
          {/* Top row: planets + aspect + badges */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              {/* Transiting planet */}
              <div className="flex flex-col items-center">
                <span className="text-2xl leading-none" title={transit.transitingPlanet}>
                  {planetGlyph}
                </span>
                <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                  {transit.transitingPlanet}
                </span>
              </div>

              {/* Aspect arrow */}
              <div className="flex flex-col items-center px-1">
                <span className="text-lg text-muted-foreground" title={transit.aspect}>
                  {aspectSymbol}
                </span>
                <span className="text-xs text-muted-foreground/60 mt-0.5 capitalize">
                  {transit.aspect}
                </span>
              </div>

              {/* Natal planet */}
              <div className="flex flex-col items-center">
                <span className="text-2xl leading-none" title={`Natal ${transit.natalPlanet}`}>
                  {natalGlyph}
                </span>
                <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                  {transit.natalPlanet}
                </span>
              </div>
            </div>

            {/* Badges: significance + urgency */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Badge
                variant="outline"
                className={cn("text-xs", config.badgeClass)}
              >
                <span
                  className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1", config.dotClass)}
                />
                {config.badge}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-[11px] px-2 py-0.5", urgency.badgeClass)}
              >
                <UrgencyIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                {urgency.label}
              </Badge>
            </div>
          </div>

          {/* Orb + duration row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Orb:</span>
              <span className="text-xs font-medium text-foreground">
                {transit.orb.toFixed(1)}&deg;
              </span>
              {transit.orb < 1 && (
                <span className="text-xs text-gold font-medium">
                  (exact)
                </span>
              )}
            </div>
            <span className="text-muted-foreground/30">|</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground/70" aria-hidden="true" />
              <span className="text-xs text-muted-foreground/70">{durationLabel}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Keywords */}
          {transit.keywords && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
              <ArrowRight className="h-3 w-3 shrink-0" />
              <span className="italic">{transit.keywords}</span>
            </div>
          )}

          {/* AI Explanation section */}
          <div className="mt-3 pt-3 border-t border-white/5">
            {isPremium ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExplain}
                  disabled={explanationLoading}
                  className="h-7 px-2 text-xs text-cosmic-purple-light hover:text-foreground hover:bg-white/5"
                >
                  {explanationLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" aria-hidden="true" />
                      Generating...
                    </>
                  ) : explanation ? (
                    <>
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 mr-1.5 transition-transform duration-200",
                          showExplanation && "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                      {showExplanation ? "Hide explanation" : "Show explanation"}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1.5" aria-hidden="true" />
                      Explain this transit
                    </>
                  )}
                </Button>

                {/* Error state */}
                {explanationError && (
                  <p className="mt-2 text-xs text-red-400">
                    {explanationError}
                  </p>
                )}

                {/* Explanation content */}
                <AnimatePresence>
                  {showExplanation && explanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 rounded-lg bg-cosmic-purple/[0.06] border border-cosmic-purple/10 p-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-cosmic-purple-light shrink-0 mt-0.5" aria-hidden="true" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {explanation}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>Upgrade to unlock AI explanations</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
