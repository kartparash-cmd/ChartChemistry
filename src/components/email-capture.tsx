"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const BENEFITS = [
  { icon: Sparkles, text: "Personalized daily horoscopes" },
  { icon: Star, text: "Weekly transit alerts for your chart" },
  { icon: Zap, text: "Relationship insights & cosmic timing" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function EmailCapture() {
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [sign, setSign] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sign, source: "inline_capture" }),
      });
      setSubmitted(true);
      trackEvent("email_subscribe", { source: "inline_capture", sign });
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative px-4 py-24">
      <motion.div
        className="mx-auto max-w-3xl"
        initial={shouldReduceMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card rounded-2xl border border-cosmic-purple/20 p-8 sm:p-12 text-center">
          {!submitted ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/20">
                  <Sparkles className="h-7 w-7 text-cosmic-purple-light" />
                </div>
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Join <span className="cosmic-text">1,000+</span> cosmic explorers
              </h2>
              <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
                Get weekly cosmic insights, transit alerts, and relationship tips
                delivered to your inbox. No account required.
              </p>

              {/* Benefits */}
              <div className="mt-6 flex flex-wrap justify-center gap-6">
                {BENEFITS.map((b) => (
                  <div key={b.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <b.icon className="h-4 w-4 text-cosmic-purple-light shrink-0" />
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-cosmic-purple focus:outline-none focus:ring-1 focus:ring-cosmic-purple"
                />
                <select
                  value={sign}
                  onChange={(e) => setSign(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 focus:border-cosmic-purple focus:outline-none focus:ring-1 focus:ring-cosmic-purple sm:w-44"
                >
                  <option value="" className="bg-[#1a1030]">Your sign</option>
                  {ZODIAC_SIGNS.map((s) => (
                    <option key={s} value={s} className="bg-[#1a1030]">{s}</option>
                  ))}
                </select>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 rounded-lg bg-gradient-to-r from-cosmic-purple to-gold px-6 text-white font-semibold hover:brightness-110 transition-all whitespace-nowrap"
                >
                  {loading ? "..." : "Subscribe"}
                </Button>
              </form>
              <p className="mt-3 text-xs text-muted-foreground/50">
                Free forever. Unsubscribe anytime.
              </p>
            </>
          ) : (
            <div className="py-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/20 mx-auto mb-4">
                <Sparkles className="h-7 w-7 text-cosmic-purple-light" />
              </div>
              <h3 className="text-xl font-bold mb-2">Welcome to the cosmos!</h3>
              <p className="text-muted-foreground">
                Your first cosmic insight is on its way. Check your inbox soon.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
