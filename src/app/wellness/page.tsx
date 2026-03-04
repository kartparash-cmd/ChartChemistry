"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Briefcase,
  Palette,
  DollarSign,
  Sparkles,
  Activity,
  Loader2,
  RefreshCw,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WellnessSuggestion {
  category: string;
  title: string;
  description: string;
  timing: string;
  confidence: number;
}

interface WellnessData {
  date: string;
  userName: string;
  suggestions: WellnessSuggestion[];
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; borderColor: string; bgColor: string; label: string }
> = {
  career: {
    icon: <Briefcase className="h-5 w-5" />,
    color: "text-blue-400",
    borderColor: "border-blue-400/20",
    bgColor: "bg-blue-400/[0.06]",
    label: "Career",
  },
  relationships: {
    icon: <Heart className="h-5 w-5" />,
    color: "text-rose-400",
    borderColor: "border-rose-400/20",
    bgColor: "bg-rose-400/[0.06]",
    label: "Relationships",
  },
  health: {
    icon: <Activity className="h-5 w-5" />,
    color: "text-emerald-400",
    borderColor: "border-emerald-400/20",
    bgColor: "bg-emerald-400/[0.06]",
    label: "Health",
  },
  creativity: {
    icon: <Palette className="h-5 w-5" />,
    color: "text-amber-400",
    borderColor: "border-amber-400/20",
    bgColor: "bg-amber-400/[0.06]",
    label: "Creativity",
  },
  finances: {
    icon: <DollarSign className="h-5 w-5" />,
    color: "text-teal-400",
    borderColor: "border-teal-400/20",
    bgColor: "bg-teal-400/[0.06]",
    label: "Finances",
  },
  spirituality: {
    icon: <Sparkles className="h-5 w-5" />,
    color: "text-cosmic-purple-light",
    borderColor: "border-cosmic-purple/20",
    bgColor: "bg-cosmic-purple/[0.06]",
    label: "Spirituality",
  },
};

function ConfidenceIndicator({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  const segments = 5;
  const filled = Math.round(confidence * segments);

  let label: string;
  let labelColor: string;
  if (percentage >= 80) {
    label = "Strong";
    labelColor = "text-emerald-400";
  } else if (percentage >= 60) {
    label = "Moderate";
    labelColor = "text-gold";
  } else {
    label = "Gentle";
    labelColor = "text-muted-foreground";
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 w-3 rounded-full transition-colors",
              i < filled ? "bg-cosmic-purple-light" : "bg-white/10"
            )}
          />
        ))}
      </div>
      <span className={cn("text-[10px] uppercase tracking-wider", labelColor)}>
        {label}
      </span>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  index,
}: {
  suggestion: WellnessSuggestion;
  index: number;
}) {
  const config = CATEGORY_CONFIG[suggestion.category] || CATEGORY_CONFIG.career;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Card
        className={cn(
          "border bg-transparent transition-colors hover:bg-white/[0.02]",
          config.borderColor
        )}
      >
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  config.bgColor,
                  config.color
                )}
              >
                {config.icon}
              </div>
              <div>
                <Badge
                  variant="outline"
                  className={cn(
                    "mb-1.5 text-[10px] uppercase tracking-wider",
                    config.borderColor,
                    config.color
                  )}
                >
                  {config.label}
                </Badge>
                <CardTitle className="text-base font-semibold">
                  {suggestion.title}
                </CardTitle>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm leading-relaxed text-foreground/80 mb-4">
            {suggestion.description}
          </p>
          <Separator className="mb-3 bg-white/5" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {suggestion.timing}
              </span>
            </div>
            <ConfidenceIndicator confidence={suggestion.confidence} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-4/5 mb-4" />
          <Separator className="mb-3 bg-white/5" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WellnessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<WellnessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchWellness();
  }, [status]);

  const fetchWellness = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wellness");
      const json = await res.json();

      if (res.ok) {
        setData(json);
      } else {
        setError(json.message || json.error || "Failed to load wellness suggestions");
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cosmic-purple-light" />
      </div>
    );
  }

  if (!session) return null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Order suggestions by category for consistent display
  const categoryOrder = [
    "career",
    "relationships",
    "health",
    "creativity",
    "finances",
    "spirituality",
  ];
  const orderedSuggestions = data?.suggestions
    ? [...data.suggestions].sort(
        (a, b) =>
          categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
      )
    : [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-4xl px-4 py-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge
              variant="outline"
              className="mb-4 border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {today}
            </Badge>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">
              Wellness &amp; <span className="cosmic-text">Timing</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
              Personalized suggestions based on today&apos;s planetary transits
              to your natal chart. Discover the best timing for every area of
              your life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col items-center gap-4 py-8 mb-8">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-cosmic-purple/10 animate-pulse" />
                <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-cosmic-purple-light animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">
                Analyzing your transits for today...
              </p>
            </div>
            <LoadingSkeleton />
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/10">
              <Activity className="h-7 w-7 text-cosmic-purple-light" />
            </div>
            <h2 className="font-heading text-lg font-semibold mb-2">
              Set Up Your Birth Chart
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {error}
            </p>
            <Button
              asChild
              className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
            >
              <Link href="/compatibility">
                <Sparkles className="mr-2 h-4 w-4" />
                Create Your Chart
              </Link>
            </Button>
          </motion.div>
        ) : data ? (
          <div className="space-y-8">
            {/* Summary Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-cosmic-purple/[0.06] to-transparent p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmic-purple/10">
                    <Sparkles className="h-5 w-5 text-cosmic-purple-light" />
                  </div>
                  <div>
                    <h2 className="font-heading text-base font-semibold">
                      {data.userName}&apos;s Cosmic Timing
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {data.suggestions.length} personalized suggestions for today
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchWellness}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Suggestion Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orderedSuggestions.map((suggestion, i) => (
                <SuggestionCard
                  key={suggestion.category}
                  suggestion={suggestion}
                  index={i}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center pt-4"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/10"
                >
                  <Link href="/horoscope">
                    Read Today&apos;s Horoscope
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/10"
                >
                  <Link href="/compatibility">
                    Check Compatibility
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
