"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Share2,
  Bookmark,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompatibilityScoreCard } from "@/components/compatibility-score-card";
import { CompatibilityRadarChart } from "@/components/radar-chart";
import { ScoreBar } from "@/components/score-bar";
import { cn } from "@/lib/utils";
import type { BirthData } from "@/components/birth-data-form";

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

interface PremiumReport {
  sections: Record<string, string>;
  redFlags: string[];
  growthAreas: string[];
}

interface CompatibilityResultsProps {
  result: CompatibilityResult;
  personAData?: BirthData | null;
  personBData?: BirthData | null;
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

const PREMIUM_SECTION_LABELS: Record<string, string> = {
  theBigPicture: "The Big Picture",
  communicationStyle: "Communication Style",
  emotionalLandscape: "Emotional Landscape",
  passionAndAttraction: "Passion & Attraction",
  longTermPotential: "Long-Term Potential",
  challengeZones: "Challenge Zones",
  cosmicAdvice: "Cosmic Advice",
};

/* -------------------------------------------------------------------------- */
/*  Blurred Premium Section (for free users)                                   */
/* -------------------------------------------------------------------------- */

function LockedSection({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
        <Badge variant="outline" className="ml-auto text-xs border-cosmic-purple/30 text-cosmic-purple-light">
          Premium
        </Badge>
      </div>
      <div className="relative">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {title.includes("Synastry") && "Your full synastry reveals 7 detailed dimensions of compatibility — from emotional bonds and communication patterns to long-term stability and challenge zones..."}
          {title.includes("Red Flags") && "We found specific areas that need attention in your relationship. Understanding these patterns early can help you navigate challenges together..."}
          {title.includes("Growth") && "Your charts reveal powerful growth opportunities. These cosmic connections can help you both evolve and deepen your bond..."}
        </p>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>
      <div className="mt-4 text-center">
        <Button asChild size="sm" className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
          <Link href="/pricing">
            Unlock Full Report
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helper: geocode + create profile + generate full report                    */
/* -------------------------------------------------------------------------- */

async function geocodeBirthData(
  data: BirthData
): Promise<BirthData & { latitude: number; longitude: number; timezone: string }> {
  if (data.latitude && data.longitude && data.timezone) {
    return data as BirthData & { latitude: number; longitude: number; timezone: string };
  }

  const res = await fetch(
    `/api/geocode?city=${encodeURIComponent(data.birthCity)}&country=${encodeURIComponent(data.birthCountry)}`
  );
  if (!res.ok) throw new Error(`Could not geocode "${data.birthCity}"`);
  const geo = await res.json();
  return { ...data, latitude: geo.latitude, longitude: geo.longitude, timezone: geo.timezone };
}

async function createProfile(data: BirthData & { latitude: number; longitude: number; timezone: string }): Promise<string> {
  const res = await fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      birthDate: data.birthDate,
      birthTime: data.birthTime || null,
      birthCity: data.birthCity,
      birthCountry: data.birthCountry,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to save profile for ${data.name}`);
  }
  const json = await res.json();
  return json.profile.id;
}

/* -------------------------------------------------------------------------- */
/*  Main Results Component                                                     */
/* -------------------------------------------------------------------------- */

export function CompatibilityResults({
  result,
  personAData,
  personBData,
  className,
}: CompatibilityResultsProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const isPremium =
    session?.user?.plan === "PREMIUM" || session?.user?.plan === "ANNUAL";

  // Premium report state
  const [premiumReport, setPremiumReport] = useState<PremiumReport | null>(null);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumError, setPremiumError] = useState("");

  // Save state
  const [saved, setSaved] = useState(false);

  // Share toast state
  const [shareToast, setShareToast] = useState(false);

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
    { label: "Harmony", score: result.dimensions.harmony },
  ];

  const handleShare = async () => {
    const shareText = `${result.personA.name} (${result.personA.sunSign}) & ${result.personB.name} (${result.personB.sunSign}) scored ${result.overallScore}/100 on ChartChemistry! Check your compatibility at chartchemistry.com`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "ChartChemistry Compatibility Results",
          text: shareText,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  const handleGenerateFullReport = async () => {
    if (!personAData || !personBData) return;
    setPremiumLoading(true);
    setPremiumError("");

    try {
      // Geocode both persons if coordinates are missing
      const [geoA, geoB] = await Promise.all([
        geocodeBirthData(personAData),
        geocodeBirthData(personBData),
      ]);

      // Create birth profiles
      const [person1Id, person2Id] = await Promise.all([
        createProfile(geoA),
        createProfile(geoB),
      ]);

      // Generate full premium report
      const res = await fetch("/api/compatibility/full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ person1Id, person2Id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to generate premium report");
      }

      const data = await res.json();
      setPremiumReport({
        sections: data.sections || {},
        redFlags: data.redFlags || [],
        growthAreas: data.growthAreas || [],
      });
      setSaved(true); // Full report is auto-saved by the API
    } catch (e) {
      setPremiumError(
        e instanceof Error ? e.message : "Something went wrong"
      );
    } finally {
      setPremiumLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session) {
      // Save results to sessionStorage before redirect
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pendingCompatibilityResults", JSON.stringify({
          personAData, personBData, result,
        }));
      }
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/compatibility?restored=true")}`);
      return;
    }

    if (premiumReport) {
      setSaved(true);
      return;
    }

    if (isPremium && personAData && personBData) {
      await handleGenerateFullReport();
      return;
    }

    // Free user — save to localStorage as bookmark
    try {
      const key = `cc_report_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(result));
      setSaved(true);
    } catch {
      // localStorage might be full or unavailable
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

      {/* Premium Sections */}
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.5, delay: 1 }}
      >
        {premiumReport ? (
          /* ---- Premium content unlocked ---- */
          <>
            {Object.entries(premiumReport.sections)
              .filter(([key]) => key !== "theBigPicture")
              .map(([key, content]) => (
                <div key={key} className="glass-card rounded-2xl p-6">
                  <h3 className="mb-3 text-lg font-semibold">
                    {PREMIUM_SECTION_LABELS[key] || key}
                  </h3>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
                      {content}
                    </p>
                  </div>
                </div>
              ))}

            {premiumReport.redFlags.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="mb-3 text-lg font-semibold text-red-400">
                  Red Flags
                </h3>
                <ul className="space-y-2">
                  {premiumReport.redFlags.map((flag, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5 text-red-400">&#9679;</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {premiumReport.growthAreas.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="mb-3 text-lg font-semibold text-green-400">
                  Growth Areas
                </h3>
                <ul className="space-y-2">
                  {premiumReport.growthAreas.map((area, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5 text-green-400">&#9679;</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : isPremium ? (
          /* ---- Premium user: show generate button ---- */
          <div className="glass-card rounded-2xl p-8 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-cosmic-purple-light" />
            <h3 className="mb-2 text-lg font-semibold">
              Full Premium Report Available
            </h3>
            <p className="mb-5 text-sm text-muted-foreground max-w-md mx-auto">
              Get detailed synastry analysis, red flags, growth insights,
              growth areas, and personalized cosmic advice.
            </p>
            {premiumError && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                {premiumError}
              </div>
            )}
            <Button
              onClick={handleGenerateFullReport}
              disabled={premiumLoading || !personAData || !personBData}
              className="rounded-full bg-gradient-to-r from-cosmic-purple to-gold px-8 text-sm font-semibold text-white hover:brightness-110"
            >
              {premiumLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Full Report
                </>
              )}
            </Button>
          </div>
        ) : (
          /* ---- Free user: show locked sections ---- */
          <>
            <LockedSection
              title="Full Synastry Report"
              icon={<Lock className="h-5 w-5 text-cosmic-purple-light" />}
            />
            <LockedSection
              title="Red Flags & Growth Insights"
              icon={<AlertCircle className="h-5 w-5 text-red-400" />}
            />
            <LockedSection
              title="Growth Areas"
              icon={<Sparkles className="h-5 w-5 text-green-400" />}
            />
          </>
        )}
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
          disabled={saved}
          onClick={handleSave}
        >
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Report Saved
            </>
          ) : (
            <>
              <Bookmark className="mr-2 h-4 w-4" />
              Save This Report
            </>
          )}
        </Button>
      </motion.div>

      {/* Share toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-background/90 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm"
          >
            <Check className="h-4 w-4 text-green-500" />
            Results copied!
          </motion.div>
        </div>
      )}
    </div>
  );
}
