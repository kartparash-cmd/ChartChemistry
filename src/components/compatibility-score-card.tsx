"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface CompatibilityScoreCardProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getScoreColor(score: number): string {
  if (score < 40) return "#EF4444"; // red
  if (score < 60) return "#F59E0B"; // yellow/gold
  if (score < 80) return "#10B981"; // green
  return "#A78BFA"; // purple
}

function getScoreGradient(score: number): [string, string] {
  if (score < 40) return ["#EF4444", "#DC2626"];
  if (score < 60) return ["#F59E0B", "#D97706"];
  if (score < 80) return ["#10B981", "#059669"];
  return ["#A78BFA", "#7C3AED"];
}

function getScoreLabel(score: number): string {
  if (score < 40) return "Challenging";
  if (score < 60) return "Moderate";
  if (score < 80) return "Strong";
  return "Exceptional";
}

const sizeMap = {
  sm: { outer: 120, stroke: 6, fontSize: "text-2xl" },
  md: { outer: 180, stroke: 8, fontSize: "text-4xl" },
  lg: { outer: 240, stroke: 10, fontSize: "text-5xl" },
};

export function CompatibilityScoreCard({
  score,
  label,
  size = "md",
  className,
}: CompatibilityScoreCardProps) {
  const hasAnimatedRef = useRef(false);
  const motionScore = useMotionValue(0);
  const displayScore = useTransform(motionScore, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(0);

  const config = sizeMap[size];
  const radius = (config.outer - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = config.outer / 2;
  const [color1, color2] = getScoreGradient(score);
  const gradientId = `score-gradient-${score}-${size}`;

  useEffect(() => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const controls = animate(motionScore, score, {
      duration: 1.5,
      ease: "easeOut",
    });

    const unsubscribe = motionScore.on("change", (v) => {
      setDisplayValue(Math.round(v));
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [score, motionScore]);

  return (
    <motion.div
      className={cn("flex flex-col items-center gap-3", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative" style={{ width: config.outer, height: config.outer }}>
        <svg
          width={config.outer}
          height={config.outer}
          viewBox={`0 0 ${config.outer} ${config.outer}`}
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color1} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-muted/20"
          />
          {/* Animated score circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: circumference - (score / 100) * circumference,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn("font-bold font-heading", config.fontSize)}
            style={{ color: getScoreColor(score) }}
          >
            {displayValue}
          </span>
          <span className="text-xs text-muted-foreground mt-0.5">
            {getScoreLabel(score)}
          </span>
        </div>

        {/* Subtle glow effect */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-xl"
          style={{
            background: `radial-gradient(circle, ${getScoreColor(score)} 0%, transparent 70%)`,
          }}
        />
      </div>

      {label && (
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      )}
    </motion.div>
  );
}
