"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: string;
  role: string;
  createdAt: string;
  _count: { birthProfiles: number; reports: number };
}

interface UserTableProps {
  users: UserRow[];
}

const planColors: Record<string, string> = {
  FREE: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  PREMIUM: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  ANNUAL: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export function UserTable({ users }: UserTableProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  async function handlePlanChange(userId: string, plan: string) {
    setUpdating(userId);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan }),
      });
      router.refresh();
    } finally {
      setUpdating(null);
    }
  }

  async function handleImpersonate(userId: string) {
    await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Profiles</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reports</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium">{user.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <Select
                  defaultValue={user.plan}
                  onValueChange={(val) => handlePlanChange(user.id, val)}
                  disabled={updating === user.id}
                >
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="ANNUAL">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{user._count.birthProfiles}</td>
              <td className="px-4 py-3 text-muted-foreground">{user._count.reports}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/admin/users/${user.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  {user.role !== "ADMIN" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-amber-500 hover:text-amber-400"
                      onClick={() => handleImpersonate(user.id)}
                      title="Impersonate user"
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
