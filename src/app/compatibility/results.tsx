"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  Heart,
  Copy,
  UserPlus,
  Compass,
  Send,
  Star,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompatibilityScoreCard } from "@/components/compatibility-score-card";
import { CompatibilityRadarChart } from "@/components/radar-chart";
import { ScoreBar } from "@/components/score-bar";
import { Confetti } from "@/components/confetti";
import { cn } from "@/lib/utils";
import { getPercentile } from "@/lib/percentile";
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
  isTrial?: boolean;
}

interface CompatibilityResultsProps {
  result: CompatibilityResult;
  personAData?: BirthData | null;
  personBData?: BirthData | null;
  remainingChecks?: number | null;
  reportId?: string | null;
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
  remainingChecks,
  reportId: initialReportId,
  className,
}: CompatibilityResultsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const isPremium =
    session?.user?.plan === "PREMIUM" || session?.user?.plan === "ANNUAL";

  const isHighScore = result.overallScore >= 85;

  // First-check celebration: fires once when the component first mounts
  const hasShownCelebration = useRef(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (hasShownCelebration.current || prefersReducedMotion) return;
    hasShownCelebration.current = true;
    setShowCelebration(true);
  }, [prefersReducedMotion]);

  // Track report ID (from initial prop or after generating a full report)
  const [reportId, setReportId] = useState<string | null>(initialReportId ?? null);

  // Premium report state
  const [premiumReport, setPremiumReport] = useState<PremiumReport | null>(null);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumError, setPremiumError] = useState("");

  // Trial report state: tracks whether the displayed report was a free trial
  const [isTrialReport, setIsTrialReport] = useState(false);
  // Tracks whether the free user has already used their trial (set when the API returns 403)
  const [trialUsed, setTrialUsed] = useState(false);

  // Save state
  const [saved, setSaved] = useState(false);

  // Share toast state
  const [shareToast, setShareToast] = useState(false);

  // Link-copy toast state
  const [linkCopied, setLinkCopied] = useState(false);

  // "Send to them" copy state
  const [sendCopied, setSendCopied] = useState(false);

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

  // Build the best share URL: report link if saved, otherwise the site
  const getShareUrl = useCallback(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://chartchemistry.com";
    return reportId ? `${origin}/report/${reportId}` : `${origin}/compatibility`;
  }, [reportId]);

  const getShareText = useCallback(() => {
    const emoji1 = getZodiacSymbol(result.personA.sunSign);
    const emoji2 = getZodiacSymbol(result.personB.sunSign);
    return `${emoji1} ${result.personA.name} & ${emoji2} ${result.personB.name} scored ${result.overallScore}% compatible on ChartChemistry!`;
  }, [result]);

  const handleShare = async () => {
    const text = getShareText();
    const url = getShareUrl();

    if (navigator.share) {
      try {
        await navigator.share({ title: "ChartChemistry Compatibility", text, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const text = getShareText();
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  const handleShareWhatsApp = () => {
    const text = getShareText();
    const url = getShareUrl();
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank");
  };

  const handleShareTwitter = () => {
    const text = getShareText();
    const url = getShareUrl();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleSendToThem = async () => {
    const url = getShareUrl();
    const shareText = `I just checked our compatibility on ChartChemistry \u2014 we scored ${result.overallScore}%! Check it out: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${result.personA.name} & ${result.personB.name} \u2014 ChartChemistry`,
          text: shareText,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setSendCopied(true);
        setTimeout(() => setSendCopied(false), 2500);
      } catch {
        // Clipboard not available
      }
    }
  };

  const handleGenerateFullReport = async () => {
    if (!personAData || !personBData) return;

    // Redirect unauthenticated users to sign up first
    if (!session) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pendingCompatibilityResults", JSON.stringify({
          personAData, personBData, result,
        }));
      }
      router.push(`/auth/signup?callbackUrl=${encodeURIComponent("/compatibility?restored=true")}`);
      return;
    }

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
        // If user's free trial has been used, mark it so the UI can update
        if (res.status === 403) {
          setTrialUsed(true);
        }
        throw new Error(err.message || "Failed to generate premium report");
      }

      const data = await res.json();
      if (data.id) {
        setReportId(data.id);
      }
      if (data.isTrial) {
        setIsTrialReport(true);
      }
      setPremiumReport({
        sections: data.sections || {},
        redFlags: data.redFlags || [],
        growthAreas: data.growthAreas || [],
        isTrial: data.isTrial || false,
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
      {/* Confetti celebration on first result or high scores */}
      {!prefersReducedMotion && (
        <Confetti trigger={showCelebration || isHighScore} />
      )}

      {/* Names & Signs */}
      <motion.div
        className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-8"
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
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

      {/* Cosmic Connection Badge (high scores only) */}
      {isHighScore && (
        <motion.div
          className="flex justify-center"
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.15, type: "spring", stiffness: 200 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-gold animate-pulse" />
            <span className="text-sm font-semibold tracking-wide text-gold">
              Cosmic Connection!
            </span>
            <Sparkles className="h-5 w-5 text-gold animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Overall Score */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.2 }}
        role="figure"
        aria-label={`Compatibility score: ${result.overallScore} out of 100`}
      >
        <CompatibilityScoreCard
          score={result.overallScore}
          label="Overall Compatibility"
          size="lg"
        />
        {/* Percentile Badge */}
        {(() => {
          const percentileData = getPercentile(result.overallScore);
          if (!percentileData.label) return null;
          return (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.5, type: "spring" }}
            >
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                  percentileData.isRare
                    ? "border border-gold/40 bg-gold/10 text-gold"
                    : "border border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light"
                )}
              >
                {percentileData.isRare && (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                )}
                <span>{percentileData.label}</span>
                {percentileData.isRare && (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                )}
              </div>
            </motion.div>
          );
        })()}
      </motion.div>

      {/* ── Quick Share Bar (right after score — the viral moment) ── */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.35 }}
      >
        <p className="text-xs text-muted-foreground">Share your results</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            onClick={handleShareWhatsApp}
            size="sm"
            className="rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs h-8 px-3"
          >
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
            WhatsApp
          </Button>
          <Button
            onClick={handleShareTwitter}
            size="sm"
            className="rounded-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-xs h-8 px-3"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Twitter / X
          </Button>
          <Button
            onClick={handleCopyLink}
            size="sm"
            variant="outline"
            className="rounded-full border-white/20 text-xs h-8 px-3"
          >
            {linkCopied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
          <Button
            onClick={handleShare}
            size="sm"
            variant="outline"
            className="rounded-full border-white/20 text-xs h-8 px-3"
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        className="glass-card rounded-2xl p-4 sm:p-6"
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.4 }}
      >
        <h3 className="mb-2 text-center text-lg font-semibold">
          Dimension Breakdown
        </h3>
        <CompatibilityRadarChart data={radarData} />
      </motion.div>

      {/* Individual Score Bars */}
      <motion.div
        className="glass-card space-y-5 rounded-2xl p-6"
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.6 }}
      >
        <h3 className="text-lg font-semibold">Detailed Scores</h3>
        {dimensionBars.map((dim, i) => (
          <div
            key={dim.label}
            role="meter"
            aria-label={`${dim.label}: ${dim.score} out of 100`}
            aria-valuenow={dim.score}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <ScoreBar
              label={dim.label}
              score={dim.score}
              delay={prefersReducedMotion ? 0 : 0.7 + i * 0.1}
            />
          </div>
        ))}
      </motion.div>

      {/* The Big Picture - AI Narrative */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.8 }}
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
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 1 }}
      >
        {premiumReport ? (
          /* ---- Premium content unlocked ---- */
          <>
            {/* Trial report banner */}
            {isTrialReport && (
              <div className="rounded-2xl border border-gold/30 bg-gold/10 p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-gold" />
                  <h3 className="text-sm font-semibold text-gold">
                    Free Trial Report
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  This was your complimentary premium report. Upgrade for unlimited full reports, AI chat, and more.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                >
                  <Link href="/pricing">
                    Upgrade for Unlimited Reports
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}

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
        ) : !trialUsed ? (
          /* ---- Free/unauth user eligible for trial: show trial CTA + locked sections ---- */
          <>
            <div className="glass-card rounded-2xl p-8 text-center border border-gold/20">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 mb-4">
                <Star className="h-4 w-4 text-gold" />
                <span className="text-xs font-semibold text-gold">Complimentary</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Get Your First Full Report &mdash; Free!
              </h3>
              <p className="mb-5 text-sm text-muted-foreground max-w-md mx-auto">
                Experience the full premium compatibility report with all 7 synastry sections,
                red flags, growth insights, and cosmic advice &mdash; on us.
              </p>
              {premiumError && (
                <div className="mb-4 flex items-center justify-center gap-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {premiumError}
                </div>
              )}
              {session ? (
                <Button
                  onClick={handleGenerateFullReport}
                  disabled={premiumLoading || !personAData || !personBData}
                  className="rounded-full bg-gradient-to-r from-gold to-cosmic-purple px-8 text-sm font-semibold text-white hover:brightness-110"
                >
                  {premiumLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Your Free Report...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Free Full Report
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleGenerateFullReport}
                  className="rounded-full bg-gradient-to-r from-gold to-cosmic-purple px-8 text-sm font-semibold text-white hover:brightness-110"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up to Get Your Free Report
                </Button>
              )}
            </div>

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
        ) : (
          /* ---- Free user who has used their trial: show upgrade CTA + locked sections ---- */
          <>
            <div className="glass-card rounded-2xl p-8 text-center">
              <Lock className="mx-auto mb-3 h-8 w-8 text-cosmic-purple-light" />
              <h3 className="mb-2 text-lg font-semibold">
                Upgrade to Premium for Unlimited Full Reports
              </h3>
              <p className="mb-5 text-sm text-muted-foreground max-w-md mx-auto">
                You have used your free trial report. Upgrade to Premium for unlimited full
                compatibility reports, Marie (personal astrologer), daily horoscopes, and more.
              </p>
              <Button
                asChild
                className="rounded-full bg-cosmic-purple hover:bg-cosmic-purple-dark px-8 text-sm font-semibold text-white"
              >
                <Link href="/pricing">
                  <Sparkles className="mr-2 h-4 w-4" />
                  View Premium Plans
                </Link>
              </Button>
            </div>

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

      {/* "Send to them" viral CTA */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-cosmic-purple/40 bg-gradient-to-br from-cosmic-purple/10 via-pink-500/5 to-gold/10 p-8 text-center"
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 1.2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cosmic-purple/5 via-transparent to-pink-500/5 pointer-events-none" />
        <div className="relative">
          <Heart className="mx-auto mb-3 h-10 w-10 text-pink-400" />
          <h3 className="mb-1 text-xl font-bold">
            Curious what {result.personB.name} thinks?
          </h3>
          <p className="mx-auto mb-2 max-w-md text-sm text-muted-foreground">
            Send {result.personB.name} your results and see if they feel the
            cosmic connection too.
          </p>
          <p className="mx-auto mb-6 max-w-sm rounded-lg border border-white/5 bg-white/[0.03] px-4 py-2 text-xs italic text-muted-foreground/70">
            &ldquo;I just checked our compatibility on ChartChemistry &mdash; we
            scored {result.overallScore}%! Check it out&rdquo;
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={handleSendToThem}
              className="w-full rounded-full bg-gradient-to-r from-cosmic-purple to-pink-500 px-8 text-sm font-semibold text-white shadow-lg shadow-cosmic-purple/20 hover:brightness-110 sm:w-auto"
            >
              {sendCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Message Copied!
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to {result.personB.name}
                </>
              )}
            </Button>
            <Button
              onClick={handleShareWhatsApp}
              size="sm"
              className="w-full rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white sm:w-auto"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </div>
      </motion.div>

      {/* What to do next */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 1.3 }}
      >
        <h3 className="mb-5 text-center text-lg font-semibold">
          What to Do Next
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Sign up to save + get free report (unauthenticated) */}
          {!session && (
            <Link
              href={`/auth/signup?callbackUrl=${encodeURIComponent("/compatibility?restored=true")}`}
              className="group flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/[0.05] p-4 transition-colors hover:border-gold/40 hover:bg-gold/[0.08]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15">
                <UserPlus className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold group-hover:text-gold">
                  Sign up &mdash; get your first full report free
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Create a free account to save this result and unlock a complimentary 7-section premium report.
                </p>
              </div>
            </Link>
          )}

          {/* Save report (authenticated, not yet saved) */}
          {session && !saved && (
            <button
              onClick={handleSave}
              className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-cosmic-purple/30 hover:bg-white/[0.06] text-left w-full"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cosmic-purple/15">
                <Bookmark className="h-4 w-4 text-cosmic-purple-light" />
              </div>
              <div>
                <p className="text-sm font-semibold group-hover:text-cosmic-purple-light">
                  Save this report
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Keep this compatibility result in your dashboard for future reference.
                </p>
              </div>
            </button>
          )}

          {/* Get full premium report (logged in + free tier, no premium report yet) */}
          {session && !isPremium && !premiumReport && !trialUsed && (
            <button
              onClick={handleGenerateFullReport}
              disabled={premiumLoading || !personAData || !personBData}
              className="group flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/[0.05] p-4 transition-colors hover:border-gold/40 hover:bg-gold/[0.08] text-left w-full"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15">
                <Star className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold group-hover:text-gold">
                  Get your first full report &mdash; free!
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your complimentary premium report with all 7 dimensions, red flags, and cosmic advice.
                </p>
              </div>
            </button>
          )}
          {session && !isPremium && !premiumReport && trialUsed && (
            <Link
              href="/pricing"
              className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-gold/30 hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15">
                <Star className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold group-hover:text-gold">
                  Upgrade to Premium for unlimited full reports
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Unlock unlimited reports with all 7 dimensions, AI chat, daily horoscopes, and more.
                </p>
              </div>
            </Link>
          )}

          {/* Explore your natal chart */}
          <Link
            href="/chart/new"
            className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-cosmic-purple/30 hover:bg-white/[0.06]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cosmic-purple/15">
              <Compass className="h-4 w-4 text-cosmic-purple-light" />
            </div>
            <div>
              <p className="text-sm font-semibold group-hover:text-cosmic-purple-light">
                Explore your natal chart
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Discover your full birth chart with planetary positions, houses, and aspects.
              </p>
            </div>
          </Link>

          {/* Check another pairing */}
          <Link
            href="/compatibility"
            className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-cosmic-purple/30 hover:bg-white/[0.06]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500/15">
              <RefreshCw className="h-4 w-4 text-pink-400" />
            </div>
            <div>
              <p className="text-sm font-semibold group-hover:text-pink-400">
                Check another pairing
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Curious about someone else? Run another compatibility check.
              </p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Remaining checks badge */}
      {typeof remainingChecks === "number" && (
        <motion.div
          className="flex justify-center"
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 1.4 }}
        >
          {remainingChecks > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-cosmic-purple-light" />
              {remainingChecks} free {remainingChecks === 1 ? "check" : "checks"}{" "}
              remaining today
            </div>
          ) : (
            <div className="inline-flex flex-col items-center gap-2 rounded-2xl border border-cosmic-purple/20 bg-cosmic-purple/5 px-5 py-3 text-center">
              <p className="text-xs text-muted-foreground">
                You&apos;ve used all free checks today.{" "}
                <Link
                  href="/pricing"
                  className="font-medium text-cosmic-purple-light underline underline-offset-2 hover:text-cosmic-purple"
                >
                  Upgrade for unlimited
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Share toast */}
      {shareToast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 md:bottom-6">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
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
