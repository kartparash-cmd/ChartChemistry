"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
