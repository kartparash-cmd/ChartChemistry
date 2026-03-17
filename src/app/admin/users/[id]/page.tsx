import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, FileText, Ticket } from "lucide-react";
import { ImpersonateButton } from "./impersonate-button";
import { PlanChangeForm } from "./plan-change-form";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      birthProfiles: {
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, birthDate: true, birthCity: true, birthCountry: true, isOwner: true },
      },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true, overallScore: true, tier: true, createdAt: true,
          person1: { select: { name: true } },
          person2: { select: { name: true } },
        },
      },
      supportTickets: {
        orderBy: { createdAt: "desc" },
        select: { id: true, subject: true, status: true, createdAt: true },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.name || user.email}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant="outline">{user.plan}</Badge>
        <Badge variant="outline" className="text-amber-500 border-amber-500/30">{user.role}</Badge>
        {user.role !== "ADMIN" && <ImpersonateButton userId={user.id} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-muted-foreground">Member since</p>
          <p className="font-medium mt-1">{user.createdAt.toLocaleDateString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-muted-foreground">Profiles</p>
          <p className="font-medium mt-1">{user.birthProfiles.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-muted-foreground">Reports</p>
          <p className="font-medium mt-1">{user.reports.length}</p>
        </div>
      </div>

      {/* Plan Change */}
      <PlanChangeForm
        userId={user.id}
        currentPlan={user.plan}
        userName={user.name || user.email}
      />

      {/* Birth Profiles */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
          <User className="h-4 w-4" /> Birth Profiles
        </h3>
        {user.birthProfiles.length > 0 ? (
          <div className="rounded-xl border border-border divide-y divide-border">
            {user.birthProfiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.birthCity}, {p.birthCountry}
                  </p>
                </div>
                {p.isOwner && <Badge variant="outline" className="text-xs">Owner</Badge>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No profiles yet.</p>
        )}
      </section>

      {/* Reports */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
          <FileText className="h-4 w-4" /> Compatibility Reports
        </h3>
        {user.reports.length > 0 ? (
          <div className="rounded-xl border border-border divide-y divide-border">
            {user.reports.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {r.person1.name} & {r.person2.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Score: {r.overallScore}% · {r.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">{r.tier}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No reports yet.</p>
        )}
      </section>

      {/* Tickets */}
      <section>
        <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
          <Ticket className="h-4 w-4" /> Support Tickets
        </h3>
        {user.supportTickets.length > 0 ? (
          <div className="rounded-xl border border-border divide-y divide-border">
            {user.supportTickets.map((t) => (
              <Link
                key={t.id}
                href={`/admin/tickets/${t.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">{t.status}</Badge>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No tickets.</p>
        )}
      </section>
    </div>
  );
}
