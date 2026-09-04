import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { AiPlanSheet } from "@/components/AiPlanSheet";
import { StatusBadge } from "@/components/StatusBadge";
import { recoveryPlans, type PlanKey } from "@/lib/ai-engine";
import { auditLog, moduleSummary, recoveryTrend, failedPayments } from "@/lib/data";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Overview — RecoverAI workspace" },
      { name: "description", content: "Revenue at risk, AI findings and recovery performance across every module." },
      { property: "og:title", content: "Overview — RecoverAI workspace" },
      { property: "og:description", content: "Revenue at risk, AI findings and recovery performance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const [planKey, setPlanKey] = useState<PlanKey | null>(null);
  const totalAtRisk = moduleSummary.reduce((a, m) => a + m.atRisk, 0);
  const totalRecoverable = moduleSummary.reduce((a, m) => a + m.recoverable, 0);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Recovery overview" sub="AI has analysed every revenue leak. Nothing executes without your approval.">
        <Button onClick={() => setPlanKey("failed")} className="bg-gold-gradient text-primary-foreground font-semibold shadow-gold hover:opacity-90">
          <Sparkles className="size-4" /> Review AI plan
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Revenue at risk", value: inr(totalAtRisk), hint: "across 4 modules" },
          { label: "AI-estimated recoverable", value: inr(totalRecoverable), hint: "if plans approved" },
          { label: "Recovered this week", value: inr(280400), hint: "+18% vs last week" },
          { label: "Awaiting your approval", value: "6 plans", hint: "0 unapproved charges" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-gold">{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">At risk vs recovered</h2>
            <span className="flex items-center gap-1.5 text-xs text-success"><TrendingUp className="size-3.5" /> 68% retry success</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recoveryTrend}>
                <defs>
                  <linearGradient id="gRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12 }}
                  formatter={(v) => inr(Number(v))}
                />
                <Area type="monotone" dataKey="atRisk" stroke="hsl(var(--destructive))" fill="url(#gRisk)" strokeWidth={2} />
                <Area type="monotone" dataKey="recovered" stroke="hsl(var(--gold))" fill="url(#gRec)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Modules</h2>
          <div className="mt-4 space-y-3">
            {moduleSummary.map((m) => (
              <Link key={m.key} to={m.to} className="block rounded-lg border border-border p-3.5 transition-colors hover:border-gold/40">
                <div className="flex items-center justify-between text-sm font-medium">
                  {m.label}
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.count} items · <span className="text-destructive">{inr(m.atRisk)} at risk</span> · <span className="text-gold">{inr(m.recoverable)} recoverable</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Latest failed payments</h2>
          <div className="mt-3 divide-y divide-border">
            {failedPayments.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.customer}</p>
                  <p className="text-xs text-muted-foreground">{p.reason} · {p.failedAt}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gold">{inr(p.amount)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Audit trail</h2>
          <div className="mt-3 divide-y divide-border">
            {auditLog.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.action}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.actor} · {a.target} · {a.at}</p>
                </div>
                <span className="text-xs text-muted-foreground">{a.outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {planKey && (
        <AiPlanSheet planKey={planKey} plan={recoveryPlans[planKey]!} open onOpenChange={(o) => !o && setPlanKey(null)} />
      )}
    </div>
  );
}
