"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, AlertTriangle, RefreshCw, LayoutDashboard, Crown, X, Infinity, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarField } from "@/components/star-field";
import { BirthDataForm, type BirthData } from "@/components/birth-data-form";
import { LoadingFacts } from "./loading-facts";
import {
  CompatibilityResults,
  type CompatibilityResult,
} from "./results";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

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

interface InviteData {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthCity: string;
  birthCountry: string;
  sign: string;
}

export default function CompatibilityPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const rateLimitModalRef = useRef<HTMLDivElement>(null);
  const [personA, setPersonA] = useState<BirthData | null>(null);
  const [personB, setPersonB] = useState<BirthData | null>(null);
  const [pageState, setPageState] = useState<PageState>("input");
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string>("");
  const [remainingChecks, setRemainingChecks] = useState<number | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  interface SavedProfile {
    id: string;
    name: string;
    birthDate: string;
    birthTime: string | null;
    birthCity: string;
    birthCountry: string;
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
  }
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [formKeyA, setFormKeyA] = useState(0);
  const [formKeyB, setFormKeyB] = useState(0);
  const [initialChecksLoaded, setInitialChecksLoaded] = useState(false);

  // Detect invite query param on mount and pre-fill Person A
  useEffect(() => {
    const inviteParam = searchParams.get("invite");
    if (!inviteParam) return;
    try {
      const decoded = JSON.parse(atob(inviteParam)) as InviteData;
      if (decoded.name && decoded.birthDate && decoded.birthCity && decoded.birthCountry) {
        setInviteData(decoded);
        setPersonA({
          name: decoded.name,
          birthDate: decoded.birthDate,
          birthTime: decoded.birthTime,
          birthCity: decoded.birthCity,
          birthCountry: decoded.birthCountry,
        });
        setFormKeyA((k) => k + 1);
      }
    } catch {
      // Invalid invite data — ignore
    }
  }, [searchParams]);

  // Fetch remaining checks count on mount for free / unauthenticated users
  useEffect(() => {
    const isPremium =
      session?.user?.plan === "PREMIUM" || session?.user?.plan === "ANNUAL";
    if (isPremium) {
      setInitialChecksLoaded(true);
      return;
    }

    // Hit the compatibility endpoint with a HEAD-style light request
    // We use a dedicated query-param the API can recognise, but since
    // no such endpoint exists yet we fall back to a simple GET that
    // returns remaining checks metadata.  The existing POST already
    // returns `remainingChecks` in its response so we keep it in sync
    // after each check.  For the initial load we try a lightweight
    // status fetch; if it 404s we just leave the counter hidden until
    // the first real check completes.
    fetch("/api/compatibility?checksOnly=1")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.remainingChecks !== undefined) {
          setRemainingChecks(data.remainingChecks);
        }
      })
      .catch(() => {})
      .finally(() => setInitialChecksLoaded(true));
  }, [session]);

  // Reduced-motion-aware transition presets
  const fade = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3 };
  const fadeSlide = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.4 };
  const springPop = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 200 };
  const springModal = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 25 };

  // Trap focus inside the rate-limit modal when open
  useEffect(() => {
    if (!showRateLimitModal) return;

    const modal = rateLimitModalRef.current;
    if (!modal) return;

    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusableEls = modal.querySelectorAll<HTMLElement>(focusableSelector);
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    // Auto-focus the first interactive element
    firstEl?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowRateLimitModal(false);
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showRateLimitModal]);

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
        const errBody = await response.json().catch(() => null);
        throw new Error(
          errBody?.message || `Analysis failed (${response.status}). Please try again.`
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
      trackEvent("compatibility_check");
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
    setInviteData(null);
  };

  return (
    <main className="relative min-h-screen">
      <StarField starCount={60} className="z-0 opacity-50" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:py-16">
        {/* Page Header */}
        <motion.div
          className="mb-10 text-center"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
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
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
            >
              {/* Invite banner */}
              {inviteData && (
                <motion.div
                  className="mb-6 rounded-2xl border border-gold/30 bg-gold/10 p-5 text-center"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Sparkles className="h-5 w-5 text-gold" />
                    <p className="text-sm font-semibold text-gold">
                      {inviteData.name} wants to check your compatibility!
                    </p>
                    <Sparkles className="h-5 w-5 text-gold" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your details below to see your cosmic connection.
                  </p>
                </motion.div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  {inviteData ? (
                    /* Read-only summary card for invited Person A */
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cosmic-purple-light">
                        Their Details
                      </p>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cosmic-purple/15 text-2xl">
                          {(() => {
                            const INVITE_ZODIAC: Record<string, string> = {
                              Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
                              Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
                              Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
                            };
                            return INVITE_ZODIAC[inviteData.sign] ?? "";
                          })()}
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{inviteData.name}</p>
                          <p className="text-sm text-muted-foreground">{inviteData.sign}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>Born: {new Date(inviteData.birthDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                        <p>Location: {inviteData.birthCity}, {inviteData.birthCountry}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {savedProfiles.length > 0 && (
                        <div className="mb-3">
                          <label
                            className="mb-1 block text-sm font-medium text-muted-foreground"
                          >
                            Your saved profile
                          </label>
                          <Select
                            onValueChange={(value) => {
                              const profile = savedProfiles.find(
                                (p: SavedProfile) => p.id === value
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
                            <SelectTrigger aria-label="Your saved profile" className="w-full h-11 rounded-lg border-white/10 bg-background/50">
                              <SelectValue placeholder="Use a saved profile..." />
                            </SelectTrigger>
                            <SelectContent>
                              {savedProfiles.map((p: SavedProfile) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <BirthDataForm
                        key={`formA-${formKeyA}`}
                        label="Your Details"
                        onSubmit={setPersonA}
                        defaultValues={personA ?? undefined}
                      />
                    </>
                  )}
                </div>
                <div>
                  {savedProfiles.length > 0 && (
                    <div className="mb-3">
                      <label
                        className="mb-1 block text-sm font-medium text-muted-foreground"
                      >
                        Their saved profile
                      </label>
                      <Select
                        onValueChange={(value) => {
                          const profile = savedProfiles.find(
                            (p: SavedProfile) => p.id === value
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
                        <SelectTrigger aria-label="Their saved profile" className="w-full h-11 rounded-lg border-white/10 bg-background/50">
                          <SelectValue placeholder="Use a saved profile..." />
                        </SelectTrigger>
                        <SelectContent>
                          {savedProfiles.map((p: SavedProfile) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <BirthDataForm
                    key={`formB-${formKeyB}`}
                    label={inviteData ? "Your Details" : "Their Details"}
                    onSubmit={setPersonB}
                    defaultValues={personB ?? undefined}
                  />
                </div>
              </div>

              {/* Instruction text */}
              <p className="mt-4 text-center text-xs text-muted-foreground">
                {inviteData
                  ? "Fill in your details above, then press \u201CCheck Compatibility\u201D below."
                  : "Fill in both forms above, then press \u201CCheck Compatibility\u201D below."}
              </p>

              {/* Submit Button */}
              <div className="mt-8 flex flex-col items-center">
                <Button
                  size="lg"
                  disabled={!bothValid}
                  onClick={handleSubmit}
                  aria-describedby={!bothValid ? "compat-disabled-hint" : undefined}
                  className={cn(
                    "h-14 rounded-full px-10 text-base font-semibold shadow-lg transition-all",
                    bothValid
                      ? "bg-gradient-to-r from-cosmic-purple to-gold text-white hover:shadow-cosmic-purple/40 hover:shadow-xl hover:brightness-110"
                      : "cursor-not-allowed opacity-50"
                  )}
                >
                  Check Compatibility
                  <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
                </Button>
                {!personAReady || !personBReady ? (
                  <p id="compat-disabled-hint" className="mt-2 text-center text-xs text-muted-foreground">
                    {!personAReady && !personBReady
                      ? "Fill in both forms above to check compatibility."
                      : !personAReady
                      ? "Complete your birth details to continue."
                      : inviteData
                      ? "Enter your birth details above to continue."
                      : "Complete the second person's birth details to continue."}
                  </p>
                ) : null}

                {/* Checks remaining counter */}
                {(() => {
                  const isPremium =
                    session?.user?.plan === "PREMIUM" ||
                    session?.user?.plan === "ANNUAL";

                  if (isPremium) {
                    return (
                      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-400">
                        <Infinity aria-hidden="true" className="h-3.5 w-3.5" />
                        Unlimited checks
                      </p>
                    );
                  }

                  if (remainingChecks !== null && initialChecksLoaded) {
                    const isWarning = remainingChecks === 1;
                    const isDepleted = remainingChecks <= 0;
                    return (
                      <p
                        className={cn(
                          "mt-3 text-center text-xs font-medium",
                          isDepleted
                            ? "text-red-400"
                            : isWarning
                            ? "text-amber-400"
                            : "text-emerald-400/80"
                        )}
                      >
                        {isDepleted ? (
                          <>
                            No free checks remaining today.{" "}
                            <Link
                              href="/pricing"
                              className="underline underline-offset-2 text-cosmic-purple-light hover:text-cosmic-purple"
                            >
                              Upgrade for unlimited
                            </Link>
                          </>
                        ) : (
                          remainingChecks === 1
                            ? "Last free check today!"
                            : `${remainingChecks} free checks remaining today`
                        )}
                      </p>
                    );
                  }

                  // Fallback for unauthenticated users before checks load
                  if (!session) {
                    return (
                      <p className="mt-2 text-center text-xs text-muted-foreground/70">
                        Free: 3 compatibility checks per day
                      </p>
                    );
                  }

                  return null;
                })()}
              </div>
            </motion.div>
          )}

          {/* =================== LOADING STATE =================== */}
          {pageState === "loading" && (
            <motion.div
              key="loading"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              aria-busy="true"
            >
              <LoadingFacts />
            </motion.div>
          )}

          {/* =================== RESULTS STATE =================== */}
          {pageState === "results" && result && (
            <motion.div
              key="results"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              aria-live="polite"
            >
              <CompatibilityResults
                result={result}
                personAData={personA}
                personBData={personB}
              />

              {remainingChecks !== null && (
                <motion.p
                  className="mt-6 text-center text-sm text-muted-foreground/70"
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.5 }}
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
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={fadeSlide}
              className="mx-auto max-w-lg"
              role="alert"
              aria-live="polite"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-sm">
                <motion.div
                  initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.1, ...springPop }}
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/10"
                >
                  <AlertTriangle aria-hidden="true" className="h-8 w-8 text-cosmic-purple-light" />
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
                    <RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />
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
                      <LayoutDashboard aria-hidden="true" className="mr-2 h-4 w-4" />
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
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            onClick={() => setShowRateLimitModal(false)}
          >
            <motion.div
              ref={rateLimitModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="rate-limit-title"
              className="glass-card relative w-full max-w-md rounded-2xl border border-cosmic-purple/40 p-8 text-center"
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
              transition={springModal}
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
                <Crown aria-hidden="true" className="h-8 w-8 text-cosmic-purple-light" />
              </div>

              <h3
                id="rate-limit-title"
                className="font-heading text-xl font-semibold mb-2"
              >
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
                    <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
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

        {/* Zodiac Compatibility Hub — SEO internal linking to all 78 pages */}
        {pageState === "input" && (
          <ZodiacHub />
        )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Zodiac Hub — filterable sign-based layout for 78 compatibility pages      */
/* -------------------------------------------------------------------------- */

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

const ZODIAC_EMOJIS: Record<string, string> = {
  aries: "\u2648", taurus: "\u2649", gemini: "\u264A", cancer: "\u264B",
  leo: "\u264C", virgo: "\u264D", libra: "\u264E", scorpio: "\u264F",
  sagittarius: "\u2650", capricorn: "\u2651", aquarius: "\u2652", pisces: "\u2653",
};

const ZODIAC_ELEMENTS: Record<string, string> = {
  aries: "Fire", taurus: "Earth", gemini: "Air", cancer: "Water",
  leo: "Fire", virgo: "Earth", libra: "Air", scorpio: "Water",
  sagittarius: "Fire", capricorn: "Earth", aquarius: "Air", pisces: "Water",
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "from-red-500/20 to-orange-500/20 border-red-500/20",
  Earth: "from-emerald-500/20 to-lime-500/20 border-emerald-500/20",
  Air: "from-sky-500/20 to-indigo-500/20 border-sky-500/20",
  Water: "from-blue-500/20 to-cyan-500/20 border-blue-500/20",
};

const ELEMENT_TEXT: Record<string, string> = {
  Fire: "text-red-400",
  Earth: "text-emerald-400",
  Air: "text-sky-400",
  Water: "text-blue-400",
};

const ELEMENT_HOVER: Record<string, string> = {
  Fire: "zodiac-fire",
  Earth: "zodiac-earth",
  Air: "zodiac-air",
  Water: "zodiac-water",
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ZodiacHub() {
  const [selectedSign, setSelectedSign] = useState<string | null>(null);

  // Build all pairs grouped by sign
  const pairsBySign = useMemo(() => {
    const grouped: Record<string, { slug: string; partner: string }[]> = {};
    for (const sign of ZODIAC_SIGNS) {
      grouped[sign] = [];
    }
    for (let i = 0; i < ZODIAC_SIGNS.length; i++) {
      for (let j = i; j < ZODIAC_SIGNS.length; j++) {
        const a = ZODIAC_SIGNS[i];
        const b = ZODIAC_SIGNS[j];
        grouped[a].push({ slug: `${a}-${b}`, partner: b });
        if (a !== b) {
          grouped[b].push({ slug: `${a}-${b}`, partner: a });
        }
      }
    }
    return grouped;
  }, []);

  const visibleSigns = selectedSign ? [selectedSign] : [...ZODIAC_SIGNS];

  return (
    <section className="mt-20 border-t border-border pt-12 pb-4">
      <h2 className="text-2xl font-heading font-bold text-center mb-2">
        Explore Zodiac <span className="cosmic-text">Compatibility</span>
      </h2>
      <p className="text-center text-muted-foreground text-sm mb-8 max-w-md mx-auto">
        Pick a sign to explore its pairings, or browse them all
      </p>

      {/* Sign filter bar */}
      <div className="flex overflow-x-auto gap-2 mb-10 max-w-2xl mx-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible">
        {ZODIAC_SIGNS.map((sign) => {
          const isActive = selectedSign === sign;
          const element = ZODIAC_ELEMENTS[sign];
          return (
            <button
              key={sign}
              onClick={() => setSelectedSign(isActive ? null : sign)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border",
                ELEMENT_HOVER[element],
                isActive
                  ? `bg-gradient-to-r ${ELEMENT_COLORS[element]} ${ELEMENT_TEXT[element]} border-current shadow-lg`
                  : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 hover:bg-white/5"
              )}
            >
              <span className="text-sm">{ZODIAC_EMOJIS[sign]}</span>
              {cap(sign)}
            </button>
          );
        })}
      </div>

      {/* Sign groups */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {visibleSigns.map((sign) => {
          const element = ZODIAC_ELEMENTS[sign];
          const pairs = pairsBySign[sign];
          return (
            <div key={sign}>
              {/* Sign header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-lg cursor-default",
                    ELEMENT_COLORS[element],
                    ELEMENT_HOVER[element]
                  )}
                >
                  {ZODIAC_EMOJIS[sign]}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm">
                    {cap(sign)} Compatibility
                  </h3>
                  <p className={cn("text-[11px] font-medium", ELEMENT_TEXT[element])}>
                    {element} Sign
                  </p>
                </div>
              </div>

              {/* Pairing cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {pairs.map(({ slug, partner }) => {
                  const partnerElement = ZODIAC_ELEMENTS[partner];
                  return (
                    <Link
                      key={slug}
                      href={`/compatibility/${slug}`}
                      className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-all hover:border-cosmic-purple/30 hover:bg-cosmic-purple/[0.04] hover:shadow-sm"
                    >
                      <span className="text-base">{ZODIAC_EMOJIS[partner]}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground/90 group-hover:text-foreground truncate">
                          {cap(sign)} & {cap(partner)}
                        </p>
                        <p className={cn("text-[10px]", ELEMENT_TEXT[partnerElement])}>
                          {partnerElement}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
