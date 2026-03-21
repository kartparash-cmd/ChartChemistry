"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Users,
  Info,
  Loader2,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  Heart,
  Sun,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LazyChartWheel as ChartWheel } from "@/components/lazy-chart-wheel";
import {
  type PlanetPosition,
  type HouseCusp,
  type Aspect,
} from "@/components/chart-wheel";
import { cn } from "@/lib/utils";
import {
  type HouseSystem,
  HOUSE_SYSTEM_LABELS,
  HOUSE_SYSTEM_TO_API,
} from "@/types/astrology";

// Types
interface ChartData {
  planets: Array<{
    planet: string;
    sign: string;
    degree: number;
    signDegree?: number;
    house?: number;
    retrograde?: boolean;
  }>;
  houses?: Array<{
    house: number;
    sign: string;
    degree: number;
    ruler?: string;
  }>;
  aspects?: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }>;
}

interface BirthChartProfile {
  id: string;
  name: string;
  birthDate: string;
  birthTime?: string | null;
  birthCity: string;
  birthCountry: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  chartData: ChartData | null;
}

const HOUSE_SYSTEMS: HouseSystem[] = [
  "placidus",
  "whole-sign",
  "equal",
  "koch",
  "campanus",
  "regiomontanus",
];

const LS_HOUSE_SYSTEM_KEY = "chartchemistry-house-system";

const PLANET_SYMBOLS: Record<string, string> = {
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
  Ascendant: "ASC",
  Midheaven: "MC",
};

const KEY_PLACEMENTS = ["Sun", "Moon", "Ascendant", "Venus", "Mars"];

const HOUSE_RULERS: Record<string, string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Pluto",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Uranus",
  Pisces: "Neptune",
};

const ASPECT_LABELS: Record<string, string> = {
  conjunction: "Conjunction",
  sextile: "Sextile",
  square: "Square",
  trine: "Trine",
  opposition: "Opposition",
  quincunx: "Quincunx",
  semisextile: "Semi-Sextile",
};

function formatDegree(degree: number): string {
  const signDeg = degree % 30;
  const deg = Math.floor(signDeg);
  const min = Math.floor((signDeg - deg) * 60);
  return `${deg}\u00B0${min.toString().padStart(2, "0")}'`;
}

/**
 * A clickable inline element that triggers an AI explanation when tapped.
 * Renders as a styled button with a sparkle icon on hover.
 */
function ExplainableElement({
  element,
  children,
  onExplain,
  className,
}: {
  element: string;
  children: React.ReactNode;
  onExplain: (element: string) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onExplain(element)}
      className={cn(
        "group/explain inline-flex items-center gap-1 rounded-md px-1 -mx-1 transition-all duration-200",
        "hover:bg-cosmic-purple/10 hover:text-cosmic-purple-light",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "cursor-pointer",
        className
      )}
      title={`Tap to explain: ${element}`}
      aria-label={`Explain ${element}`}
    >
      {children}
      <Sparkles className="h-3 w-3 opacity-0 group-hover/explain:opacity-70 transition-opacity duration-200 text-cosmic-purple-light flex-shrink-0" />
    </button>
  );
}

export default function ChartPage() {
  const params = useParams();
  const prefersReducedMotion = useReducedMotion();
  const [profile, setProfile] = useState<BirthChartProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // House system state
  const [houseSystem, setHouseSystem] = useState<HouseSystem>("placidus");
  const [recalculating, setRecalculating] = useState(false);
  const [recalcError, setRecalcError] = useState<string | null>(null);

  // Load house system preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_HOUSE_SYSTEM_KEY);
      if (stored && Object.keys(HOUSE_SYSTEM_LABELS).includes(stored)) {
        setHouseSystem(stored as HouseSystem);
      }
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  // Explain panel state
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainElement, setExplainElement] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainText, setExplainText] = useState("");
  const [explainError, setExplainError] = useState("");
  const explanationCache = useRef<Map<string, string>>(new Map());

  const chartId = params.id as string;

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await fetch(`/api/profile/${chartId}`);
        if (res.ok) {
          const json = await res.json();
          setProfile(json.profile || json);
        } else {
          setError("Unable to load this chart. It may not exist or you may not have access.");
        }
      } catch (err) {
        console.error("Failed to load chart:", err);
        setError("Unable to load this chart. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [chartId]);

  const handleExplain = useCallback(
    async (element: string) => {
      setExplainElement(element);
      setExplainOpen(true);
      setExplainError("");

      // Check cache first
      const cached = explanationCache.current.get(element);
      if (cached) {
        setExplainText(cached);
        setExplainLoading(false);
        return;
      }

      setExplainText("");
      setExplainLoading(true);

      try {
        const res = await fetch("/api/chart/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: chartId, element }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error || `Request failed (${res.status})`
          );
        }

        const data = await res.json();
        const explanation = data.explanation || "No explanation available.";
        explanationCache.current.set(element, explanation);
        setExplainText(explanation);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load explanation.";
        setExplainError(message);
      } finally {
        setExplainLoading(false);
      }
    },
    [chartId]
  );

  /**
   * Change the house system: persist to localStorage and recalculate the chart
   * via the natal-chart API endpoint, then update the local profile state.
   */
  const handleHouseSystemChange = useCallback(
    async (value: string) => {
      const newSystem = value as HouseSystem;
      setHouseSystem(newSystem);

      try {
        localStorage.setItem(LS_HOUSE_SYSTEM_KEY, newSystem);
      } catch {
        // localStorage may be unavailable
      }

      // Only recalculate when we have profile birth data for API call
      if (
        !profile?.birthTime ||
        profile?.latitude == null ||
        profile?.longitude == null ||
        !profile?.timezone
      ) {
        return;
      }

      setRecalculating(true);
      setRecalcError(null);
      try {
        const res = await fetch("/api/natal-chart/recalculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: chartId,
            houseSystem: HOUSE_SYSTEM_TO_API[newSystem] ?? newSystem,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.chartData) {
            setProfile((prev) =>
              prev ? { ...prev, chartData: data.chartData } : prev
            );
          }
        } else {
          setRecalcError("Failed to recalculate houses. Showing previous data.");
          setTimeout(() => setRecalcError(null), 5000);
        }
      } catch (err) {
        console.warn("House system recalculation failed:", err);
        setRecalcError("Failed to recalculate houses. Showing previous data.");
        setTimeout(() => setRecalcError(null), 5000);
      } finally {
        setRecalculating(false);
      }
    },
    [chartId, profile]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cosmic-purple-light" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading birth chart...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-4">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Chart Unavailable</h1>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
          <Button asChild className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-heading font-semibold mb-2">
            Chart Not Found
          </p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const chartData = profile.chartData;
  const hasBirthTime = !!profile.birthTime;

  // Animation props that respect prefers-reduced-motion
  const fadeUp = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };
  const fadeIn = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0 }, animate: { opacity: 1 } };
  const scaleIn = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5 } };

  // Prepare chart wheel data
  const wheelPlanets: PlanetPosition[] =
    chartData?.planets?.map((p) => ({
      planet: p.planet,
      sign: p.sign,
      degree: p.degree,
      retrograde: p.retrograde,
    })) || [];

  const wheelHouses: HouseCusp[] =
    chartData?.houses?.map((h) => ({
      house: h.house,
      sign: h.sign,
      degree: h.degree,
    })) || [];

  const wheelAspects: Aspect[] =
    chartData?.aspects?.map((a: Record<string, unknown>) => ({
      planet1: String(a.planet1 || ""),
      planet2: String(a.planet2 || ""),
      type: String(a.aspect || a.type || ""),
      orb: Number(a.orb || 0),
    })) || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <motion.div
            {...fadeUp}
          >
            <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
              {profile.name}&apos;s Natal Chart
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(profile.birthDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {profile.birthTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {profile.birthTime}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {profile.birthCity}, {profile.birthCountry}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* No birth time notice */}
        {!hasBirthTime && (
          <motion.div
            {...fadeIn}
            className="mb-6 rounded-xl border border-gold/20 bg-gold/[0.03] p-4 flex items-start gap-3"
          >
            <Info className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gold">
                Birth time not provided
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                House placements and the exact Moon position are unavailable
                without a birth time. Rising sign (Ascendant) cannot be
                calculated. Consider adding your birth time for a more complete
                chart.
              </p>
            </div>
          </motion.div>
        )}

        {/* House system recalculation error notice */}
        {recalcError && (
          <motion.div
            {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 } })}
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4 flex items-start gap-3"
          >
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400">{recalcError}</p>
            </div>
            <button
              onClick={() => setRecalcError(null)}
              className="text-red-400/60 hover:text-red-400 text-sm"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </motion.div>
        )}

        {/* Tap-to-explain hint */}
        <motion.div
          {...fadeIn}
          {...(prefersReducedMotion ? {} : { transition: { delay: 0.15 } })}
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-cosmic-purple-light" />
          <span>
            Tap any planet placement, house, or aspect to get an AI-powered
            explanation.
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Wheel */}
          <motion.div
            {...scaleIn}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
            role="img"
            aria-label={`Natal chart wheel for ${profile.name}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold text-center flex-1">
                Chart Wheel
              </h2>
              {hasBirthTime && (
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="house-system"
                    className="text-xs text-muted-foreground whitespace-nowrap"
                  >
                    Houses
                  </Label>
                  <Select
                    value={houseSystem}
                    onValueChange={handleHouseSystemChange}
                  >
                    <SelectTrigger
                      id="house-system"
                      size="sm"
                      className="w-[140px] text-xs"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOUSE_SYSTEMS.map((sys) => (
                        <SelectItem key={sys} value={sys}>
                          {HOUSE_SYSTEM_LABELS[sys]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {recalculating && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-cosmic-purple-light" />
                  )}
                </div>
              )}
            </div>
            <ChartWheel
              planets={wheelPlanets}
              houses={wheelHouses}
              aspects={wheelAspects}
            />
            {/* Screen reader table for chart data */}
            <div className="sr-only">
              <table>
                <caption>Natal Chart Planetary Positions</caption>
                <thead>
                  <tr>
                    <th scope="col">Planet</th>
                    <th scope="col">Sign</th>
                    <th scope="col">Degree</th>
                    <th scope="col">House</th>
                    <th scope="col">Retrograde</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData?.planets?.map((p) => (
                    <tr key={p.planet}>
                      <td>{p.planet}</td>
                      <td>{p.sign}</td>
                      <td>{Math.round(p.degree)}°</td>
                      <td>{p.house ?? "N/A"}</td>
                      <td>{p.retrograde ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Key Placements */}
          <div className="space-y-6">
            {/* Key placements highlight */}
            <motion.div
              {...fadeUp}
              {...(prefersReducedMotion ? {} : { transition: { delay: 0.1 } })}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <h2 className="font-heading text-lg font-semibold mb-4">
                Key Placements
              </h2>
              <div role="region" aria-label="Key Planetary Placements" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {KEY_PLACEMENTS.map((planetName) => {
                  const planet = chartData?.planets?.find(
                    (p) => p.planet === planetName
                  );
                  if (!planet && planetName === "Ascendant" && !hasBirthTime)
                    return (
                      <div
                        key={planetName}
                        className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center opacity-50"
                      >
                        <p className="text-lg mb-0.5">ASC</p>
                        <p className="text-xs text-muted-foreground">
                          {planetName}
                        </p>
                        <p className="text-xs text-muted-foreground italic mt-1">
                          Needs birth time
                        </p>
                      </div>
                    );
                  if (!planet) return null;

                  const elementDesc = `${planet.planet} in ${planet.sign}${planet.house ? ` in House ${planet.house}` : ""}`;

                  return (
                    <button
                      type="button"
                      key={planetName}
                      onClick={() => handleExplain(elementDesc)}
                      className={cn(
                        "group/card rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center transition-all duration-200",
                        "hover:border-cosmic-purple/30 hover:bg-cosmic-purple/[0.06] hover:shadow-[0_0_15px_rgba(124,58,237,0.1)]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple/50",
                        "cursor-pointer"
                      )}
                      title={`Explain ${elementDesc}`}
                    >
                      <p className="text-lg mb-0.5">
                        {PLANET_SYMBOLS[planetName] || planetName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {planetName}
                      </p>
                      <p className="text-sm font-medium mt-1">{planet.sign}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDegree(planet.degree)}
                        {planet.house && ` | House ${planet.house}`}
                        {planet.retrograde && " R"}
                      </p>
                      <Sparkles className="mx-auto mt-1.5 h-3 w-3 text-cosmic-purple-light opacity-0 group-hover/card:opacity-70 transition-opacity duration-200" />
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              {...fadeUp}
              {...(prefersReducedMotion ? {} : { transition: { delay: 0.2 } })}
              className="rounded-xl border border-cosmic-purple/20 bg-gradient-to-br from-cosmic-purple/10 to-transparent p-6 text-center"
            >
              <h3 className="font-heading text-lg font-semibold mb-2">
                Check Compatibility With Someone
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                See how your chart aligns with someone special.
              </p>
              <Button
                asChild
                className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
              >
                <Link href="/compatibility">
                  <Users className="mr-2 h-4 w-4" />
                  Check Compatibility
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Planet Positions Table */}
        <motion.div
          {...fadeUp}
          {...(prefersReducedMotion ? {} : { transition: { delay: 0.3 } })}
          className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
        >
          <h2 className="font-heading text-lg font-semibold mb-4">
            Planet Positions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <caption className="sr-only">Planetary Positions</caption>
              <thead>
                <tr className="border-b border-white/10">
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Planet
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sign
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Degree
                  </th>
                  {hasBirthTime && (
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      House
                    </th>
                  )}
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Retrograde
                  </th>
                </tr>
              </thead>
              <tbody>
                {chartData?.planets?.map((planet) => {
                  const isKey = KEY_PLACEMENTS.includes(planet.planet);
                  const elementDesc = `${planet.planet} in ${planet.sign}${planet.house ? ` in House ${planet.house}` : ""}${planet.retrograde ? " (retrograde)" : ""}`;

                  return (
                    <tr
                      key={planet.planet}
                      className={cn(
                        "border-b border-white/5 transition-colors hover:bg-white/[0.02]",
                        isKey && "bg-cosmic-purple/[0.03]"
                      )}
                    >
                      <td className="px-3 py-3">
                        <ExplainableElement
                          element={elementDesc}
                          onExplain={handleExplain}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-lg">
                              {PLANET_SYMBOLS[planet.planet] || ""}
                            </span>
                            <span
                              className={cn(
                                "text-sm",
                                isKey &&
                                  "font-semibold text-cosmic-purple-light"
                              )}
                            >
                              {planet.planet}
                            </span>
                          </span>
                        </ExplainableElement>
                      </td>
                      <td className="px-3 py-3">
                        <ExplainableElement
                          element={elementDesc}
                          onExplain={handleExplain}
                          className="text-sm"
                        >
                          {planet.sign}
                        </ExplainableElement>
                      </td>
                      <td className="px-3 py-3 text-sm font-mono text-muted-foreground">
                        {formatDegree(planet.degree)}
                      </td>
                      {hasBirthTime && (
                        <td className="px-3 py-3 text-sm text-muted-foreground">
                          {planet.house || "\u2014"}
                        </td>
                      )}
                      <td className="px-3 py-3">
                        {planet.retrograde ? (
                          <Badge
                            variant="outline"
                            className="text-xs border-gold/30 text-gold"
                          >
                            R
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">
                            \u2014
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Aspects Table */}
        {chartData?.aspects && chartData.aspects.length > 0 && (
          <motion.div
            {...fadeUp}
            {...(prefersReducedMotion ? {} : { transition: { delay: 0.35 } })}
            className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
          >
            <h2 className="font-heading text-lg font-semibold mb-4">
              Aspects
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <caption className="sr-only">Planetary Aspects</caption>
                <thead>
                  <tr className="border-b border-white/10">
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Aspect
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Orb
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.aspects.map((aspect, i) => {
                    const a = aspect as Record<string, unknown>;
                    const aspectKind = String(a.aspect || a.type || "");
                    const aspectLabel =
                      ASPECT_LABELS[aspectKind] || aspectKind;
                    const elementDesc = `${aspect.planet1} ${aspectLabel} ${aspect.planet2} (orb ${aspect.orb.toFixed(1)}\u00B0)`;
                    const isHarmonious =
                      aspectKind === "trine" ||
                      aspectKind === "sextile" ||
                      aspectKind === "conjunction";

                    return (
                      <tr
                        key={`${aspect.planet1}-${aspect.planet2}-${i}`}
                        className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="px-3 py-3">
                          <ExplainableElement
                            element={elementDesc}
                            onExplain={handleExplain}
                          >
                            <span className="flex items-center gap-1.5 text-sm">
                              <span>
                                {PLANET_SYMBOLS[aspect.planet1] || ""}{" "}
                                {aspect.planet1}
                              </span>
                              <span className="text-muted-foreground">
                                &ndash;
                              </span>
                              <span>
                                {PLANET_SYMBOLS[aspect.planet2] || ""}{" "}
                                {aspect.planet2}
                              </span>
                            </span>
                          </ExplainableElement>
                        </td>
                        <td className="px-3 py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              isHarmonious
                                ? "border-emerald-500/30 text-emerald-400"
                                : "border-red-500/30 text-red-400"
                            )}
                          >
                            {aspectLabel}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-sm font-mono text-muted-foreground">
                          {aspect.orb.toFixed(1)}&deg;
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* House Placements Table */}
        {hasBirthTime && chartData?.houses && (
          <motion.div
            {...fadeUp}
            {...(prefersReducedMotion ? {} : { transition: { delay: 0.4 } })}
            className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
          >
            <h2 className="font-heading text-lg font-semibold mb-4">
              House Placements
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <caption className="sr-only">House Placements</caption>
                <thead>
                  <tr className="border-b border-white/10">
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      House
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Sign
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ruler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.houses.map((house) => {
                    const ruler =
                      house.ruler || HOUSE_RULERS[house.sign] || "\u2014";
                    const elementDesc = `House ${house.house} in ${house.sign}${house.house === 1 ? " (Ascendant)" : ""}${house.house === 10 ? " (Midheaven)" : ""}, ruled by ${ruler}`;

                    return (
                      <tr
                        key={house.house}
                        className={cn(
                          "border-b border-white/5 transition-colors hover:bg-white/[0.02]",
                          (house.house === 1 || house.house === 10) &&
                            "bg-cosmic-purple/[0.03]"
                        )}
                      >
                        <td className="px-3 py-3">
                          <ExplainableElement
                            element={elementDesc}
                            onExplain={handleExplain}
                          >
                            <span
                              className={cn(
                                "text-sm",
                                (house.house === 1 || house.house === 10) &&
                                  "font-semibold text-cosmic-purple-light"
                              )}
                            >
                              House {house.house}
                              {house.house === 1 && " (ASC)"}
                              {house.house === 10 && " (MC)"}
                            </span>
                          </ExplainableElement>
                        </td>
                        <td className="px-3 py-3">
                          <ExplainableElement
                            element={elementDesc}
                            onExplain={handleExplain}
                            className="text-sm"
                          >
                            {house.sign}
                          </ExplainableElement>
                        </td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">
                          {ruler}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* What's Next */}
        <motion.div
          {...fadeUp}
          {...(prefersReducedMotion ? {} : { transition: { delay: 0.45 } })}
          className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
        >
          <h2 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            What&apos;s Next
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/compatibility"
              className="group glass-card rounded-xl border border-white/10 p-4 flex flex-col items-center text-center gap-2 transition-all hover:border-cosmic-purple/50 hover:bg-cosmic-purple/5"
            >
              <Heart className="h-5 w-5 text-cosmic-purple-light group-hover:text-cosmic-purple transition-colors" />
              <span className="text-sm font-medium leading-tight">
                Check Compatibility
              </span>
              <span className="text-[11px] leading-snug text-muted-foreground">
                See how your chart aligns with someone
              </span>
            </Link>
            <Link
              href="/horoscope"
              className="group glass-card rounded-xl border border-white/10 p-4 flex flex-col items-center text-center gap-2 transition-all hover:border-cosmic-purple/50 hover:bg-cosmic-purple/5"
            >
              <Sun className="h-5 w-5 text-cosmic-purple-light group-hover:text-cosmic-purple transition-colors" />
              <span className="text-sm font-medium leading-tight">
                Daily Horoscope
              </span>
              <span className="text-[11px] leading-snug text-muted-foreground">
                Your personalized cosmic guidance today
              </span>
            </Link>
            <Link
              href="/learn"
              className="group glass-card rounded-xl border border-white/10 p-4 flex flex-col items-center text-center gap-2 transition-all hover:border-cosmic-purple/50 hover:bg-cosmic-purple/5"
            >
              <BookOpen className="h-5 w-5 text-cosmic-purple-light group-hover:text-cosmic-purple transition-colors" />
              <span className="text-sm font-medium leading-tight">
                Explore Your Placements
              </span>
              <span className="text-[11px] leading-snug text-muted-foreground">
                Learn what your chart positions mean
              </span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* AI Explanation Sheet */}
      <Sheet open={explainOpen} onOpenChange={setExplainOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md border-white/10 bg-background/95 backdrop-blur-xl"
        >
          <SheetHeader className="border-b border-white/10 pb-4">
            <SheetTitle className="flex items-center gap-2 text-base font-heading">
              <Sparkles className="h-4 w-4 text-cosmic-purple-light" />
              AI Explanation
            </SheetTitle>
            <SheetDescription className="text-sm text-cosmic-purple-light/80 font-medium">
              {explainElement}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="py-4">
              {explainLoading && (
                <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-cosmic-purple-light" />
                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-gold animate-pulse" />
                  </div>
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Consulting the stars...
                  </p>
                </div>
              )}

              {explainError && !explainLoading && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/[0.05] p-4">
                  <p className="text-sm text-red-400">{explainError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleExplain(explainElement)}
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {explainText && !explainLoading && (
                <motion.div
                  {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } })}
                  className="prose prose-invert prose-sm max-w-none"
                >
                  {explainText.split("\n").map((paragraph, i) =>
                    paragraph.trim() ? (
                      <p
                        key={i}
                        className="text-sm leading-relaxed text-foreground/90 mb-3"
                      >
                        {paragraph}
                      </p>
                    ) : null
                  )}
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

