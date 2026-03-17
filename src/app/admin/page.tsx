import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/stat-card";
import {
  Users,
  FileText,
  Ticket,
  Crown,
  DollarSign,
  TrendingUp,
  MessageCircle,
  UserPlus,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers,
    freeUsers,
    premiumUsers,
    annualUsers,
    totalReports,
    openTickets,
    totalChatSessions,
    usersLast7d,
    usersLast30d,
    usersPrev30d,
    reportsLast7d,
    reportsToday,
    chatSessionsLast7d,
    recentSignups,
    recentReports,
    recentTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: "FREE" } }),
    prisma.user.count({ where: { plan: "PREMIUM" } }),
    prisma.user.count({ where: { plan: "ANNUAL" } }),
    prisma.compatibilityReport.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.chatSession.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.compatibilityReport.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.compatibilityReport.count({ where: { createdAt: { gte: today } } }),
    prisma.chatSession.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, email: true, name: true, plan: true, createdAt: true },
    }),
    prisma.compatibilityReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
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
      take: 5,
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  // -- Business metrics --
  const mrr = premiumUsers * 9.99 + annualUsers * (79.99 / 12);
  const arr = mrr * 12;
  const conversionRate = totalUsers > 0
    ? ((premiumUsers + annualUsers) / totalUsers * 100)
    : 0;
  const growthRate = usersPrev30d > 0
    ? ((usersLast30d - usersPrev30d) / usersPrev30d * 100)
    : usersLast30d > 0 ? 100 : 0;
  const paidUsers = premiumUsers + annualUsers;

  // -- Plan distribution percentages --
  const freePct = totalUsers > 0 ? (freeUsers / totalUsers * 100) : 0;
  const premPct = totalUsers > 0 ? (premiumUsers / totalUsers * 100) : 0;
  const annPct = totalUsers > 0 ? (annualUsers / totalUsers * 100) : 0;

  const planColor = (plan: string) => {
    switch (plan) {
      case "PREMIUM": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "ANNUAL": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };


  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Business metrics and platform health &middot;{" "}
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Revenue Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Revenue"
          value={`$${mrr.toFixed(2)}`}
          icon={DollarSign}
          description={`ARR: $${arr.toFixed(0)}`}
          className="border-green-500/20"
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          description={`${paidUsers} of ${totalUsers} users`}
        />
        <StatCard
          title="User Growth (30d)"
          value={`${growthRate >= 0 ? "+" : ""}${growthRate.toFixed(0)}%`}
          icon={UserPlus}
          description={`${usersLast30d} new users this month`}
        />
        <StatCard
          title="Open Tickets"
          value={openTickets}
          icon={Ticket}
          className={openTickets > 0 ? "border-amber-500/30" : ""}
          description={openTickets > 0 ? "Needs attention" : "All clear"}
        />
      </div>

      {/* Users & Engagement Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={totalUsers} icon={Users} description={`+${usersLast7d} this week`} />
        <StatCard
          title="Paid Subscribers"
          value={paidUsers}
          icon={Crown}
          description={`${premiumUsers} monthly · ${annualUsers} annual`}
        />
        <StatCard title="Reports Generated" value={totalReports} icon={FileText} description={`${reportsToday} today · ${reportsLast7d} this week`} />
        <StatCard title="Chat Sessions" value={totalChatSessions} icon={MessageCircle} description={`${chatSessionsLast7d} this week`} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Plan Distribution */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Plan Distribution</h3>
          <div className="space-y-3">
            {[
              { label: "Free", count: freeUsers, pct: freePct, color: "bg-zinc-500" },
              { label: "Premium", count: premiumUsers, pct: premPct, color: "bg-purple-500" },
              { label: "Annual", count: annualUsers, pct: annPct, color: "bg-amber-500" },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">{bar.label}</span>
                  <span className="text-sm font-medium">{bar.count} ({bar.pct.toFixed(1)}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                    style={{ width: `${Math.max(bar.pct, 1)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Revenue breakdown */}
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Revenue Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Premium ({premiumUsers}x $9.99)</span>
                <span className="font-medium">${(premiumUsers * 9.99).toFixed(2)}/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Annual ({annualUsers}x $79.99/yr)</span>
                <span className="font-medium">${(annualUsers * (79.99 / 12)).toFixed(2)}/mo</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
                <span>Total MRR</span>
                <span className="text-green-400">${mrr.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">Activity Feed</h3>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="divide-y divide-border max-h-[380px] overflow-y-auto">
            {/* Merge and sort all activity */}
            {[
              ...recentSignups.map((u) => ({
                type: "signup" as const,
                name: u.name || u.email,
                plan: u.plan,
                time: u.createdAt,
                id: u.id,
              })),
              ...recentReports.map((r) => ({
                type: "report" as const,
                name: r.user.name || r.user.email,
                score: r.overallScore,
                tier: r.tier,
                time: r.createdAt,
                id: r.id,
              })),
              ...recentTickets.map((t) => ({
                type: "ticket" as const,
                name: t.user.name || t.user.email,
                subject: t.subject,
                status: t.status,
                time: t.createdAt,
                id: t.id,
              })),
            ]
              .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
              .slice(0, 12)
              .map((item) => (
                <div key={`${item.type}-${item.id}`} className="px-6 py-3 flex items-start gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full shrink-0 ${
                    item.type === "signup" ? "bg-green-500/10" :
                    item.type === "report" ? "bg-purple-500/10" :
                    "bg-amber-500/10"
                  }`}>
                    {item.type === "signup" && <UserPlus className="h-3.5 w-3.5 text-green-400" />}
                    {item.type === "report" && <FileText className="h-3.5 w-3.5 text-purple-400" />}
                    {item.type === "ticket" && <Ticket className="h-3.5 w-3.5 text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      {item.type === "signup" && (
                        <>
                          <span className="font-medium">{item.name}</span>{" "}
                          <span className="text-muted-foreground">signed up</span>{" "}
                          <Badge variant="outline" className={`text-[10px] py-0 ${planColor(item.plan)}`}>
                            {item.plan}
                          </Badge>
                        </>
                      )}
                      {item.type === "report" && (
                        <>
                          <span className="font-medium">{item.name}</span>{" "}
                          <span className="text-muted-foreground">generated a report</span>{" "}
                          <span className="text-purple-400 font-medium">{"score" in item ? `${item.score}%` : ""}</span>
                        </>
                      )}
                      {item.type === "ticket" && (
                        <>
                          <span className="font-medium">{item.name}</span>{" "}
                          <span className="text-muted-foreground">opened ticket:</span>{" "}
                          <Link href={`/admin/tickets/${item.id}`} className="text-amber-400 hover:underline">
                            {"subject" in item ? item.subject : ""}
                          </Link>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeTime(new Date(item.time))}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent Signups Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent Signups</h3>
          <Link href="/admin/users" className="text-xs text-cosmic-purple dark:text-cosmic-purple-light hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left font-medium px-6 py-3">User</th>
                <th className="text-left font-medium px-6 py-3">Email</th>
                <th className="text-left font-medium px-6 py-3">Plan</th>
                <th className="text-left font-medium px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentSignups.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3">
                    <Link href={`/admin/users/${user.id}`} className="text-sm font-medium hover:underline">
                      {user.name || "—"}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-3">
                    <Badge variant="outline" className={`text-xs ${planColor(user.plan)}`}>
                      {user.plan}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">
                    {formatRelativeTime(new Date(user.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -- Utility --

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
