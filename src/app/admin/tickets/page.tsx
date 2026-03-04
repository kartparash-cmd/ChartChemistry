"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; name: string | null };
  _count: { replies: number };
}

const statusColors: Record<string, string> = {
  OPEN: "bg-green-500/10 text-green-400 border-green-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  RESOLVED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  CLOSED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    params.set("page", String(page));

    const res = await fetch(`/api/admin/tickets?${params}`);
    const json = await res.json();
    setTickets(json.tickets || []);
    setTotal(json.total || 0);
    setTotalPages(json.totalPages || 1);
    setLoading(false);
  }, [status, page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} total tickets</p>
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading tickets...</div>
      ) : tickets.length > 0 ? (
        <>
          <div className="rounded-xl border border-border divide-y divide-border">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/admin/tickets/${ticket.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ticket.user.name || ticket.user.email} · {ticket._count.replies} replies · {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className={statusColors[ticket.status]}>
                  {ticket.status.replace("_", " ")}
                </Badge>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">No tickets found.</div>
      )}
    </div>
  );
}
