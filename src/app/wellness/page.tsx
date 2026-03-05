"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Heart,
  Briefcase,
  Palette,
  DollarSign,
  Sparkles,
  Activity,
  Loader2,
  RefreshCw,
  Clock,
  ArrowRight,
  AlertTriangle,
  LayoutDashboard,
  Sun,
  Compass,
  Users,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WellnessSuggestion {
  category: string;
  title: string;
  description: string;
  timing: string;
  confidence: number;
}

interface WellnessData {
  date: string;
  userName: string;
  suggestions: WellnessSuggestion[];
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; borderColor: string; bgColor: string; label: string }
> = {
  career: {
    icon: <Briefcase className="h-5 w-5" />,
    color: "text-blue-400",
    borderColor: "border-blue-400/20",
    bgColor: "bg-blue-400/[0.06]",
    label: "Career",
  },
  relationships: {
    icon: <Heart className="h-5 w-5" />,
    color: "text-rose-400",
    borderColor: "border-rose-400/20",
    bgColor: "bg-rose-400/[0.06]",
    label: "Relationships",
  },
  health: {
    icon: <Activity className="h-5 w-5" />,
    color: "text-emerald-400",
    borderColor: "border-emerald-400/20",
    bgColor: "bg-emerald-400/[0.06]",
    label: "Health",
  },
  creativity: {
    icon: <Palette className="h-5 w-5" />,
    color: "text-amber-400",
    borderColor: "border-amber-400/20",
    bgColor: "bg-amber-400/[0.06]",
    label: "Creativity",
  },
  finances: {
    icon: <DollarSign className="h-5 w-5" />,
    color: "text-teal-400",
    borderColor: "border-teal-400/20",
    bgColor: "bg-teal-400/[0.06]",
    label: "Finances",
  },
  spirituality: {
    icon: <Sparkles className="h-5 w-5" />,
    color: "text-cosmic-purple-light",
    borderColor: "border-cosmic-purple/20",
    bgColor: "bg-cosmic-purple/[0.06]",
    label: "Spirituality",
  },
};

function ConfidenceIndicator({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  const segments = 5;
  const filled = Math.round(confidence * segments);

  let label: string;
  let labelColor: string;
  if (percentage >= 80) {
    label = "Strong";
    labelColor = "text-emerald-400";
  } else if (percentage >= 60) {
    label = "Moderate";
    labelColor = "text-gold";
  } else {
    label = "Gentle";
    labelColor = "text-muted-foreground";
  }

  return (
    <div className="flex items-center gap-2" role="meter" aria-label={`Confidence: ${label}`} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 w-3 rounded-full transition-colors",
              i < filled ? "bg-cosmic-purple-light" : "bg-white/10"
            )}
          />
        ))}
      </div>
      <span className={cn("text-xs uppercase tracking-wider", labelColor)}>
        {label}
      </span>
    </div>
  );
}

/**
 * Detects if a timing string contains a specific time window
 * (e.g. "Morning hours, 9-11 AM", "Evening, 6:00-8:00 PM", "2-4 PM").
 */
function hasSpecificTimeWindow(timing: string): boolean {
  return /\d{1,2}[:\s]?\d{0,2}\s*[-\u2013]\s*\d{1,2}[:\s]?\d{0,2}\s*(AM|PM|am|pm)/i.test(timing);
}

function SuggestionCard({
  suggestion,
  index,
  prefersReducedMotion,
}: {
  suggestion: WellnessSuggestion;
  index: number;
  prefersReducedMotion: boolean;
}) {
  const config = CATEGORY_CONFIG[suggestion.category] || CATEGORY_CONFIG.career;
  const isRelationships = suggestion.category === "relationships";
  const showTimingBadge = hasSpecificTimeWindow(suggestion.timing);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.08, duration: 0.4 }}
    >
      <Card
        role="article"
        aria-label={`${config.label} suggestion: ${suggestion.title}`}
        className={cn(
          "border bg-transparent transition-colors hover:bg-white/[0.02]",
          config.borderColor
        )}
      >
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  config.bgColor,
                  config.color
                )}
              >
                {config.icon}
              </div>
              <div>
                <Badge
                  variant="outline"
                  className={cn(
                    "mb-1.5 text-xs uppercase tracking-wider",
                    config.borderColor,
                    config.color
                  )}
                >
                  {config.label}
                </Badge>
                <CardTitle className="text-base font-semibold">
                  {suggestion.title}
                </CardTitle>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm leading-relaxed text-foreground/80 mb-4">
            {suggestion.description}
          </p>

          {/* Contextual relationship hint */}
          {isRelationships && (
            <Link
              href="/connections"
              aria-label="See how today's energy affects your connections"
              className="group/link mb-4 flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-400 transition-colors"
            >
              <Users className="h-3 w-3" />
              <span>See how today&apos;s energy affects your connections</span>
              <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-0" />
            </Link>
          )}

          <Separator className="mb-3 bg-white/5" />
          <div className="flex items-center justify-between">
            {showTimingBadge ? (
              <Badge
                variant="outline"
                className="border-gold/30 bg-gold/[0.08] text-gold gap-1.5 text-xs font-medium"
              >
                <Clock className="h-3 w-3" />
                {suggestion.timing}
              </Badge>
            ) : (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {suggestion.timing}
                </span>
              </div>
            )}
            <ConfidenceIndicator confidence={suggestion.confidence} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-4/5 mb-4" />
          <Separator className="mb-3 bg-white/5" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WellnessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [data, setData] = useState<WellnessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (session?.user?.plan === "FREE") return;
    fetchWellness();
  }, [status, session?.user?.plan]);

  const fetchWellness = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wellness");
      const json = await res.json();

      if (res.ok) {
        setData(json);
      } else {
        setError(json.message || json.error || "Failed to load wellness suggestions");
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
    const previewCategories = [
      { key: "career", ...CATEGORY_CONFIG.career },
      { key: "relationships", ...CATEGORY_CONFIG.relationships },
      { key: "health", ...CATEGORY_CONFIG.health },
      { key: "creativity", ...CATEGORY_CONFIG.creativity },
      { key: "finances", ...CATEGORY_CONFIG.finances },
      { key: "spirituality", ...CATEGORY_CONFIG.spirituality },
    ];

    return (
      <main className="min-h-screen" aria-label="Wellness and Timing">
        <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent" aria-label="Page header">
          <div className="mx-auto max-w-4xl px-4 py-10 text-center">
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">
              Wellness &amp; <span className="cosmic-text">Timing</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
              Personalized suggestions based on today&apos;s planetary transits
              to your natal chart.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
          {/* Upgrade CTA */}
          <Card className="glass-card border-white/10 bg-white/[0.03] p-8 text-center">
            <Lock className="h-8 w-8 text-cosmic-purple-light mx-auto mb-3" />
            <h2 className="text-xl font-semibold cosmic-text mb-2">Premium Feature</h2>
            <p className="text-muted-foreground mb-1">
              Get personalized daily wellness insights across 6 life areas
            </p>
            <p className="text-xs text-muted-foreground/70 mb-5">
              Powered by real-time transits to your natal chart, updated every day
            </p>
            <Button asChild className="cosmic-gradient text-white hover:opacity-90">
              <Link href="/pricing">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Link>
            </Button>
          </Card>

          {/* Blurred preview cards */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none pointer-events-none" aria-hidden="true">
              {previewCategories.map((cat) => (
                <div
                  key={cat.key}
                  className={cn(
                    "rounded-xl border bg-transparent p-6 opacity-50 blur-[2px]",
                    cat.borderColor
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        cat.bgColor,
                        cat.color
                      )}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mb-1 text-xs uppercase tracking-wider",
                          cat.borderColor,
                          cat.color
                        )}
                      >
                        {cat.label}
                      </Badge>
                      <p className="text-sm font-semibold text-foreground/60">
                        Today&apos;s {cat.label.toLowerCase()} insight
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="h-3 w-full rounded bg-white/10" />
                    <div className="h-3 w-4/5 rounded bg-white/10" />
                  </div>
                  <Separator className="mb-3 bg-white/5" />
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 rounded bg-white/10" />
                    <div className="h-3 w-16 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Order suggestions by category for consistent display
  const categoryOrder = [
    "career",
    "relationships",
    "health",
    "creativity",
    "finances",
    "spirituality",
  ];
  const orderedSuggestions = data?.suggestions
    ? [...data.suggestions].sort(
        (a, b) =>
          categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
      )
    : [];

  return (
    <main className="min-h-screen" aria-label="Wellness and Timing">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent" aria-label="Page header">
        <div className="mx-auto max-w-4xl px-4 py-10 text-center">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : undefined}
          >
            <Badge
              variant="outline"
              className="mb-4 border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {today}
            </Badge>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">
              Wellness &amp; <span className="cosmic-text">Timing</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
              Personalized suggestions based on today&apos;s planetary transits
              to your natal chart. Discover the best timing for every area of
              your life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {loading ? (
          <motion.div initial={prefersReducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={prefersReducedMotion ? { duration: 0 } : undefined}>
            <div className="flex flex-col items-center gap-4 py-8 mb-8">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-cosmic-purple/10 animate-pulse" />
                <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-cosmic-purple-light animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">
                Analyzing your transits for today...
              </p>
            </div>
            <LoadingSkeleton />
          </motion.div>
        ) : error ? (
          (() => {
            const isServiceError =
              error.toLowerCase().includes("unreachable") ||
              error.toLowerCase().includes("unavailable") ||
              error.toLowerCase().includes("connect") ||
              error.toLowerCase().includes("service") ||
              error.toLowerCase().includes("temporarily");
            return (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : undefined}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm"
              >
                <motion.div
                  initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.1, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/10"
                >
                  {isServiceError ? (
                    <AlertTriangle className="h-7 w-7 text-amber-400" />
                  ) : (
                    <Activity className="h-7 w-7 text-cosmic-purple-light" />
                  )}
                </motion.div>
                <h2 className="font-heading text-lg font-semibold mb-2">
                  {isServiceError
                    ? "Service Temporarily Unavailable"
                    : "Set Up Your Birth Chart"}
                </h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {isServiceError
                    ? "Our astrology calculation service is currently being updated. Please try again shortly."
                    : error}
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  {isServiceError ? (
                    <>
                      <Button
                        onClick={fetchWellness}
                        aria-label="Retry loading wellness suggestions"
                        className="bg-cosmic-purple text-white hover:bg-cosmic-purple-dark"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="border-white/10"
                      >
                        <Link href="/dashboard" aria-label="Go to Dashboard">
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
                      >
                        <Link href="/compatibility" aria-label="Create your birth chart">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Create Your Chart
                        </Link>
                      </Button>
                      <Button
                        onClick={fetchWellness}
                        aria-label="Retry loading wellness suggestions"
                        variant="outline"
                        className="border-white/10"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })()
        ) : data ? (
          <div className="space-y-8">
            {/* Summary Bar */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : undefined}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-cosmic-purple/[0.06] to-transparent p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmic-purple/10">
                    <Sparkles className="h-5 w-5 text-cosmic-purple-light" />
                  </div>
                  <div>
                    <h2 className="font-heading text-base font-semibold">
                      {data.userName}&apos;s Cosmic Timing
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {data.suggestions.length} personalized suggestions for today
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchWellness}
                  aria-label="Refresh wellness suggestions"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Suggestion Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Wellness suggestions">
              {orderedSuggestions.map((suggestion, i) => (
                <SuggestionCard
                  key={suggestion.category}
                  suggestion={suggestion}
                  index={i}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </div>

            {/* Continue Exploring */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.5 }}
              className="pt-4"
            >
              <h3 className="font-heading text-base font-semibold text-center mb-4">
                Continue Exploring
              </h3>
              <nav className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Related features">
                <Link href="/horoscope" className="group" aria-label="View today's horoscope">
                  <div className="glass-card flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-all hover:border-cosmic-purple/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold/20">
                      <Sun className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Today&apos;s Horoscope</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        See your full cosmic reading
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>
                </Link>
                <Link href="/transits" className="group" aria-label="View active transits">
                  <div className="glass-card flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-all hover:border-cosmic-purple/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cosmic-purple/10 text-cosmic-purple-light transition-colors group-hover:bg-cosmic-purple/20">
                      <Compass className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Active Transits</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        What&apos;s influencing your timing
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>
                </Link>
                <Link href="/compatibility" className="group" aria-label="Check compatibility">
                  <div className="glass-card flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-all hover:border-cosmic-purple/30">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400 transition-colors group-hover:bg-rose-400/20">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Check Compatibility</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        See how timing affects relationships
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>
                </Link>
              </nav>
            </motion.div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
