import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/stat-card";
import { Users, FileText, Ticket, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [
    totalUsers,
    freeUsers,
    premiumUsers,
    annualUsers,
    totalReports,
    openTickets,
    recentSignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: "FREE" } }),
    prisma.user.count({ where: { plan: "PREMIUM" } }),
    prisma.user.count({ where: { plan: "ANNUAL" } }),
    prisma.compatibilityReport.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, email: true, name: true, plan: true, createdAt: true },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform analytics at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={totalUsers} icon={Users} />
        <StatCard
          title="Premium Users"
          value={premiumUsers + annualUsers}
          icon={Crown}
          description={`${premiumUsers} monthly · ${annualUsers} annual`}
        />
        <StatCard title="Reports" value={totalReports} icon={FileText} />
        <StatCard
          title="Open Tickets"
          value={openTickets}
          icon={Ticket}
          className={openTickets > 0 ? "border-amber-500/30" : ""}
        />
      </div>

      {/* Plan breakdown */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Plan Distribution</h3>
        <div className="flex gap-2 items-end h-32">
          {[
            { label: "Free", count: freeUsers, color: "bg-zinc-500" },
            { label: "Premium", count: premiumUsers, color: "bg-purple-500" },
            { label: "Annual", count: annualUsers, color: "bg-amber-500" },
          ].map((bar) => {
            const pct = totalUsers > 0 ? (bar.count / totalUsers) * 100 : 0;
            return (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium">{bar.count}</span>
                <div
                  className={`w-full rounded-t-md ${bar.color}`}
                  style={{ height: `${Math.max(pct, 4)}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{bar.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent signups */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-medium">Recent Signups</h3>
        </div>
        <div className="divide-y divide-border">
          {recentSignups.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-sm font-medium">{user.name || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px]">{user.plan}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
