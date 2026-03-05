"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarField } from "@/components/star-field";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      } else {
        setIsSuccess(true);
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        <StarField starCount={80} className="z-0" />

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
              <h1 className="text-sm text-muted-foreground font-normal">
                Reset your password
              </h1>
            </div>
            <div className="text-center">
              <div role="alert" aria-live="polite" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                Invalid or missing reset token. Please request a new password
                reset link.
              </div>
              <Link href="/auth/forgot-password">
                <Button className="w-full h-11 bg-cosmic-purple hover:bg-cosmic-purple-dark text-white transition-all">
                  Request New Link
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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
            <h1 className="text-sm text-muted-foreground font-normal">
              Set your new password
            </h1>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Password reset successful
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Your password has been updated. You can now sign in with your
                new password.
              </p>
              <Link href="/auth/signin">
                <Button className="w-full h-11 bg-cosmic-purple hover:bg-cosmic-purple-dark text-white transition-all">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              {errorMessage && (
                <div role="alert" aria-live="polite" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    New password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="h-11 bg-white/5 border-white/10 focus:border-cosmic-purple/50 focus:ring-cosmic-purple/20 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm">
                    Confirm new password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="h-11 bg-white/5 border-white/10 focus:border-cosmic-purple/50 focus:ring-cosmic-purple/20 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-cosmic-purple hover:bg-cosmic-purple-dark text-white transition-all"
                  disabled={isLoading || !password || !confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
