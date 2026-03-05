"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Compass,
  Sparkles,
  Heart,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlanetData {
  name: string;
  sign: string;
  degree?: number;
}

interface ChartData {
  planets?: PlanetData[];
}

interface PublicProfile {
  id: string;
  name: string;
  sunSign: string | null;
  moonSign: string | null;
  risingSign: string | null;
  element: string | null;
  birthCity: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: "Fire",
  Leo: "Fire",
  Sagittarius: "Fire",
  Taurus: "Earth",
  Virgo: "Earth",
  Capricorn: "Earth",
  Gemini: "Air",
  Libra: "Air",
  Aquarius: "Air",
  Cancer: "Water",
  Scorpio: "Water",
  Pisces: "Water",
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "from-orange-500/20 to-red-500/20 border-orange-500/30",
  Earth: "from-green-600/20 to-emerald-500/20 border-green-500/30",
  Air: "from-sky-500/20 to-indigo-500/20 border-sky-500/30",
  Water: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
};

const ELEMENT_TEXT: Record<string, string> = {
  Fire: "text-orange-400",
  Earth: "text-emerald-400",
  Air: "text-sky-400",
  Water: "text-blue-400",
};

function getArchetype(sunSign: string | null): string {
  if (!sunSign) return "Cosmic Explorer";
  const archetypes: Record<string, string> = {
    Aries: "The Trailblazer",
    Taurus: "The Stabilizer",
    Gemini: "The Communicator",
    Cancer: "The Nurturer",
    Leo: "The Radiant One",
    Virgo: "The Analyst",
    Libra: "The Harmonizer",
    Scorpio: "The Transformer",
    Sagittarius: "The Explorer",
    Capricorn: "The Architect",
    Aquarius: "The Visionary",
    Pisces: "The Dreamer",
  };
  return archetypes[sunSign] ?? "Cosmic Explorer";
}

function getSignSymbol(sign: string | null): string {
  if (!sign) return "?";
  const symbols: Record<string, string> = {
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
  return symbols[sign] ?? "?";
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PublicProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const { status } = useSession();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${profileId}?public=true`);
        if (res.ok) {
          const json = await res.json();
          const chartData = json.profile?.chartData as ChartData | null;

          const findSign = (planetName: string): string | null => {
            const planet = chartData?.planets?.find(
              (p: PlanetData) => p.name.toLowerCase() === planetName.toLowerCase()
            );
            return planet?.sign ?? null;
          };

          const sunSign = findSign("Sun");
          const moonSign = findSign("Moon");
          const risingSign = findSign("Ascendant") || findSign("Rising");

          setProfile({
            id: json.profile.id,
            name: json.profile.name,
            sunSign,
            moonSign,
            risingSign,
            element: sunSign ? SIGN_ELEMENTS[sunSign] ?? null : null,
            birthCity: json.profile.birthCity,
          });
        } else {
          const errJson = await res.json().catch(() => null);
          setError(
            errJson?.error || "This profile is not available."
          );
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Unable to load this profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cosmic-purple-light" />
          <p className="text-sm text-muted-foreground">
            Loading cosmic identity...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-md text-center px-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-heading text-xl font-semibold mb-2">
            Profile Not Found
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {error || "This cosmic identity card is not publicly available."}
          </p>
          <Button asChild variant="outline" className="border-white/10">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const element = profile.element;
  const elementColorClass = element
    ? ELEMENT_COLORS[element] ?? ""
    : "from-cosmic-purple/20 to-purple-500/20 border-cosmic-purple/30";
  const elementTextClass = element
    ? ELEMENT_TEXT[element] ?? "text-cosmic-purple-light"
    : "text-cosmic-purple-light";
  const archetype = getArchetype(profile.sunSign);

  return (
    <div className="min-h-screen pt-16 pb-16">
      <div className="mx-auto max-w-lg px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Cosmic Identity Card */}
          <div
            className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${elementColorClass} p-8 shadow-xl`}
          >
            {/* Background glow */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="mb-3 text-5xl">
                  {getSignSymbol(profile.sunSign)}
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-1">
                  {profile.name}
                </h1>
                <p className={`text-sm font-medium ${elementTextClass}`}>
                  {archetype}
                </p>
                {element && (
                  <Badge
                    variant="outline"
                    className={`mt-2 border-white/20 ${elementTextClass} text-xs`}
                  >
                    {element} Sign
                  </Badge>
                )}
              </div>

              {/* Cosmic Trio */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <Sun className="mx-auto mb-1 h-5 w-5 text-amber-400" />
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Sun
                  </p>
                  <p className="text-sm font-semibold">
                    {profile.sunSign ?? "Unknown"}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <Moon className="mx-auto mb-1 h-5 w-5 text-slate-300" />
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Moon
                  </p>
                  <p className="text-sm font-semibold">
                    {profile.moonSign ?? "Unknown"}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <Compass className="mx-auto mb-1 h-5 w-5 text-cosmic-purple-light" />
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Rising
                  </p>
                  <p className="text-sm font-semibold">
                    {profile.risingSign ?? "Unknown"}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 mb-6" />

              {/* CTA */}
              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                >
                  <Link href="/compatibility">
                    <Heart className="mr-2 h-4 w-4" />
                    Check Compatibility with {profile.name}
                  </Link>
                </Button>

                {status !== "authenticated" && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-white/20"
                  >
                    <Link href="/auth/signup">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Your Cosmic Profile
                    </Link>
                  </Button>
                )}
              </div>

              {/* Footer watermark */}
              <p className="mt-6 text-center text-[11px] text-muted-foreground/50">
                ChartChemistry
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
