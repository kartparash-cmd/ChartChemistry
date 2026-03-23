"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { ErrorFallback } from "@/components/error-fallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email ?? undefined,
      });
    }
    Sentry.captureException(error);
  }, [error, session]);

  return <ErrorFallback error={error} reset={reset} />;
}
