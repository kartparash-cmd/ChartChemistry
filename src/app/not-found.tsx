"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowLeft, Home, Telescope } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        className="mx-auto max-w-lg space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cosmic-purple/10">
            <Telescope className="h-12 w-12 text-cosmic-purple-light" />
          </div>
        </motion.div>

        <motion.h1
          className="text-6xl font-bold tracking-tight sm:text-7xl"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <span className="cosmic-text">404</span>
        </motion.h1>

        <motion.h2
          className="text-2xl font-semibold sm:text-3xl"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          Lost in the Cosmos
        </motion.h2>

        <motion.p
          className="mx-auto max-w-md text-base text-muted-foreground sm:text-lg"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          The stars couldn&apos;t align for this page. It may have drifted into
          another orbit, or perhaps it never existed in this constellation.
        </motion.p>

        <motion.div
          className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-gradient-to-r from-cosmic-purple to-gold px-6 font-semibold text-white shadow-lg transition-all hover:shadow-cosmic-purple/40 hover:shadow-xl hover:brightness-110"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-full px-6 font-semibold"
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2 pt-4 text-sm text-muted-foreground"
        >
          <Sparkles className="h-4 w-4 text-gold" />
          <span>Maybe the universe has other plans for you.</span>
          <Sparkles className="h-4 w-4 text-gold" />
        </motion.div>
      </motion.div>
    </div>
  );
}
