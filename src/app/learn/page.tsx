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
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Learn Astrology",
  description:
    "Explore the fundamentals of astrology. Learn about zodiac signs, planets, houses, aspects, and how to read your birth chart.",
  keywords: [
    "learn astrology",
    "astrology basics",
    "zodiac signs",
    "planets in astrology",
    "astrological houses",
    "aspects astrology",
    "birth chart reading",
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
  {
    href: "/learn/zodiac",
    icon: <BookOpen className="h-6 w-6" />,
    title: "Reading Your Chart",
    description:
      "Tie it all together: learn how signs, planets, houses, and aspects combine to create the full picture of your astrological birth chart.",
    badge: "Guide",
  },
];

export default function LearnPage() {
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
        </div>
      </section>

      <Separator className="mx-auto max-w-4xl opacity-30" />

      {/* Topic Cards Grid */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Link key={topic.title} href={topic.href} className="group">
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
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground text-sm">
            Ready to see your own chart?{" "}
            <Link
              href="/compatibility"
              className="text-cosmic-purple-light hover:text-cosmic-purple underline underline-offset-4"
            >
              Check your compatibility
            </Link>{" "}
            or{" "}
            <Link
              href="/auth/signup"
              className="text-cosmic-purple-light hover:text-cosmic-purple underline underline-offset-4"
            >
              create a free account
            </Link>{" "}
            to save your birth chart.
          </p>
        </div>
      </section>
    </div>
  );
}
