"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Heart,
  ArrowRight,
  Plus,
  BarChart3,
  Loader2,
  Calendar,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ProfileSelector, type Profile } from "@/components/profile-selector";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface CompatibilityScores {
  emotional: number;
  chemistry: number;
  communication: number;
  stability: number;
  conflict: number;
  overall: number;
}

interface QuickResult {
  person1Name: string;
  person2Name: string;
  scores: CompatibilityScores;
}

interface CompatibilityReport {
  id: string;
  person1: { name: string };
  person2: { name: string };
  overallScore: number;
  createdAt: string;
  tier: string;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 50) return "text-gold";
  return "text-red-400";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 50) return "Moderate";
  if (score >= 40) return "Challenging";
  return "Difficult";
}

function getScoreBadgeVariant(
  score: number
): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 70) return "default";
  if (score >= 50) return "secondary";
  return "outline";
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64 bg-white/5" />
        <Skeleton className="h-4 w-96 bg-white/5" />
      </div>

      {/* Compare section skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <Skeleton className="h-6 w-40 mb-6 bg-white/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-10 w-full bg-white/5" />
          <Skeleton className="h-10 w-full bg-white/5" />
        </div>
        <Skeleton className="h-12 w-48 mx-auto bg-white/5" />
      </div>

      {/* Reports skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 bg-white/5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreDimension({
  label,
  score,
  delay,
}: {
  label: string;
  score: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-xs font-semibold", getScoreColor(score))}>
          {score}%
        </span>
      </div>
      <Progress value={score} className="h-1.5 bg-white/5" />
    </motion.div>
  );
}

function ReportCard({ report }: { report: CompatibilityReport }) {
  const scoreColor = getScoreColor(report.overallScore);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/report/${report.id}`}
        className="block rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.05]"
      >
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-medium">
              {report.person1.name} & {report.person2.name}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              <Calendar className="mr-1 inline h-3 w-3" />
              {new Date(report.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="ml-3 flex-shrink-0 text-right">
            <p className={cn("text-2xl font-bold", scoreColor)}>
              {report.overallScore}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              score
            </p>
          </div>
        </div>
        <Progress value={report.overallScore} className="h-1.5 bg-white/5" />
        {report.tier !== "FREE" && (
          <Badge
            variant="outline"
            className="mt-3 border-cosmic-purple/30 text-[10px] text-cosmic-purple-light"
          >
            {report.tier}
          </Badge>
        )}
      </Link>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-12 text-center"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/10">
        <Users className="h-8 w-8 text-cosmic-purple-light" />
      </div>
      <h3 className="mb-2 font-heading text-xl font-semibold">
        Add Profiles to Get Started
      </h3>
      <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
        Add profiles to compare compatibility between people in your life. Save
        birth data for friends, family, or partners and discover your cosmic
        connections.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button
          asChild
          className="bg-cosmic-purple text-white hover:bg-cosmic-purple-dark"
        >
          <Link href="/dashboard/profiles">
            <Plus className="mr-2 h-4 w-4" />
            Add a Birth Profile
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-white/10">
          <Link href="/compatibility">
            <Heart className="mr-2 h-4 w-4" />
            Quick Compatibility Check
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page Component                                                       */
/* -------------------------------------------------------------------------- */

export default function ConnectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reports, setReports] = useState<CompatibilityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  const [person1Id, setPerson1Id] = useState("");
  const [person2Id, setPerson2Id] = useState("");
  const [quickResult, setQuickResult] = useState<QuickResult | null>(null);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch profiles and reports
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchData = async () => {
      try {
        setFetchError(null);
        const [profilesRes, reportsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/dashboard").catch(() => null),
        ]);

        if (profilesRes.ok) {
          const profilesData = await profilesRes.json();
          setProfiles(profilesData.profiles || []);
        } else {
          setFetchError("Failed to load profiles. Please try refreshing the page.");
        }

        if (reportsRes && reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(reportsData.reports || []);
        }
      } catch {
        setFetchError("Could not connect to the server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status]);

  // Run compatibility comparison
  const handleCompare = useCallback(async () => {
    if (!person1Id || !person2Id) return;

    const profile1 = profiles.find((p) => p.id === person1Id);
    const profile2 = profiles.find((p) => p.id === person2Id);

    if (!profile1 || !profile2) return;

    setComparing(true);
    setError("");
    setQuickResult(null);

    try {
      const response = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person1: {
            name: profile1.name,
            birthDate: profile1.birthDate,
            birthTime: profile1.birthTime || undefined,
            birthCity: profile1.birthCity,
            birthCountry: profile1.birthCountry,
            latitude: profile1.latitude,
            longitude: profile1.longitude,
            timezone: profile1.timezone,
          },
          person2: {
            name: profile2.name,
            birthDate: profile2.birthDate,
            birthTime: profile2.birthTime || undefined,
            birthCity: profile2.birthCity,
            birthCountry: profile2.birthCountry,
            latitude: profile2.latitude,
            longitude: profile2.longitude,
            timezone: profile2.timezone,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.message || errData.error || `Request failed (${response.status})`
        );
      }

      const data = await response.json();

      setQuickResult({
        person1Name: profile1.name,
        person2Name: profile2.name,
        scores: data.scores,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setComparing(false);
    }
  }, [person1Id, person2Id, profiles]);

  // Reset comparison
  const handleReset = () => {
    setPerson1Id("");
    setPerson2Id("");
    setQuickResult(null);
    setError("");
  };

  /* ======================================================================== */
  /*  Render                                                                  */
  /* ======================================================================== */

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen">
        <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-64 bg-white/5" />
            <Skeleton className="mt-2 h-4 w-96 bg-white/5" />
          </div>
        </section>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!session) return null;

  const hasProfiles = profiles.length >= 2;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="font-heading text-3xl font-bold">
                <span className="cosmic-text">Connections</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Compare compatibility between your saved profiles
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-white/10 text-muted-foreground"
              >
                <Users className="mr-1 h-3 w-3" />
                {profiles.length} {profiles.length === 1 ? "profile" : "profiles"}
              </Badge>
              <Button
                asChild
                size="sm"
                className="bg-cosmic-purple text-white hover:bg-cosmic-purple-dark"
              >
                <Link href="/dashboard/profiles">
                  <Plus className="mr-2 h-3 w-3" />
                  Add Profile
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Fetch error banner */}
        {fetchError && (
          <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{fetchError}</span>
            <button
              onClick={() => setFetchError(null)}
              className="shrink-0 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* No profiles or not enough */}
        {!hasProfiles && (
          <EmptyState />
        )}

        {/* Compare Profiles Section */}
        {hasProfiles && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-cosmic-purple-light" />
                  Compare Profiles
                </CardTitle>
                <CardDescription>
                  Select two profiles to check their astrological compatibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile selectors */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ProfileSelector
                    profiles={profiles}
                    value={person1Id}
                    onValueChange={(val) => {
                      setPerson1Id(val);
                      setQuickResult(null);
                      setError("");
                    }}
                    placeholder="Select first person"
                    excludeId={person2Id}
                    label="Person 1"
                  />
                  <ProfileSelector
                    profiles={profiles}
                    value={person2Id}
                    onValueChange={(val) => {
                      setPerson2Id(val);
                      setQuickResult(null);
                      setError("");
                    }}
                    placeholder="Select second person"
                    excludeId={person1Id}
                    label="Person 2"
                  />
                </div>

                {/* Compare button */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    disabled={!person1Id || !person2Id || comparing}
                    onClick={handleCompare}
                    className={cn(
                      "h-12 rounded-full px-8 text-base font-semibold shadow-lg transition-all",
                      person1Id && person2Id && !comparing
                        ? "bg-gradient-to-r from-cosmic-purple to-gold text-white hover:shadow-cosmic-purple/40 hover:shadow-xl hover:brightness-110"
                        : "cursor-not-allowed opacity-50"
                    )}
                  >
                    {comparing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing Charts...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Compare Compatibility
                      </>
                    )}
                  </Button>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm"
                    >
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cosmic-purple/10">
                        <AlertTriangle className="h-6 w-6 text-cosmic-purple-light" />
                      </div>
                      <h4 className="font-heading text-base font-semibold mb-1">
                        {error.toLowerCase().includes("unreachable") ||
                        error.toLowerCase().includes("unavailable") ||
                        error.toLowerCase().includes("service")
                          ? "Service Temporarily Unavailable"
                          : "Compatibility Check Failed"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                        {error.toLowerCase().includes("unreachable") ||
                        error.toLowerCase().includes("unavailable") ||
                        error.toLowerCase().includes("service")
                          ? "Our astrology calculation service is currently being updated. Please try again shortly."
                          : error}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          size="sm"
                          onClick={handleCompare}
                          className="bg-cosmic-purple text-white hover:bg-cosmic-purple-dark"
                        >
                          <RefreshCw className="mr-2 h-3.5 w-3.5" />
                          Try Again
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setError("")}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Result */}
                <AnimatePresence>
                  {quickResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <Separator className="bg-white/10" />

                      {/* Overall score hero */}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          {quickResult.person1Name} &{" "}
                          {quickResult.person2Name}
                        </p>
                        <div className="mt-3 flex items-center justify-center gap-3">
                          <p
                            className={cn(
                              "text-5xl font-bold",
                              getScoreColor(quickResult.scores.overall)
                            )}
                          >
                            {quickResult.scores.overall}
                          </p>
                          <div className="text-left">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">
                              overall
                            </p>
                            <Badge
                              variant={getScoreBadgeVariant(
                                quickResult.scores.overall
                              )}
                              className="mt-0.5"
                            >
                              {getScoreLabel(quickResult.scores.overall)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Score dimensions */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                          <BarChart3 className="h-4 w-4 text-cosmic-purple-light" />
                          Score Breakdown
                        </h4>
                        <div className="space-y-3">
                          <ScoreDimension
                            label="Emotional Connection"
                            score={quickResult.scores.emotional}
                            delay={0.1}
                          />
                          <ScoreDimension
                            label="Chemistry & Attraction"
                            score={quickResult.scores.chemistry}
                            delay={0.2}
                          />
                          <ScoreDimension
                            label="Communication Style"
                            score={quickResult.scores.communication}
                            delay={0.3}
                          />
                          <ScoreDimension
                            label="Long-Term Stability"
                            score={quickResult.scores.stability}
                            delay={0.4}
                          />
                          <ScoreDimension
                            label="Conflict Resolution"
                            score={quickResult.scores.conflict}
                            delay={0.5}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Button
                          asChild
                          className="bg-gradient-to-r from-cosmic-purple to-gold text-white hover:brightness-110"
                        >
                          <Link href="/compatibility">
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Generate Full Report
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/10"
                          onClick={handleReset}
                        >
                          Compare Different Profiles
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Existing Reports Section */}
        {reports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">
                Past Compatibility Reports
              </h2>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/10"
              >
                <Link href="/compatibility">
                  <Plus className="mr-2 h-3 w-3" />
                  New Check
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {reports.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <ReportCard report={report} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No reports but has profiles */}
        {reports.length === 0 && hasProfiles && !quickResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center"
          >
            <BarChart3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <h3 className="mb-1 font-medium text-muted-foreground">
              No reports yet
            </h3>
            <p className="text-xs text-muted-foreground/70">
              Compare two profiles above to see your first compatibility result
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
