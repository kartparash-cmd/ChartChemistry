"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: { replies: number };
}

const statusColors: Record<string, string> = {
  OPEN: "bg-green-500/10 text-green-400 border-green-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  RESOLVED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  CLOSED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function SupportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch("/api/support")
      .then((r) => r.json())
      .then((d) => { setTickets(d.tickets || []); setLoading(false); });
  }, [session]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit ticket. Please try again.");
        setSubmitting(false);
        return;
      }
      if (data.ticket) {
        router.push(`/support/${data.ticket.id}`);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setSubmitting(false);
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-muted-foreground mt-2">Please sign in to access support.</p>
        <Button asChild className="mt-4 bg-cosmic-purple hover:bg-cosmic-purple-dark text-white">
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-24 pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-muted-foreground text-sm mt-1">Get help with your account</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={4}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setError(null); }}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !subject.trim() || !description.trim()}
              className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : tickets.length > 0 ? (
        <div className="rounded-xl border border-border divide-y divide-border">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support/${ticket.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ticket._count.replies} replies · Updated {new Date(ticket.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className={statusColors[ticket.status]}>
                {ticket.status.replace("_", " ")}
              </Badge>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <Ticket className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No tickets yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Click &quot;New Ticket&quot; to get started.
          </p>
        </div>
      )}
    </div>
  );
}
