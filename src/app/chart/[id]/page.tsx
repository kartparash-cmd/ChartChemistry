"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Info,
  Loader2,
  Clock,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartWheel, type PlanetPosition, type HouseCusp, type Aspect } from "@/components/chart-wheel";
import { cn } from "@/lib/utils";

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
  chartData: ChartData | null;
}

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

function formatDegree(degree: number): string {
  const sign = Math.floor(degree / 30);
  const signDeg = degree % 30;
  const deg = Math.floor(signDeg);
  const min = Math.floor((signDeg - deg) * 60);
  return `${deg}\u00B0${min.toString().padStart(2, "0")}'`;
}

export default function ChartPage() {
  const params = useParams();
  const [profile, setProfile] = useState<BirthChartProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const chartId = params.id as string;

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await fetch(`/api/profile/${chartId}`);
        if (res.ok) {
          const json = await res.json();
          setProfile(json.profile || json);
        } else {
          setProfile(getDemoProfile(chartId));
        }
      } catch {
        setProfile(getDemoProfile(chartId));
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [chartId]);

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
    chartData?.aspects?.map((a) => ({
      planet1: a.planet1,
      planet2: a.planet2,
      type: a.type,
      orb: a.orb,
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Wheel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
          >
            <h2 className="font-heading text-lg font-semibold mb-4 text-center">
              Chart Wheel
            </h2>
            <ChartWheel
              planets={wheelPlanets}
              houses={wheelHouses}
              aspects={wheelAspects}
            />
          </motion.div>

          {/* Key Placements */}
          <div className="space-y-6">
            {/* Key placements highlight */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <h2 className="font-heading text-lg font-semibold mb-4">
                Key Placements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  return (
                    <div
                      key={planetName}
                      className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center"
                    >
                      <p className="text-lg mb-0.5">
                        {PLANET_SYMBOLS[planetName] || planetName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {planetName}
                      </p>
                      <p className="text-sm font-medium mt-1">{planet.sign}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDegree(planet.degree)}
                        {planet.house && ` | House ${planet.house}`}
                        {planet.retrograde && " R"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
        >
          <h2 className="font-heading text-lg font-semibold mb-4">
            Planet Positions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Planet
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sign
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Degree
                  </th>
                  {hasBirthTime && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      House
                    </th>
                  )}
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Retrograde
                  </th>
                </tr>
              </thead>
              <tbody>
                {chartData?.planets?.map((planet, i) => {
                  const isKey = KEY_PLACEMENTS.includes(planet.planet);
                  return (
                    <tr
                      key={planet.planet}
                      className={cn(
                        "border-b border-white/5 transition-colors hover:bg-white/[0.02]",
                        isKey && "bg-cosmic-purple/[0.03]"
                      )}
                    >
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">
                            {PLANET_SYMBOLS[planet.planet] || ""}
                          </span>
                          <span
                            className={cn(
                              "text-sm",
                              isKey && "font-semibold text-cosmic-purple-light"
                            )}
                          >
                            {planet.planet}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm">{planet.sign}</td>
                      <td className="px-3 py-3 text-sm font-mono text-muted-foreground">
                        {formatDegree(planet.degree)}
                      </td>
                      {hasBirthTime && (
                        <td className="px-3 py-3 text-sm text-muted-foreground">
                          {planet.house || "—"}
                        </td>
                      )}
                      <td className="px-3 py-3">
                        {planet.retrograde ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-gold/30 text-gold"
                          >
                            R
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">
                            —
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

        {/* House Placements Table */}
        {hasBirthTime && chartData?.houses && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
          >
            <h2 className="font-heading text-lg font-semibold mb-4">
              House Placements
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      House
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Sign
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ruler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.houses.map((house) => (
                    <tr
                      key={house.house}
                      className={cn(
                        "border-b border-white/5 transition-colors hover:bg-white/[0.02]",
                        (house.house === 1 || house.house === 10) &&
                          "bg-cosmic-purple/[0.03]"
                      )}
                    >
                      <td className="px-3 py-3">
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
                      </td>
                      <td className="px-3 py-3 text-sm">{house.sign}</td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">
                        {house.ruler || HOUSE_RULERS[house.sign] || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Demo profile for when API is not available
function getDemoProfile(id: string): BirthChartProfile {
  return {
    id,
    name: "Alex",
    birthDate: "1995-03-21",
    birthTime: "14:30",
    birthCity: "New York",
    birthCountry: "United States",
    chartData: {
      planets: [
        { planet: "Sun", sign: "Aries", degree: 0.5, house: 10, retrograde: false },
        { planet: "Moon", sign: "Cancer", degree: 105.2, house: 1, retrograde: false },
        { planet: "Mercury", sign: "Pisces", degree: 345.8, house: 9, retrograde: true },
        { planet: "Venus", sign: "Taurus", degree: 42.3, house: 11, retrograde: false },
        { planet: "Mars", sign: "Leo", degree: 138.7, house: 2, retrograde: false },
        { planet: "Jupiter", sign: "Sagittarius", degree: 255.1, house: 6, retrograde: false },
        { planet: "Saturn", sign: "Pisces", degree: 338.4, house: 9, retrograde: true },
        { planet: "Uranus", sign: "Aquarius", degree: 305.9, house: 8, retrograde: false },
        { planet: "Neptune", sign: "Capricorn", degree: 295.2, house: 7, retrograde: false },
        { planet: "Pluto", sign: "Scorpio", degree: 230.6, house: 5, retrograde: false },
        { planet: "Ascendant", sign: "Cancer", degree: 97.0, house: 1, retrograde: false },
        { planet: "Midheaven", sign: "Aries", degree: 7.0, house: 10, retrograde: false },
      ],
      houses: [
        { house: 1, sign: "Cancer", degree: 97 },
        { house: 2, sign: "Leo", degree: 127 },
        { house: 3, sign: "Virgo", degree: 157 },
        { house: 4, sign: "Libra", degree: 187 },
        { house: 5, sign: "Scorpio", degree: 217 },
        { house: 6, sign: "Sagittarius", degree: 247 },
        { house: 7, sign: "Capricorn", degree: 277 },
        { house: 8, sign: "Aquarius", degree: 307 },
        { house: 9, sign: "Pisces", degree: 337 },
        { house: 10, sign: "Aries", degree: 7 },
        { house: 11, sign: "Taurus", degree: 37 },
        { house: 12, sign: "Gemini", degree: 67 },
      ],
      aspects: [
        { planet1: "Sun", planet2: "Mars", type: "trine", orb: 1.8 },
        { planet1: "Sun", planet2: "Jupiter", type: "trine", orb: 2.4 },
        { planet1: "Moon", planet2: "Venus", type: "sextile", orb: 2.1 },
        { planet1: "Mercury", planet2: "Saturn", type: "conjunction", orb: 0.6 },
        { planet1: "Venus", planet2: "Mars", type: "square", orb: 3.6 },
        { planet1: "Mars", planet2: "Pluto", type: "square", orb: 1.9 },
        { planet1: "Jupiter", planet2: "Neptune", type: "sextile", orb: 1.1 },
      ],
    },
  };
}
