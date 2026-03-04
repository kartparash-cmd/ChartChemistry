"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarField } from "@/components/star-field";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "no-token"
  >(token ? "loading" : "no-token");
  const [message, setMessage] = useState("");

  const verifyEmail = useCallback(async (verificationToken: string) => {
    try {
      const res = await fetch(
        `/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`
      );
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <StarField starCount={80} className="z-0" />

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute left-4 top-6 sm:left-8 sm:top-8 z-10"
      >
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-cosmic-purple-light" />
              <span className="font-heading text-2xl font-bold cosmic-text">
                ChartChemistry
              </span>
            </div>
          </div>

          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <Loader2 className="h-10 w-10 text-cosmic-purple-light animate-spin" />
              <p className="text-sm text-muted-foreground">
                Verifying your email...
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
              <Badge
                variant="outline"
                className="border-green-500/30 bg-green-500/10 text-green-400"
              >
                Verified
              </Badge>
              <h2 className="text-xl font-semibold text-foreground">
                Email verified!
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                {message}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                You can now sign in to your account.
              </p>
              <Button
                asChild
                className="mt-2 w-full h-11 bg-cosmic-purple hover:bg-cosmic-purple-dark text-white transition-all"
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <div className="rounded-full bg-red-500/10 p-3">
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
              <Badge
                variant="outline"
                className="border-red-500/30 bg-red-500/10 text-red-400"
              >
                Verification Failed
              </Badge>
              <h2 className="text-xl font-semibold text-foreground">
                Unable to verify
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                {message}
              </p>
              <div className="flex flex-col gap-2 w-full mt-2">
                <Button
                  asChild
                  className="w-full h-11 bg-cosmic-purple hover:bg-cosmic-purple-dark text-white transition-all"
                >
                  <Link href="/auth/signup">Request New Verification</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 transition-all"
                >
                  <Link href="/auth/signin">Back to Sign In</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {status === "no-token" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <div className="rounded-full bg-cosmic-purple/10 p-3">
                <Mail className="h-10 w-10 text-cosmic-purple-light" />
              </div>
              <Badge
                variant="outline"
                className="border-cosmic-purple/30 bg-cosmic-purple/10 text-cosmic-purple-light"
              >
                Check Your Email
              </Badge>
              <h2 className="text-xl font-semibold text-foreground">
                Verification link sent
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                We&apos;ve sent a verification link to your email address.
                Please check your inbox and click the link to verify your
                account.
              </p>
              <p className="text-xs text-muted-foreground text-center">
                The link will expire in 24 hours. Check your spam folder if you
                don&apos;t see it.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-2 w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 transition-all"
              >
                <Link href="/auth/signin">Back to Sign In</Link>
              </Button>
            </motion.div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link
            href="/terms"
            className="text-cosmic-purple-light hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-cosmic-purple-light hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}
