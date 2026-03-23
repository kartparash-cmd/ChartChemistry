"use client";

import { motion, useReducedMotion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

/**
 * Animated hero section wrapper for the learn hub page.
 */
export function AnimatedHero({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: 0.5 }}
      className="relative mx-auto max-w-4xl text-center"
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated stagger grid for the learn hub topic cards.
 */
export function AnimatedCardGrid({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="mx-auto max-w-4xl grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated wrapper for individual topic cards.
 */
export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
      {children}
    </motion.div>
  );
}

/**
 * Animated section that fades in on scroll.
 */
export function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
