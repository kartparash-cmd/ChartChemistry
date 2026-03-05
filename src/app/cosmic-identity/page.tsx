"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Sunrise,
  Sparkles,
  Loader2,
  Lock,
  Copy,
  Check,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================================
// Types
// ============================================================

interface PlanetData {
  planet: string;
  sign: string;
  degree: number;
  house?: number | null;
}

interface ProfileData {
  id: string;
  name: string;
  birthDate: string;
  birthTime?: string | null;
  birthCity: string;
  isOwner: boolean;
  chartData?: {
    planets?: PlanetData[];
  } | null;
}

// ============================================================
// Zodiac data & helpers
// ============================================================

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

const SIGN_GLYPHS: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "text-orange-400",
  Earth: "text-emerald-400",
  Air: "text-sky-400",
  Water: "text-blue-400",
};

const ELEMENT_BG_COLORS: Record<string, string> = {
  Fire: "bg-orange-500/10 border-orange-500/20",
  Earth: "bg-emerald-500/10 border-emerald-500/20",
  Air: "bg-sky-500/10 border-sky-500/20",
  Water: "bg-blue-500/10 border-blue-500/20",
};

const ELEMENT_DESCRIPTIONS: Record<string, string> = {
  Fire: "Passionate, dynamic, and action-oriented. You lead with enthusiasm and inspire others.",
  Earth: "Grounded, practical, and reliable. You build things that last and value stability.",
  Air: "Intellectual, communicative, and curious. You thrive on ideas and social connections.",
  Water: "Intuitive, emotional, and empathetic. You feel deeply and understand the unseen.",
};

/** Emotional archetypes based on Moon sign */
const MOON_ARCHETYPES: Record<string, string> = {
  Aries: "The Warrior Heart",
  Taurus: "The Steady Soul",
  Gemini: "The Curious Spirit",
  Cancer: "The Nurturer",
  Leo: "The Radiant Heart",
  Virgo: "The Healer",
  Libra: "The Harmonizer",
  Scorpio: "The Deep Feeler",
  Sagittarius: "The Free Spirit",
  Capricorn: "The Resilient One",
  Aquarius: "The Visionary Heart",
  Pisces: "The Empath",
};

/** Social archetypes based on Rising sign */
const RISING_ARCHETYPES: Record<string, string> = {
  Aries: "The Trailblazer",
  Taurus: "The Pillar",
  Gemini: "The Storyteller",
  Cancer: "The Guardian",
  Leo: "The Star",
  Virgo: "The Analyst",
  Libra: "The Diplomat",
  Scorpio: "The Enigma",
  Sagittarius: "The Explorer",
  Capricorn: "The Authority",
  Aquarius: "The Innovator",
  Pisces: "The Dreamer",
};

/** Combined archetype names based on big three combinations */
const ARCHETYPE_ADJECTIVES: Record<string, string> = {
  Aries: "Passionate",
  Taurus: "Steadfast",
  Gemini: "Mercurial",
  Cancer: "Nurturing",
  Leo: "Radiant",
  Virgo: "Discerning",
  Libra: "Harmonious",
  Scorpio: "Magnetic",
  Sagittarius: "Adventurous",
  Capricorn: "Ambitious",
  Aquarius: "Visionary",
  Pisces: "Mystical",
};

const ARCHETYPE_NOUNS: Record<string, string> = {
  Aries: "Pioneer",
  Taurus: "Builder",
  Gemini: "Messenger",
  Cancer: "Guardian",
  Leo: "Sovereign",
  Virgo: "Sage",
  Libra: "Peacemaker",
  Scorpio: "Alchemist",
  Sagittarius: "Philosopher",
  Capricorn: "Architect",
  Aquarius: "Visionary",
  Pisces: "Mystic",
};

function getArchetypeName(sunSign: string, moonSign: string, risingSign: string | null): string {
  const adj = ARCHETYPE_ADJECTIVES[sunSign] || "Cosmic";
  const noun = risingSign
    ? ARCHETYPE_NOUNS[risingSign] || "Stargazer"
    : ARCHETYPE_NOUNS[moonSign] || "Stargazer";
  return `The ${adj} ${noun}`;
}

function getSignFromPlanets(planets: PlanetData[] | undefined, planetName: string): string | null {
  if (!planets) return null;
  const found = planets.find((p) => p.planet === planetName);
  return found?.sign || null;
}

function getDominantElement(planets: PlanetData[] | undefined): { element: string; count: number } | null {
  if (!planets) return null;

  const counts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };

  // Count personal planets (Sun through Saturn for a simplified approach)
  const personalPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
  for (const p of planets) {
    if (personalPlanets.includes(p.planet) && SIGN_ELEMENTS[p.sign]) {
      counts[SIGN_ELEMENTS[p.sign]]++;
    }
  }

  // Also count Ascendant if present
  const asc = planets.find((p) => p.planet === "Ascendant");
  if (asc && SIGN_ELEMENTS[asc.sign]) {
    counts[SIGN_ELEMENTS[asc.sign]]++;
  }

  let maxElement = "Fire";
  let maxCount = 0;
  for (const [element, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxElement = element;
    }
  }

  return { element: maxElement, count: maxCount };
}

function getElementBalance(planets: PlanetData[] | undefined): Record<string, number> {
  const counts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  if (!planets) return counts;

  const personalPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Ascendant"];
  for (const p of planets) {
    if (personalPlanets.includes(p.planet) && SIGN_ELEMENTS[p.sign]) {
      counts[SIGN_ELEMENTS[p.sign]]++;
    }
  }

  return counts;
}

// ============================================================
// Component
// ============================================================

export default function CosmicIdentityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isPremium =
    session?.user?.plan === "PREMIUM" || session?.user?.plan === "ANNUAL";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        // Find the owner profile (primary), or fall back to the first profile
        const profiles: ProfileData[] = data.profiles || [];
        const ownerProfile = profiles.find((p: ProfileData) => p.isOwner) || profiles[0] || null;
        setProfile(ownerProfile);
      } catch {
        // Fail silently
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cosmic-purple-light" />
          <p className="mt-3 text-sm text-muted-foreground">
            Decoding your cosmic identity...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // Extract chart data
  const planets = profile?.chartData?.planets;
  const sunSign = getSignFromPlanets(planets, "Sun");
  const moonSign = getSignFromPlanets(planets, "Moon");
  const risingSign = getSignFromPlanets(planets, "Ascendant");
  const sunElement = sunSign ? SIGN_ELEMENTS[sunSign] : null;
  const moonElement = moonSign ? SIGN_ELEMENTS[moonSign] : null;
  const risingElement = risingSign ? SIGN_ELEMENTS[risingSign] : null;
  const dominantElement = getDominantElement(planets);
  const elementBalance = getElementBalance(planets);
  const maxElementCount = Math.max(...Object.values(elementBalance), 1);

  const archetypeName =
    sunSign && moonSign
      ? getArchetypeName(sunSign, moonSign, risingSign)
      : null;

  const handleCopyIdentity = async () => {
    if (!sunSign) return;
    const lines = [
      `My Cosmic Identity - ChartChemistry`,
      ``,
      archetypeName ? `${archetypeName}` : "",
      ``,
      `Sun: ${sunSign} ${SIGN_GLYPHS[sunSign] || ""} (${sunElement})`,
      moonSign ? `Moon: ${moonSign} ${SIGN_GLYPHS[moonSign] || ""} - ${MOON_ARCHETYPES[moonSign] || ""}` : "",
      risingSign ? `Rising: ${risingSign} ${SIGN_GLYPHS[risingSign] || ""} - ${RISING_ARCHETYPES[risingSign] || ""}` : "",
      ``,
      `Discover yours at chartchemistry.io`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  // No profile
  if (!profile || !sunSign) {
    return (
      <div className="min-h-screen">
        <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cosmic-purple/10">
              <Fingerprint className="h-10 w-10 text-cosmic-purple-light" />
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
              Your <span className="cosmic-text">Cosmic Identity</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Create a birth profile to discover your unique cosmic archetype,
              elemental balance, and rarity stats.
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
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/10">
              <Fingerprint className="h-8 w-8 text-cosmic-purple-light" />
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
              Your <span className="cosmic-text">Cosmic Identity</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile.name}&apos;s unique astrological blueprint
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Archetype Card */}
        {archetypeName && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/[0.06] via-cosmic-purple/[0.03] to-transparent p-8 text-center backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-widest text-gold mb-3">
              Your Archetype
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold cosmic-text mb-4">
              {archetypeName}
            </h2>
            <div className="flex items-center justify-center gap-4 text-lg">
              {sunSign && (
                <span title={`Sun in ${sunSign}`}>{SIGN_GLYPHS[sunSign]}</span>
              )}
              {moonSign && (
                <span className="text-muted-foreground">/</span>
              )}
              {moonSign && (
                <span title={`Moon in ${moonSign}`}>{SIGN_GLYPHS[moonSign]}</span>
              )}
              {risingSign && (
                <span className="text-muted-foreground">/</span>
              )}
              {risingSign && (
                <span title={`Rising in ${risingSign}`}>{SIGN_GLYPHS[risingSign]}</span>
              )}
            </div>
          </motion.div>
        )}

        {/* Big Three - Always visible (free tier) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-heading text-lg font-semibold mb-4">
            Your Big Three
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sun Sign */}
            <div className={cn(
              "rounded-xl border p-5 backdrop-blur-sm",
              sunElement ? ELEMENT_BG_COLORS[sunElement] : "border-white/10 bg-white/[0.03]"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <Sun className="h-5 w-5 text-gold" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Sun Sign
                </span>
              </div>
              <div className="text-3xl mb-2">{SIGN_GLYPHS[sunSign] || ""}</div>
              <p className="font-heading text-xl font-semibold">{sunSign}</p>
              {sunElement && (
                <Badge
                  variant="outline"
                  className={cn("mt-2 text-xs", ELEMENT_COLORS[sunElement], "border-current/30")}
                >
                  {sunElement} Sign
                </Badge>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Your core identity and ego expression
              </p>
            </div>

            {/* Moon Sign */}
            <div className={cn(
              "rounded-xl border p-5 backdrop-blur-sm",
              moonSign && moonElement ? ELEMENT_BG_COLORS[moonElement] : "border-white/10 bg-white/[0.03]"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <Moon className="h-5 w-5 text-cosmic-purple-light" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Moon Sign
                </span>
              </div>
              {moonSign ? (
                <>
                  <div className="text-3xl mb-2">{SIGN_GLYPHS[moonSign] || ""}</div>
                  <p className="font-heading text-xl font-semibold">{moonSign}</p>
                  <Badge
                    variant="outline"
                    className={cn("mt-2 text-xs", ELEMENT_COLORS[moonElement!], "border-current/30")}
                  >
                    {MOON_ARCHETYPES[moonSign]}
                  </Badge>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Your emotional inner world
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-4">
                  Not calculated
                </p>
              )}
            </div>

            {/* Rising Sign */}
            <div className={cn(
              "rounded-xl border p-5 backdrop-blur-sm",
              risingSign && risingElement ? ELEMENT_BG_COLORS[risingElement] : "border-white/10 bg-white/[0.03]"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <Sunrise className="h-5 w-5 text-gold-light" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Rising Sign
                </span>
              </div>
              {risingSign ? (
                <>
                  <div className="text-3xl mb-2">{SIGN_GLYPHS[risingSign] || ""}</div>
                  <p className="font-heading text-xl font-semibold">{risingSign}</p>
                  <Badge
                    variant="outline"
                    className={cn("mt-2 text-xs", ELEMENT_COLORS[risingElement!], "border-current/30")}
                  >
                    {RISING_ARCHETYPES[risingSign]}
                  </Badge>
                  <p className="mt-3 text-xs text-muted-foreground">
                    How the world sees you
                  </p>
                </>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground italic mt-4 mb-2">
                    Birth time required
                  </p>
                  <Button asChild size="sm" variant="outline" className="text-xs border-white/10">
                    <Link href="/dashboard/profiles">
                      Add Birth Time
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Premium section: Dominant Element, Rarity, Full Breakdown */}
        {isPremium ? (
          <>
            {/* Dominant Element */}
            {dominantElement && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-heading text-lg font-semibold mb-4">
                  Dominant Element
                </h3>
                <div className={cn(
                  "rounded-xl border p-6 backdrop-blur-sm",
                  ELEMENT_BG_COLORS[dominantElement.element]
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full text-2xl",
                      dominantElement.element === "Fire" ? "bg-orange-500/20" :
                      dominantElement.element === "Earth" ? "bg-emerald-500/20" :
                      dominantElement.element === "Air" ? "bg-sky-500/20" :
                      "bg-blue-500/20"
                    )}>
                      {dominantElement.element === "Fire" ? "\uD83D\uDD25" :
                       dominantElement.element === "Earth" ? "\uD83C\uDF0D" :
                       dominantElement.element === "Air" ? "\uD83D\uDCA8" :
                       "\uD83C\uDF0A"}
                    </div>
                    <div>
                      <p className={cn("text-xl font-bold", ELEMENT_COLORS[dominantElement.element])}>
                        {dominantElement.element}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dominantElement.count} of your placements are in {dominantElement.element} signs
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {ELEMENT_DESCRIPTIONS[dominantElement.element]}
                  </p>

                  {/* Element balance bar chart */}
                  <div className="mt-6 space-y-3">
                    {(["Fire", "Earth", "Air", "Water"] as const).map((el) => (
                      <div key={el} className="flex items-center gap-3">
                        <span className={cn("w-12 text-xs font-medium", ELEMENT_COLORS[el])}>
                          {el}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full rounded-full",
                              el === "Fire" ? "bg-orange-400" :
                              el === "Earth" ? "bg-emerald-400" :
                              el === "Air" ? "bg-sky-400" :
                              "bg-blue-400"
                            )}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${((elementBalance[el] || 0) / maxElementCount) * 100}%`,
                            }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                          />
                        </div>
                        <span className="w-6 text-xs text-muted-foreground text-right">
                          {elementBalance[el] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rarity Stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="font-heading text-lg font-semibold mb-4">
                Rarity Stats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sun-Moon combo rarity */}
                {moonSign && (
                  <div className="rounded-xl border border-cosmic-purple/20 bg-cosmic-purple/[0.04] p-5 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Sun-Moon Combination
                    </p>
                    <p className="font-heading text-lg font-semibold">
                      {sunSign} Sun + {moonSign} Moon
                    </p>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-bold cosmic-text">
                        &lt; 1%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        of the population
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Only about 1 in 144 people share your exact Sun-Moon combination.
                      Your emotional landscape is truly unique.
                    </p>
                  </div>
                )}

                {/* Full big three rarity */}
                {risingSign && moonSign && (
                  <div className="rounded-xl border border-gold/20 bg-gold/[0.04] p-5 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Big Three Combination
                    </p>
                    <p className="font-heading text-lg font-semibold">
                      {sunSign} / {moonSign} / {risingSign}
                    </p>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gold">
                        &lt; 0.06%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        of the population
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      About 1 in 1,728 people share your exact Big Three.
                      Your cosmic fingerprint is extraordinarily rare.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Full Planetary Breakdown */}
            {planets && planets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="font-heading text-lg font-semibold mb-4">
                  Full Planetary Positions
                </h3>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {planets
                      .filter((p) => !["North Node", "South Node", "Chiron", "Part of Fortune"].includes(p.planet))
                      .map((p) => {
                        const element = SIGN_ELEMENTS[p.sign];
                        return (
                          <div
                            key={p.planet}
                            className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3"
                          >
                            <span className="text-xl w-8 text-center">
                              {SIGN_GLYPHS[p.sign] || ""}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{p.planet}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.sign} {p.degree !== undefined ? `${p.degree}\u00B0` : ""}
                                {p.house ? ` - House ${p.house}` : ""}
                              </p>
                            </div>
                            {element && (
                              <span className={cn("text-xs", ELEMENT_COLORS[element])}>
                                {element}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          /* Premium Gate */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-cosmic-purple/20 bg-gradient-to-br from-cosmic-purple/[0.06] to-transparent p-8 text-center backdrop-blur-sm"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/10">
              <Lock className="h-7 w-7 text-cosmic-purple-light" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">
              Unlock Your Full Cosmic Identity
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Premium members get access to their dominant element analysis,
              elemental balance chart, rarity statistics, and full planetary breakdown.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {[
                "Dominant Element",
                "Element Balance",
                "Rarity Stats",
                "Full Planetary Positions",
              ].map((feature) => (
                <Badge
                  key={feature}
                  variant="outline"
                  className="border-cosmic-purple/30 text-cosmic-purple-light text-xs"
                >
                  <Lock className="mr-1 h-3 w-3" />
                  {feature}
                </Badge>
              ))}
            </div>
            <Button
              asChild
              className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
            >
              <Link href="/pricing?callbackUrl=/cosmic-identity">
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Premium
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        )}

        {/* Share / Copy button */}
        {sunSign && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <Button
              variant="outline"
              className="border-gold/20 text-gold hover:bg-gold/10"
              onClick={handleCopyIdentity}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied to clipboard!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Share Your Cosmic Identity
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
