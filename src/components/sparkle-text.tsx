"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

interface SparkleTextProps {
  children: string;
  className?: string;
  delay?: number;
}

const containerVariants: Variants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: {
      staggerChildren: 0.03,
      delayChildren: delay,
    },
  }),
};

const charVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 5,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.3, ease: "easeOut" },
      y: { duration: 0.3, ease: "easeOut" },
    },
  },
};

export function SparkleText({
  children,
  className,
  delay = 0,
}: SparkleTextProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span className={className}>{children}</span>;
  }

  // Split into words to prevent mid-word line breaks
  const words = children.split(" ");

  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      custom={delay}
      variants={containerVariants}
      aria-label={children}
    >
      {words.map((word, wi) => (
        <span key={wi} style={{ whiteSpace: "nowrap" }}>
          {word.split("").map((char, ci) => (
            <motion.span
              key={`${wi}-${ci}`}
              variants={charVariants}
              style={{ display: "inline-block" }}
            >
              {char}
            </motion.span>
          ))}
          {wi < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </motion.span>
  );
}
