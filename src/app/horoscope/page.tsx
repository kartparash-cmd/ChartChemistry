"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sun,
  Sparkles,
  Loader2,
  RefreshCw,
  Clock,
  Lightbulb,
  ArrowRight,
  AlertTriangle,
  LayoutDashboard,
  X,
  Heart,
  Activity,
  Lock,
  Briefcase,
  Hash,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function isAstroServiceError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("unreachable") ||
    lower.includes("unavailable") ||
    lower.includes("could not connect") ||
    lower.includes("fetch") ||
    lower.includes("service") ||
    lower.includes("temporarily")
  );
}

// --- Mercury Retrograde Periods for 2026 ---
const MERCURY_RETROGRADE_2026 = [
  { start: new Date(2026, 2, 15), end: new Date(2026, 3, 7) },   // Mar 15 - Apr 7
  { start: new Date(2026, 6, 18), end: new Date(2026, 7, 11) },  // Jul 18 - Aug 11
  { start: new Date(2026, 10, 9), end: new Date(2026, 10, 29) }, // Nov 9 - Nov 29
];

function isMercuryRetrograde(date: Date): boolean {
  return MERCURY_RETROGRADE_2026.some(
    (period) => date >= period.start && date <= period.end
  );
}

// --- Moon Phase Calculation ---
// Reference new moon: January 6, 2000 18:14 UTC
const KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
const SYNODIC_MONTH = 29.53058867; // days

interface MoonPhaseInfo {
  emoji: string;
  label: string;
  dayInCycle: number;
}

function getMoonPhase(date: Date): MoonPhaseInfo {
  const diffMs = date.getTime() - KNOWN_NEW_MOON.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const dayInCycle = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  // 8 phases, each ~3.69 days
  const phaseIndex = Math.floor((dayInCycle / SYNODIC_MONTH) * 8) % 8;

  const phases: { emoji: string; label: string }[] = [
    { emoji: "\u{1F311}", label: "New Moon" },
    { emoji: "\u{1F312}", label: "Waxing Crescent" },
    { emoji: "\u{1F313}", label: "First Quarter" },
    { emoji: "\u{1F314}", label: "Waxing Gibbous" },
    { emoji: "\u{1F315}", label: "Full Moon" },
    { emoji: "\u{1F316}", label: "Waning Gibbous" },
    { emoji: "\u{1F317}", label: "Last Quarter" },
    { emoji: "\u{1F318}", label: "Waning Crescent" },
  ];

  return { ...phases[phaseIndex], dayInCycle: Math.round(dayInCycle) };
}

interface Horoscope {
  date: string;
  userName: string;
  overview: string;
  love: string;
  career: string;
  wellness: string;
  cosmicTip: string;
  luckyTime: string;
  luckyNumber: number;
  luckyColor: string;
  mood: string;
  // Legacy fields (backward compat)
  summary?: string;
  body?: string;
}

const MOOD_CONFIG: Record<string, { color: string; icon: string }> = {
  energetic: { color: "text-orange-400", icon: "⚡" },
  reflective: { color: "text-blue-400", icon: "🌙" },
  passionate: { color: "text-red-400", icon: "🔥" },
  calm: { color: "text-teal-400", icon: "🌊" },
  adventurous: { color: "text-yellow-400", icon: "🧭" },
  expansive: { color: "text-gold", icon: "✨" },
  grounded: { color: "text-emerald-400", icon: "🌿" },
  transformative: { color: "text-cosmic-purple-light", icon: "🦋" },
  playful: { color: "text-yellow-400", icon: "⭐" },
  intense: { color: "text-orange-400", icon: "⚡" },
  harmonious: { color: "text-teal-400", icon: "🌊" },
};

export default function HoroscopePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrogradedismissed, setRetrogradeDissmissed] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const now = useMemo(() => new Date(), []);
  const mercuryRetrograde = useMemo(() => isMercuryRetrograde(now), [now]);
  const moonPhase = useMemo(() => getMoonPhase(now), [now]);

  // Animation variants that respect reduced motion preferences
  const fadeUp = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
  const fadeUpSmall = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };
  const fadeIn = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 } };
  const scaleIn = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 } };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.user?.plan === "FREE") {
      setLoading(false);
      return;
    }
    fetchHoroscope();
  }, [status, session?.user?.plan]);

  const fetchHoroscope = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/horoscope");
      const data = await res.json();

      if (res.ok) {
        setHoroscope(data);
        setFetchedAt(new Date());
      } else {
        setError(data.message || data.error || "Failed to load horoscope");
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cosmic-purple-light" />
      </div>
    );
  }

  if (!session) return null;

  // Premium gate — return upgrade CTA early for free users
  if (session?.user?.plan === "FREE") {
    return (
      <div className="min-h-screen">
        <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
          <div className="mx-auto max-w-3xl px-4 py-10 text-center">
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">
              Your Daily <span className="cosmic-text">Horoscope</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Personalized to your full natal chart — not just your sun sign
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
          {/* Upgrade CTA */}
          <div className="text-center py-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
            <Lock className="h-8 w-8 text-cosmic-purple-light mx-auto mb-3" />
            <h2 className="text-xl font-semibold cosmic-text mb-2">Unlock Daily Horoscopes</h2>
            <p className="text-muted-foreground mb-1">
              AI-generated daily horoscope based on your actual chart placements
            </p>
            <p className="text-xs text-muted-foreground/70 mb-5">
              Not generic sun sign readings -- personalized to your full natal chart every day
            </p>
            <Button asChild className="cosmic-gradient text-white" aria-label="Upgrade to Premium for daily horoscopes">
              <Link href="/pricing">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Link>
            </Button>
          </div>

          {/* Blurred preview of horoscope content */}
          <div className="relative select-none pointer-events-none" aria-hidden="true">
            {/* Mood + Summary preview */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cosmic-purple/[0.06] to-transparent p-6 opacity-50 blur-[2px] mb-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✨</span>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Today&apos;s Energy
                  </p>
                  <p className="text-lg font-semibold text-gold capitalize">
                    Expansive
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-white/10" />
                <div className="h-4 w-5/6 rounded bg-white/10" />
              </div>
            </div>

            {/* Cosmic Tip + Lucky Time preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gold/20 bg-gold/[0.04] p-5 opacity-50 blur-[2px]">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-gold" />
                  <h3 className="text-sm font-semibold text-gold">
                    Cosmic Tip
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-white/10" />
                  <div className="h-3 w-3/4 rounded bg-white/10" />
                </div>
              </div>

              <div className="rounded-xl border border-cosmic-purple/20 bg-cosmic-purple/[0.04] p-5 opacity-50 blur-[2px]">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-cosmic-purple-light" />
                  <h3 className="text-sm font-semibold text-cosmic-purple-light">
                    Best Time Window
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-white/10" />
                  <div className="h-3 w-2/3 rounded bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const moodConfig = horoscope
    ? MOOD_CONFIG[horoscope.mood] || MOOD_CONFIG.harmonious
    : MOOD_CONFIG.harmonious;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <motion.div
            initial={fadeUp.initial}
            animate={fadeUp.animate}
          >
            <Badge
              variant="outline"
              className="mb-4 border-gold/30 bg-gold/10 text-gold"
            >
              <Sun className="mr-1 h-3 w-3" />
              {today}
            </Badge>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">
              Your Daily <span className="cosmic-text">Horoscope</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Personalized to your full natal chart — not just your sun sign
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mercury Retrograde Banner */}
      <AnimatePresence>
        {mercuryRetrograde && !retrogradedismissed && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            className="mx-auto max-w-3xl px-4 pt-4"
          >
            <div role="alert" className="relative flex items-start gap-3 rounded-2xl bg-amber-400/10 px-5 py-4 text-amber-400">
              <span className="mt-0.5 text-lg shrink-0" aria-hidden="true">
                ☿
              </span>
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">Mercury is in retrograde</span>{" "}
                — expect communication challenges and tech glitches. Double-check
                important messages.
              </p>
              <button
                onClick={() => setRetrogradeDissmissed(true)}
                className="absolute right-3 top-3 rounded-lg p-1 text-amber-400/60 transition-colors hover:bg-amber-400/10 hover:text-amber-400"
                aria-label="Dismiss Mercury retrograde banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {loading ? (
          <motion.div
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            className="flex flex-col items-center gap-4 py-20"
          >
            <div className="relative">
              <div className={cn("h-16 w-16 rounded-full bg-cosmic-purple/10", !prefersReducedMotion && "animate-pulse")} />
              <Sparkles className={cn("absolute inset-0 m-auto h-8 w-8 text-cosmic-purple-light", !prefersReducedMotion && "animate-spin")} />
            </div>
            <p className="text-sm text-muted-foreground">
              Reading the stars for you...
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={fadeUpSmall.initial}
            animate={fadeUpSmall.animate}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm"
          >
            <motion.div
              initial={scaleIn.initial}
              animate={scaleIn.animate}
              transition={prefersReducedMotion ? undefined : { delay: 0.1, type: "spring", stiffness: 200 }}
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/10"
            >
              {isAstroServiceError(error) ? (
                <AlertTriangle className="h-7 w-7 text-amber-400" />
              ) : (
                <Sun className="h-7 w-7 text-cosmic-purple-light" />
              )}
            </motion.div>
            <h2 className="font-heading text-lg font-semibold mb-2">
              {isAstroServiceError(error)
                ? "Service Temporarily Unavailable"
                : "Set Up Your Birth Chart"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {isAstroServiceError(error)
                ? "Our astrology calculation service is currently being updated. Please try again shortly."
                : error}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {isAstroServiceError(error) ? (
                <>
                  <Button
                    onClick={fetchHoroscope}
                    className="bg-cosmic-purple text-white hover:bg-cosmic-purple-dark"
                    aria-label="Retry loading horoscope"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/10"
                    aria-label="Navigate to dashboard"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                    aria-label="Create your birth profile"
                  >
                    <Link href="/dashboard/profiles">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Your Birth Profile
                    </Link>
                  </Button>
                  <Button
                    onClick={fetchHoroscope}
                    variant="outline"
                    className="border-white/10"
                    aria-label="Retry loading horoscope"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        ) : horoscope ? (
          <div className="space-y-6">
            {/* Updated Timestamp + Moon Phase */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {fetchedAt && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Updated today at{" "}
                    {fetchedAt.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-base leading-none">{moonPhase.emoji}</span>
                <span>{moonPhase.label}</span>
                <span className="text-muted-foreground/50">
                  (Day {moonPhase.dayInCycle})
                </span>
              </div>
            </div>

            {/* Overview + Mood Card */}
            <motion.div
              role="article"
              aria-label="Today's mood and energy overview"
              initial={fadeUpSmall.initial}
              animate={fadeUpSmall.animate}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-cosmic-purple/[0.06] to-transparent p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">
                    {moodConfig.icon}
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Today&apos;s Energy
                    </p>
                    <p className={cn("text-lg font-semibold capitalize", moodConfig.color)}>
                      {horoscope.mood}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchHoroscope}
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Refresh horoscope"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && !prefersReducedMotion && "animate-spin")} />
                </Button>
              </div>
              <p className="text-lg font-medium leading-relaxed">
                {horoscope.overview}
              </p>
              {/* Lucky badges */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <Badge variant="outline" className="border-gold/30 bg-gold/10 text-gold text-xs">
                  <Hash className="mr-1 h-3 w-3" />
                  Lucky {horoscope.luckyNumber}
                </Badge>
                <Badge variant="outline" className="border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light text-xs">
                  <Palette className="mr-1 h-3 w-3" />
                  {horoscope.luckyColor}
                </Badge>
                <Badge variant="outline" className="border-white/20 bg-white/5 text-muted-foreground text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {horoscope.luckyTime}
                </Badge>
              </div>
            </motion.div>

            {/* Section Cards: Love, Career, Wellness */}
            <div className="grid grid-cols-1 gap-4">
              {/* Love */}
              <motion.div
                role="article"
                aria-label="Love and relationships reading"
                initial={fadeUpSmall.initial}
                animate={fadeUpSmall.animate}
                transition={prefersReducedMotion ? undefined : { delay: 0.1 }}
                className="glass-card rounded-2xl border border-pink-500/20 bg-pink-500/[0.04] p-5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10">
                    <Heart className="h-4 w-4 text-pink-400" />
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-pink-400">
                    Love &amp; Relationships
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/85">
                  {horoscope.love}
                </p>
              </motion.div>

              {/* Career */}
              <motion.div
                role="article"
                aria-label="Career and work reading"
                initial={fadeUpSmall.initial}
                animate={fadeUpSmall.animate}
                transition={prefersReducedMotion ? undefined : { delay: 0.15 }}
                className="glass-card rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <Briefcase className="h-4 w-4 text-blue-400" />
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-blue-400">
                    Career &amp; Purpose
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/85">
                  {horoscope.career}
                </p>
              </motion.div>

              {/* Wellness */}
              <motion.div
                role="article"
                aria-label="Wellness and energy reading"
                initial={fadeUpSmall.initial}
                animate={fadeUpSmall.animate}
                transition={prefersReducedMotion ? undefined : { delay: 0.2 }}
                className="glass-card rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Activity className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-emerald-400">
                    Wellness &amp; Energy
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/85">
                  {horoscope.wellness}
                </p>
              </motion.div>
            </div>

            {/* Cosmic Tip */}
            <motion.div
              role="article"
              aria-label="Cosmic tip of the day"
              initial={fadeUpSmall.initial}
              animate={fadeUpSmall.animate}
              transition={prefersReducedMotion ? undefined : { delay: 0.25 }}
              className="rounded-xl border border-gold/20 bg-gold/[0.04] p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-gold" />
                <h3 className="text-sm font-semibold text-gold">
                  Cosmic Tip
                </h3>
              </div>
              <p className="text-sm text-foreground/80">
                {horoscope.cosmicTip}
              </p>
            </motion.div>

            {/* Continue Your Cosmic Journey */}
            <motion.nav
              aria-label="Related cosmic features"
              initial={fadeUpSmall.initial}
              animate={fadeUpSmall.animate}
              transition={prefersReducedMotion ? undefined : { delay: 0.3 }}
              className="pt-4"
            >
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center mb-4">
                Continue Your Cosmic Journey
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/transits"
                  aria-label="View your current planetary transits"
                  className="glass-card group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center backdrop-blur-sm transition-colors hover:border-cosmic-purple/30 hover:bg-cosmic-purple/[0.06]"
                >
                  <RefreshCw className="h-5 w-5 text-cosmic-purple-light transition-transform group-hover:rotate-45" />
                  <span className="text-sm font-medium">View Your Transits</span>
                  <span className="text-xs text-muted-foreground">
                    What the planets are doing right now
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/compatibility"
                  aria-label="Check your astrological compatibility"
                  className="glass-card group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center backdrop-blur-sm transition-colors hover:border-gold/30 hover:bg-gold/[0.06]"
                >
                  <Heart className="h-5 w-5 text-gold transition-transform group-hover:scale-110" />
                  <span className="text-sm font-medium">Check Compatibility</span>
                  <span className="text-xs text-muted-foreground">
                    How today affects your relationships
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/wellness"
                  aria-label="View wellness timing recommendations"
                  className="glass-card group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center backdrop-blur-sm transition-colors hover:border-emerald-400/30 hover:bg-emerald-400/[0.06]"
                >
                  <Activity className="h-5 w-5 text-emerald-400 transition-transform group-hover:scale-110" />
                  <span className="text-sm font-medium">Wellness Timing</span>
                  <span className="text-xs text-muted-foreground">
                    Best times for activities today
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </motion.nav>
          </div>
        ) : null}
      </div>
    </div>
  );
}
