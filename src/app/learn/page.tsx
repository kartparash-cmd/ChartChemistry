import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Star,
  Sun,
  Moon,
  Compass,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AnimatedHero,
  AnimatedCardGrid,
  AnimatedCard,
  AnimatedSection,
} from "@/components/learn-animations";

export const metadata: Metadata = {
  title: "Learn Astrology",
  description:
    "Explore the building blocks of astrology: zodiac signs, planets, houses, and aspects. Educational resources for beginners and intermediate learners.",
  alternates: { canonical: "/learn" },
  keywords: [
    "learn astrology",
    "astrology basics",
    "zodiac signs",
    "planets astrology",
    "astrological houses",
    "aspects astrology",
  ],
};

interface LearningTopic {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

const topics: LearningTopic[] = [
  {
    href: "/learn/zodiac",
    icon: <Star className="h-6 w-6" />,
    title: "The Zodiac Signs",
    description:
      "Discover the twelve signs of the zodiac, their elements, modalities, ruling planets, and the unique traits each sign brings to a birth chart.",
    badge: "12 Signs",
  },
  {
    href: "/learn/planets",
    icon: <Sun className="h-6 w-6" />,
    title: "The Planets",
    description:
      "Understand the ten celestial bodies used in astrology, from the luminaries (Sun and Moon) to the outer planets, and what each one represents in your chart.",
    badge: "10 Planets",
  },
  {
    href: "/learn/houses",
    icon: <Compass className="h-6 w-6" />,
    title: "The Houses",
    description:
      "Learn about the twelve houses of the birth chart, each governing a different area of life from identity and values to career and spirituality.",
    badge: "12 Houses",
  },
  {
    href: "/learn/aspects",
    icon: <Moon className="h-6 w-6" />,
    title: "Aspects",
    description:
      "Explore the geometric relationships between planets in your chart. Aspects reveal the dynamic interplay of energies that shape your personality and life.",
    badge: "5 Major",
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-purple/5 via-transparent to-transparent" />
        <AnimatedHero>
          <Badge
            variant="outline"
            className="mb-4 border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light"
          >
            <BookOpen className="mr-1 h-3 w-3" />
            Educational Resources
          </Badge>
          <h1 className="font-heading text-4xl font-bold sm:text-5xl mb-4">
            Learn <span className="cosmic-text">Astrology</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you are a complete beginner or looking to deepen your
            understanding, explore the building blocks of astrology and learn how
            to interpret the cosmic patterns in your birth chart.
          </p>
        </AnimatedHero>
      </section>

      <Separator className="mx-auto max-w-4xl opacity-30" />

      {/* Topic Cards Grid */}
      <section className="px-4 py-16">
        <AnimatedCardGrid>
          {topics.map((topic) => (
            <AnimatedCard key={topic.title}>
              <Link href={topic.href} className="group">
                <Card className="h-full border-white/10 bg-white/[0.02] transition-all hover:border-cosmic-purple/30 hover:bg-cosmic-purple/[0.03] hover:shadow-lg hover:shadow-cosmic-purple/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cosmic-purple/10 text-cosmic-purple-light transition-colors group-hover:bg-cosmic-purple/20">
                        {topic.icon}
                      </div>
                      {topic.badge && (
                        <Badge
                          variant="outline"
                          className="border-white/10 text-muted-foreground text-xs"
                        >
                          {topic.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-heading text-lg mt-2">
                      {topic.title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                      {topic.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <span className="inline-flex items-center text-sm font-medium text-cosmic-purple-light transition-colors group-hover:text-cosmic-purple">
                      Learn More
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            </AnimatedCard>
          ))}
        </AnimatedCardGrid>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-20">
        <AnimatedSection className="mx-auto max-w-2xl">
          <div className="glass-card rounded-2xl border border-white/10 p-8 text-center">
            <h2 className="font-heading text-2xl font-bold mb-3">
              Ready to see how this applies to{" "}
              <span className="cosmic-text">you</span>?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explore your personal birth chart or discover how your stars align
              with someone special.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cosmic-purple to-cosmic-purple-light px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-purple/25 transition-all hover:shadow-xl hover:shadow-cosmic-purple/30 hover:brightness-110"
              >
                View Your Birth Chart
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/compatibility"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-white/10 hover:border-white/20"
              >
                Check Compatibility
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
