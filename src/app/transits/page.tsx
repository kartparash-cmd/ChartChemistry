"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Star,
  AlertTriangle,
  Info,
  ArrowRight,
  Loader2,
  Orbit,
  Sparkles,
  Clock,
  Heart,
  Compass,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TransitCard, type TransitData } from "@/components/transit-card";

interface TransitResponse {
  date: string;
  profileName: string;
  transits: TransitData[];
  transitCount: number;
  highSignificance: number;
  error?: string;
}

/**
 * Estimate how long a transit remains active based on the transiting planet's
 * average speed (days per degree of ecliptic longitude) and the current orb.
 * The orb tells us roughly how far the transiting planet is from exact -- we
 * use half the remaining orb travel as an approximation of "time left" since
 * the transit is already active (orb is shrinking or has passed exact).
 */
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

function getTransitDurationLabel(planet: string, orb: number): string {
  const daysPerDeg = PLANET_DAYS_PER_DEGREE[planet] ?? 2;
  // Estimate remaining active time: the orb is the current distance from exact.
  // The transit stays active while the orb is within the allowed threshold.
  // We approximate remaining time as orb * daysPerDeg (how long to traverse the current orb).
  const totalDays = orb * daysPerDeg;

  if (planet === "Moon") {
    const hours = Math.max(1, Math.round(totalDays * 24));
    return `~${hours} more hour${hours !== 1 ? "s" : ""}`;
  }

  if (OUTER_PLANETS.has(planet)) {
    const weeks = Math.max(1, Math.round(totalDays / 7));
    return `~${weeks} more week${weeks !== 1 ? "s" : ""}`;
  }

  const days = Math.max(1, Math.round(totalDays));
  return `~${days} more day${days !== 1 ? "s" : ""}`;
}

function TransitSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 bg-white/5" />
          <Skeleton className="h-3 w-32 bg-white/5" />
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />
        ))}
      </div>

      {/* Card skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-36 rounded-xl bg-white/5" />
      ))}
    </div>
  );
}

function EmptyProfileState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-12 text-center"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/10">
        <Orbit className="h-8 w-8 text-cosmic-purple-light" />
      </div>
      <h2 className="font-heading text-xl font-semibold mb-2">
        No Birth Profile Found
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        To see your personal transits, you need a birth profile with chart data.
        Create your birth chart first to unlock transit insights.
      </p>
      <Button
        asChild
        className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
      >
        <Link href="/dashboard/profiles">
          <Sparkles className="mr-2 h-4 w-4" />
          Create Your Birth Profile
        </Link>
      </Button>
    </motion.div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const isServiceError =
    message.toLowerCase().includes("unreachable") ||
    message.toLowerCase().includes("unavailable") ||
    message.toLowerCase().includes("connect") ||
    message.toLowerCase().includes("service") ||
    message.toLowerCase().includes("temporarily");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/10"
      >
        <AlertTriangle className="h-7 w-7 text-amber-400" />
      </motion.div>
      <h2 className="font-heading text-lg font-semibold mb-2">
        {isServiceError
          ? "Service Temporarily Unavailable"
          : "Unable to Load Transits"}
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        {isServiceError
          ? "Our astrology calculation service is currently being updated. Please try again shortly."
          : message}
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button
          onClick={onRetry}
          className="bg-cosmic-purple text-white hover:bg-cosmic-purple-dark"
        >
          <Orbit className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button asChild variant="outline" className="border-white/10">
          <Link href="/dashboard">
            <ArrowRight className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

function TransitLegend() {
  return (
    <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4 text-cosmic-purple-light" />
          What Are Transits?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Transits occur when the current positions of planets form aspects
          (geometric angles) to the planets in your natal chart. They represent
          the ongoing cosmic weather influencing your life.
        </p>
        <Separator className="bg-white/10" />
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground uppercase tracking-wider mb-2">
            Significance Levels
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
            <span className="text-xs">
              <strong className="text-red-400">High Impact</strong> -- Outer planets
              (Jupiter-Pluto) aspecting personal planets. Powerful, transformative influences.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-cosmic-purple-light" />
            <span className="text-xs">
              <strong className="text-cosmic-purple-light">Medium</strong> -- Mixed
              outer/personal planet contacts. Noticeable shifts in mood and events.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-xs">
              <strong className="text-muted-foreground">Subtle</strong> -- Personal
              planet-to-personal planet transits. Brief, day-to-day influences.
            </span>
          </div>
        </div>
        <Separator className="bg-white/10" />
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground uppercase tracking-wider mb-2">
            Common Aspects
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span><span className="text-foreground">{"\u260C"}</span> Conjunction -- Merging</span>
            <span><span className="text-foreground">{"\u260D"}</span> Opposition -- Tension</span>
            <span><span className="text-foreground">{"\u25B3"}</span> Trine -- Harmony</span>
            <span><span className="text-foreground">{"\u25A1"}</span> Square -- Challenge</span>
            <span><span className="text-foreground">{"\u2731"}</span> Sextile -- Opportunity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransitDuration({ planet, orb }: { planet: string; orb: number }) {
  const label = getTransitDurationLabel(planet, orb);
  return (
    <div className="flex items-center gap-1 mt-2 ml-5">
      <Clock className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Active for {label}</span>
    </div>
  );
}

function HighImpactNote() {
  return (
    <p className="text-xs text-muted-foreground/80 italic mt-1 ml-6">
      High-impact transits can bring noticeable life events and shifts. Pay attention to this area.
    </p>
  );
}

function RelatedInsights() {
  const links = [
    {
      title: "Today\u2019s Horoscope",
      description: "Your personalized daily cosmic forecast",
      href: "/horoscope",
      icon: Sun,
    },
    {
      title: "Wellness Timing",
      description: "Align your wellness routine with the stars",
      href: "/wellness",
      icon: Compass,
    },
    {
      title: "Check Compatibility",
      description: "Explore relationship chemistry",
      href: "/compatibility",
      icon: Heart,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-12"
    >
      <h2 className="font-heading text-lg font-semibold mb-4">Related Insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div className="glass-card rounded-xl border border-white/10 p-4 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cosmic-purple/10">
                    <Icon className="h-4 w-4 text-cosmic-purple-light" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">{link.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}

export default function TransitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<TransitResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noProfile, setNoProfile] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch transit data
  const fetchTransits = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoProfile(false);
    try {
      const res = await fetch("/api/transits/personal");

      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }

      if (res.status === 404) {
        setNoProfile(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.message || errData.error || "";
        setError(
          msg || "Something went wrong loading your transits. Please try again later."
        );
        setLoading(false);
        return;
      }

      const json: TransitResponse = await res.json();
      setData(json);
    } catch {
      setError("Failed to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchTransits();
  }, [status, fetchTransits]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen">
        <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-cosmic-purple-light" />
              <span className="text-sm text-muted-foreground">
                Loading your cosmic transits...
              </span>
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TransitSkeleton />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-80 rounded-xl bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // Group transits by significance
  const highTransits = data?.transits.filter((t) => t.significance === "high") || [];
  const mediumTransits = data?.transits.filter((t) => t.significance === "medium") || [];
  const lowTransits = data?.transits.filter((t) => t.significance === "low") || [];
  const totalTransits = data?.transitCount || 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="font-heading text-3xl font-bold">
                <span className="cosmic-text">Transit Timeline</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {data?.profileName
                  ? `Current planetary transits for ${data.profileName}`
                  : "Current planetary influences on your natal chart"}
              </p>
            </div>
            {data?.date && (
              <Badge
                variant="outline"
                className="border-white/10 text-muted-foreground self-start"
              >
                <Sun className="mr-1.5 h-3 w-3 text-gold" />
                {new Date(data.date + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Badge>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {noProfile ? (
          <EmptyProfileState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTransits} />
        ) : (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main timeline */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats overview */}
              {totalTransits > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold text-foreground">{totalTransits}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active Transits</p>
                  </div>
                  <div className="rounded-xl border border-red-400/20 bg-red-400/[0.04] p-4 text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold text-red-400">{highTransits.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">High Impact</p>
                  </div>
                  <div className="rounded-xl border border-cosmic-purple/20 bg-cosmic-purple/[0.04] p-4 text-center backdrop-blur-sm">
                    <p className="text-2xl font-bold text-cosmic-purple-light">
                      {mediumTransits.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Medium</p>
                  </div>
                </motion.div>
              )}

              {/* Service error warning */}
              {data?.error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 rounded-xl border border-gold/20 bg-gold/[0.04] p-4"
                >
                  <AlertTriangle className="h-4 w-4 text-gold shrink-0" />
                  <p className="text-sm text-muted-foreground">{data.error}</p>
                </motion.div>
              )}

              {/* Empty transits state */}
              {totalTransits === 0 && !data?.error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-12 text-center"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/10">
                    <Moon className="h-7 w-7 text-cosmic-purple-light" />
                  </div>
                  <h2 className="font-heading text-lg font-semibold mb-2">
                    No Active Transits
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    No significant planetary transits are affecting your chart right now.
                    Check back tomorrow for updated cosmic weather.
                  </p>
                </motion.div>
              )}

              {/* High significance transits */}
              {highTransits.length > 0 && (
                <div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-2 mb-1"
                  >
                    <Star className="h-4 w-4 text-red-400" />
                    <h2 className="font-heading text-lg font-semibold text-red-400">
                      High Impact
                    </h2>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({highTransits.length})
                    </span>
                  </motion.div>
                  <HighImpactNote />
                  <div className="space-y-3 mt-4">
                    {highTransits.map((transit, i) => (
                      <div key={`high-${transit.transitingPlanet}-${transit.aspect}-${transit.natalPlanet}`}>
                        <TransitCard
                          transit={transit}
                          index={i}
                        />
                        <TransitDuration planet={transit.transitingPlanet} orb={transit.orb} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medium significance transits */}
              {mediumTransits.length > 0 && (
                <div>
                  {highTransits.length > 0 && (
                    <Separator className="bg-white/10 mb-8" />
                  )}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-center gap-2 mb-4"
                  >
                    <Orbit className="h-4 w-4 text-cosmic-purple-light" />
                    <h2 className="font-heading text-lg font-semibold text-cosmic-purple-light">
                      Medium Influence
                    </h2>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({mediumTransits.length})
                    </span>
                  </motion.div>
                  <div className="space-y-3">
                    {mediumTransits.map((transit, i) => (
                      <div key={`med-${transit.transitingPlanet}-${transit.aspect}-${transit.natalPlanet}`}>
                        <TransitCard
                          transit={transit}
                          index={i + highTransits.length}
                        />
                        <TransitDuration planet={transit.transitingPlanet} orb={transit.orb} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Low significance transits */}
              {lowTransits.length > 0 && (
                <div>
                  {(highTransits.length > 0 || mediumTransits.length > 0) && (
                    <Separator className="bg-white/10 mb-8" />
                  )}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center gap-2 mb-4"
                  >
                    <Moon className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-heading text-lg font-semibold text-muted-foreground">
                      Subtle Influences
                    </h2>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({lowTransits.length})
                    </span>
                  </motion.div>
                  <div className="space-y-3">
                    {lowTransits.map((transit, i) => (
                      <div key={`low-${transit.transitingPlanet}-${transit.aspect}-${transit.natalPlanet}`}>
                        <TransitCard
                          transit={transit}
                          index={i + highTransits.length + mediumTransits.length}
                        />
                        <TransitDuration planet={transit.transitingPlanet} orb={transit.orb} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Legend card */}
              <TransitLegend />

              {/* Quick links */}
              <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Explore More</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Link href="/dashboard">
                      <ArrowRight className="mr-2 h-3 w-3" />
                      Back to Dashboard
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Link href="/compatibility">
                      <ArrowRight className="mr-2 h-3 w-3" />
                      Compatibility Check
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Link href="/horoscope">
                      <ArrowRight className="mr-2 h-3 w-3" />
                      Daily Horoscope
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Insights */}
          {totalTransits > 0 && <RelatedInsights />}
          </>
        )}
      </div>
    </div>
  );
}
