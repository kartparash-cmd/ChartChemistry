"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export function TransitCard({ transit, index }: TransitCardProps) {
  const config = significanceConfig[transit.significance];
  const planetGlyph = planetGlyphs[transit.transitingPlanet] || "";
  const natalGlyph = planetGlyphs[transit.natalPlanet] || "";
  const aspectSymbol = aspectSymbols[transit.aspect] || transit.aspect;
  const description = getTransitDescription(transit.aspect, transit.transitingPlanet);

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
          {/* Top row: planets + aspect + badge */}
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

            {/* Significance badge */}
            <Badge
              variant="outline"
              className={cn("text-xs shrink-0", config.badgeClass)}
            >
              <span
                className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1", config.dotClass)}
              />
              {config.badge}
            </Badge>
          </div>

          {/* Orb display */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">Orb:</span>
            <span className="text-xs font-medium text-foreground">
              {transit.orb.toFixed(1)}&deg;
            </span>
            {transit.orb <= 1 && (
              <span className="text-xs text-gold">
                (exact)
              </span>
            )}
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
