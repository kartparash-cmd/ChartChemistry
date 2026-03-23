import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star, Compass, Sun, Moon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SunSignBadge } from "@/components/your-placement-badge";

export const metadata: Metadata = {
  title: "The Zodiac Signs",
  description:
    "Learn about all 12 zodiac signs: their elements, modalities, ruling planets, date ranges, and key personality traits.",
  alternates: { canonical: "/learn/zodiac" },
  keywords: [
    "zodiac signs",
    "astrology signs",
    "fire signs",
    "earth signs",
    "air signs",
    "water signs",
    "zodiac traits",
  ],
};

type Element = "Fire" | "Earth" | "Air" | "Water";
type Modality = "Cardinal" | "Fixed" | "Mutable";

interface ZodiacSign {
  name: string;
  symbol: string;
  dateRange: string;
  element: Element;
  modality: Modality;
  rulingPlanet: string;
  traits: string[];
  description: string;
}

const elementColors: Record<Element, { bg: string; text: string; border: string; badge: string }> = {
  Fire: {
    bg: "bg-red-500/5",
    text: "text-red-400",
    border: "border-red-500/20 hover:border-red-500/40",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  Earth: {
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  Air: {
    bg: "bg-sky-500/5",
    text: "text-sky-400",
    border: "border-sky-500/20 hover:border-sky-500/40",
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  Water: {
    bg: "bg-blue-500/5",
    text: "text-blue-400",
    border: "border-blue-500/20 hover:border-blue-500/40",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
};

const signs: ZodiacSign[] = [
  {
    name: "Aries",
    symbol: "\u2648",
    dateRange: "Mar 21 - Apr 19",
    element: "Fire",
    modality: "Cardinal",
    rulingPlanet: "Mars",
    traits: ["Bold", "Ambitious", "Energetic", "Pioneering"],
    description:
      "Aries is the first sign of the zodiac, representing new beginnings and raw initiative. Ruled by Mars, Aries natives are natural leaders who thrive on challenge, competition, and the thrill of forging ahead into uncharted territory.",
  },
  {
    name: "Taurus",
    symbol: "\u2649",
    dateRange: "Apr 20 - May 20",
    element: "Earth",
    modality: "Fixed",
    rulingPlanet: "Venus",
    traits: ["Reliable", "Sensual", "Patient", "Determined"],
    description:
      "Taurus embodies stability, comfort, and the appreciation of life's pleasures. Ruled by Venus, this sign values security, loyalty, and the beauty found in the physical world. Taurus builds lasting foundations with steady perseverance.",
  },
  {
    name: "Gemini",
    symbol: "\u264A",
    dateRange: "May 21 - Jun 20",
    element: "Air",
    modality: "Mutable",
    rulingPlanet: "Mercury",
    traits: ["Curious", "Adaptable", "Witty", "Communicative"],
    description:
      "Gemini is the sign of the twins, representing duality, communication, and intellectual curiosity. Ruled by Mercury, Gemini thrives on variety, social connection, and the exchange of ideas across every domain.",
  },
  {
    name: "Cancer",
    symbol: "\u264B",
    dateRange: "Jun 21 - Jul 22",
    element: "Water",
    modality: "Cardinal",
    rulingPlanet: "Moon",
    traits: ["Nurturing", "Intuitive", "Protective", "Emotional"],
    description:
      "Cancer is the nurturing heart of the zodiac, deeply connected to home, family, and emotional security. Ruled by the Moon, Cancer natives possess profound intuition and an innate ability to care for others.",
  },
  {
    name: "Leo",
    symbol: "\u264C",
    dateRange: "Jul 23 - Aug 22",
    element: "Fire",
    modality: "Fixed",
    rulingPlanet: "Sun",
    traits: ["Confident", "Generous", "Creative", "Dramatic"],
    description:
      "Leo radiates warmth, creativity, and magnetic charisma. Ruled by the Sun itself, Leo commands attention and inspires others with bold self-expression, generous spirit, and an unwavering loyalty to those they love.",
  },
  {
    name: "Virgo",
    symbol: "\u264D",
    dateRange: "Aug 23 - Sep 22",
    element: "Earth",
    modality: "Mutable",
    rulingPlanet: "Mercury",
    traits: ["Analytical", "Practical", "Diligent", "Helpful"],
    description:
      "Virgo brings order, precision, and a desire for improvement to everything it touches. Ruled by Mercury, Virgo excels at analysis, problem-solving, and service to others, always striving for refinement and excellence.",
  },
  {
    name: "Libra",
    symbol: "\u264E",
    dateRange: "Sep 23 - Oct 22",
    element: "Air",
    modality: "Cardinal",
    rulingPlanet: "Venus",
    traits: ["Diplomatic", "Harmonious", "Fair", "Social"],
    description:
      "Libra seeks balance, beauty, and partnership in all things. Ruled by Venus, this sign is the zodiac's natural mediator, valuing fairness, aesthetic harmony, and the deep connections forged through meaningful relationships.",
  },
  {
    name: "Scorpio",
    symbol: "\u264F",
    dateRange: "Oct 23 - Nov 21",
    element: "Water",
    modality: "Fixed",
    rulingPlanet: "Pluto (Mars traditionally)",
    traits: ["Intense", "Perceptive", "Passionate", "Transformative"],
    description:
      "Scorpio dives beneath the surface to uncover hidden truths and catalyze transformation. Ruled by Pluto (and traditionally by Mars), Scorpio possesses remarkable depth, emotional intensity, and the power to regenerate and reinvent itself.",
  },
  {
    name: "Sagittarius",
    symbol: "\u2650",
    dateRange: "Nov 22 - Dec 21",
    element: "Fire",
    modality: "Mutable",
    rulingPlanet: "Jupiter",
    traits: ["Adventurous", "Optimistic", "Philosophical", "Free-spirited"],
    description:
      "Sagittarius is the explorer and philosopher of the zodiac, driven by a quest for meaning, knowledge, and expansion. Ruled by Jupiter, this sign embraces adventure, higher learning, and the broadening of horizons.",
  },
  {
    name: "Capricorn",
    symbol: "\u2651",
    dateRange: "Dec 22 - Jan 19",
    element: "Earth",
    modality: "Cardinal",
    rulingPlanet: "Saturn",
    traits: ["Ambitious", "Disciplined", "Responsible", "Strategic"],
    description:
      "Capricorn is the master builder of the zodiac, channeling ambition and discipline into lasting achievement. Ruled by Saturn, Capricorn respects structure, tradition, and the patient climb toward long-term goals.",
  },
  {
    name: "Aquarius",
    symbol: "\u2652",
    dateRange: "Jan 20 - Feb 18",
    element: "Air",
    modality: "Fixed",
    rulingPlanet: "Uranus (Saturn traditionally)",
    traits: ["Innovative", "Independent", "Humanitarian", "Visionary"],
    description:
      "Aquarius is the visionary and humanitarian of the zodiac, looking toward the future with progressive ideals. Ruled by Uranus (and traditionally by Saturn), this sign values individuality, community, and the revolutionary ideas that advance humanity.",
  },
  {
    name: "Pisces",
    symbol: "\u2653",
    dateRange: "Feb 19 - Mar 20",
    element: "Water",
    modality: "Mutable",
    rulingPlanet: "Neptune",
    traits: ["Compassionate", "Imaginative", "Spiritual", "Empathic"],
    description:
      "Pisces is the mystic dreamer of the zodiac, swimming in the waters of imagination, compassion, and transcendence. Ruled by Neptune, Pisces possesses extraordinary empathy, creative vision, and a connection to the unseen.",
  },
];

export default function ZodiacPage() {
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
            <Star className="mr-1 h-3 w-3" />
            12 Signs
          </Badge>
          <h1 className="font-heading text-4xl font-bold sm:text-5xl mb-4">
            The <span className="cosmic-text">Zodiac Signs</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The zodiac is divided into twelve signs, each spanning 30 degrees of
            the ecliptic. Every sign belongs to an element and modality that
            shapes its fundamental nature.
          </p>
        </div>
      </section>

      {/* Element Legend */}
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-center gap-3">
          {(["Fire", "Earth", "Air", "Water"] as Element[]).map((element) => (
            <Badge
              key={element}
              variant="outline"
              className={elementColors[element].badge}
            >
              {element}
            </Badge>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl opacity-30" />

      {/* Signs Grid */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {signs.map((sign) => {
            const colors = elementColors[sign.element];
            return (
              <Card
                key={sign.name}
                className={`border ${colors.border} ${colors.bg} transition-all`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{sign.symbol}</span>
                      <div>
                        <CardTitle className="font-heading text-lg">
                          {sign.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {sign.dateRange}
                        </p>
                      </div>
                    </div>
                  </div>
                  <SunSignBadge signName={sign.name} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={colors.badge}>
                      {sign.element}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-white/10 text-muted-foreground"
                    >
                      {sign.modality}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-white/10 text-muted-foreground"
                    >
                      {sign.rulingPlanet}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {sign.traits.map((trait) => (
                      <span
                        key={trait}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${colors.text}`}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>

                  <CardDescription className="leading-relaxed text-sm">
                    {sign.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Personalization CTA */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-2xl">
          <div className="glass-card rounded-2xl border border-white/10 p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Want to know your Sun, Moon, and Rising signs? Create your birth
              profile to find out.
            </p>
            <Link
              href="/dashboard/profiles"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cosmic-purple to-cosmic-purple-light px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-purple/25 transition-all hover:shadow-xl hover:shadow-cosmic-purple/30 hover:brightness-110"
            >
              Create Your Birth Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Continue Learning */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm text-muted-foreground mb-4">Continue Learning</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-cosmic-purple/30 bg-cosmic-purple/10 px-4 py-2 text-sm font-medium text-cosmic-purple-light">
              <Star className="h-3.5 w-3.5" />
              Zodiac Signs
            </span>
            <Link
              href="/learn/planets"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-white/10 hover:border-white/20 hover:text-foreground"
            >
              <Sun className="h-3.5 w-3.5" />
              Planets
            </Link>
            <Link
              href="/learn/houses"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-white/10 hover:border-white/20 hover:text-foreground"
            >
              <Compass className="h-3.5 w-3.5" />
              Houses
            </Link>
            <Link
              href="/learn/aspects"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-white/10 hover:border-white/20 hover:text-foreground"
            >
              <Moon className="h-3.5 w-3.5" />
              Aspects
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <Link
            href="/learn"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Learn
          </Link>
          <Link
            href="/learn/planets"
            className="inline-flex items-center text-sm font-medium text-cosmic-purple-light hover:text-cosmic-purple transition-colors"
          >
            Next: The Planets
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
