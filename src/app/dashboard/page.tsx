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
  Star,
  Trophy,
  Gift,
  Copy,
  Check,
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
import { NotificationPrompt } from "@/components/notification-prompt";
import { NotificationPreferences } from "@/components/notification-preferences";
import { AccountManagement } from "@/components/account-management";
import { ACHIEVEMENTS } from "@/lib/achievement-defs";
import { getBannerEvents, formatShortDate } from "@/lib/cosmic-events";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { RelationshipCheckIn } from "@/components/relationship-checkin";

// Map achievement icon names to Lucide components
const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  Star: <Star className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  Flame: <Flame className="h-4 w-4" />,
  Trophy: <Trophy className="h-4 w-4" />,
  Crown: <Crown className="h-4 w-4" />,
};

interface EarnedAchievement {
  achievementType: string;
  unlockedAt: string;
}

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

/** Styling config for each cosmic event type. */
const COSMIC_EVENT_STYLES: Record<string, { border: string; bg: string; text: string }> = {
  "mercury-retrograde": { border: "border-amber-400/30", bg: "bg-gradient-to-r from-amber-500/10 to-amber-400/5", text: "text-amber-400" },
  "full-moon": { border: "border-cosmic-purple-light/30", bg: "bg-gradient-to-r from-cosmic-purple/10 to-indigo-500/5", text: "text-cosmic-purple-light" },
  "new-moon": { border: "border-slate-400/30", bg: "bg-gradient-to-r from-slate-500/10 to-slate-400/5", text: "text-slate-300" },
  "solar-eclipse": { border: "border-gold/40", bg: "bg-gradient-to-r from-gold/15 to-orange-500/5", text: "text-gold" },
  "lunar-eclipse": { border: "border-red-400/30", bg: "bg-gradient-to-r from-red-500/10 to-purple-500/5", text: "text-red-400" },
  "zodiac-season": { border: "border-cosmic-purple/20", bg: "bg-gradient-to-r from-cosmic-purple/5 to-transparent", text: "text-cosmic-purple-light" },
};

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
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
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
            className="mt-3 text-xs border-cosmic-purple/30 text-cosmic-purple-light"
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
  const [portalLoading, setPortalLoading] = useState(false);
  const [achievements, setAchievements] = useState<EarnedAchievement[]>([]);
  const [referralData, setReferralData] = useState<{
    referralCode: string;
    referralCount: number;
    referralsNeeded: number;
    threshold: number;
    eligible: boolean;
    rewardClaimed: boolean;
  } | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

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

  // Open Stripe Customer Portal for subscription management
  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const result = await res.json();
      if (res.ok && result.url) {
        window.location.href = result.url;
      } else {
        setError(result.error || "Failed to open subscription portal. Please try again.");
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  // Trigger confetti on upgrade
  useEffect(() => {
    if (upgraded && shouldAnimate) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [upgraded, shouldAnimate]);

  // Record daily check-in via server and sync streak + achievements from DB
  useEffect(() => {
    if (status !== "authenticated") return;

    const syncStreak = async () => {
      try {
        const res = await fetch("/api/streak", { method: "POST" });
        if (!res.ok) return;

        const result = await res.json();
        const newCount: number = result.streakCount;
        setStreak(newCount);

        // Populate earned achievements from server response
        if (result.achievements) {
          setAchievements(result.achievements);
        }

        // Trigger confetti on milestone reached (only on new days)
        if (result.isNewDay && shouldAnimate) {
          const prevCount = newCount - 1; // previous streak before today's increment
          for (const milestone of STREAK_MILESTONES) {
            if (prevCount < milestone && newCount >= milestone) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3500);
              break;
            }
          }
        }
      } catch {
        // Network error — streak display will remain at 0
      }
    };

    syncStreak();
  }, [status, shouldAnimate]);

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

  // Fetch referral data
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchReferral = async () => {
      try {
        const res = await fetch("/api/referral");
        if (res.ok) {
          const json = await res.json();
          setReferralData(json);
        }
      } catch {
        // Silently fail — referral card just won't show
      }
    };

    fetchReferral();
  }, [status]);

  const handleCopyReferralLink = async () => {
    if (!referralData?.referralCode) return;
    const link = `${window.location.origin}/auth/signup?ref=${referralData.referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    }
  };

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
      <OnboardingWizard />
      {/* Confetti overlay */}
      <Confetti trigger={showConfetti} />

      {/* Relationship Check-In Modal */}
      <RelationshipCheckIn
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onComplete={() => {}}
      />

      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold">
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

      {/* Notification Opt-in Prompt */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <NotificationPrompt />
      </div>

      {/* Cosmic Events Banner */}
      {(() => {
        const cosmicEvents = getBannerEvents();
        if (cosmicEvents.length === 0) return null;
        return (
          <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 space-y-3">
            {cosmicEvents.map((event, i) => {
              const styles = COSMIC_EVENT_STYLES[event.type] || COSMIC_EVENT_STYLES["zodiac-season"];
              return (
                <motion.div
                  key={`${event.type}-${event.name}`}
                  initial={shouldAnimate ? { opacity: 0, y: -5 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 text-sm backdrop-blur-sm",
                    styles.border,
                    styles.bg,
                  )}
                >
                  <span className="text-xl shrink-0 mt-0.5">{event.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className={cn("font-semibold", styles.text)}>
                        {event.name}
                      </strong>
                      {event.type === "mercury-retrograde" && (
                        <Badge variant="outline" className={cn("text-xs", styles.border, styles.text)}>
                          Until {formatShortDate(event.endDate)}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        );
      })()}

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
                Marie (personal astrologer) for personalized guidance
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
        <div className="space-y-8">
          {/* Stats Row — horizontal across the top */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              value={data?.stats.highestScore ? `${data.stats.highestScore}%` : "N/A"}
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
            {streak > 0 && (
              <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.08] to-transparent p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Flame className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Daily Streak</p>
                    <p className="text-lg font-semibold text-orange-400">Day {streak}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Area */}
          <div>
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
                      /* No profile — onboarding welcome */
                      <motion.div
                        initial={shouldAnimate ? { opacity: 0, scale: 0.98 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-8 sm:p-12"
                      >
                        {/* Hero area */}
                        <div className="text-center mb-8">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/10">
                            <Sparkles className="h-8 w-8 text-cosmic-purple-light" />
                          </div>
                          <h3 className="font-heading text-2xl font-bold mb-2">
                            Discover Your Cosmic Identity
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                            Your birth chart is a unique map of the sky at the
                            moment you were born. Set up your profile to unlock
                            personalized insights, daily guidance, and
                            compatibility analysis.
                          </p>
                        </div>

                        {/* Step indicator */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                          {/* Step 1 — active */}
                          <div className="relative rounded-xl border border-cosmic-purple/30 bg-cosmic-purple/[0.06] p-5 text-center">
                            <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-cosmic-purple/20 ring-2 ring-cosmic-purple/40">
                              <span className="text-sm font-bold text-cosmic-purple-light">1</span>
                            </div>
                            <h4 className="text-sm font-semibold mb-1">Add Birth Details</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Your natal chart with 10+ planetary positions
                            </p>
                            <div className="hidden sm:block absolute top-1/2 -right-2.5 -translate-y-1/2">
                              <ArrowRight className="h-4 w-4 text-white/20" />
                            </div>
                          </div>

                          {/* Step 2 — upcoming */}
                          <div className="relative rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center opacity-70">
                            <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                              <span className="text-sm font-bold text-muted-foreground">2</span>
                            </div>
                            <h4 className="text-sm font-semibold mb-1">Get Your Chart</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              AI-powered daily horoscope tailored to you
                            </p>
                            <div className="hidden sm:block absolute top-1/2 -right-2.5 -translate-y-1/2">
                              <ArrowRight className="h-4 w-4 text-white/20" />
                            </div>
                          </div>

                          {/* Step 3 — upcoming */}
                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center opacity-70">
                            <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                              <span className="text-sm font-bold text-muted-foreground">3</span>
                            </div>
                            <h4 className="text-sm font-semibold mb-1">Check Compatibility</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Compatibility analysis with anyone
                            </p>
                          </div>
                        </div>

                        {/* Sample chart preview teaser */}
                        <div className="mx-auto max-w-sm mb-8 rounded-xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-sm">
                          <div className="flex items-center gap-4">
                            <div className="grid grid-cols-3 gap-1.5 shrink-0">
                              {["\u2648", "\u2649", "\u264A", "\u264B", "\u264C", "\u264D", "\u264E", "\u264F", "\u2650"].map((glyph, i) => (
                                <span key={i} className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] text-sm text-muted-foreground/60">
                                  {glyph}
                                </span>
                              ))}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-muted-foreground mb-0.5">
                                Your Cosmic Blueprint
                              </p>
                              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                                Sun, Moon, Rising, Mercury, Venus, Mars and more
                                &mdash; mapped across 12 houses
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Primary CTA */}
                        <div className="text-center">
                          <Button
                            asChild
                            size="lg"
                            className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white px-8"
                          >
                            <Link href="/dashboard/profiles">
                              <Plus className="mr-2 h-4 w-4" />
                              Create Your Birth Profile
                            </Link>
                          </Button>
                          <p className="mt-3 text-xs text-muted-foreground">
                            Takes less than 2 minutes
                          </p>
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
                      <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-8 sm:p-12">
                        <div className="text-center mb-8">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/10">
                            <Users className="h-8 w-8 text-cosmic-purple-light" />
                          </div>
                          <h3 className="font-heading text-xl font-semibold mb-2">
                            No Connections Yet
                          </h3>
                          <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            Run your first compatibility check to see your connections here
                          </p>
                        </div>

                        {/* Preview of what a connection card looks like */}
                        <div className="mx-auto max-w-sm mb-8 opacity-40 pointer-events-none select-none" aria-hidden="true">
                          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                            <div className="flex items-start justify-between mb-3">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-sm">You & Someone Special</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  <Calendar className="inline mr-1 h-3 w-3" />
                                  Your first match
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0 ml-3">
                                <p className="text-2xl font-bold text-emerald-400">
                                  85
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  score
                                </p>
                              </div>
                            </div>
                            <Progress
                              value={85}
                              className="h-1.5 bg-white/5"
                            />
                          </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                          <Button
                            asChild
                            className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                          >
                            <Link href="/compatibility">
                              <Heart className="mr-2 h-4 w-4" />
                              Check Compatibility
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            className="border-white/10"
                          >
                            <Link href="/about">
                              <Lightbulb className="mr-2 h-4 w-4" />
                              Learn How It Works
                            </Link>
                          </Button>
                        </div>
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
                      {data?.stats.plan === "FREE" ? (
                        <Button asChild size="sm" className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
                          <Link href="/pricing?callbackUrl=/dashboard">Upgrade</Link>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10"
                          disabled={portalLoading}
                          onClick={handleManageSubscription}
                        >
                          {portalLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Settings className="mr-2 h-4 w-4" />
                              Manage Subscription
                            </>
                          )}
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

                  {/* Notification Preferences */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                    <NotificationPreferences />
                  </div>

                  {/* Account & Data Management */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                    <AccountManagement />
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Quick Actions Row — horizontal below tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4 text-gold" />
                  <h4 className="font-heading text-sm font-semibold">Achievements</h4>
                </div>
                <div className="space-y-2">
                  {achievements.map((a) => {
                    const def = ACHIEVEMENTS[a.achievementType];
                    if (!def) return null;
                    return (
                      <div key={a.achievementType} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                          {ACHIEVEMENT_ICONS[def.icon] || <Star className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{def.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{def.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily Horoscope */}
            <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/[0.06] to-transparent p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-4 w-4 text-gold" />
                <h4 className="font-heading text-sm font-semibold">Daily Horoscope</h4>
              </div>
              {hasProfiles ? (
                <>
                  <p className="text-xs text-muted-foreground mb-3">Your personalized cosmic reading for today</p>
                  <Button asChild size="sm" variant="outline" className="w-full border-gold/20 text-gold hover:bg-gold/10">
                    <Link href="/horoscope">
                      <Lightbulb className="mr-2 h-3 w-3" />
                      Read Horoscope
                    </Link>
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  <Link href="/dashboard/profiles" className="underline hover:no-underline text-gold/80 hover:text-gold">Create a birth profile</Link> to unlock
                </p>
              )}
            </div>

            {/* Active Transits */}
            <div className="rounded-xl border border-cosmic-purple/20 bg-gradient-to-br from-cosmic-purple/[0.06] to-transparent p-4">
              <div className="flex items-center gap-2 mb-2">
                <Orbit className="h-4 w-4 text-cosmic-purple-light" />
                <h4 className="font-heading text-sm font-semibold">Active Transits</h4>
              </div>
              {hasProfiles ? (
                <>
                  <p className="text-xs text-muted-foreground mb-3">Planetary influences on your chart today</p>
                  <Button asChild size="sm" variant="outline" className="w-full border-cosmic-purple/20 text-cosmic-purple-light hover:bg-cosmic-purple/10">
                    <Link href="/transits">
                      <Orbit className="mr-2 h-3 w-3" />
                      View Transits
                    </Link>
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  <Link href="/dashboard/profiles" className="underline hover:no-underline text-cosmic-purple-light/80 hover:text-cosmic-purple-light">Create a birth profile</Link> to unlock
                </p>
              )}
            </div>

            {/* Relationship Check-In */}
            {data?.stats.plan !== "FREE" && (
              <div className="rounded-xl border border-pink-500/20 bg-gradient-to-br from-pink-500/[0.06] to-transparent p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-pink-400" />
                  <h4 className="font-heading text-sm font-semibold">Check-In</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Monthly relationship health check</p>
                <Button size="sm" onClick={() => setShowCheckIn(true)} className="w-full bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20">
                  Start Check-In
                </Button>
              </div>
            )}

            {/* Invite Friends Referral Card */}
            {referralData && (
              <motion.div
                whileHover={shouldAnimate ? { scale: 1.02 } : {}}
                className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] to-transparent p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="h-4 w-4 text-emerald-400" />
                  <h4 className="font-heading text-sm font-semibold">Invite Friends</h4>
                </div>

                {referralData.rewardClaimed ? (
                  <div className="text-center py-2">
                    <p className="text-xs text-emerald-400 font-medium">
                      Reward claimed! Enjoy your free Premium month.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {referralData.referralCount} friend{referralData.referralCount !== 1 ? "s" : ""} invited
                    </p>
                  </div>
                ) : referralData.eligible ? (
                  <div className="text-center py-2">
                    <p className="text-xs text-emerald-400 font-medium mb-2">
                      You&apos;ve earned 1 month of free Premium!
                    </p>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                      <Award className="mr-1 h-3 w-3" />
                      Reward Unlocked
                    </Badge>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-3">
                      Invite {referralData.threshold} friends and earn 1 month of free Premium!
                    </p>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{referralData.referralCount}/{referralData.threshold} friends invited</span>
                        <span>{referralData.referralsNeeded} more to go</span>
                      </div>
                      <Progress
                        value={(referralData.referralCount / referralData.threshold) * 100}
                        className="h-1.5 bg-white/5"
                      />
                    </div>
                  </>
                )}

                {/* Referral link + copy button */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">Your referral link:</p>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 truncate rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-muted-foreground font-mono">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/auth/signup?ref=${referralData.referralCode}`
                        : `https://chartchemistry.com/auth/signup?ref=${referralData.referralCode}`}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "shrink-0 h-8 w-8 p-0 border-white/10",
                        referralCopied && "border-emerald-500/30 text-emerald-400"
                      )}
                      onClick={handleCopyReferralLink}
                    >
                      {referralCopied ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

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
                        label: "Marie",
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
                        href="/pricing?callbackUrl=/dashboard"
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
                        <p className="mt-1 text-[11px] text-cosmic-purple-light opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <Link href="/pricing?callbackUrl=/dashboard">
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
