"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StarField } from "@/components/star-field";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method.",
  CredentialsSignin: "Invalid email or password.",
  OAuthCallback:
    "There was a problem with the authentication service. Please try again later.",
};

const DEFAULT_ERROR_MESSAGE = "An authentication error occurred.";

function getErrorMessage(error: string | null): string {
  if (!error) return DEFAULT_ERROR_MESSAGE;
  return ERROR_MESSAGES[error] ?? DEFAULT_ERROR_MESSAGE;
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage = getErrorMessage(error);

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
        className="relative z-10 w-full max-w-[420px]"
      >
        <Card className="glass-card border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
            <CardTitle className="text-xl cosmic-text">
              Sign-in Error
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {errorMessage}
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              If you signed up with email and password, try signing in with
              those credentials. If you used Google, use the Google sign-in
              button instead.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              asChild
              className="w-full h-11 cosmic-gradient text-white hover:opacity-90 transition-all"
            >
              <Link href="/auth/signin">Try Again</Link>
            </Button>
            <Link
              href="/auth/signup"
              className="text-sm text-cosmic-purple-light hover:underline font-medium"
            >
              Create an account instead
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
