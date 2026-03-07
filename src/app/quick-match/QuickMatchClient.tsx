"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, ArrowRight, Share2, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

/* ─── Sun Sign Logic ────────────────────────────────────────────────────── */

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const SIGN_EMOJIS: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
};

// Compatibility matrix (symmetric, 0-100)
// Same element = high, complementary = good, opposing = challenging but dynamic
const COMPAT: Record<string, Record<string, number>> = {};
function setCompat(a: string, b: string, score: number) {
  if (!COMPAT[a]) COMPAT[a] = {};
  if (!COMPAT[b]) COMPAT[b] = {};
  COMPAT[a][b] = score;
  COMPAT[b][a] = score;
}

// Same sign
SIGNS.forEach((s) => setCompat(s, s, 78));
// Fire + Fire
setCompat("Aries", "Leo", 93); setCompat("Aries", "Sagittarius", 90); setCompat("Leo", "Sagittarius", 88);
// Earth + Earth
setCompat("Taurus", "Virgo", 90); setCompat("Taurus", "Capricorn", 92); setCompat("Virgo", "Capricorn", 88);
// Air + Air
setCompat("Gemini", "Libra", 89); setCompat("Gemini", "Aquarius", 85); setCompat("Libra", "Aquarius", 91);
// Water + Water
setCompat("Cancer", "Scorpio", 94); setCompat("Cancer", "Pisces", 92); setCompat("Scorpio", "Pisces", 90);
// Fire + Air (complementary)
setCompat("Aries", "Gemini", 83); setCompat("Aries", "Libra", 72); setCompat("Aries", "Aquarius", 79);
setCompat("Leo", "Gemini", 80); setCompat("Leo", "Libra", 85); setCompat("Leo", "Aquarius", 68);
setCompat("Sagittarius", "Gemini", 70); setCompat("Sagittarius", "Libra", 82); setCompat("Sagittarius", "Aquarius", 87);
// Earth + Water (complementary)
setCompat("Taurus", "Cancer", 89); setCompat("Taurus", "Scorpio", 73); setCompat("Taurus", "Pisces", 84);
setCompat("Virgo", "Cancer", 82); setCompat("Virgo", "Scorpio", 86); setCompat("Virgo", "Pisces", 65);
setCompat("Capricorn", "Cancer", 68); setCompat("Capricorn", "Scorpio", 88); setCompat("Capricorn", "Pisces", 81);
// Fire + Water (challenging)
setCompat("Aries", "Cancer", 47); setCompat("Aries", "Scorpio", 55); setCompat("Aries", "Pisces", 62);
setCompat("Leo", "Cancer", 58); setCompat("Leo", "Scorpio", 60); setCompat("Leo", "Pisces", 52);
setCompat("Sagittarius", "Cancer", 42); setCompat("Sagittarius", "Scorpio", 58); setCompat("Sagittarius", "Pisces", 70);
// Fire + Earth (friction)
setCompat("Aries", "Taurus", 52); setCompat("Aries", "Virgo", 48); setCompat("Aries", "Capricorn", 55);
setCompat("Leo", "Taurus", 65); setCompat("Leo", "Virgo", 55); setCompat("Leo", "Capricorn", 50);
setCompat("Sagittarius", "Taurus", 45); setCompat("Sagittarius", "Virgo", 50); setCompat("Sagittarius", "Capricorn", 60);
// Air + Water (mixed)
setCompat("Gemini", "Cancer", 55); setCompat("Gemini", "Scorpio", 48); setCompat("Gemini", "Pisces", 58);
setCompat("Libra", "Cancer", 50); setCompat("Libra", "Scorpio", 72); setCompat("Libra", "Pisces", 60);
setCompat("Aquarius", "Cancer", 42); setCompat("Aquarius", "Scorpio", 65); setCompat("Aquarius", "Pisces", 55);
// Air + Earth
setCompat("Gemini", "Taurus", 60); setCompat("Gemini", "Virgo", 62); setCompat("Gemini", "Capricorn", 50);
setCompat("Libra", "Taurus", 68); setCompat("Libra", "Virgo", 55); setCompat("Libra", "Capricorn", 58);
setCompat("Aquarius", "Taurus", 48); setCompat("Aquarius", "Virgo", 52); setCompat("Aquarius", "Capricorn", 60);

function getSunSign(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return "Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

function getCompatibility(sign1: string, sign2: string): number {
  return COMPAT[sign1]?.[sign2] ?? 65;
}

function getVerdict(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "Cosmic Soulmates", color: "text-gold" };
  if (score >= 80) return { text: "Written in the Stars", color: "text-cosmic-purple-light" };
  if (score >= 70) return { text: "Strong Connection", color: "text-green-400" };
  if (score >= 55) return { text: "Interesting Dynamic", color: "text-blue-400" };
  if (score >= 40) return { text: "Challenging but Passionate", color: "text-orange-400" };
  return { text: "Opposites Attract?", color: "text-red-400" };
}

function getBlurb(sign1: string, sign2: string, score: number): string {
  const el1 = SIGN_ELEMENTS[sign1];
  const el2 = SIGN_ELEMENTS[sign2];
  if (sign1 === sign2) return `Two ${sign1}s together? Double the energy, double the intensity. You understand each other instinctively — but watch out for power struggles.`;
  if (el1 === el2) return `${el1} meets ${el2} — you speak the same elemental language. This is a naturally harmonious pairing with deep understanding.`;
  if ((el1 === "Fire" && el2 === "Air") || (el1 === "Air" && el2 === "Fire")) return `${el1} feeds ${el2} — together you ignite ideas and fuel each other's passions. An energizing, dynamic match.`;
  if ((el1 === "Earth" && el2 === "Water") || (el1 === "Water" && el2 === "Earth")) return `${el1} and ${el2} nurture each other. This is a deeply supportive connection built on emotional security and practical care.`;
  if (score >= 65) return `${sign1} and ${sign2} bring out unexpected sides of each other. There's real growth potential here — and plenty of sparks.`;
  return `${sign1} and ${sign2} are a complex match. Different wavelengths can create friction — but also magnetic attraction. The key is patience.`;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

const SITE_URL = "https://chartchemistry.com";

export default function QuickMatchClient() {
  const [nameA, setNameA] = useState("");
  const [dateA, setDateA] = useState("");
  const [nameB, setNameB] = useState("");
  const [dateB, setDateB] = useState("");
  const [result, setResult] = useState<{
    signA: string; signB: string; score: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  const canCheck = dateA && dateB;

  function check() {
    const signA = getSunSign(dateA);
    const signB = getSunSign(dateB);
    const score = getCompatibility(signA, signB);
    setAnimating(true);
    setTimeout(() => {
      setResult({ signA, signB, score });
      trackEvent("quick_match");
      setAnimating(false);
    }, 1500);
  }

  function reset() {
    setResult(null);
    setNameA(""); setDateA("");
    setNameB(""); setDateB("");
  }

  function shareResult() {
    if (!result) return;
    const labelA = nameA || result.signA;
    const labelB = nameB || result.signB;
    const verdict = getVerdict(result.score);
    const text = `${SIGN_EMOJIS[result.signA]} ${labelA} + ${SIGN_EMOJIS[result.signB]} ${labelB} = ${result.score}% compatible (${verdict.text})! Check your compatibility:`;
    const url = `${SITE_URL}/quick-match?a=${encodeURIComponent(dateA)}&b=${encodeURIComponent(dateB)}`;

    if (navigator.share) {
      navigator.share({ title: "Zodiac Compatibility", text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    setHasShared(true);
  }

  const verdict = result ? getVerdict(result.score) : null;

  return (
    <div className="relative min-h-screen bg-navy overflow-hidden">
      {/* Starfield bg */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-[15%] w-1 h-1 bg-white rounded-full animate-[star-twinkle_3s_ease-in-out_infinite]" />
        <div className="absolute top-40 right-[25%] w-1.5 h-1.5 bg-cosmic-purple-light rounded-full animate-[star-twinkle_4s_ease-in-out_infinite_1s]" />
        <div className="absolute top-60 left-[60%] w-1 h-1 bg-gold-light rounded-full animate-[star-twinkle_3.5s_ease-in-out_infinite_0.5s]" />
        <div className="absolute bottom-40 left-[30%] w-1 h-1 bg-white rounded-full animate-[star-twinkle_4.5s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-20 right-[40%] w-1.5 h-1.5 bg-cosmic-purple-light rounded-full animate-[star-twinkle_3s_ease-in-out_infinite_1.5s]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cosmic-purple-light" />
            <span className="font-heading font-bold text-white">ChartChemistry</span>
          </Link>
          <Link href="/compatibility" className="text-sm text-white/50 hover:text-white/80 transition-colors">
            Full Compatibility Analysis &rarr;
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <AnimatePresence mode="wait">
          {/* ── Animating state ── */}
          {animating && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-cosmic-purple/30 animate-[orbit_3s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border-2 border-gold/30 animate-[orbit_2s_linear_infinite_reverse]" />
                <Heart className="absolute inset-0 m-auto w-8 h-8 text-cosmic-purple-light animate-[pulse-glow_1.5s_ease-in-out_infinite]" />
              </div>
              <p className="text-white/60 font-heading text-lg">Reading the stars...</p>
            </motion.div>
          )}

          {/* ── Results ── */}
          {result && !animating && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Score card */}
              <div className="glass-card rounded-2xl p-8 text-center">
                {/* Signs */}
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-5xl mb-2">{SIGN_EMOJIS[result.signA]}</div>
                    <p className="text-white font-medium">{nameA || "Person 1"}</p>
                    <p className="text-sm text-white/50">{result.signA}</p>
                  </div>
                  <Heart className="w-6 h-6 text-cosmic-purple-light animate-[pulse-glow_2s_ease-in-out_infinite]" />
                  <div className="text-center">
                    <div className="text-5xl mb-2">{SIGN_EMOJIS[result.signB]}</div>
                    <p className="text-white font-medium">{nameB || "Person 2"}</p>
                    <p className="text-sm text-white/50">{result.signB}</p>
                  </div>
                </div>

                {/* Score */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-white/10" strokeWidth="8" />
                    <motion.circle
                      cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGradient)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 52}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - result.score / 100) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                      className="text-3xl font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {result.score}%
                    </motion.span>
                  </div>
                </div>

                <p className={cn("text-xl font-heading font-bold mb-2", verdict?.color)}>
                  {verdict?.text}
                </p>
                <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">
                  {getBlurb(result.signA, result.signB, result.score)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={shareResult}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  {copied ? <Copy className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Share Result"}
                </Button>
                <Button
                  onClick={reset}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Another Pair
                </Button>
              </div>

              {!hasShared && (
                <p className="text-xs text-white/40 text-center">
                  Share your results to unlock the detailed breakdown!
                </p>
              )}

              {/* CTA to full report */}
              <div className="glass-card rounded-2xl p-6 text-center border border-cosmic-purple/30">
                <Sparkles className="w-5 h-5 text-gold mx-auto mb-3" />
                <h3 className="font-heading text-lg font-bold text-white mb-2">
                  Want the full picture?
                </h3>
                <p className="text-white/50 text-sm mb-4 max-w-sm mx-auto">
                  Get a detailed 7-section compatibility report powered by real natal chart calculations — not just sun signs.
                </p>
                <Button asChild className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
                  <Link href="/compatibility">
                    Full Compatibility Analysis <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Input form ── */}
          {!result && !animating && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-cosmic-purple/20 border border-cosmic-purple/30 text-cosmic-purple-light px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Free · Instant · No Sign-up
                </div>
                <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
                  How compatible<br />are you?
                </h1>
                <p className="text-white/50 text-lg max-w-md mx-auto">
                  Enter two birthdays and see what the stars say about your connection.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                {/* Person A */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-cosmic-purple-light uppercase tracking-wider">Person 1</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="nameA" className="text-white/60 text-xs">Name (optional)</Label>
                      <Input
                        id="nameA"
                        value={nameA}
                        onChange={(e) => setNameA(e.target.value)}
                        placeholder="e.g. Alex"
                        className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateA" className="text-white/60 text-xs">Birthday</Label>
                      <Input
                        id="dateA"
                        type="date"
                        value={dateA}
                        onChange={(e) => setDateA(e.target.value)}
                        className="mt-1 bg-white/5 border-white/10 text-white [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  {dateA && (
                    <p className="text-xs text-white/40">
                      {SIGN_EMOJIS[getSunSign(dateA)]} {getSunSign(dateA)} · {SIGN_ELEMENTS[getSunSign(dateA)]} sign
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <Heart className="w-4 h-4 text-cosmic-purple/50" />
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Person B */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gold uppercase tracking-wider">Person 2</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="nameB" className="text-white/60 text-xs">Name (optional)</Label>
                      <Input
                        id="nameB"
                        value={nameB}
                        onChange={(e) => setNameB(e.target.value)}
                        placeholder="e.g. Jordan"
                        className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateB" className="text-white/60 text-xs">Birthday</Label>
                      <Input
                        id="dateB"
                        type="date"
                        value={dateB}
                        onChange={(e) => setDateB(e.target.value)}
                        className="mt-1 bg-white/5 border-white/10 text-white [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  {dateB && (
                    <p className="text-xs text-white/40">
                      {SIGN_EMOJIS[getSunSign(dateB)]} {getSunSign(dateB)} · {SIGN_ELEMENTS[getSunSign(dateB)]} sign
                    </p>
                  )}
                </div>

                {/* Check button */}
                <Button
                  onClick={check}
                  disabled={!canCheck}
                  className="w-full py-6 text-lg cosmic-gradient text-white font-semibold disabled:opacity-40"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Check Compatibility
                </Button>
              </div>

              <p className="text-center text-white/30 text-xs mt-6">
                This is a sun-sign compatibility check for fun.{" "}
                <Link href="/compatibility" className="text-cosmic-purple-light hover:underline">
                  Get a real natal chart analysis
                </Link>{" "}
                for deeper insights.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
