"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "cc_popup_dismissed";
const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export function ExitPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [sign, setSign] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    // Never show again if already dismissed
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    // Arm after 5s (skip immediate bouncers)
    const armTimer = setTimeout(() => {
      readyRef.current = true;
    }, 5000);

    // Desktop: mouseleave toward top of viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (!readyRef.current) return;
      if (e.clientY <= 0) {
        setShow(true);
        markDismissed();
      }
    };

    // Mobile: idle for 45s after scrolling past 30%
    let scrolledPast30 = false;
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && window.scrollY / docHeight > 0.3) {
        scrolledPast30 = true;
      }
    };

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (!readyRef.current) return;
      idleTimer = setTimeout(() => {
        if (scrolledPast30 && readyRef.current) {
          setShow(true);
          markDismissed();
        }
      }, 45000);
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scroll", resetIdle, { passive: true });
    window.addEventListener("touchstart", resetIdle, { passive: true });

    return () => {
      clearTimeout(armTimer);
      if (idleTimer) clearTimeout(idleTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", resetIdle);
      window.removeEventListener("touchstart", resetIdle);
    };
  }, []);

  const markDismissed = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  const close = useCallback(() => {
    setShow(false);
    markDismissed();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sign, source: "exit_popup" }),
      });
      setSubmitted(true);
      trackEvent("email_subscribe", { source: "exit_popup", sign });
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1030] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cosmic-purple/20">
                <Sparkles className="h-5 w-5 text-cosmic-purple-light" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Wait — get your free daily horoscope
              </h3>
            </div>
            <p className="text-sm text-white/60 mb-6">
              Personalized cosmic insights delivered to your inbox every morning.
              No account needed.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-cosmic-purple focus:outline-none focus:ring-1 focus:ring-cosmic-purple"
              />
              <select
                value={sign}
                onChange={(e) => setSign(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 focus:border-cosmic-purple focus:outline-none focus:ring-1 focus:ring-cosmic-purple"
              >
                <option value="" className="bg-[#1a1030]">Select your sign (optional)</option>
                {ZODIAC_SIGNS.map((s) => (
                  <option key={s} value={s} className="bg-[#1a1030]">{s}</option>
                ))}
              </select>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-gradient-to-r from-cosmic-purple to-gold text-white font-semibold hover:brightness-110 transition-all"
              >
                {loading ? "Subscribing..." : "Get My Daily Horoscope"}
              </Button>
            </form>
            <p className="mt-3 text-center text-xs text-white/30">
              Unsubscribe anytime. No spam, ever.
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/20 mx-auto mb-4">
              <Sparkles className="h-7 w-7 text-cosmic-purple-light" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              You&apos;re in the cosmic loop!
            </h3>
            <p className="text-sm text-white/60">
              Check your inbox tomorrow morning for your first personalized horoscope.
            </p>
            <Button
              onClick={close}
              variant="ghost"
              className="mt-4 text-cosmic-purple-light hover:text-white"
            >
              Continue exploring
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
