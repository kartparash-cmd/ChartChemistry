"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, AlertTriangle, RefreshCw, LayoutDashboard, Crown, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/star-field";
import { BirthDataForm, type BirthData } from "@/components/birth-data-form";
import { LoadingFacts } from "./loading-facts";
import {
  CompatibilityResults,
  type CompatibilityResult,
} from "./results";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Sun sign helper (approximate, for display purposes)                       */
/* -------------------------------------------------------------------------- */

function getSunSign(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

/* -------------------------------------------------------------------------- */
/*  Page states                                                               */
/* -------------------------------------------------------------------------- */

type PageState = "input" | "loading" | "results" | "error";

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function CompatibilityPage() {
  const { data: session } = useSession();
  const [personA, setPersonA] = useState<BirthData | null>(null);
  const [personB, setPersonB] = useState<BirthData | null>(null);
  const [pageState, setPageState] = useState<PageState>("input");
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string>("");
  const [remainingChecks, setRemainingChecks] = useState<number | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [formKeyA, setFormKeyA] = useState(0);
  const [formKeyB, setFormKeyB] = useState(0);

  const bothValid = personA !== null && personB !== null;
  const personAReady = personA !== null;
  const personBReady = personB !== null;

  // Fetch saved profiles for authenticated users
  useEffect(() => {
    if (session?.user) {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profiles && Array.isArray(data.profiles)) {
            setSavedProfiles(data.profiles);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const handleSubmit = useCallback(async () => {
    if (!personA || !personB) return;

    setPageState("loading");
    setError("");

    try {
      const response = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person1: personA,
          person2: personB,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setShowRateLimitModal(true);
          setPageState("input");
          return;
        }
        throw new Error(
          `Analysis failed (${response.status}). Please try again.`
        );
      }

      const data = await response.json();

      // Capture remaining checks from API response
      if (data.remainingChecks !== undefined) {
        setRemainingChecks(data.remainingChecks as number | null);
      }

      // Map API response shape to CompatibilityResult format
      const mappedResult: CompatibilityResult = {
        personA: {
          name: personA.name,
          sunSign: getSunSign(personA.birthDate),
        },
        personB: {
          name: personB.name,
          sunSign: getSunSign(personB.birthDate),
        },
        overallScore: data.scores?.overall ?? 0,
        dimensions: {
          emotional: data.scores?.emotional ?? 0,
          chemistry: data.scores?.chemistry ?? 0,
          communication: data.scores?.communication ?? 0,
          stability: data.scores?.stability ?? 0,
          harmony: data.scores?.conflict != null
            ? Math.round(100 - data.scores.conflict)
            : 0,
        },
        narrative: data.narrative ?? "",
      };
      setResult(mappedResult);
      setPageState("results");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      const isServiceDown =
        message.includes("fetch") ||
        message.toLowerCase().includes("unreachable") ||
        message.toLowerCase().includes("unavailable");
      setError(
        isServiceDown
          ? "Our astrology calculation service is currently being updated. Please try again shortly."
          : message
      );
      setPageState("error");
    }
  }, [personA, personB]);

  const handleReset = () => {
    setPersonA(null);
    setPersonB(null);
    setResult(null);
    setPageState("input");
    setError("");
  };

  return (
    <main className="relative min-h-screen">
      <StarField starCount={60} className="z-0 opacity-50" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:py-16">
        {/* Page Header */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Birth Chart{" "}
            <span className="cosmic-text">Compatibility Calculator</span>
          </h1>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            Go beyond sun signs. Analyze your full synastry chart with AI.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* =================== INPUT STATE =================== */}
          {pageState === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  {savedProfiles.length > 0 && (
                    <div className="mb-3">
                      <select
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground"
                        defaultValue=""
                        onChange={(e) => {
                          const profile = savedProfiles.find(
                            (p: any) => p.id === e.target.value
                          );
                          if (profile) {
                            setPersonA({
                              name: profile.name,
                              birthDate: profile.birthDate,
                              birthTime: profile.birthTime ?? undefined,
                              birthCity: profile.birthCity,
                              birthCountry: profile.birthCountry,
                              latitude: profile.latitude ?? undefined,
                              longitude: profile.longitude ?? undefined,
                              timezone: profile.timezone ?? undefined,
                            });
                            setFormKeyA((k) => k + 1);
                          }
                        }}
                      >
                        <option value="" disabled>
                          Use a saved profile...
                        </option>
                        {savedProfiles.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <BirthDataForm
                    key={`formA-${formKeyA}`}
                    label="Your Details"
                    onSubmit={setPersonA}
                    defaultValues={personA ?? undefined}
                  />
                </div>
                <div>
                  {savedProfiles.length > 0 && (
                    <div className="mb-3">
                      <select
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground"
                        defaultValue=""
                        onChange={(e) => {
                          const profile = savedProfiles.find(
                            (p: any) => p.id === e.target.value
                          );
                          if (profile) {
                            setPersonB({
                              name: profile.name,
                              birthDate: profile.birthDate,
                              birthTime: profile.birthTime ?? undefined,
                              birthCity: profile.birthCity,
                              birthCountry: profile.birthCountry,
                              latitude: profile.latitude ?? undefined,
                              longitude: profile.longitude ?? undefined,
                              timezone: profile.timezone ?? undefined,
                            });
                            setFormKeyB((k) => k + 1);
                          }
                        }}
                      >
                        <option value="" disabled>
                          Use a saved profile...
                        </option>
                        {savedProfiles.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <BirthDataForm
                    key={`formB-${formKeyB}`}
                    label="Their Details"
                    onSubmit={setPersonB}
                    defaultValues={personB ?? undefined}
                  />
                </div>
              </div>

              {/* Instruction text */}
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Fill in both forms above, then press &ldquo;Check
                Compatibility&rdquo; below.
              </p>

              {/* Submit Button */}
              <div className="mt-8 flex flex-col items-center">
                <Button
                  size="lg"
                  disabled={!bothValid}
                  onClick={handleSubmit}
                  className={cn(
                    "h-14 rounded-full px-10 text-base font-semibold shadow-lg transition-all",
                    bothValid
                      ? "bg-gradient-to-r from-cosmic-purple to-gold text-white hover:shadow-cosmic-purple/40 hover:shadow-xl hover:brightness-110"
                      : "cursor-not-allowed opacity-50"
                  )}
                >
                  Check Compatibility
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {!personAReady || !personBReady ? (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {!personAReady && !personBReady
                      ? "Fill in both forms above to check compatibility."
                      : !personAReady
                      ? "Complete your birth details to continue."
                      : "Complete the second person's birth details to continue."}
                  </p>
                ) : null}
                {!session && (
                  <p className="mt-2 text-center text-xs text-muted-foreground/70">
                    Free: 3 compatibility checks per day
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* =================== LOADING STATE =================== */}
          {pageState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingFacts />
            </motion.div>
          )}

          {/* =================== RESULTS STATE =================== */}
          {pageState === "results" && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CompatibilityResults
                result={result}
                personAData={personA}
                personBData={personB}
              />

              {remainingChecks !== null && !session && (
                <motion.p
                  className="mt-6 text-center text-sm text-muted-foreground/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {remainingChecks > 0
                    ? `${remainingChecks} free check${remainingChecks === 1 ? "" : "s"} remaining today`
                    : "No free checks remaining today"}
                </motion.p>
              )}

              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="rounded-full"
                >
                  Try Another Comparison
                </Button>
              </div>
            </motion.div>
          )}

          {/* =================== ERROR STATE =================== */}
          {pageState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-lg"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/10"
                >
                  <AlertTriangle className="h-8 w-8 text-cosmic-purple-light" />
                </motion.div>
                <h3 className="font-heading text-xl font-semibold mb-2">
                  {error.toLowerCase().includes("updated") ||
                  error.toLowerCase().includes("unavailable")
                    ? "Service Temporarily Unavailable"
                    : "Something Went Wrong"}
                </h3>
                <p className="mx-auto max-w-md text-sm text-muted-foreground mb-6">
                  {error}
                </p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button
                    onClick={handleSubmit}
                    className="bg-cosmic-purple text-white hover:bg-cosmic-purple-dark"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10"
                    onClick={handleReset}
                  >
                    Start Over
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =================== RATE LIMIT MODAL =================== */}
      <AnimatePresence>
        {showRateLimitModal && (
          <motion.div
            key="rate-limit-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRateLimitModal(false)}
          >
            <motion.div
              className="glass-card relative w-full max-w-md rounded-2xl border border-cosmic-purple/40 p-8 text-center"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowRateLimitModal(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/15">
                <Crown className="h-8 w-8 text-cosmic-purple-light" />
              </div>

              <h3 className="font-heading text-xl font-semibold mb-2">
                You&apos;ve used all 3 free checks today
              </h3>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground mb-6">
                Upgrade to Premium for unlimited compatibility checks, full
                reports, and AI chat.
              </p>

              <div className="flex flex-col items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full bg-gradient-to-r from-cosmic-purple to-gold text-white font-semibold hover:shadow-cosmic-purple/40 hover:shadow-xl hover:brightness-110"
                >
                  <Link href="/pricing">
                    Upgrade to Premium
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => setShowRateLimitModal(false)}
                >
                  Come back tomorrow
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
