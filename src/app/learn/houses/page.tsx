import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Star, Sun, Moon } from "lucide-react";
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
  title: "The Astrological Houses",
  description:
    "Learn about the 12 astrological houses, each representing a different area of life from identity and finances to relationships and spirituality.",
  keywords: [
    "astrological houses",
    "birth chart houses",
    "12 houses astrology",
    "house system",
    "ascendant",
    "midheaven",
  ],
};

type Quadrant = "Angular" | "Succedent" | "Cadent";

interface House {
  number: number;
  name: string;
  naturalSign: string;
  naturalRuler: string;
  quadrant: Quadrant;
  lifeArea: string;
  keywords: string[];
  description: string;
}

const quadrantColors: Record<
  Quadrant,
  { bg: string; text: string; border: string; badge: string }
> = {
  Angular: {
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    border: "border-amber-500/20 hover:border-amber-500/40",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  Succedent: {
    bg: "bg-cosmic-purple/5",
    text: "text-cosmic-purple-light",
    border: "border-cosmic-purple/20 hover:border-cosmic-purple/40",
    badge: "bg-cosmic-purple/10 text-cosmic-purple-light border-cosmic-purple/20",
  },
  Cadent: {
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
};

const houses: House[] = [
  {
    number: 1,
    name: "House of Self",
    naturalSign: "Aries",
    naturalRuler: "Mars",
    quadrant: "Angular",
    lifeArea: "Identity, appearance, first impressions",
    keywords: ["Self-image", "Body", "Persona", "Beginnings"],
    description:
      "The first house, marked by the Ascendant (Rising Sign), represents your outward personality, physical appearance, and the way others first perceive you. It is the mask you wear when meeting the world and sets the tone for the entire chart.",
  },
  {
    number: 2,
    name: "House of Values",
    naturalSign: "Taurus",
    naturalRuler: "Venus",
    quadrant: "Succedent",
    lifeArea: "Money, possessions, self-worth",
    keywords: ["Finances", "Resources", "Self-worth", "Material"],
    description:
      "The second house governs your material resources, earning capacity, and relationship with money. Beyond finances, it also reflects your core values, self-esteem, and what you consider truly worthwhile in life.",
  },
  {
    number: 3,
    name: "House of Communication",
    naturalSign: "Gemini",
    naturalRuler: "Mercury",
    quadrant: "Cadent",
    lifeArea: "Communication, siblings, local environment",
    keywords: ["Speech", "Learning", "Siblings", "Neighborhood"],
    description:
      "The third house rules communication, early education, and your immediate environment. It governs how you think, speak, and share information, as well as relationships with siblings, neighbors, and short-distance travel.",
  },
  {
    number: 4,
    name: "House of Home",
    naturalSign: "Cancer",
    naturalRuler: "Moon",
    quadrant: "Angular",
    lifeArea: "Home, family, roots, foundations",
    keywords: ["Family", "Roots", "Security", "Private life"],
    description:
      "The fourth house, anchored by the IC (Imum Coeli), represents your deepest roots: home, family, ancestry, and emotional foundation. It describes your private life, sense of security, and the conditions at the end of life.",
  },
  {
    number: 5,
    name: "House of Pleasure",
    naturalSign: "Leo",
    naturalRuler: "Sun",
    quadrant: "Succedent",
    lifeArea: "Creativity, romance, children, fun",
    keywords: ["Creativity", "Romance", "Joy", "Children"],
    description:
      "The fifth house is the domain of creative self-expression, romance, and joy. It governs love affairs, hobbies, artistic talents, children, and all forms of play and pleasure that make life worth living.",
  },
  {
    number: 6,
    name: "House of Health",
    naturalSign: "Virgo",
    naturalRuler: "Mercury",
    quadrant: "Cadent",
    lifeArea: "Health, daily routines, service, work",
    keywords: ["Wellness", "Routine", "Service", "Improvement"],
    description:
      "The sixth house governs your daily habits, physical health, and work environment. It is the house of service, self-improvement, and the practical routines that sustain your well-being and productivity.",
  },
  {
    number: 7,
    name: "House of Partnership",
    naturalSign: "Libra",
    naturalRuler: "Venus",
    quadrant: "Angular",
    lifeArea: "Marriage, partnerships, open enemies",
    keywords: ["Marriage", "Contracts", "Partnerships", "Others"],
    description:
      "The seventh house, marked by the Descendant, is the house of committed partnerships -- both romantic and business. It reveals what you seek in a partner, how you relate one-on-one, and the dynamics of your closest bonds.",
  },
  {
    number: 8,
    name: "House of Transformation",
    naturalSign: "Scorpio",
    naturalRuler: "Pluto",
    quadrant: "Succedent",
    lifeArea: "Shared resources, intimacy, death/rebirth",
    keywords: ["Intimacy", "Shared assets", "Crisis", "Rebirth"],
    description:
      "The eighth house deals with shared resources, deep intimacy, and the transformative cycles of death and rebirth. It governs inheritance, taxes, debts, and the psychological depths you explore through merging with another.",
  },
  {
    number: 9,
    name: "House of Philosophy",
    naturalSign: "Sagittarius",
    naturalRuler: "Jupiter",
    quadrant: "Cadent",
    lifeArea: "Higher learning, travel, belief systems",
    keywords: ["Philosophy", "Travel", "Higher education", "Faith"],
    description:
      "The ninth house expands your horizons through higher education, long-distance travel, philosophy, and spiritual seeking. It governs your worldview, moral code, and the quest for meaning that drives your intellectual growth.",
  },
  {
    number: 10,
    name: "House of Career",
    naturalSign: "Capricorn",
    naturalRuler: "Saturn",
    quadrant: "Angular",
    lifeArea: "Career, public image, ambition, authority",
    keywords: ["Career", "Reputation", "Achievement", "Authority"],
    description:
      "The tenth house, crowned by the Midheaven (MC), represents your public image, career aspirations, and greatest achievements. It shows how the world sees you professionally and the legacy you aim to build.",
  },
  {
    number: 11,
    name: "House of Community",
    naturalSign: "Aquarius",
    naturalRuler: "Uranus",
    quadrant: "Succedent",
    lifeArea: "Friends, groups, hopes, social causes",
    keywords: ["Friendships", "Community", "Aspirations", "Innovation"],
    description:
      "The eleventh house governs friendships, social groups, and your hopes for the future. It represents the communities you belong to, your ideals, and the collective efforts that connect you to something larger than yourself.",
  },
  {
    number: 12,
    name: "House of the Unconscious",
    naturalSign: "Pisces",
    naturalRuler: "Neptune",
    quadrant: "Cadent",
    lifeArea: "Spirituality, solitude, hidden matters, karma",
    keywords: ["Spirituality", "Solitude", "Karma", "Hidden self"],
    description:
      "The twelfth house is the most mysterious domain of the chart, governing the unconscious, hidden patterns, and spiritual transcendence. It relates to solitude, dreams, self-undoing, and the karmic threads woven through lifetimes.",
  },
];

export default function HousesPage() {
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
            <Compass className="mr-1 h-3 w-3" />
            12 Houses
          </Badge>
          <h1 className="font-heading text-4xl font-bold sm:text-5xl mb-4">
            The <span className="cosmic-text">Houses</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The twelve houses divide your birth chart into life areas. While
            signs describe how energy expresses itself and planets represent what
            kind of energy is at play, houses reveal where in your life that
            energy manifests.
          </p>
        </div>
      </section>

      {/* House System Explanation */}
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-3xl">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardContent className="space-y-3 pt-6">
              <h3 className="font-heading text-base font-semibold text-cosmic-purple-light">
                Understanding the House System
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The house system is calculated from your exact birth time and
                location. The first house cusp is your Ascendant (the zodiac
                sign rising on the eastern horizon at birth), and the remaining
                houses follow in counter-clockwise order. Different house systems
                (Placidus, Whole Sign, Equal, Koch) divide the sky differently,
                but all use the same twelve life themes. Your birth time must be
                accurate for precise house placements.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quadrant Legend */}
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-center gap-3">
          <Badge variant="outline" className={quadrantColors.Angular.badge}>
            Angular (1, 4, 7, 10)
          </Badge>
          <Badge variant="outline" className={quadrantColors.Succedent.badge}>
            Succedent (2, 5, 8, 11)
          </Badge>
          <Badge variant="outline" className={quadrantColors.Cadent.badge}>
            Cadent (3, 6, 9, 12)
          </Badge>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl opacity-30" />

      {/* Houses Grid */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {houses.map((house) => {
            const colors = quadrantColors[house.quadrant];
            return (
              <Card
                key={house.number}
                className={`border ${colors.border} ${colors.bg} transition-all`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 font-heading text-lg font-bold ${colors.text}`}
                    >
                      {house.number}
                    </div>
                    <div>
                      <CardTitle className="font-heading text-lg">
                        {house.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {house.naturalSign} / {house.naturalRuler}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={colors.badge}>
                      {house.quadrant}
                    </Badge>
                  </div>

                  <p className={`text-sm font-medium ${colors.text}`}>
                    {house.lifeArea}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {house.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${colors.text}`}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  <CardDescription className="leading-relaxed text-sm">
                    {house.description}
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
              See which houses are most active in your chart and how they shape
              your life path.
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
            <Link
              href="/learn/zodiac"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-white/10 hover:border-white/20 hover:text-foreground"
            >
              <Star className="h-3.5 w-3.5" />
              Zodiac Signs
            </Link>
            <Link
              href="/learn/planets"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-white/10 hover:border-white/20 hover:text-foreground"
            >
              <Sun className="h-3.5 w-3.5" />
              Planets
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-cosmic-purple/30 bg-cosmic-purple/10 px-4 py-2 text-sm font-medium text-cosmic-purple-light">
              <Compass className="h-3.5 w-3.5" />
              Houses
            </span>
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
            href="/learn/planets"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; The Planets
          </Link>
          <Link
            href="/learn/aspects"
            className="inline-flex items-center text-sm font-medium text-cosmic-purple-light hover:text-cosmic-purple transition-colors"
          >
            Next: Aspects
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
