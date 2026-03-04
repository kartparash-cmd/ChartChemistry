"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";

export function ImpersonationBanner() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user?.realId) return null;

  async function stopImpersonation() {
    await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stop: true }),
    });
    router.push("/admin/users");
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-black">
      <AlertTriangle className="h-4 w-4" />
      <span>
        Impersonating <strong>{session.user.name || session.user.email}</strong> (ID: {session.user.id})
      </span>
      <button
        onClick={stopImpersonation}
        className="ml-2 inline-flex items-center gap-1 rounded-md bg-black/20 px-2 py-0.5 text-xs font-bold hover:bg-black/30 transition-colors"
      >
        <X className="h-3 w-3" />
        Stop
      </button>
    </div>
  );
}
