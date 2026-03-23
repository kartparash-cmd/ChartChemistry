"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  useEffect(() => {
    trackEvent("error_shown", { message: error.message || "unknown" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="glass-card mx-auto max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-purple/20">
          <Sparkles aria-hidden="true" className="h-8 w-8 text-cosmic-purple" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm text-gray-400">
          {process.env.NODE_ENV !== "production" && error.message
            ? error.message
            : "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            className="rounded-2xl bg-cosmic-purple hover:bg-cosmic-purple/80"
          >
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-2xl border-white/10 hover:bg-white/5"
          >
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
