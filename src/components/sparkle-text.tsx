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
    textShadow: "0 0 20px rgba(167,139,250,0.8)",
  },
  visible: {
    opacity: 1,
    y: 0,
    textShadow: "0 0 0px transparent",
    transition: {
      opacity: { duration: 0.3, ease: "easeOut" },
      y: { duration: 0.3, ease: "easeOut" },
      textShadow: { duration: 0.5, ease: "easeOut" },
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

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={delay}
      variants={containerVariants}
      aria-label={children}
    >
      {children.split("").map((char, i) =>
        char === " " ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <motion.span
            key={i}
            variants={charVariants}
            style={{ display: "inline-block" }}
          >
            {char}
          </motion.span>
        )
      )}
    </motion.span>
  );
}
