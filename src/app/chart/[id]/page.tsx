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
  Moon,
  Star,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const ZODIAC_EMOJIS: Record<string, string> = {
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

const FIRE_SIGNS = ["Aries", "Leo", "Sagittarius"];
const EARTH_SIGNS = ["Taurus", "Virgo", "Capricorn"];
const AIR_SIGNS = ["Gemini", "Libra", "Aquarius"];
const WATER_SIGNS = ["Cancer", "Scorpio", "Pisces"];

function getElement(sign: string): "fire" | "earth" | "air" | "water" {
  if (FIRE_SIGNS.includes(sign)) return "fire";
  if (EARTH_SIGNS.includes(sign)) return "earth";
  if (AIR_SIGNS.includes(sign)) return "air";
  return "water";
}

function getElementColors(sign: string) {
  const element = getElement(sign);
  switch (element) {
    case "fire":
      return {
        border: "border-orange-500/30",
        bg: "bg-orange-500/[0.06]",
        text: "text-orange-400",
        glow: "hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]",
        gradient: "from-orange-500/20 to-red-500/10",
        dot: "bg-orange-400",
        label: "Fire",
      };
    case "earth":
      return {
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/[0.06]",
        text: "text-emerald-400",
        glow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
        gradient: "from-emerald-500/20 to-green-500/10",
        dot: "bg-emerald-400",
        label: "Earth",
      };
    case "air":
      return {
        border: "border-sky-500/30",
        bg: "bg-sky-500/[0.06]",
        text: "text-sky-400",
        glow: "hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]",
        gradient: "from-sky-500/20 to-blue-500/10",
        dot: "bg-sky-400",
        label: "Air",
      };
    case "water":
      return {
        border: "border-blue-500/30",
        bg: "bg-blue-500/[0.06]",
        text: "text-blue-400",
        glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
        gradient: "from-blue-500/20 to-indigo-500/10",
        dot: "bg-blue-400",
        label: "Water",
      };
  }
}

const HOUSE_LABELS: Record<number, string> = {
  1: "Self",
  2: "Values",
  3: "Communication",
  4: "Home",
  5: "Creativity",
  6: "Health",
  7: "Partnerships",
  8: "Transformation",
  9: "Philosophy",
  10: "Career",
  11: "Community",
  12: "Subconscious",
};

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

  // Derived data for tabs
  const sunPlanet = chartData?.planets?.find((p) => p.planet === "Sun");
  const moonPlanet = chartData?.planets?.find((p) => p.planet === "Moon");
  const ascPlanet = chartData?.planets?.find((p) => p.planet === "Ascendant");

  const harmonious = chartData?.aspects?.filter((a) => {
    const kind = String((a as Record<string, unknown>).aspect || (a as Record<string, unknown>).type || "");
    return kind === "trine" || kind === "sextile" || kind === "conjunction";
  }) || [];
  const challenging = chartData?.aspects?.filter((a) => {
    const kind = String((a as Record<string, unknown>).aspect || (a as Record<string, unknown>).type || "");
    return kind === "square" || kind === "opposition" || kind === "quincunx" || kind === "semisextile";
  }) || [];

  return (
    <div className="min-h-screen">
      {/* Compact Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-cosmic-purple-light" />
              <span className="hidden sm:inline">Tap any placement for AI insights</span>
              <span className="sm:hidden">Tap for insights</span>
            </div>
          </div>
          <motion.div {...fadeUp} className="mt-3">
            <h1 className="font-heading text-xl sm:text-2xl font-bold">
              {profile.name}&apos;s Natal Chart
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(profile.birthDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {profile.birthTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {profile.birthTime}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.birthCity}, {profile.birthCountry}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* No birth time notice */}
        {!hasBirthTime && (
          <motion.div
            {...fadeIn}
            className="mb-4 rounded-xl border border-gold/20 bg-gold/[0.03] p-3 flex items-start gap-3"
          >
            <Info className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gold">Birth time not provided</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Houses, Rising sign, and exact Moon position unavailable.
              </p>
            </div>
          </motion.div>
        )}

        {/* House system recalculation error notice */}
        {recalcError && (
          <motion.div
            {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -5 } })}
            className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-3 flex items-start gap-3"
          >
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-400 flex-1">{recalcError}</p>
            <button
              onClick={() => setRecalcError(null)}
              className="text-red-400/60 hover:text-red-400 text-sm"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </motion.div>
        )}

        {/* ==================== TOP SECTION: Chart Wheel + Big 3 ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Chart Wheel - takes 3 columns */}
          <motion.div
            {...scaleIn}
            className="lg:col-span-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 backdrop-blur-sm"
            role="img"
            aria-label={`Natal chart wheel for ${profile.name}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-base font-semibold flex-1">
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
                      className="w-[130px] text-xs"
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
                      <td>{Math.round(p.degree)}&deg;</td>
                      <td>{p.house ?? "N/A"}</td>
                      <td>{p.retrograde ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Your Cosmic DNA - Big 3 - takes 2 columns */}
          <motion.div
            {...fadeUp}
            {...(prefersReducedMotion ? {} : { transition: { delay: 0.1 } })}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 backdrop-blur-sm flex-1">
              <h2 className="font-heading text-base font-semibold mb-1">
                Your Cosmic DNA
              </h2>
              <p className="text-xs text-muted-foreground mb-4">The Big 3 that define you</p>

              <div className="space-y-3">
                {/* Sun Card */}
                {sunPlanet ? (() => {
                  const colors = getElementColors(sunPlanet.sign);
                  const elementDesc = `Sun in ${sunPlanet.sign}${sunPlanet.house ? ` in House ${sunPlanet.house}` : ""}`;
                  return (
                    <button
                      type="button"
                      onClick={() => handleExplain(elementDesc)}
                      className={cn(
                        "group/big3 w-full rounded-xl border p-4 text-left transition-all duration-300",
                        colors.border, colors.bg, colors.glow,
                        "hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple/50 cursor-pointer"
                      )}
                      title={`Explain ${elementDesc}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("text-4xl", colors.text)}>
                          {ZODIAC_EMOJIS[sunPlanet.sign] || "\u2609"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Sun Sign</span>
                            <Badge variant="outline" className={cn("text-[10px] py-0", colors.border, colors.text)}>
                              {getElementColors(sunPlanet.sign).label}
                            </Badge>
                          </div>
                          <p className={cn("text-xl font-heading font-bold mt-0.5", colors.text)}>
                            {sunPlanet.sign}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDegree(sunPlanet.degree)}
                            {sunPlanet.house && ` \u00B7 House ${sunPlanet.house}`}
                          </p>
                        </div>
                        <Sparkles className="h-4 w-4 text-cosmic-purple-light opacity-0 group-hover/big3:opacity-70 transition-opacity" />
                      </div>
                    </button>
                  );
                })() : null}

                {/* Moon Card */}
                {moonPlanet ? (() => {
                  const colors = getElementColors(moonPlanet.sign);
                  const elementDesc = `Moon in ${moonPlanet.sign}${moonPlanet.house ? ` in House ${moonPlanet.house}` : ""}`;
                  return (
                    <button
                      type="button"
                      onClick={() => handleExplain(elementDesc)}
                      className={cn(
                        "group/big3 w-full rounded-xl border p-4 text-left transition-all duration-300",
                        colors.border, colors.bg, colors.glow,
                        "hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple/50 cursor-pointer"
                      )}
                      title={`Explain ${elementDesc}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("text-4xl", colors.text)}>
                          {ZODIAC_EMOJIS[moonPlanet.sign] || "\u263D"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Moon Sign</span>
                            <Badge variant="outline" className={cn("text-[10px] py-0", colors.border, colors.text)}>
                              {getElementColors(moonPlanet.sign).label}
                            </Badge>
                          </div>
                          <p className={cn("text-xl font-heading font-bold mt-0.5", colors.text)}>
                            {moonPlanet.sign}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDegree(moonPlanet.degree)}
                            {moonPlanet.house && ` \u00B7 House ${moonPlanet.house}`}
                          </p>
                        </div>
                        <Sparkles className="h-4 w-4 text-cosmic-purple-light opacity-0 group-hover/big3:opacity-70 transition-opacity" />
                      </div>
                    </button>
                  );
                })() : null}

                {/* Rising / Ascendant Card */}
                {ascPlanet ? (() => {
                  const colors = getElementColors(ascPlanet.sign);
                  const elementDesc = `Ascendant in ${ascPlanet.sign}`;
                  return (
                    <button
                      type="button"
                      onClick={() => handleExplain(elementDesc)}
                      className={cn(
                        "group/big3 w-full rounded-xl border p-4 text-left transition-all duration-300",
                        colors.border, colors.bg, colors.glow,
                        "hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple/50 cursor-pointer"
                      )}
                      title={`Explain ${elementDesc}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("text-4xl", colors.text)}>
                          {ZODIAC_EMOJIS[ascPlanet.sign] || "ASC"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Rising Sign</span>
                            <Badge variant="outline" className={cn("text-[10px] py-0", colors.border, colors.text)}>
                              {getElementColors(ascPlanet.sign).label}
                            </Badge>
                          </div>
                          <p className={cn("text-xl font-heading font-bold mt-0.5", colors.text)}>
                            {ascPlanet.sign}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDegree(ascPlanet.degree)}
                          </p>
                        </div>
                        <Sparkles className="h-4 w-4 text-cosmic-purple-light opacity-0 group-hover/big3:opacity-70 transition-opacity" />
                      </div>
                    </button>
                  );
                })() : (
                  <div className="w-full rounded-xl border border-white/5 bg-white/[0.02] p-4 opacity-50">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl text-muted-foreground">ASC</div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Rising Sign</span>
                        <p className="text-sm text-muted-foreground italic mt-1">Needs birth time</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick CTA under Big 3 */}
            <Button
              asChild
              className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white w-full"
            >
              <Link href="/compatibility">
                <Users className="mr-2 h-4 w-4" />
                Check Compatibility
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* ==================== MIDDLE SECTION: Tabbed Interface ==================== */}
        <motion.div
          {...fadeUp}
          {...(prefersReducedMotion ? {} : { transition: { delay: 0.2 } })}
          className="mt-6"
        >
          <Tabs defaultValue="planets" className="w-full">
            <TabsList className="w-full sm:w-auto bg-white/[0.03] border border-white/10 rounded-xl p-1">
              <TabsTrigger value="planets" className="gap-1.5 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple-light rounded-lg">
                <Star className="h-3.5 w-3.5" />
                Planets
                {chartData?.planets && (
                  <Badge variant="outline" className="ml-1 text-[10px] py-0 px-1.5 border-white/10">
                    {chartData.planets.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="aspects" className="gap-1.5 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple-light rounded-lg">
                <Sparkles className="h-3.5 w-3.5" />
                Aspects
                {chartData?.aspects && (
                  <Badge variant="outline" className="ml-1 text-[10px] py-0 px-1.5 border-white/10">
                    {chartData.aspects.length}
                  </Badge>
                )}
              </TabsTrigger>
              {hasBirthTime && chartData?.houses && (
                <TabsTrigger value="houses" className="gap-1.5 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple-light rounded-lg">
                  <Moon className="h-3.5 w-3.5" />
                  Houses
                  <Badge variant="outline" className="ml-1 text-[10px] py-0 px-1.5 border-white/10">
                    12
                  </Badge>
                </TabsTrigger>
              )}
            </TabsList>

            {/* ========== TAB 1: Planets as Cards Grid ========== */}
            <TabsContent value="planets" className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {chartData?.planets?.map((planet) => {
                  const colors = getElementColors(planet.sign);
                  const isKey = KEY_PLACEMENTS.includes(planet.planet);
                  const elementDesc = `${planet.planet} in ${planet.sign}${planet.house ? ` in House ${planet.house}` : ""}${planet.retrograde ? " (retrograde)" : ""}`;

                  return (
                    <button
                      type="button"
                      key={planet.planet}
                      onClick={() => handleExplain(elementDesc)}
                      className={cn(
                        "group/planet relative rounded-xl border p-3 sm:p-4 text-left transition-all duration-300",
                        "hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple/50 cursor-pointer",
                        colors.border, colors.bg, colors.glow,
                        isKey && "ring-1 ring-cosmic-purple/20"
                      )}
                      title={`Explain ${elementDesc}`}
                    >
                      {/* Retrograde badge */}
                      {planet.retrograde && (
                        <Badge
                          variant="outline"
                          className="absolute top-2 right-2 text-[10px] py-0 px-1 border-gold/40 text-gold"
                        >
                          Rx
                        </Badge>
                      )}

                      {/* Planet symbol - large */}
                      <div className={cn("text-3xl sm:text-4xl mb-2", colors.text)}>
                        {PLANET_SYMBOLS[planet.planet] || planet.planet}
                      </div>

                      {/* Planet name */}
                      <p className={cn(
                        "text-sm font-semibold leading-tight",
                        isKey ? "text-cosmic-purple-light" : "text-foreground"
                      )}>
                        {planet.planet}
                      </p>

                      {/* Sign with emoji */}
                      <p className={cn("text-xs font-medium mt-1", colors.text)}>
                        {ZODIAC_EMOJIS[planet.sign] || ""} {planet.sign}
                      </p>

                      {/* Degree and house */}
                      <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                        {formatDegree(planet.degree)}
                        {planet.house ? ` \u00B7 H${planet.house}` : ""}
                      </p>

                      {/* Hover sparkle */}
                      <Sparkles className="absolute bottom-2 right-2 h-3 w-3 text-cosmic-purple-light opacity-0 group-hover/planet:opacity-60 transition-opacity duration-200" />
                    </button>
                  );
                })}
              </div>

              {/* Screen reader table */}
              <div className="sr-only">
                <table>
                  <caption>Planetary Positions</caption>
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
                      <tr key={`sr-${p.planet}`}>
                        <td>{p.planet}</td>
                        <td>{p.sign}</td>
                        <td>{Math.round(p.degree)}&deg;</td>
                        <td>{p.house ?? "N/A"}</td>
                        <td>{p.retrograde ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* ========== TAB 2: Aspects - Grouped by Harmony ========== */}
            <TabsContent value="aspects" className="mt-4">
              {chartData?.aspects && chartData.aspects.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary badges */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">
                        {harmonious.length} Harmonious
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/[0.06] px-3 py-1">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <span className="text-xs font-medium text-red-400">
                        {challenging.length} Challenging
                      </span>
                    </div>
                  </div>

                  {/* Harmonious aspects */}
                  {harmonious.length > 0 && (
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-emerald-400/80 font-medium mb-2 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Harmonious Aspects
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {harmonious.map((aspect, i) => {
                          const a = aspect as Record<string, unknown>;
                          const aspectKind = String(a.aspect || a.type || "");
                          const aspectLabel = ASPECT_LABELS[aspectKind] || aspectKind;
                          const elementDesc = `${aspect.planet1} ${aspectLabel} ${aspect.planet2} (orb ${aspect.orb.toFixed(1)}\u00B0)`;

                          return (
                            <button
                              type="button"
                              key={`h-${aspect.planet1}-${aspect.planet2}-${i}`}
                              onClick={() => handleExplain(elementDesc)}
                              className={cn(
                                "group/aspect flex items-center gap-3 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] p-2.5 text-left transition-all duration-200",
                                "hover:border-emerald-500/30 hover:bg-emerald-500/[0.08] cursor-pointer",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                              )}
                              title={`Explain ${elementDesc}`}
                            >
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span className="text-base shrink-0">{PLANET_SYMBOLS[aspect.planet1] || ""}</span>
                                <span className="text-emerald-500/40 text-xs">&mdash;</span>
                                <span className="text-base shrink-0">{PLANET_SYMBOLS[aspect.planet2] || ""}</span>
                                <div className="ml-1.5 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {aspect.planet1} &amp; {aspect.planet2}
                                  </p>
                                  <p className="text-[10px] text-emerald-400">
                                    {aspectLabel} <span className="text-muted-foreground font-mono">{aspect.orb.toFixed(1)}&deg;</span>
                                  </p>
                                </div>
                              </div>
                              <Sparkles className="h-3 w-3 text-emerald-400 opacity-0 group-hover/aspect:opacity-60 transition-opacity shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Challenging aspects */}
                  {challenging.length > 0 && (
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-red-400/80 font-medium mb-2 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        Challenging Aspects
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {challenging.map((aspect, i) => {
                          const a = aspect as Record<string, unknown>;
                          const aspectKind = String(a.aspect || a.type || "");
                          const aspectLabel = ASPECT_LABELS[aspectKind] || aspectKind;
                          const elementDesc = `${aspect.planet1} ${aspectLabel} ${aspect.planet2} (orb ${aspect.orb.toFixed(1)}\u00B0)`;

                          return (
                            <button
                              type="button"
                              key={`c-${aspect.planet1}-${aspect.planet2}-${i}`}
                              onClick={() => handleExplain(elementDesc)}
                              className={cn(
                                "group/aspect flex items-center gap-3 rounded-lg border border-red-500/15 bg-red-500/[0.03] p-2.5 text-left transition-all duration-200",
                                "hover:border-red-500/30 hover:bg-red-500/[0.08] cursor-pointer",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                              )}
                              title={`Explain ${elementDesc}`}
                            >
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span className="text-base shrink-0">{PLANET_SYMBOLS[aspect.planet1] || ""}</span>
                                <span className="text-red-500/40 text-xs">&mdash;</span>
                                <span className="text-base shrink-0">{PLANET_SYMBOLS[aspect.planet2] || ""}</span>
                                <div className="ml-1.5 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {aspect.planet1} &amp; {aspect.planet2}
                                  </p>
                                  <p className="text-[10px] text-red-400">
                                    {aspectLabel} <span className="text-muted-foreground font-mono">{aspect.orb.toFixed(1)}&deg;</span>
                                  </p>
                                </div>
                              </div>
                              <Sparkles className="h-3 w-3 text-red-400 opacity-0 group-hover/aspect:opacity-60 transition-opacity shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Screen reader table */}
                  <div className="sr-only">
                    <table>
                      <caption>Planetary Aspects</caption>
                      <thead>
                        <tr>
                          <th scope="col">Planet 1</th>
                          <th scope="col">Planet 2</th>
                          <th scope="col">Aspect</th>
                          <th scope="col">Orb</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.aspects.map((aspect, i) => {
                          const a = aspect as Record<string, unknown>;
                          const aspectKind = String(a.aspect || a.type || "");
                          return (
                            <tr key={`sr-a-${i}`}>
                              <td>{aspect.planet1}</td>
                              <td>{aspect.planet2}</td>
                              <td>{ASPECT_LABELS[aspectKind] || aspectKind}</td>
                              <td>{aspect.orb.toFixed(1)}&deg;</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No aspect data available.
                </p>
              )}
            </TabsContent>

            {/* ========== TAB 3: Houses - Compact Grid ========== */}
            {hasBirthTime && chartData?.houses && (
              <TabsContent value="houses" className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {chartData.houses.map((house) => {
                    const colors = getElementColors(house.sign);
                    const ruler = house.ruler || HOUSE_RULERS[house.sign] || "\u2014";
                    const isAngular = house.house === 1 || house.house === 4 || house.house === 7 || house.house === 10;
                    const specialLabel = house.house === 1 ? "ASC" : house.house === 10 ? "MC" : null;
                    const elementDesc = `House ${house.house} in ${house.sign}${house.house === 1 ? " (Ascendant)" : ""}${house.house === 10 ? " (Midheaven)" : ""}, ruled by ${ruler}`;

                    return (
                      <button
                        type="button"
                        key={house.house}
                        onClick={() => handleExplain(elementDesc)}
                        className={cn(
                          "group/house relative rounded-xl border p-3 text-left transition-all duration-300",
                          "hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple/50 cursor-pointer",
                          colors.border, colors.bg, colors.glow,
                          isAngular && "ring-1 ring-cosmic-purple/25"
                        )}
                        title={`Explain ${elementDesc}`}
                      >
                        {/* House number */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "text-2xl font-heading font-bold leading-none",
                            isAngular ? "text-cosmic-purple-light" : "text-foreground/70"
                          )}>
                            {house.house}
                          </span>
                          {specialLabel && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-cosmic-purple/30 text-cosmic-purple-light">
                              {specialLabel}
                            </Badge>
                          )}
                        </div>

                        {/* House theme */}
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                          {HOUSE_LABELS[house.house] || ""}
                        </p>

                        {/* Sign */}
                        <p className={cn("text-sm font-semibold", colors.text)}>
                          {ZODIAC_EMOJIS[house.sign] || ""} {house.sign}
                        </p>

                        {/* Ruler */}
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {PLANET_SYMBOLS[ruler] || ""} {ruler}
                        </p>

                        <Sparkles className="absolute bottom-2 right-2 h-3 w-3 text-cosmic-purple-light opacity-0 group-hover/house:opacity-60 transition-opacity duration-200" />
                      </button>
                    );
                  })}
                </div>

                {/* Screen reader table */}
                <div className="sr-only">
                  <table>
                    <caption>House Placements</caption>
                    <thead>
                      <tr>
                        <th scope="col">House</th>
                        <th scope="col">Sign</th>
                        <th scope="col">Ruler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.houses.map((house) => (
                        <tr key={`sr-h-${house.house}`}>
                          <td>House {house.house}</td>
                          <td>{house.sign}</td>
                          <td>{house.ruler || HOUSE_RULERS[house.sign] || "\u2014"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>

        {/* ==================== BOTTOM: Compact What's Next ==================== */}
        <motion.div
          {...fadeUp}
          {...(prefersReducedMotion ? {} : { transition: { delay: 0.3 } })}
          className="mt-6 mb-4"
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Link
              href="/compatibility"
              className="group glass-card rounded-xl border border-white/10 p-3 flex flex-col items-center text-center gap-1.5 transition-all hover:border-cosmic-purple/50 hover:bg-cosmic-purple/5"
            >
              <Heart className="h-4 w-4 text-cosmic-purple-light group-hover:text-cosmic-purple transition-colors" />
              <span className="text-xs sm:text-sm font-medium leading-tight">
                Compatibility
              </span>
            </Link>
            <Link
              href="/horoscope"
              className="group glass-card rounded-xl border border-white/10 p-3 flex flex-col items-center text-center gap-1.5 transition-all hover:border-cosmic-purple/50 hover:bg-cosmic-purple/5"
            >
              <Sun className="h-4 w-4 text-cosmic-purple-light group-hover:text-cosmic-purple transition-colors" />
              <span className="text-xs sm:text-sm font-medium leading-tight">
                Horoscope
              </span>
            </Link>
            <Link
              href="/learn"
              className="group glass-card rounded-xl border border-white/10 p-3 flex flex-col items-center text-center gap-1.5 transition-all hover:border-cosmic-purple/50 hover:bg-cosmic-purple/5"
            >
              <BookOpen className="h-4 w-4 text-cosmic-purple-light group-hover:text-cosmic-purple transition-colors" />
              <span className="text-xs sm:text-sm font-medium leading-tight">
                Learn More
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

