import type { Metadata } from "next";
import Link from "next/link";
import { Moon } from "lucide-react";
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
  title: "Astrological Aspects",
  description:
    "Learn about the five major aspects in astrology: conjunction, sextile, square, trine, and opposition, and how they shape your birth chart.",
  keywords: [
    "astrological aspects",
    "conjunction",
    "sextile",
    "square",
    "trine",
    "opposition",
    "birth chart aspects",
  ],
};

type AspectNature = "Neutral" | "Harmonious" | "Challenging";

interface Aspect {
  name: string;
  symbol: string;
  angle: string;
  orb: string;
  nature: AspectNature;
  keywords: string[];
  description: string;
}

const natureColors: Record<
  AspectNature,
  { bg: string; text: string; border: string; badge: string }
> = {
  Neutral: {
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    border: "border-amber-500/20 hover:border-amber-500/40",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  Harmonious: {
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  Challenging: {
    bg: "bg-red-500/5",
    text: "text-red-400",
    border: "border-red-500/20 hover:border-red-500/40",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

const aspects: Aspect[] = [
  {
    name: "Conjunction",
    symbol: "\u260C",
    angle: "0\u00B0",
    orb: "8-10\u00B0",
    nature: "Neutral",
    keywords: ["Fusion", "Intensity", "Focus", "Amplification"],
    description:
      "A conjunction occurs when two planets occupy the same degree of the zodiac, merging their energies into a single, concentrated force. The result depends on the planets involved: benefics create powerful gifts, while malefics may produce tension. Conjunctions amplify and fuse planetary energies, making them the most potent aspect in astrology. The planets involved become inseparable influences in the native's life, often defining core personality traits or life themes.",
  },
  {
    name: "Sextile",
    symbol: "\u26B9",
    angle: "60\u00B0",
    orb: "4-6\u00B0",
    nature: "Harmonious",
    keywords: ["Opportunity", "Cooperation", "Talent", "Flow"],
    description:
      "The sextile connects planets in compatible elements (Fire-Air or Earth-Water), creating a gentle, supportive flow of energy. Unlike the trine, the sextile represents latent potential that must be actively engaged -- it offers opportunities rather than effortless gifts. Sextiles indicate natural talents and areas where cooperation comes easily, but their benefits unfold only when you consciously work with the energies they provide.",
  },
  {
    name: "Square",
    symbol: "\u25A1",
    angle: "90\u00B0",
    orb: "6-8\u00B0",
    nature: "Challenging",
    keywords: ["Tension", "Action", "Growth", "Friction"],
    description:
      "The square creates a right-angle relationship between planets, generating friction, tension, and the urgent need for action. Squares are often considered difficult, but they are also the primary drivers of growth and achievement. The tension demands resolution, pushing you to develop new skills and overcome internal conflicts. Many of the most accomplished people have prominent squares in their charts -- the challenge becomes their catalyst for greatness.",
  },
  {
    name: "Trine",
    symbol: "\u25B3",
    angle: "120\u00B0",
    orb: "6-8\u00B0",
    nature: "Harmonious",
    keywords: ["Ease", "Talent", "Harmony", "Natural flow"],
    description:
      "The trine connects planets in the same element, creating a smooth, effortless flow of energy. Trines represent innate talents, natural abilities, and areas of life where things come easily. Because trines operate so naturally, they can sometimes be taken for granted. The most fulfilling expression of a trine comes when you consciously cultivate and share the gifts it represents rather than coasting on natural ability.",
  },
  {
    name: "Opposition",
    symbol: "\u260D",
    angle: "180\u00B0",
    orb: "8-10\u00B0",
    nature: "Challenging",
    keywords: ["Awareness", "Balance", "Projection", "Polarity"],
    description:
      "The opposition places two planets directly across the zodiac from each other, creating a tug-of-war between complementary energies. While challenging, oppositions bring awareness and the potential for integration. You may project one side of the opposition onto others (especially in relationships) until you learn to own both energies within yourself. Mastering an opposition means finding the balance point where two seemingly contradictory forces work in concert.",
  },
];

export default function AspectsPage() {
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
            <Moon className="mr-1 h-3 w-3" />
            5 Major Aspects
          </Badge>
          <h1 className="font-heading text-4xl font-bold sm:text-5xl mb-4">
            <span className="cosmic-text">Aspects</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aspects are the angular relationships between planets in your birth
            chart. They describe how planetary energies interact -- whether they
            cooperate, clash, or amplify each other -- and are essential for
            understanding the dynamics of any chart.
          </p>
        </div>
      </section>

      {/* Nature Legend */}
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-center gap-3">
          <Badge variant="outline" className={natureColors.Harmonious.badge}>
            Harmonious
          </Badge>
          <Badge variant="outline" className={natureColors.Challenging.badge}>
            Challenging
          </Badge>
          <Badge variant="outline" className={natureColors.Neutral.badge}>
            Neutral
          </Badge>
        </div>
      </section>

      {/* Orb Explanation */}
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-3xl">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="space-y-3 pt-6">
              <h3 className="font-heading text-base font-semibold text-cosmic-purple-light">
                What is an Orb?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An orb is the degree of tolerance allowed when determining
                whether an aspect is active. For example, a trine is exactly
                120 degrees, but an orb of 8 degrees means planets anywhere
                from 112 to 128 degrees apart still form a trine. Tighter orbs
                (closer to exact) produce stronger, more noticeable effects.
                The Sun and Moon are generally allowed wider orbs due to their
                importance in the chart.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl opacity-30" />

      {/* Aspects List */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-6">
          {aspects.map((aspect) => {
            const colors = natureColors[aspect.nature];
            return (
              <Card
                key={aspect.name}
                className={`border ${colors.border} ${colors.bg} transition-all`}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-3xl ${colors.text}`}
                      >
                        {aspect.symbol}
                      </div>
                      <div>
                        <CardTitle className="font-heading text-xl">
                          {aspect.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {aspect.angle} (orb: {aspect.orb})
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={colors.badge}>
                      {aspect.nature}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {aspect.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 ${colors.text}`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  <CardDescription className="leading-relaxed text-sm">
                    {aspect.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Navigation */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <Link
            href="/learn/houses"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; The Houses
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center text-sm font-medium text-cosmic-purple-light hover:text-cosmic-purple transition-colors"
          >
            Back to Learn Hub
          </Link>
        </div>
      </section>
    </div>
  );
}
