import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TicketThread } from "@/components/admin/ticket-thread";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!ticket) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/tickets"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <p className="text-xs text-muted-foreground">
            Submitted by{" "}
            <Link href={`/admin/users/${ticket.user.id}`} className="text-cosmic-purple-light hover:underline">
              {ticket.user.name || ticket.user.email}
            </Link>
          </p>
        </div>
      </div>

      <TicketThread
        ticketId={ticket.id}
        subject={ticket.subject}
        description={ticket.description}
        status={ticket.status}
        createdAt={ticket.createdAt.toISOString()}
        replies={ticket.replies.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
        isAdmin
        replyEndpoint={`/api/admin/tickets/${ticket.id}`}
      />
    </div>
  );
}
