"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Reply {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
  user: { id: string; name: string | null };
}

interface TicketThreadProps {
  ticketId: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  replies: Reply[];
  isAdmin?: boolean;
  replyEndpoint: string;
}

const statusColors: Record<string, string> = {
  OPEN: "bg-green-500/10 text-green-400 border-green-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  RESOLVED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  CLOSED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export function TicketThread({
  ticketId,
  subject,
  description,
  status,
  createdAt,
  replies,
  isAdmin = false,
  replyEndpoint,
}: TicketThreadProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await fetch(replyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      setMessage("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setStatusUpdating(true);
    try {
      await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setStatusUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{subject}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Opened {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusColors[status]}>
            {status.replace("_", " ")}
          </Badge>
          {isAdmin && (
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          )}
        </div>
      </div>

      {/* Original description */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm whitespace-pre-wrap">{description}</p>
      </div>

      {/* Replies */}
      <div className="space-y-3">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className={cn(
              "rounded-xl border p-4",
              reply.isAdmin
                ? "border-amber-500/30 bg-amber-500/5 ml-8"
                : "border-border bg-card mr-8"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">
                {reply.user.name || "User"}
              </span>
              {reply.isAdmin && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                  Admin
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(reply.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {status !== "CLOSED" && (
        <form onSubmit={handleSendReply} className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply..."
            rows={2}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50"
          />
          <Button
            type="submit"
            disabled={sending || !message.trim()}
            className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
