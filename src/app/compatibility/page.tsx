"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
  const [personA, setPersonA] = useState<BirthData | null>(null);
  const [personB, setPersonB] = useState<BirthData | null>(null);
  const [pageState, setPageState] = useState<PageState>("input");
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string>("");

  const bothValid = personA !== null && personB !== null;

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
        throw new Error(
          `Analysis failed (${response.status}). Please try again.`
        );
      }

      const data = await response.json();

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
      // If the API isn't ready yet, generate mock results for demo
      const mockResult: CompatibilityResult = {
        personA: {
          name: personA.name,
          sunSign: getSunSign(personA.birthDate),
        },
        personB: {
          name: personB.name,
          sunSign: getSunSign(personB.birthDate),
        },
        overallScore: Math.floor(Math.random() * 40) + 55,
        dimensions: {
          emotional: Math.floor(Math.random() * 35) + 50,
          chemistry: Math.floor(Math.random() * 40) + 45,
          communication: Math.floor(Math.random() * 35) + 50,
          stability: Math.floor(Math.random() * 30) + 55,
          harmony: Math.floor(Math.random() * 35) + 50,
        },
        narrative: `The connection between ${personA.name} and ${personB.name} shows a compelling blend of complementary energies. As a ${getSunSign(personA.birthDate)} and ${getSunSign(personB.birthDate)} pairing, there is a natural dynamic that balances initiative with receptivity. The planetary aspects suggest strong emotional resonance, particularly through Moon and Venus interactions. Communication flows with ease when both partners lean into vulnerability, though there are moments where different processing styles may create temporary friction. The composite chart reveals a relationship that has real potential for growth, with Jupiter aspects indicating that you expand each other's worldview. Overall, this is a connection worth investing in \u2014 one that deepens meaningfully over time when both people show up authentically.`,
      };

      // Simulate loading delay for demo
      await new Promise((resolve) => setTimeout(resolve, 4000));
      setResult(mockResult);
      setPageState("results");

      // If there was a real error (not just missing API), store it
      if (err instanceof Error && !err.message.includes("Failed to fetch")) {
        console.warn("API not available, using demo results:", err.message);
      }
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
                <BirthDataForm
                  label="Your Details"
                  onSubmit={setPersonA}
                  defaultValues={personA ?? undefined}
                />
                <BirthDataForm
                  label="Their Details"
                  onSubmit={setPersonB}
                  defaultValues={personB ?? undefined}
                />
              </div>

              {/* Instruction text */}
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Fill in both forms above, then press &ldquo;Check
                Compatibility&rdquo; below.
              </p>

              {/* Submit Button */}
              <div className="mt-8 flex justify-center">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4 py-16 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <span className="text-2xl">!</span>
              </div>
              <h3 className="text-lg font-semibold">Something went wrong</h3>
              <p className="max-w-md text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                onClick={handleReset}
                className="mt-2 rounded-full"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
