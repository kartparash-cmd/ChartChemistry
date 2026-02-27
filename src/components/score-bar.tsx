"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

function getBarGradient(score: number): string {
  if (score < 40) return "from-red-500 to-red-600";
  if (score < 60) return "from-amber-400 to-amber-500";
  if (score < 80) return "from-emerald-400 to-emerald-500";
  return "from-cosmic-purple-light to-cosmic-purple";
}

export function ScoreBar({
  label,
  score,
  maxScore = 100,
  icon,
  className,
  delay = 0,
}: ScoreBarProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <motion.div
      className={cn("space-y-2", className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-cosmic-purple-light">{icon}</span>
          )}
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm font-bold text-foreground">
          {score}
          <span className="text-muted-foreground font-normal">/{maxScore}</span>
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/30">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r",
            getBarGradient(score)
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1,
            delay: delay + 0.2,
            ease: "easeOut",
          }}
        />
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1,
            delay: delay + 0.2,
            ease: "easeOut",
          }}
        />
      </div>
    </motion.div>
  );
}
