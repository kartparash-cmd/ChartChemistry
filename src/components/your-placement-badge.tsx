"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { NatalChart, PlanetPosition } from "@/types/astrology";

interface ProfileWithChart {
  id: string;
  name: string;
  isOwner: boolean;
  chartData: NatalChart | null;
}

interface CachedChartData {
  chart: NatalChart | null;
  fetchedAt: number;
}

// Module-level cache so we only fetch once per session across all badge instances
let chartCache: CachedChartData | null = null;
let fetchPromise: Promise<NatalChart | null> | null = null;

function fetchChartData(): Promise<NatalChart | null> {
  // If we already have a fetch in progress, reuse it
  if (fetchPromise) return fetchPromise;

  // If we have a recent cache (within 5 minutes), use it
  if (chartCache && Date.now() - chartCache.fetchedAt < 5 * 60 * 1000) {
    return Promise.resolve(chartCache.chart);
  }

  fetchPromise = fetch("/api/profile")
    .then((res) => {
      if (!res.ok) return null;
      return res.json();
    })
    .then((data) => {
      if (!data?.profiles) return null;
      const profiles: ProfileWithChart[] = data.profiles;
      // Prefer the owner profile (primary), otherwise use the first one
      const primary =
        profiles.find((p) => p.isOwner) || profiles[0];
      if (!primary?.chartData) return null;
      const chart = primary.chartData as NatalChart;
      chartCache = { chart, fetchedAt: Date.now() };
      return chart;
    })
    .catch(() => null)
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

/**
 * Displays a subtle badge if the user's chart has a matching sun sign.
 * Used on the zodiac learn page.
 */
export function SunSignBadge({ signName }: { signName: string }) {
  const { status } = useSession();
  const [match, setMatch] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchChartData().then((chart) => {
      if (!chart?.planets) return;
      const sun = chart.planets.find(
        (p: PlanetPosition) => p.planet === "Sun"
      );
      if (sun && sun.sign.toLowerCase() === signName.toLowerCase()) {
        setMatch(true);
      }
    });
  }, [status, signName]);

  if (!match) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 border border-gold/30 px-2.5 py-0.5 text-xs font-medium text-gold">
      <span aria-hidden="true">&#10024;</span>
      This is your Sun sign!
    </span>
  );
}

/**
 * Displays "Your [Planet] is in [Sign]" above a planet card.
 * Used on the planets learn page.
 */
export function PlanetPlacementBadge({ planetName }: { planetName: string }) {
  const { status } = useSession();
  const [placement, setPlacement] = useState<{
    sign: string;
    retrograde: boolean;
  } | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchChartData().then((chart) => {
      if (!chart?.planets) return;
      const planet = chart.planets.find(
        (p: PlanetPosition) => p.planet.toLowerCase() === planetName.toLowerCase()
      );
      if (planet) {
        setPlacement({ sign: planet.sign, retrograde: planet.retrograde });
      }
    });
  }, [status, planetName]);

  if (!placement) return null;

  return (
    <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-cosmic-purple/10 border border-cosmic-purple/25 px-3 py-1.5 text-xs font-medium text-cosmic-purple-light">
      <span aria-hidden="true">&#10024;</span>
      Your {planetName} is in {placement.sign}
      {placement.retrograde && (
        <span className="text-amber-400 ml-1">(Rx)</span>
      )}
    </div>
  );
}
