"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
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

function ReportCard({ report }: { report: CompatibilityReport }) {
  const scoreColor =
    report.overallScore >= 70
      ? "text-emerald-400"
      : report.overallScore >= 50
        ? "text-gold"
        : "text-red-400";

  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.2 }}>
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialTab = searchParams.get("tab") || "chart";
  const [activeTab, setActiveTab] = useState(initialTab);

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="font-heading text-3xl font-bold">
                Welcome back,{" "}
                <span className="cosmic-text">
                  {session.user.name || "Stargazer"}
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your cosmic dashboard awaits
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

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
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
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-12 text-center"
                      >
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/10">
                          <Sparkles className="h-8 w-8 text-cosmic-purple-light" />
                        </div>
                        <h3 className="font-heading text-xl font-semibold mb-2">
                          Set Up Your Birth Chart
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                          Enter your birth details to unlock your natal chart,
                          discover your Sun, Moon, and Rising signs, and start
                          exploring compatibility.
                        </p>
                        <Button
                          asChild
                          className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                        >
                          <Link href="/compatibility">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your Chart
                          </Link>
                        </Button>
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
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
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <ReportCard report={report} />
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
                  initial={{ opacity: 0, y: 10 }}
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
            />
            <StatCard
              icon={<Crown className="h-5 w-5 text-cosmic-purple-light" />}
              label="Account Plan"
              value={planLabel}
              color="bg-cosmic-purple/10"
            />

            {/* Daily Horoscope Quick Link */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/[0.06] to-transparent p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-4 w-4 text-gold" />
                <h4 className="font-heading text-sm font-semibold">Daily Horoscope</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Your personalized cosmic reading for today
              </p>
              <Button asChild size="sm" variant="outline" className="w-full border-gold/20 text-gold hover:bg-gold/10">
                <Link href="/horoscope">
                  <Lightbulb className="mr-2 h-3 w-3" />
                  Read Today&apos;s Horoscope
                </Link>
              </Button>
            </motion.div>

            {/* Transit Alerts */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-cosmic-purple/20 bg-gradient-to-br from-cosmic-purple/[0.06] to-transparent p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Orbit className="h-4 w-4 text-cosmic-purple-light" />
                <h4 className="font-heading text-sm font-semibold">Active Transits</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                Planetary influences on your chart today
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                Available when you have a birth profile with chart data
              </p>
            </motion.div>

            {data?.stats.plan === "FREE" && (
              <motion.div
                whileHover={{ scale: 1.02 }}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
