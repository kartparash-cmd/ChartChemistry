import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  FileText,
  Ticket,
  MessageCircle,
  Crown,
} from "lucide-react";
import Link from "next/link";

type ActivityItem = {
  type: "signup" | "report" | "ticket" | "chat" | "plan_change";
  id: string;
  name: string;
  detail: string;
  meta?: string;
  time: Date;
};

export default async function ActivityLogPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [recentUsers, recentReports, recentTickets, recentChats] =
    await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          createdAt: true,
        },
      }),
      prisma.compatibilityReport.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          overallScore: true,
          tier: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          subject: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.chatSession.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

  const activities: ActivityItem[] = [
    ...recentUsers.map((u) => ({
      type: "signup" as const,
      id: u.id,
      name: u.name || u.email,
      detail: `Signed up with ${u.plan} plan`,
      meta: u.plan,
      time: u.createdAt,
    })),
    ...recentReports.map((r) => ({
      type: "report" as const,
      id: r.id,
      name: r.user.name || r.user.email,
      detail: `Generated ${r.tier} report — ${r.overallScore}% compatibility`,
      time: r.createdAt,
    })),
    ...recentTickets.map((t) => ({
      type: "ticket" as const,
      id: t.id,
      name: t.user.name || t.user.email,
      detail: t.subject,
      meta: t.status,
      time: t.createdAt,
    })),
    ...recentChats.map((c) => ({
      type: "chat" as const,
      id: c.id,
      name: c.user.name || c.user.email,
      detail: "Started AI chat session",
      time: c.createdAt,
    })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime());

  const iconMap = {
    signup: { icon: UserPlus, color: "bg-green-500/10 text-green-400" },
    report: { icon: FileText, color: "bg-purple-500/10 text-purple-400" },
    ticket: { icon: Ticket, color: "bg-amber-500/10 text-amber-400" },
    chat: { icon: MessageCircle, color: "bg-blue-500/10 text-blue-400" },
    plan_change: { icon: Crown, color: "bg-pink-500/10 text-pink-400" },
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "IN_PROGRESS": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "RESOLVED": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "CLOSED": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      default: return "";
    }
  };

  // Group by date
  const grouped: Record<string, ActivityItem[]> = {};
  for (const item of activities) {
    const key = item.time.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Recent platform activity across signups, reports, tickets, and chat sessions
        </p>
      </div>

      {/* Filter legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(iconMap).map(([type, { icon: Icon, color }]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={`h-5 w-5 rounded-full flex items-center justify-center ${color}`}>
              <Icon className="h-3 w-3" />
            </div>
            <span className="capitalize">{type.replace("_", " ")}</span>
          </div>
        ))}
      </div>

      {/* Activity timeline */}
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 sticky top-0 bg-background py-1">
            {date}
          </h3>
          <div className="space-y-1">
            {items.map((item, idx) => {
              const { icon: Icon, color } = iconMap[item.type];
              return (
                <div
                  key={`${item.type}-${item.id}-${idx}`}
                  className="flex items-start gap-3 rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{item.name}</span>{" "}
                      <span className="text-muted-foreground">
                        {item.type === "ticket" ? (
                          <>
                            opened ticket:{" "}
                            <Link href={`/admin/tickets/${item.id}`} className="text-amber-400 hover:underline">
                              {item.detail}
                            </Link>
                          </>
                        ) : (
                          item.detail
                        )}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {item.time.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      {item.type === "ticket" && item.meta && (
                        <Badge variant="outline" className={`text-[10px] py-0 ${statusColor(item.meta)}`}>
                          {item.meta}
                        </Badge>
                      )}
                      {item.type === "signup" && item.meta && item.meta !== "FREE" && (
                        <Badge variant="outline" className="text-[10px] py-0 bg-purple-500/10 text-purple-400 border-purple-500/20">
                          {item.meta}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
