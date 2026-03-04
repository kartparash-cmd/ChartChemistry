"use client";

import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImpersonateButton({ userId }: { userId: string }) {
  const router = useRouter();

  async function handleImpersonate() {
    await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
      onClick={handleImpersonate}
    >
      <UserCheck className="h-4 w-4 mr-2" />
      Impersonate
    </Button>
  );
}
