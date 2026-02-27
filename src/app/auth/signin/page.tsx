"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StarField } from "@/components/star-field";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setIsLoadingGoogle(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoadingEmail(true);
    try {
      const result = await signIn("email", {
        email,
        callbackUrl: "/dashboard",
        redirect: false,
      });
      if (result?.ok) {
        setEmailSent(true);
      }
    } catch {
      // Error handled silently for MVP
    } finally {
      setIsLoadingEmail(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      {/* Star field background */}
      <StarField starCount={80} className="z-0" />

      {/* Back to home */}
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

      {/* Sign-in card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-cosmic-purple-light" />
              <span className="font-heading text-2xl font-bold cosmic-text">
                ChartChemistry
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign in to save your charts and unlock insights
            </p>
          </div>

          {emailSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cosmic-purple/10">
                <Mail className="h-7 w-7 text-cosmic-purple-light" />
              </div>
              <h3 className="mb-2 text-lg font-heading font-semibold">
                Check your email
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                We sent a magic link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Click it to sign in.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEmailSent(false)}
                className="text-cosmic-purple-light"
              >
                Try a different email
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Google OAuth */}
              <Button
                variant="outline"
                className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 transition-all"
                onClick={handleGoogleSignIn}
                disabled={isLoadingGoogle}
              >
                {isLoadingGoogle ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <Separator className="bg-white/10" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-navy-light px-3 text-xs text-muted-foreground">
                  or
                </span>
              </div>

              {/* Email Magic Link */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                  disabled={isLoadingEmail || !email}
                >
                  {isLoadingEmail ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Send Magic Link
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Terms */}
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
