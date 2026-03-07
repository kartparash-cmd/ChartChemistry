"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, Heart, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: User,
    title: "Create Your Birth Profile",
    description:
      "Add your birth date, time, and location to generate your natal chart. The more accurate your birth time, the more precise your readings.",
  },
  {
    icon: Heart,
    title: "Add Someone Special",
    description:
      "Add a partner, friend, or family member's birth details to discover your astrological compatibility and relationship dynamics.",
  },
  {
    icon: Sparkles,
    title: "Discover Your Chemistry",
    description:
      "Get AI-powered compatibility reports with synastry analysis, composite charts, and personalized relationship insights.",
  },
];

export function OnboardingWizard() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem("onboarding-complete");
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("onboarding-complete", "true");
    setVisible(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const current = steps[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {visible && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to ChartChemistry"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <button
              onClick={dismiss}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close onboarding"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step
                        ? "w-8 bg-cosmic-purple"
                        : i < step
                          ? "w-4 bg-cosmic-purple/50"
                          : "w-4 bg-muted"
                    }`}
                  />
                ))}
              </div>

              <motion.div
                key={step}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mx-auto w-16 h-16 rounded-2xl bg-cosmic-purple/10 flex items-center justify-center mb-4">
                  <Icon className="h-8 w-8 text-cosmic-purple-light" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">
                  {current.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {current.description}
                </p>
              </motion.div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={dismiss} className="flex-1">
                  Skip
                </Button>
                <Button
                  onClick={next}
                  className="flex-1 cosmic-gradient text-white"
                >
                  {step < steps.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
