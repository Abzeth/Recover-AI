import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { AiPlanSheet } from "@/components/AiPlanSheet";
import { StatusBadge } from "@/components/StatusBadge";
import { recoveryPlans, type PlanKey } from "@/lib/ai-engine";
import { auditLog, moduleSummary, recoveryTrend, failedPayments } from "@/lib/data";
import { inr } from "@/lib/format";
import { categoryCounts, funnel, monthImpact, resolvedBatch, riskBatch } from "@/lib/recovery-engine";
import { RecoveryFunnel } from "@/components/RecoveryFunnel";
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
  const batch = funnel(riskBatch);
  const closed = funnel(resolvedBatch);


  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Recovery overview" sub="AI has analysed every revenue leak. Nothing executes without your approval.">
        <Button asChild variant="outline">
          <Link to="/app/recovery"><Sparkles className="size-4" /> Open closed-loop recovery run</Link>
        </Button>
        <Button onClick={() => setPlanKey("failed")} className="bg-gold-gradient text-primary-foreground font-semibold shadow-gold hover:opacity-90">
          <Sparkles className="size-4" /> Review AI plan
        </Button>
      </PageHeader>

      {/* THIS MONTH — verified business impact */}
      <div className="rounded-xl border border-gold/25 bg-gold/5 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">This month — business impact</h2>
          <span className="text-xs text-muted-foreground">verified, reconciled batches · modeled estimates labelled separately</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "Revenue at risk", value: inr(monthImpact.atRisk), tag: "detected exposure", tone: "text-destructive" },
            { label: "Recovered", value: inr(monthImpact.recovered), tag: "verified recovered", tone: "text-success" },
            { label: "Recovery rate", value: `${monthImpact.recoveryRate.toFixed(1)}%`, tag: "recovered ÷ attempted", tone: "text-success" },
            { label: "Recovery attempts", value: monthImpact.attempts.toLocaleString("en-IN"), tag: "bounded by policy", tone: "text-gold" },
            { label: "Successful recoveries", value: monthImpact.successes.toLocaleString("en-IN"), tag: "closed workflows", tone: "text-gold" },
            { label: "Revenue protected", value: inr(monthImpact.recovered), tag: "verified recovered — not a forecast", tone: "text-success" },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <p className={`mt-1.5 font-display text-2xl font-semibold ${k.tone}`}>{k.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{k.tag}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Without RecoverAI: <span className="text-destructive">{inr(monthImpact.atRisk)}</span> estimated loss (modeled) · With RecoverAI:{" "}
          <span className="text-success">{inr(monthImpact.recovered)}</span> recovered (verified).
        </p>
      </div>

      {/* Today's batch — live closed loop */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-base font-semibold">Today's recovery queue</h2>
            <Link to="/app/recovery" className="text-xs text-gold hover:underline">Run the loop →</Link>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {riskBatch.length} revenue-at-risk events · <span className="text-destructive">{inr(batch.atRisk)} at risk</span> ·{" "}
            <span className="text-gold-dim">{inr(batch.estimatedRecovery)} estimated recoverable (modeled)</span>
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {categoryCounts(riskBatch).map((c) => (
              <div key={c.category} className="flex items-baseline justify-between rounded-lg border border-border p-3 text-sm">
                <span>{c.category}</span>
                <span className="font-medium">{c.count} · <span className="text-destructive">{inr(c.atRisk)}</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Latest closed batch</h2>
          <div className="mt-4">
            <RecoveryFunnel
              steps={[
                { label: "Revenue at risk", value: closed.atRisk, kind: "risk" },
                { label: "Eligible for recovery", value: closed.estimatedRecovery, kind: "estimate" },
                { label: "Recovery attempted", value: closed.attempted, kind: "attempt" },
                { label: "Successfully recovered", value: closed.recovered, kind: "actual" },
                { label: "Still outstanding", value: closed.outstanding, kind: "outstanding" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Module revenue at risk", value: inr(totalAtRisk), hint: "across 4 modules" },
          { label: "AI-estimated recoverable", value: inr(totalRecoverable), hint: "modeled — needs approval" },
          { label: "Recovered this week", value: inr(280400), hint: "verified, +18% vs last week" },
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
                    <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                  formatter={(v) => inr(Number(v))}
                />
                <Area type="monotone" dataKey="atRisk" stroke="var(--destructive)" fill="url(#gRisk)" strokeWidth={2} />
                <Area type="monotone" dataKey="recovered" stroke="var(--gold)" fill="url(#gRec)" strokeWidth={2} />
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
