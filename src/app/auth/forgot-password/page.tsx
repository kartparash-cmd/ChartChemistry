"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarField } from "@/components/star-field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <StarField starCount={80} className="z-0" />

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute left-4 top-6 sm:left-8 sm:top-8 z-10"
      >
        <Link
          href="/auth/signin"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
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
            <p className="text-sm text-muted-foreground">
              Reset your password
            </p>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cosmic-purple/20">
                <Mail className="h-6 w-6 text-cosmic-purple-light" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Check your email
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                If an account exists with that email, we&apos;ve sent a password
                reset link. Please check your inbox and spam folder.
              </p>
              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {errorMessage}
                </div>
              )}

              <p className="mb-6 text-sm text-muted-foreground">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-white/5 border-white/10 focus:border-cosmic-purple/50 focus:ring-cosmic-purple/20"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-cosmic-purple hover:bg-cosmic-purple-dark text-white transition-all"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Send Reset Link
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/auth/signin"
                  className="text-cosmic-purple-light hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
