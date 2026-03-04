"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Lightbulb,
  Calendar,
  Users,
  Sparkles,
  Loader2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface BirthProfile {
  id: string;
  name: string;
  birthDate: string;
  birthTime?: string | null;
  birthCity: string;
}

interface LoveLanguagePrediction {
  person1: { primary: string; reason: string };
  person2: { primary: string; reason: string };
  synergy: string;
}

interface DateNightSuggestion {
  idea: string;
  reason: string;
}

interface RelationshipInsights {
  person1: { name: string; id: string };
  person2: { name: string; id: string };
  compatibility_style: string;
  love_language_prediction: LoveLanguagePrediction;
  potential_challenges: string[];
  growth_areas: string[];
  date_night_suggestions: DateNightSuggestion[];
  communication_tips: string[];
}

/* -------------------------------------------------------------------------- */
/*  Loading skeleton                                                          */
/* -------------------------------------------------------------------------- */

function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card
          key={i}
          className="border-white/10 bg-white/[0.03] backdrop-blur-sm"
        >
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-2 h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Insight cards                                                             */
/* -------------------------------------------------------------------------- */

function CompatibilityStyleCard({ style }: { style: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border-cosmic-purple/20 bg-gradient-to-br from-cosmic-purple/[0.08] to-transparent backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cosmic-purple/10">
              <Heart className="h-4 w-4 text-cosmic-purple-light" />
            </div>
            Compatibility Style
          </CardTitle>
          <CardDescription>
            How you naturally relate as romantic partners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground/90">{style}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoveLanguagesCard({
  prediction,
  name1,
  name2,
}: {
  prediction: LoveLanguagePrediction;
  name1: string;
  name2: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-pink-500/20 bg-gradient-to-br from-pink-500/[0.06] to-transparent backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10">
              <Sparkles className="h-4 w-4 text-pink-400" />
            </div>
            Love Languages
          </CardTitle>
          <CardDescription>
            How each person gives and receives love
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">{name1}</span>
              <Badge
                variant="outline"
                className="border-pink-500/30 text-pink-400"
              >
                {prediction.person1.primary}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {prediction.person1.reason}
            </p>
          </div>

          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium">{name2}</span>
              <Badge
                variant="outline"
                className="border-pink-500/30 text-pink-400"
              >
                {prediction.person2.primary}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {prediction.person2.reason}
            </p>
          </div>

          <Separator className="bg-white/10" />

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Synergy
            </p>
            <p className="text-sm text-foreground/90">
              {prediction.synergy}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ChallengesAndGrowthCard({
  challenges,
  growthAreas,
}: {
  challenges: string[];
  growthAreas: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-gold/20 bg-gradient-to-br from-gold/[0.06] to-transparent backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
              <TrendingUp className="h-4 w-4 text-gold" />
            </div>
            Challenges & Growth
          </CardTitle>
          <CardDescription>
            Navigate friction and grow together
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <p className="text-sm font-medium">Potential Challenges</p>
            </div>
            <ul className="space-y-2">
              {challenges.map((challenge, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-foreground/80"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400/60" />
                  {challenge}
                </li>
              ))}
            </ul>
          </div>

          <Separator className="bg-white/10" />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-medium">Growth Areas</p>
            </div>
            <ul className="space-y-2">
              {growthAreas.map((area, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-foreground/80"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400/60" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DateNightCard({
  suggestions,
}: {
  suggestions: DateNightSuggestion[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/[0.06] to-transparent backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <Calendar className="h-4 w-4 text-violet-400" />
            </div>
            Date Night Suggestions
          </CardTitle>
          <CardDescription>
            Cosmically aligned ideas for your next outing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
              >
                <p className="mb-1 text-sm font-medium">{suggestion.idea}</p>
                <p className="text-xs text-muted-foreground">
                  {suggestion.reason}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CommunicationTipsCard({ tips }: { tips: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.06] to-transparent backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
              <MessageCircle className="h-4 w-4 text-cyan-400" />
            </div>
            Communication Tips
          </CardTitle>
          <CardDescription>
            How to talk, listen, and connect more deeply
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground/80">
                <Badge
                  variant="outline"
                  className="mt-0.5 h-5 w-5 flex-shrink-0 items-center justify-center border-cyan-500/30 p-0 text-[10px] text-cyan-400"
                >
                  {i + 1}
                </Badge>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export default function RelationshipPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profileId1, setProfileId1] = useState("");
  const [profileId2, setProfileId2] = useState("");
  const [insights, setInsights] = useState<RelationshipInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Fetch user's birth profiles
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchProfiles = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfiles(data.profiles || []);
        }
      } catch {
        // Profiles will remain empty
      } finally {
        setProfilesLoading(false);
      }
    };

    fetchProfiles();
  }, [status]);

  const handleGetInsights = async () => {
    if (!profileId1 || !profileId2) return;

    setLoading(true);
    setError("");
    setInsights(null);

    try {
      const response = await fetch("/api/relationship/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId1, profileId2 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Request failed (${response.status})`
        );
      }

      const data: RelationshipInsights = await response.json();
      setInsights(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    profileId1 &&
    profileId2 &&
    profileId1 !== profileId2 &&
    !loading;

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cosmic-purple-light" />
          <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-pink-500/5 via-cosmic-purple/5 to-transparent">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-cosmic-purple/20">
              <Heart className="h-7 w-7 text-pink-400" />
            </div>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">
              Relationship{" "}
              <span className="cosmic-text">Insights</span>
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              Discover how the stars shape your romantic connection. Get
              personalized dating insights, love language predictions, and
              communication tips based on your birth charts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile selectors */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8 border-white/10 bg-white/[0.03] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-cosmic-purple-light" />
                Select Two Profiles
              </CardTitle>
              <CardDescription>
                Choose two birth profiles to analyze their romantic
                compatibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <div className="flex items-center gap-4">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ) : profiles.length < 2 ? (
                <div className="rounded-lg border border-dashed border-white/20 bg-white/[0.02] p-6 text-center">
                  <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    You need at least 2 birth profiles to compare. Head to
                    your dashboard to create profiles first.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-white/10"
                    onClick={() => router.push("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-muted-foreground">
                        Person 1
                      </label>
                      <Select
                        value={profileId1}
                        onValueChange={setProfileId1}
                      >
                        <SelectTrigger className="w-full border-white/10 bg-white/[0.03]">
                          <SelectValue placeholder="Select a profile" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem
                              key={profile.id}
                              value={profile.id}
                              disabled={profile.id === profileId2}
                            >
                              {profile.name} — {profile.birthCity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-muted-foreground">
                        Person 2
                      </label>
                      <Select
                        value={profileId2}
                        onValueChange={setProfileId2}
                      >
                        <SelectTrigger className="w-full border-white/10 bg-white/[0.03]">
                          <SelectValue placeholder="Select a profile" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem
                              key={profile.id}
                              value={profile.id}
                              disabled={profile.id === profileId1}
                            >
                              {profile.name} — {profile.birthCity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {profileId1 && profileId2 && profileId1 === profileId2 && (
                    <p className="mt-3 text-xs text-destructive">
                      Please select two different profiles.
                    </p>
                  )}

                  <div className="mt-6 flex justify-center">
                    <Button
                      size="lg"
                      disabled={!canSubmit}
                      onClick={handleGetInsights}
                      className={cn(
                        "h-12 rounded-full px-8 text-base font-semibold shadow-lg transition-all",
                        canSubmit
                          ? "bg-gradient-to-r from-pink-500 to-cosmic-purple text-white hover:shadow-pink-500/30 hover:shadow-xl hover:brightness-110"
                          : "cursor-not-allowed opacity-50"
                      )}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing Charts...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Get Insights
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cosmic-purple/10">
                  <AlertTriangle className="h-6 w-6 text-cosmic-purple-light" />
                </div>
                <h3 className="font-heading text-base font-semibold mb-1">
                  {error.toLowerCase().includes("unreachable") ||
                  error.toLowerCase().includes("unavailable") ||
                  error.toLowerCase().includes("service")
                    ? "Service Temporarily Unavailable"
                    : "Unable to Load Insights"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  {error.toLowerCase().includes("unreachable") ||
                  error.toLowerCase().includes("unavailable") ||
                  error.toLowerCase().includes("service")
                    ? "Our astrology calculation service is currently being updated. Please try again shortly."
                    : error}
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button
                    size="sm"
                    onClick={handleGetInsights}
                    disabled={!canSubmit}
                    className="bg-cosmic-purple text-white hover:bg-cosmic-purple-dark"
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Try Again
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-white/10"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-3.5 w-3.5" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {loading && <InsightsSkeleton />}

        {/* Results */}
        <AnimatePresence>
          {insights && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Names header */}
              <div className="mb-2 text-center">
                <p className="text-sm text-muted-foreground">
                  Relationship insights for
                </p>
                <h2 className="font-heading text-xl font-semibold">
                  <span className="cosmic-text">{insights.person1.name}</span>
                  {" & "}
                  <span className="cosmic-text">{insights.person2.name}</span>
                </h2>
              </div>

              <CompatibilityStyleCard
                style={insights.compatibility_style}
              />

              <LoveLanguagesCard
                prediction={insights.love_language_prediction}
                name1={insights.person1.name}
                name2={insights.person2.name}
              />

              <ChallengesAndGrowthCard
                challenges={insights.potential_challenges}
                growthAreas={insights.growth_areas}
              />

              <DateNightCard
                suggestions={insights.date_night_suggestions}
              />

              <CommunicationTipsCard tips={insights.communication_tips} />

              {/* Reset / Try again */}
              <div className="flex justify-center pt-4 pb-8">
                <Button
                  variant="outline"
                  className="rounded-full border-white/10"
                  onClick={() => {
                    setInsights(null);
                    setProfileId1("");
                    setProfileId2("");
                  }}
                >
                  Try Another Pair
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
