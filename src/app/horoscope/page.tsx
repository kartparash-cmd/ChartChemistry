"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sun,
  Sparkles,
  Loader2,
  RefreshCw,
  Clock,
  Lightbulb,
  ArrowRight,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function isAstroServiceError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("unreachable") ||
    lower.includes("unavailable") ||
    lower.includes("could not connect") ||
    lower.includes("fetch") ||
    lower.includes("service") ||
    lower.includes("temporarily")
  );
}

interface Horoscope {
  date: string;
  userName: string;
  summary: string;
  body: string;
  cosmicTip: string;
  luckyTime: string;
  mood: string;
}

const MOOD_CONFIG: Record<string, { color: string; icon: string }> = {
  expansive: { color: "text-gold", icon: "✨" },
  reflective: { color: "text-blue-400", icon: "🌙" },
  passionate: { color: "text-red-400", icon: "🔥" },
  grounded: { color: "text-emerald-400", icon: "🌿" },
  transformative: { color: "text-cosmic-purple-light", icon: "🦋" },
  playful: { color: "text-yellow-400", icon: "⭐" },
  intense: { color: "text-orange-400", icon: "⚡" },
  harmonious: { color: "text-teal-400", icon: "🌊" },
};

export default function HoroscopePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchHoroscope();
  }, [status]);

  const fetchHoroscope = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/horoscope");
      const data = await res.json();

      if (res.ok) {
        setHoroscope(data);
      } else {
        setError(data.message || data.error || "Failed to load horoscope");
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

  const moodConfig = horoscope
    ? MOOD_CONFIG[horoscope.mood] || MOOD_CONFIG.harmonious
    : MOOD_CONFIG.harmonious;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge
              variant="outline"
              className="mb-4 border-gold/30 bg-gold/10 text-gold"
            >
              <Sun className="mr-1 h-3 w-3" />
              {today}
            </Badge>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">
              Your Daily <span className="cosmic-text">Horoscope</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Personalized to your full natal chart — not just your sun sign
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-cosmic-purple/10 animate-pulse" />
              <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-cosmic-purple-light animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">
              Reading the stars for you...
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/10"
            >
              {isAstroServiceError(error) ? (
                <AlertTriangle className="h-7 w-7 text-cosmic-purple-light" />
              ) : (
                <Sun className="h-7 w-7 text-cosmic-purple-light" />
              )}
            </motion.div>
            <h2 className="font-heading text-lg font-semibold mb-2">
              {isAstroServiceError(error)
                ? "Service Temporarily Unavailable"
                : "Set Up Your Birth Chart"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {isAstroServiceError(error)
                ? "Our astrology calculation service is currently being updated. Please try again shortly."
                : error}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {isAstroServiceError(error) ? (
                <>
                  <Button
                    onClick={fetchHoroscope}
                    className="bg-cosmic-purple text-white hover:bg-cosmic-purple-dark"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/10"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                  >
                    <Link href="/dashboard/profiles">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Your Birth Profile
                    </Link>
                  </Button>
                  <Button
                    onClick={fetchHoroscope}
                    variant="outline"
                    className="border-white/10"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        ) : horoscope ? (
          <div className="space-y-6">
            {/* Mood + Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-cosmic-purple/[0.06] to-transparent p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {moodConfig.icon}
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Today&apos;s Energy
                    </p>
                    <p className={cn("text-lg font-semibold capitalize", moodConfig.color)}>
                      {horoscope.mood}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchHoroscope}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-lg font-medium leading-relaxed">
                {horoscope.summary}
              </p>
            </motion.div>

            {/* Main Horoscope Body */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-cosmic-purple-light" />
                <h2 className="font-heading text-lg font-semibold">
                  {horoscope.userName}&apos;s Cosmic Reading
                </h2>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {horoscope.body}
                </p>
              </div>
            </motion.div>

            {/* Bottom Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cosmic Tip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-gold/20 bg-gold/[0.04] p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-gold" />
                  <h3 className="text-sm font-semibold text-gold">
                    Cosmic Tip
                  </h3>
                </div>
                <p className="text-sm text-foreground/80">
                  {horoscope.cosmicTip}
                </p>
              </motion.div>

              {/* Lucky Time */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-xl border border-cosmic-purple/20 bg-cosmic-purple/[0.04] p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-cosmic-purple-light" />
                  <h3 className="text-sm font-semibold text-cosmic-purple-light">
                    Best Time Window
                  </h3>
                </div>
                <p className="text-sm text-foreground/80">
                  {horoscope.luckyTime}
                </p>
              </motion.div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center pt-4"
            >
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
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
