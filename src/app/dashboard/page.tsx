"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sun,
  Moon,
  Sunrise,
  Users,
  Plus,
  TrendingUp,
  Award,
  Crown,
  BarChart3,
  Heart,
  Sparkles,
  Loader2,
  Calendar,
  ArrowRight,
  Orbit,
  Lightbulb,
  Settings,
  LogOut,
  Mail,
  Shield,
  AlertTriangle,
  MessageCircle,
  Lock,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Confetti } from "@/components/confetti";

// Types for dashboard data
interface BirthProfile {
  id: string;
  name: string;
  birthDate: string;
  birthTime?: string | null;
  birthCity: string;
  isOwner: boolean;
  chartData?: {
    planets?: Array<{
      planet: string;
      sign: string;
      degree: number;
      house?: number;
    }>;
  } | null;
}

interface CompatibilityReport {
  id: string;
  person1: { name: string };
  person2: { name: string };
  overallScore: number;
  createdAt: string;
  tier: string;
}

interface DashboardData {
  profile: BirthProfile | null;
  profiles?: BirthProfile[];
  reports: CompatibilityReport[];
  stats: {
    totalReports: number;
    highestScore: number;
    plan: string;
  };
}

function getSignFromChartData(
  chartData: BirthProfile["chartData"],
  planet: string
): string | null {
  if (!chartData?.planets) return null;
  const found = chartData.planets.find((p) => p.planet === planet);
  return found?.sign || null;
}

function getSignIcon(sign: string | null): string {
  const glyphs: Record<string, string> = {
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
  return sign ? glyphs[sign] || "" : "";
}

function getSignEmoji(sign: string): string {
  const emojis: Record<string, string> = {
    Aries: "\u2648\uFE0F",
    Taurus: "\u2649\uFE0F",
    Gemini: "\u264A\uFE0F",
    Cancer: "\u264B\uFE0F",
    Leo: "\u264C\uFE0F",
    Virgo: "\u264D\uFE0F",
    Libra: "\u264E\uFE0F",
    Scorpio: "\u264F\uFE0F",
    Sagittarius: "\u2650\uFE0F",
    Capricorn: "\u2651\uFE0F",
    Aquarius: "\u2652\uFE0F",
    Pisces: "\u2653\uFE0F",
  };
  return emojis[sign] || "";
}

function getSignGreeting(sign: string): string {
  const greetings: Record<string, string> = {
    Aries: "fiery Aries energy is fueling your drive today",
    Taurus: "grounded Taurus energy is keeping you centered today",
    Gemini: "curious Gemini energy is sparking new ideas today",
    Cancer: "nurturing Cancer energy is guiding your heart today",
    Leo: "radiant Leo energy is lighting up your path today",
    Virgo: "detail-oriented Virgo energy is sharpening your focus today",
    Libra: "harmonious Libra energy is balancing your world today",
    Scorpio: "transformative Scorpio energy is deepening your insight today",
    Sagittarius: "adventurous Sagittarius energy is expanding your horizons today",
    Capricorn: "ambitious Capricorn energy is building your foundation today",
    Aquarius: "visionary Aquarius energy is inspiring your creativity today",
    Pisces: "intuitive Pisces energy is flowing through you today",
  };
  return greetings[sign] || `${sign} season energy is with you today`;
}

function isMercuryRetrograde(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  if (year !== 2026) return false;

  // Approximate 2026 Mercury retrograde windows
  const retrogradeWindows: Array<[number, number, number, number]> = [
    // [startMonth (0-indexed), startDay, endMonth, endDay]
    [2, 15, 3, 7],   // Mar 15 - Apr 7
    [6, 18, 7, 11],  // Jul 18 - Aug 11
    [10, 9, 10, 29], // Nov 9 - Nov 29
  ];

  for (const [startMonth, startDay, endMonth, endDay] of retrogradeWindows) {
    const start = new Date(year, startMonth, startDay);
    const end = new Date(year, endMonth, endDay, 23, 59, 59);
    if (now >= start && now <= end) return true;
  }

  return false;
}

interface StreakData {
  lastDate: string;
  count: number;
}

const STREAK_MILESTONES = [7, 30, 100];

function getStreakMilestoneBadge(count: number): string | null {
  if (count >= 100) return "Cosmic Master";
  if (count >= 30) return "Star Voyager";
  if (count >= 7) return "Rising Star";
  return null;
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 11) return "Good morning";
  if (hour >= 12 && hour <= 16) return "Good afternoon";
  if (hour >= 17 && hour <= 20) return "Good evening";
  return "Late night stargazing";
}

function StatCard({
  icon,
  label,
  value,
  color,
  shouldAnimate,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  shouldAnimate: boolean;
}) {
  return (
    <motion.div
      whileHover={shouldAnimate ? { y: -2, scale: 1.01 } : {}}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            color
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SignCard({
  label,
  sign,
  icon,
}: {
  label: string;
  sign: string | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-sm">
      <div className="mb-2 flex justify-center text-muted-foreground">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {sign ? (
        <>
          <p className="text-2xl mb-1">{getSignIcon(sign)}</p>
          <p className="text-sm font-medium">{sign}</p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground italic">Not calculated</p>
      )}
    </div>
  );
}

function ReportCard({ report, shouldAnimate }: { report: CompatibilityReport; shouldAnimate: boolean }) {
  const scoreColor =
    report.overallScore >= 70
      ? "text-emerald-400"
      : report.overallScore >= 50
        ? "text-gold"
        : "text-red-400";

  return (
    <motion.div whileHover={shouldAnimate ? { y: -3, scale: 1.01 } : {}} transition={{ duration: 0.2 }}>
      <Link
        href={`/report/${report.id}`}
        className="block rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.05]"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h4 className="font-medium truncate">
              {report.person1.name} & {report.person2.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              <Calendar className="inline mr-1 h-3 w-3" />
              {new Date(report.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <p className={cn("text-2xl font-bold", scoreColor)}>
              {report.overallScore}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              score
            </p>
          </div>
        </div>
        <Progress
          value={report.overallScore}
          className="h-1.5 bg-white/5"
        />
        {report.tier !== "FREE" && (
          <Badge
            variant="outline"
            className="mt-3 text-[10px] border-cosmic-purple/30 text-cosmic-purple-light"
          >
            {report.tier}
          </Badge>
        )}
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cosmic-purple-light" />
          <p className="mt-3 text-sm text-muted-foreground">Loading your cosmic dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialTab = searchParams.get("tab") || "chart";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [upgraded, setUpgraded] = useState(searchParams.get("upgraded") === "true");
  const [streak, setStreak] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [greetingPrefix, setGreetingPrefix] = useState("Welcome back");

  // Determine greeting: first-visit detection + time-of-day
  useEffect(() => {
    try {
      const isFirstVisit = !localStorage.getItem("cc_first_dashboard_visit");
      if (isFirstVisit) {
        setGreetingPrefix("Welcome to ChartChemistry");
        localStorage.setItem("cc_first_dashboard_visit", "true");
      } else {
        setGreetingPrefix(getTimeOfDayGreeting());
      }
    } catch {
      setGreetingPrefix(getTimeOfDayGreeting());
    }
  }, []);

  // Trigger confetti on upgrade
  useEffect(() => {
    if (upgraded && shouldAnimate) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [upgraded, shouldAnimate]);

  // Track daily check-in streak and detect milestone celebrations
  useEffect(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const raw = localStorage.getItem("cc_streak");
      let streakData: StreakData = { lastDate: "", count: 0 };

      if (raw) {
        streakData = JSON.parse(raw) as StreakData;
      }

      let newCount = streakData.count;
      let updatedToday = false;

      if (streakData.lastDate === today) {
        // Already visited today
        newCount = streakData.count;
        updatedToday = true;
      } else {
        // Check if yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (streakData.lastDate === yesterdayStr) {
          newCount = streakData.count + 1;
          localStorage.setItem(
            "cc_streak",
            JSON.stringify({ lastDate: today, count: newCount })
          );
        } else {
          // Reset streak
          newCount = 1;
          localStorage.setItem(
            "cc_streak",
            JSON.stringify({ lastDate: today, count: 1 })
          );
        }
      }

      setStreak(newCount);

      // Check for milestone celebration (only when count just changed, i.e. not already visited today)
      if (!updatedToday && shouldAnimate) {
        const prevCount = streakData.count;
        const lastMilestoneRaw = localStorage.getItem("cc_last_milestone");
        const lastMilestone = lastMilestoneRaw ? parseInt(lastMilestoneRaw, 10) : 0;

        for (const milestone of STREAK_MILESTONES) {
          if (prevCount < milestone && newCount >= milestone && lastMilestone < milestone) {
            localStorage.setItem("cc_last_milestone", String(milestone));
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3500);
            break;
          }
        }
      }
    } catch {
      // localStorage unavailable or parse error
      setStreak(1);
    }
  }, [shouldAnimate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchData = async () => {
      try {
        setError(null);
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else if (res.status === 404) {
          // API not built yet; use empty state
          setData({
            profile: null,
            profiles: [],
            reports: [],
            stats: {
              totalReports: 0,
              highestScore: 0,
              plan: session?.user?.plan || "FREE",
            },
          });
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.message || errData.error || "Failed to load dashboard data. Please try again.");
          setData({
            profile: null,
            profiles: [],
            reports: [],
            stats: {
              totalReports: 0,
              highestScore: 0,
              plan: session?.user?.plan || "FREE",
            },
          });
        }
      } catch {
        setError("Could not connect to the server. Please try again.");
        setData({
          profile: null,
          profiles: [],
          reports: [],
          stats: {
            totalReports: 0,
            highestScore: 0,
            plan: session?.user?.plan || "FREE",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cosmic-purple-light" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading your cosmic dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const sunSign = data?.profile
    ? getSignFromChartData(data.profile.chartData, "Sun")
    : null;
  const moonSign = data?.profile
    ? getSignFromChartData(data.profile.chartData, "Moon")
    : null;
  const risingSign = data?.profile
    ? getSignFromChartData(data.profile.chartData, "Ascendant")
    : null;

  const planLabel =
    data?.stats.plan === "PREMIUM"
      ? "Premium"
      : data?.stats.plan === "ANNUAL"
        ? "Premium (Annual)"
        : "Free";

  // Determine whether the user has any birth profiles (for sidebar widget gating)
  const hasProfiles =
    (data?.profiles && data.profiles.length > 0) || data?.profile != null;

  return (
    <div className="min-h-screen">
      {/* Confetti overlay */}
      <Confetti trigger={showConfetti} />

      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="font-heading text-3xl font-bold">
                {greetingPrefix},{" "}
                <span className="cosmic-text">
                  {session.user.name || "Stargazer"}
                </span>
                {sunSign && (
                  <span className="text-2xl ml-1">
                    {" "}&mdash; {getSignEmoji(sunSign)}
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {sunSign
                  ? getSignGreeting(sunSign)
                  : "Your cosmic dashboard awaits"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "border-white/10",
                  data?.stats.plan !== "FREE"
                    ? "border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light"
                    : ""
                )}
              >
                <Crown className="mr-1 h-3 w-3" />
                {planLabel}
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div role="alert" className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              aria-label="Dismiss error message"
              onClick={() => setError(null)}
              className="shrink-0 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Mercury Retrograde Banner */}
      {isMercuryRetrograde() && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: -5 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-400"
          >
            <span className="text-lg shrink-0">{"\u263F"}</span>
            <span>
              <strong>Mercury Retrograde</strong> &mdash; communications may feel challenging. Double-check messages and travel plans.
            </span>
          </motion.div>
        </div>
      )}

      {/* Upgrade Celebration Banner */}
      {upgraded && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: -10 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center"
          >
            <p className="text-xl font-bold text-emerald-400">
              Welcome to Premium!
            </p>
            <p className="text-sm font-semibold text-emerald-300 mt-1 mb-3">
              Here&apos;s what you&apos;ve unlocked:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4 text-left max-w-xs mx-auto">
              <li className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-emerald-400 shrink-0" />
                Full compatibility reports with in-depth analysis
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                AI Astrologer chat for personalized guidance
              </li>
              <li className="flex items-center gap-2">
                <Sun className="h-3 w-3 text-emerald-400 shrink-0" />
                Daily horoscope tailored to your natal chart
              </li>
              <li className="flex items-center gap-2">
                <Orbit className="h-3 w-3 text-emerald-400 shrink-0" />
                Live transit alerts affecting your chart
              </li>
            </ul>
            <Button
              size="sm"
              className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
              onClick={() => {
                setUpgraded(false);
                router.replace("/dashboard");
              }}
            >
              Let&apos;s explore!
            </Button>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={(newTab) => {
              setActiveTab(newTab);
              router.replace(`/dashboard?tab=${newTab}`, { scroll: false });
            }}>
              <TabsList className="bg-white/5 border border-white/10 mb-6">
                <TabsTrigger
                  value="chart"
                  className="data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple-light"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  My Chart
                </TabsTrigger>
                <TabsTrigger
                  value="connections"
                  className="data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple-light"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  My Connections
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple-light"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* My Chart Tab */}
              <TabsContent value="chart">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="chart-tab"
                    initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldAnimate ? { opacity: 0, y: -10 } : {}}
                  >
                    {data?.profile ? (
                      <div className="space-y-6">
                        {/* Profile header */}
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h2 className="font-heading text-xl font-semibold">
                                {data.profile.name}
                              </h2>
                              <p className="text-sm text-muted-foreground">
                                Born {new Date(data.profile.birthDate).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                                {data.profile.birthTime &&
                                  ` at ${data.profile.birthTime}`}{" "}
                                in {data.profile.birthCity}
                              </p>
                            </div>
                            <Button asChild variant="outline" size="sm" className="border-white/10">
                              <Link href={`/chart/${data.profile.id}`}>
                                View Full Chart
                                <ArrowRight className="ml-2 h-3 w-3" />
                              </Link>
                            </Button>
                          </div>

                          {/* Sign cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <SignCard
                              label="Sun Sign"
                              sign={sunSign}
                              icon={<Sun className="h-5 w-5 text-gold" />}
                            />
                            <SignCard
                              label="Moon Sign"
                              sign={moonSign}
                              icon={<Moon className="h-5 w-5 text-cosmic-purple-light" />}
                            />
                            <SignCard
                              label="Rising Sign"
                              sign={
                                data.profile.birthTime ? risingSign : null
                              }
                              icon={<Sunrise className="h-5 w-5 text-gold-light" />}
                            />
                          </div>
                          {!data.profile.birthTime && (
                            <p className="mt-4 text-xs text-muted-foreground bg-white/5 rounded-lg p-3 border border-white/5">
                              Birth time not provided. Add your birth time for
                              Rising sign and more accurate Moon placement.
                            </p>
                          )}
                        </div>

                        {/* Quick actions */}
                        <div className="flex flex-wrap gap-3">
                          <Button asChild className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
                            <Link href="/compatibility">
                              <Users className="mr-2 h-4 w-4" />
                              New Compatibility Check
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="border-white/10">
                            <Link href={`/chart/${data.profile.id}`}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Explore Your Chart
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* No profile CTA */
                      <motion.div
                        initial={shouldAnimate ? { opacity: 0, scale: 0.98 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-12 text-center"
                      >
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/10">
                          <Sparkles className="h-8 w-8 text-cosmic-purple-light" />
                        </div>
                        <h3 className="font-heading text-xl font-semibold mb-2">
                          Set Up Your Birth Profile
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                          Add your birth details to see your natal chart, daily
                          horoscope, and more.
                        </p>
                        <Button
                          asChild
                          className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                        >
                          <Link href="/dashboard/profiles">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your Birth Profile
                          </Link>
                        </Button>

                        {/* Onboarding Checklist */}
                        <div className="mt-6 space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">Getting Started:</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cosmic-purple/20 text-xs font-bold text-cosmic-purple-light">1</span>
                            Create your birth profile
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold">2</span>
                            Run your first compatibility check
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold">3</span>
                            Explore your daily horoscope
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {/* My Connections Tab */}
              <TabsContent value="connections">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="connections-tab"
                    initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldAnimate ? { opacity: 0, y: -10 } : {}}
                  >
                    {data?.reports && data.reports.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading text-lg font-semibold">
                            Your Compatibility Reports
                          </h3>
                          <Button
                            asChild
                            size="sm"
                            className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                          >
                            <Link href="/compatibility">
                              <Plus className="mr-2 h-3 w-3" />
                              Compare With Someone New
                            </Link>
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {data.reports.map((report, i) => (
                            <motion.div
                              key={report.id}
                              initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: shouldAnimate ? i * 0.05 : 0 }}
                            >
                              <ReportCard report={report} shouldAnimate={shouldAnimate} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/10">
                          <Users className="h-8 w-8 text-cosmic-purple-light" />
                        </div>
                        <h3 className="font-heading text-xl font-semibold mb-2">
                          No Connections Yet
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                          Start by comparing your chart with someone special.
                          Get AI-powered insights into your compatibility.
                        </p>
                        <Button
                          asChild
                          className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                        >
                          <Link href="/compatibility">
                            <Plus className="mr-2 h-4 w-4" />
                            Compare With Someone New
                          </Link>
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <motion.div
                  initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Account Info */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                    <h3 className="font-heading text-lg font-semibold mb-4">Account</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium">{session?.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="text-sm font-medium">{session?.user?.name || "Not set"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                    <h3 className="font-heading text-lg font-semibold mb-4">Subscription</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Crown className="h-5 w-5 text-cosmic-purple-light" />
                        <div>
                          <p className="text-sm font-medium">{planLabel} Plan</p>
                          <p className="text-xs text-muted-foreground">
                            {data?.stats.plan === "FREE"
                              ? "Upgrade to unlock full reports, AI chat, and more"
                              : "You have access to all premium features"}
                          </p>
                        </div>
                      </div>
                      {data?.stats.plan === "FREE" && (
                        <Button asChild size="sm" className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
                          <Link href="/pricing">Upgrade</Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                    <h3 className="font-heading text-lg font-semibold mb-4">Session</h3>
                    <Button
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-heading text-lg font-semibold mb-4">
              Your Stats
            </h3>
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-cosmic-purple-light" />}
              label="Total Comparisons"
              value={String(data?.stats.totalReports || 0)}
              color="bg-cosmic-purple/10"
              shouldAnimate={shouldAnimate}
            />
            <StatCard
              icon={<Award className="h-5 w-5 text-gold" />}
              label="Highest Match"
              value={
                data?.stats.highestScore
                  ? `${data.stats.highestScore}%`
                  : "N/A"
              }
              color="bg-gold/10"
              shouldAnimate={shouldAnimate}
            />
            <StatCard
              icon={<Crown className="h-5 w-5 text-cosmic-purple-light" />}
              label="Account Plan"
              value={planLabel}
              color="bg-cosmic-purple/10"
              shouldAnimate={shouldAnimate}
            />

            {/* Daily Check-in Streak */}
            {streak > 0 && (
              <motion.div
                whileHover={shouldAnimate ? { y: -2, scale: 1.01 } : {}}
                className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.08] to-transparent p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Flame className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Daily Streak</p>
                    <p className="text-lg font-semibold text-orange-400">
                      Day {streak}
                    </p>
                  </div>
                </div>
                {getStreakMilestoneBadge(streak) && (
                  <div className="mt-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        streak >= 100
                          ? "border-gold/40 bg-gold/10 text-gold"
                          : streak >= 30
                            ? "border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light"
                            : "border-orange-500/30 bg-orange-500/10 text-orange-400"
                      )}
                    >
                      <Award className="mr-1 h-3 w-3" />
                      {getStreakMilestoneBadge(streak)}
                    </Badge>
                  </div>
                )}
              </motion.div>
            )}

            {/* Daily Horoscope Quick Link */}
            <motion.div
              whileHover={shouldAnimate ? { scale: 1.02 } : {}}
              className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/[0.06] to-transparent p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-4 w-4 text-gold" />
                <h4 className="font-heading text-sm font-semibold">Daily Horoscope</h4>
              </div>
              {hasProfiles ? (
                <>
                  <p className="text-xs text-muted-foreground mb-3">
                    Your personalized cosmic reading for today
                  </p>
                  <Button asChild size="sm" variant="outline" className="w-full border-gold/20 text-gold hover:bg-gold/10">
                    <Link href="/horoscope">
                      <Lightbulb className="mr-2 h-3 w-3" />
                      Read Today&apos;s Horoscope
                    </Link>
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  <Link
                    href="/dashboard/profiles"
                    className="underline hover:no-underline text-gold/80 hover:text-gold"
                  >
                    Create a birth profile
                  </Link>{" "}
                  to unlock your daily horoscope
                </p>
              )}
            </motion.div>

            {/* Transit Alerts */}
            <motion.div
              whileHover={shouldAnimate ? { scale: 1.02 } : {}}
              className="rounded-xl border border-cosmic-purple/20 bg-gradient-to-br from-cosmic-purple/[0.06] to-transparent p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Orbit className="h-4 w-4 text-cosmic-purple-light" />
                <h4 className="font-heading text-sm font-semibold">Active Transits</h4>
              </div>
              {hasProfiles ? (
                <>
                  <p className="text-xs text-muted-foreground mb-3">
                    Planetary influences on your chart today
                  </p>
                  <Button asChild size="sm" variant="outline" className="w-full border-cosmic-purple/20 text-cosmic-purple-light hover:bg-cosmic-purple/10">
                    <Link href="/transits">
                      <Orbit className="mr-2 h-3 w-3" />
                      View Active Transits
                    </Link>
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  <Link
                    href="/dashboard/profiles"
                    className="underline hover:no-underline text-cosmic-purple-light/80 hover:text-cosmic-purple-light"
                  >
                    Create a birth profile
                  </Link>{" "}
                  to unlock transit alerts
                </p>
              )}
            </motion.div>

            {data?.stats.plan === "FREE" && (
              <>
                {/* Premium Feature Discovery Tiles */}
                <div className="space-y-2">
                  <h4 className="font-heading text-sm font-semibold text-muted-foreground">
                    Premium Features
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        icon: <MessageCircle className="h-4 w-4" />,
                        label: "AI Astrologer Chat",
                      },
                      {
                        icon: <Sun className="h-4 w-4" />,
                        label: "Daily Horoscope",
                      },
                      {
                        icon: <TrendingUp className="h-4 w-4" />,
                        label: "Transit Alerts",
                      },
                      {
                        icon: <Heart className="h-4 w-4" />,
                        label: "Wellness Insights",
                      },
                    ].map((tile) => (
                      <Link
                        key={tile.label}
                        href="/pricing"
                        className="group relative rounded-lg border border-white/10 bg-white/[0.03] p-3 opacity-60 backdrop-blur-sm transition-all hover:opacity-80 hover:border-cosmic-purple/30"
                      >
                        <div className="absolute top-1.5 right-1.5">
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="mb-1.5 text-muted-foreground">
                          {tile.icon}
                        </div>
                        <p className="text-[11px] font-medium leading-tight">
                          {tile.label}
                        </p>
                        <p className="mt-1 text-[9px] text-cosmic-purple-light opacity-0 group-hover:opacity-100 transition-opacity">
                          Unlock with Premium
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                <motion.div
                  whileHover={shouldAnimate ? { scale: 1.02 } : {}}
                  className="rounded-xl border border-cosmic-purple/20 bg-gradient-to-br from-cosmic-purple/10 to-transparent p-4"
                >
                  <h4 className="font-heading text-sm font-semibold mb-1">
                    Unlock Full Insights
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upgrade to Premium for unlimited checks, full reports, and AI
                    chat.
                  </p>
                  <Button asChild size="sm" className="w-full bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
                    <Link href="/pricing">
                      <Sparkles className="mr-2 h-3 w-3" />
                      View Plans
                    </Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
