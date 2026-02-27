"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const LOADING_FACTS = [
  "Calculating planetary positions...",
  "Analyzing Venus-Mars dynamics...",
  "Reading your Moon compatibility...",
  "Mapping house overlays...",
  "Synthesizing your cosmic connection...",
  "Checking Mercury aspects for communication...",
  "Examining Saturn bonds for longevity...",
  "Interpreting Jupiter blessings...",
  "Analyzing North Node connections...",
  "Decoding your composite chart...",
];

interface LoadingFactsProps {
  className?: string;
}

export function LoadingFacts({ className }: LoadingFactsProps) {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % LOADING_FACTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-8 py-16",
        className
      )}
    >
      {/* Constellation spinner */}
      <div className="relative h-24 w-24">
        {/* Outer orbit ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-cosmic-purple/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Middle orbit ring */}
        <motion.div
          className="absolute inset-3 rounded-full border border-cosmic-purple-light/40"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner glow */}
        <div className="absolute inset-6 rounded-full bg-cosmic-purple/20 animate-pulse-glow" />

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-gold"
            style={{
              top: "50%",
              left: "50%",
              marginTop: -4,
              marginLeft: -4,
            }}
            animate={{
              x: [
                Math.cos((i * 2 * Math.PI) / 3) * 36,
                Math.cos((i * 2 * Math.PI) / 3 + Math.PI * 2) * 36,
              ],
              y: [
                Math.sin((i * 2 * Math.PI) / 3) * 36,
                Math.sin((i * 2 * Math.PI) / 3 + Math.PI * 2) * 36,
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Center star */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cosmic-purple-light"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Rotating fact text */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={factIndex}
            className="text-center text-sm text-muted-foreground md:text-base"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {LOADING_FACTS[factIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {LOADING_FACTS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === factIndex
                ? "w-6 bg-cosmic-purple-light"
                : "w-1.5 bg-muted-foreground/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}
