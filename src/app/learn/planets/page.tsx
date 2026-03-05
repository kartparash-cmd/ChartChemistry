import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sun } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "The Planets in Astrology",
  description:
    "Learn about the ten planets used in astrology: the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto.",
  keywords: [
    "planets astrology",
    "personal planets",
    "outer planets",
    "ruling planet",
    "sun moon astrology",
    "planetary meanings",
  ],
};

type PlanetCategory = "Luminary" | "Personal" | "Social" | "Outer";

interface Planet {
  name: string;
  symbol: string;
  category: PlanetCategory;
  rulesSigns: string[];
  represents: string;
  keywords: string[];
  description: string;
}

const categoryColors: Record<
  PlanetCategory,
  { bg: string; text: string; border: string; badge: string }
> = {
  Luminary: {
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    border: "border-amber-500/20 hover:border-amber-500/40",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  Personal: {
    bg: "bg-cosmic-purple/5",
    text: "text-cosmic-purple-light",
    border: "border-cosmic-purple/20 hover:border-cosmic-purple/40",
    badge: "bg-cosmic-purple/10 text-cosmic-purple-light border-cosmic-purple/20",
  },
  Social: {
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  Outer: {
    bg: "bg-blue-500/5",
    text: "text-blue-400",
    border: "border-blue-500/20 hover:border-blue-500/40",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
};

const planets: Planet[] = [
  {
    name: "Sun",
    symbol: "\u2609",
    category: "Luminary",
    rulesSigns: ["Leo"],
    represents: "Core identity, ego, vitality, and life purpose",
    keywords: ["Identity", "Willpower", "Vitality", "Purpose"],
    description:
      "The Sun represents your fundamental self -- your conscious ego, creative life force, and the central drive that fuels your sense of purpose. It is the most important placement in the chart and describes what you are becoming in this lifetime.",
  },
  {
    name: "Moon",
    symbol: "\u263D",
    category: "Luminary",
    rulesSigns: ["Cancer"],
    represents: "Emotions, instincts, habits, and inner world",
    keywords: ["Emotions", "Intuition", "Comfort", "Memory"],
    description:
      "The Moon governs your emotional landscape, subconscious patterns, and deepest needs. It reveals how you nurture and seek nurturing, your instinctive reactions, and the private self you show only to those closest to you.",
  },
  {
    name: "Mercury",
    symbol: "\u263F",
    category: "Personal",
    rulesSigns: ["Gemini", "Virgo"],
    represents: "Communication, intellect, logic, and learning style",
    keywords: ["Communication", "Thinking", "Learning", "Analysis"],
    description:
      "Mercury shapes how you think, communicate, and process information. This planet governs speech, writing, reasoning, and the way you connect ideas. It also rules commerce, technology, and short-distance travel.",
  },
  {
    name: "Venus",
    symbol: "\u2640",
    category: "Personal",
    rulesSigns: ["Taurus", "Libra"],
    represents: "Love, beauty, values, and attraction",
    keywords: ["Love", "Beauty", "Values", "Pleasure"],
    description:
      "Venus reveals what you find beautiful, how you express affection, and what you value most in relationships and possessions. It governs romantic attraction, aesthetic taste, and your capacity for harmony and enjoyment.",
  },
  {
    name: "Mars",
    symbol: "\u2642",
    category: "Personal",
    rulesSigns: ["Aries", "Scorpio (traditional)"],
    represents: "Drive, ambition, energy, and assertiveness",
    keywords: ["Action", "Desire", "Courage", "Aggression"],
    description:
      "Mars fuels your drive to act, compete, and assert yourself in the world. It governs physical energy, sexual desire, courage, and how you handle anger and conflict. Mars shows what motivates you and how you pursue your goals.",
  },
  {
    name: "Jupiter",
    symbol: "\u2643",
    category: "Social",
    rulesSigns: ["Sagittarius"],
    represents: "Growth, expansion, wisdom, and abundance",
    keywords: ["Expansion", "Luck", "Wisdom", "Optimism"],
    description:
      "Jupiter is the great benefic, bringing expansion, opportunity, and generosity wherever it touches. It governs higher education, philosophy, long-distance travel, and your sense of faith. Jupiter shows where you find meaning and experience growth.",
  },
  {
    name: "Saturn",
    symbol: "\u2644",
    category: "Social",
    rulesSigns: ["Capricorn", "Aquarius (traditional)"],
    represents: "Structure, discipline, responsibility, and lessons",
    keywords: ["Discipline", "Structure", "Maturity", "Limitation"],
    description:
      "Saturn represents life's hard-won lessons, boundaries, and the structures you build through patience and effort. Often called the taskmaster, Saturn demands accountability and rewards perseverance with enduring mastery and authority.",
  },
  {
    name: "Uranus",
    symbol: "\u2645",
    category: "Outer",
    rulesSigns: ["Aquarius"],
    represents: "Innovation, rebellion, sudden change, and individuality",
    keywords: ["Revolution", "Freedom", "Innovation", "Awakening"],
    description:
      "Uranus disrupts the status quo and sparks revolutionary change. This planet governs innovation, technology, and the desire for freedom from convention. Uranus transits bring sudden breakthroughs, upheavals, and awakenings that alter your trajectory.",
  },
  {
    name: "Neptune",
    symbol: "\u2646",
    category: "Outer",
    rulesSigns: ["Pisces"],
    represents: "Dreams, intuition, spirituality, and illusion",
    keywords: ["Imagination", "Spirituality", "Illusion", "Compassion"],
    description:
      "Neptune dissolves boundaries and connects you to the transcendent, the imaginative, and the spiritual. It governs dreams, artistic inspiration, and universal compassion, but can also create confusion, escapism, and deception when poorly aspected.",
  },
  {
    name: "Pluto",
    symbol: "\u2647",
    category: "Outer",
    rulesSigns: ["Scorpio"],
    represents: "Transformation, power, death/rebirth, and the unconscious",
    keywords: ["Transformation", "Power", "Rebirth", "Intensity"],
    description:
      "Pluto governs the deepest processes of transformation, destruction, and regeneration. It brings to light hidden power dynamics, compulsions, and the psychological depths that drive evolution. Pluto transits are rare but profoundly life-altering.",
  },
];

const categoryDescriptions: Record<PlanetCategory, string> = {
  Luminary:
    "The luminaries -- the Sun and Moon -- are the most personal and visible forces in your chart, shaping your core identity and emotional foundation.",
  Personal:
    "The personal planets move quickly through the zodiac and describe your individual traits: how you think, love, and take action.",
  Social:
    "The social planets bridge the personal and collective, shaping how you grow, take responsibility, and relate to society.",
  Outer:
    "The outer planets move slowly, spending years in each sign. They represent generational forces and deep, transformative energies.",
};

const categories: PlanetCategory[] = ["Luminary", "Personal", "Social", "Outer"];

export default function PlanetsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-purple/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge
            variant="outline"
            className="mb-4 border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light"
          >
            <Sun className="mr-1 h-3 w-3" />
            10 Celestial Bodies
          </Badge>
          <h1 className="font-heading text-4xl font-bold sm:text-5xl mb-4">
            The <span className="cosmic-text">Planets</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            In astrology, the planets represent different facets of your psyche
            and life experience. Each planet carries a distinct energy that
            expresses itself through the sign and house it occupies in your chart.
          </p>
        </div>
      </section>

      {/* Category Legend */}
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-center gap-3">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant="outline"
              className={categoryColors[cat].badge}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl opacity-30" />

      {/* Planets by Category */}
      {categories.map((category) => {
        const categoryPlanets = planets.filter((p) => p.category === category);
        const colors = categoryColors[category];

        return (
          <section key={category} className="px-4 py-12">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <h2
                  className={`font-heading text-2xl font-bold mb-2 ${colors.text}`}
                >
                  {category === "Luminary" ? "The Luminaries" : `${category} Planets`}
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  {categoryDescriptions[category]}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryPlanets.map((planet) => (
                  <Card
                    key={planet.name}
                    className={`border ${colors.border} ${colors.bg} transition-all`}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{planet.symbol}</span>
                        <div>
                          <CardTitle className="font-heading text-lg">
                            {planet.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Rules: {planet.rulesSigns.join(", ")}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className={`text-sm font-medium ${colors.text}`}>
                        {planet.represents}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {planet.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${colors.text}`}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>

                      <CardDescription className="leading-relaxed text-sm">
                        {planet.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Navigation */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <Link
            href="/learn/zodiac"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; The Zodiac Signs
          </Link>
          <Link
            href="/learn/houses"
            className="inline-flex items-center text-sm font-medium text-cosmic-purple-light hover:text-cosmic-purple transition-colors"
          >
            Next: The Houses
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
