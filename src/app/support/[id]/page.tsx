import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TicketThread } from "@/components/admin/ticket-thread";

export default async function SupportTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!ticket) notFound();
  if (ticket.userId !== session.user.id) redirect("/support");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/support"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
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
        replyEndpoint={`/api/support/${ticket.id}`}
      />
    </div>
  );
}
