import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { RecoveryFunnel } from "@/components/RecoveryFunnel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import {
  categoryCounts, decisionCounts, escalationLadder, funnel, humanReviewQueue, outcomeCounts,
  policyRows, resolvedBatch, riskBatch, stopReasonCounts, timelineFor, type RiskEvent,
} from "@/lib/recovery-engine";
import {
  AlertTriangle, Ban, Check, CircleDollarSign, Gauge, Loader2, OctagonX,
  ShieldCheck, Sparkles, UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/app/recovery")({
  head: () => ({
    meta: [
      { title: "Closed-Loop Recovery Run — RecoverAI" },
      { name: "description", content: "Run a bounded batch recovery loop: detect, diagnose, decide, act, measure and stop — with audited outcomes and human escalation." },
      { property: "og:title", content: "Closed-Loop Recovery Run — RecoverAI" },
      { property: "og:description", content: "Batch recovery with measured money recovered, stopping rules and full audit trail." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecoveryRunPage,
});

type Phase = "detected" | "analysing" | "decided" | "executing" | "measured";

function RecoveryRunPage() {
  const [phase, setPhase] = useState<Phase>("detected");
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<RiskEvent | null>(null);

  const detected = riskBatch;
  const resolved = resolvedBatch;
  const events = phase === "measured" ? resolved : detected;

  const detectedFunnel = useMemo(() => funnel(detected), [detected]);
  const finalFunnel = useMemo(() => funnel(resolved), [resolved]);
  const live = phase === "measured" ? finalFunnel : detectedFunnel;
  const cats = useMemo(() => categoryCounts(detected), [detected]);
  const decisions = useMemo(() => decisionCounts(detected), [detected]);
  const outcomes = useMemo(() => outcomeCounts(resolved), [resolved]);
  const stops = useMemo(() => stopReasonCounts(resolved), [resolved]);
  const review = useMemo(() => humanReviewQueue(detected), [detected]);

  useEffect(() => {
    if (phase === "analysing") {
      const t = setTimeout(() => setPhase("decided"), 2200);
      return () => clearTimeout(t);
    }
    if (phase === "executing") {
      setProgress(0);
      const iv = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) return 100;
          return p + 4;
        });
      }, 70);
      const t = setTimeout(() => {
        clearInterval(iv);
        setPhase("measured");
        toast.success(`Batch closed — ${inr(finalFunnel.recovered)} verified recovered`, {
          description: `${finalFunnel.recoveredCount} recoveries, ${finalFunnel.stoppedCount} workflows stopped by policy, ${finalFunnel.escalatedCount} escalated to humans.`,
        });
      }, 1950);
      return () => { clearInterval(iv); clearTimeout(t); };
    }
    return;
  }, [phase, finalFunnel]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Closed-loop recovery run"
        sub="Detect → Diagnose → Decide → Act → Measure → Stop. Every action is bounded, approved and audited."
      >
        {phase === "detected" && (
          <Button onClick={() => setPhase("analysing")} className="bg-gold-gradient text-primary-foreground font-semibold shadow-gold hover:opacity-90">
            <Sparkles className="size-4" /> Analyse batch of {detected.length}
          </Button>
        )}
        {phase === "analysing" && (
          <Button disabled className="bg-gold-gradient text-primary-foreground font-semibold">
            <Loader2 className="size-4 animate-spin" /> Analysing {detected.length} events…
          </Button>
        )}
        {phase === "decided" && (
          <Button onClick={() => { setPhase("executing"); toast("Bounded workflow approved by Priya Sharma"); }} className="bg-gold-gradient text-primary-foreground font-semibold shadow-gold hover:opacity-90">
            <ShieldCheck className="size-4" /> Approve bounded workflow
          </Button>
        )}
        {phase === "executing" && (
          <Button disabled className="bg-gold-gradient text-primary-foreground font-semibold">
            <Loader2 className="size-4 animate-spin" /> Executing… {progress}%
          </Button>
        )}
        {phase === "measured" && (
          <Button variant="outline" onClick={() => { setPhase("detected"); setProgress(0); }}>
            Reset demo run
          </Button>
        )}
      </PageHeader>

      <LoopStrip phase={phase} />

      {/* 1 — DETECT */}
      <Section n={1} title="Detect — today's recovery queue" note="Batch, not a single transaction.">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Revenue-at-risk events</p>
            <p className="mt-1 font-display text-4xl font-semibold text-gold">{detected.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Total revenue at risk <span className="font-medium text-destructive">{inr(detectedFunnel.atRisk)}</span>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {cats.map((c) => (
                  <tr key={c.category}>
                    <td className="py-2.5">{c.category}</td>
                    <td className="py-2.5 text-right font-medium">{c.count}</td>
                    <td className="py-2.5 text-right text-destructive">{inr(c.atRisk)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* 2 — DIAGNOSE + DECIDE */}
      {phase !== "detected" && (
        <Section n={2} title="Diagnose & decide — AI recovery analysis" note="Each event is segmented into exactly one bounded strategy.">
          {phase === "analysing" ? (
            <div className="rounded-xl border border-gold/25 bg-gold/5 p-6 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 text-gold"><Loader2 className="size-4 animate-spin" /> Clustering {detected.length} events by root cause, value, retry history and contact budget…</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Opportunities analysed</p>
                <p className="mt-1 font-display text-3xl font-semibold">{detected.length}</p>
                <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">AI estimated recoverable</p>
                <p className="mt-1 font-display text-2xl font-semibold text-gold">{inr(detectedFunnel.estimatedRecovery)}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">modeled estimate — not recovered money</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {detectedFunnel.eligibleCount} of {detected.length} events are eligible for automation. {detectedFunnel.atRisk - detectedFunnel.eligibleValue > 0 && <>{inr(detectedFunnel.atRisk - detectedFunnel.eligibleValue)} is withheld from automation by policy.</>}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
                <p className="text-sm font-medium">Recommended actions</p>
                <table className="mt-3 w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {decisions.map((d) => (
                      <tr key={d.decision}>
                        <td className="py-2.5">
                          <span className={d.decision === "Do not contact" ? "text-muted-foreground" : d.decision === "Escalate to human" ? "text-warning" : "text-gold-soft"}>{d.decision}</span>
                        </td>
                        <td className="py-2.5 text-right font-medium">{d.count}</td>
                        <td className="py-2.5 text-right text-muted-foreground">{inr(d.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* 3 — DECISION ENGINE detail */}
      {(phase === "decided" || phase === "executing" || phase === "measured") && (
        <Section n={3} title="Recovery decision engine" note="Why at risk, which intervention, why it was chosen, expected recovery, stopping conditions.">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {["Event", "Customer", "At risk", "Root cause", "Prob.", "Intervention", "Expected", "Attempts", "Outcome", "Stop reason"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-[13px]">
                  {events.slice(0, 14).map((e) => (
                    <tr key={e.id} className="cursor-pointer transition-colors hover:bg-secondary/40" onClick={() => setSelected(e)}>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{e.id}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium">{e.customer}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-destructive">{inr(e.amount)}</td>
                      <td className="whitespace-nowrap px-4 py-3">{e.rootCause}</td>
                      <td className="whitespace-nowrap px-4 py-3">{e.probability}%</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gold-soft">{e.decision}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{e.expectedRecovery ? inr(e.expectedRecovery) : "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{e.attempts}/{3}</td>
                      <td className="whitespace-nowrap px-4 py-3"><OutcomePill outcome={e.outcome} /></td>
                      <td className="max-w-[240px] truncate px-4 py-3 text-xs text-muted-foreground">{e.stopReason ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
              Showing 14 of {events.length} events. Click any row for its decision rationale, bounds and live timeline.
            </p>
          </div>
        </Section>
      )}

      {/* 4 — BOUNDS + ESCALATION */}
      <Section n={4} title="Bounded workflows & escalation ladder" note="The AI cannot exceed these limits, ever.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-medium"><Gauge className="size-4 text-gold" /> Hard policy bounds</p>
            <table className="mt-3 w-full text-sm">
              <tbody className="divide-y divide-border">
                {policyRows.map((p) => (
                  <tr key={p.label}>
                    <td className="py-2.5">{p.label}<span className="block text-xs text-muted-foreground">{p.note}</span></td>
                    <td className="py-2.5 text-right font-display font-semibold text-gold">{p.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-medium"><UserCheck className="size-4 text-gold" /> Escalation hierarchy</p>
            <ol className="mt-3 space-y-2.5">
              {escalationLadder.map((l) => (
                <li key={l.level} className="flex gap-3 rounded-lg border border-border p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gold-gradient text-[11px] font-bold text-primary-foreground">{l.level}</span>
                  <div>
                    <p className="text-[13.5px] font-medium">{l.label}</p>
                    <p className="text-xs text-muted-foreground">{l.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* 5 — MEASURE */}
      {(phase === "executing" || phase === "measured") && (
        <Section n={5} title="Measure — money actually recovered" note="Estimated, attempted and recovered are three different numbers.">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { label: "Revenue at risk", value: inr(live.atRisk), tag: "detected", tone: "text-destructive" },
              { label: "AI estimated recovery", value: inr(detectedFunnel.estimatedRecovery), tag: "modeled estimate", tone: "text-gold-dim" },
              { label: "Recovery attempted", value: inr(live.attempted), tag: "verified attempts", tone: "text-gold" },
              { label: "Successfully recovered", value: phase === "measured" ? inr(live.recovered) : "—", tag: "verified recovered", tone: "text-success" },
              { label: "Recovery rate", value: phase === "measured" ? `${live.recoveryRate.toFixed(1)}%` : "—", tag: "recovered ÷ attempted", tone: "text-success" },
              { label: "Still outstanding", value: phase === "measured" ? inr(live.outstanding) : "—", tag: "not recovered", tone: "text-muted-foreground" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
                <p className={`mt-2 font-display text-2xl font-semibold ${k.tone}`}>{k.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{k.tag}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-medium">Recovery funnel</p>
              <div className="mt-4">
                <RecoveryFunnel
                  steps={[
                    { label: "Revenue at risk", value: live.atRisk, kind: "risk" },
                    { label: "Eligible for recovery", value: detectedFunnel.estimatedRecovery, kind: "estimate" },
                    { label: "Recovery attempted", value: live.attempted, kind: "attempt" },
                    { label: "Successfully recovered", value: phase === "measured" ? live.recovered : 0, kind: "actual" },
                    { label: "Still outstanding", value: phase === "measured" ? live.outstanding : live.atRisk, kind: "outstanding" },
                  ]}
                />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-medium">Outcome tracking</p>
              <table className="mt-3 w-full text-sm">
                <tbody className="divide-y divide-border">
                  {outcomes.map((o) => (
                    <tr key={o.outcome}>
                      <td className="py-2.5"><OutcomePill outcome={o.outcome} /></td>
                      <td className="py-2.5 text-right font-medium">{phase === "measured" ? o.count : "—"}</td>
                      <td className="py-2.5 text-right text-success">{phase === "measured" && o.value ? inr(o.value) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>
      )}

      {/* 6 — STOP */}
      {phase === "measured" && (
        <Section n={6} title="Stop — workflows the AI shut down itself" note="No endless retries, no repeat messaging, no runaway escalation.">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-sm font-medium"><OctagonX className="size-4 text-warning" /> Stop reasons across the batch</p>
              <table className="mt-3 w-full text-sm">
                <tbody className="divide-y divide-border">
                  {stops.map((s) => (
                    <tr key={s.reason}>
                      <td className="py-2.5">{s.reason}</td>
                      <td className="py-2.5 text-right font-medium">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-warning/40 bg-warning/5 p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-warning"><AlertTriangle className="size-4" /> Human review required</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {live.escalatedCount} events worth {inr(live.escalatedValue)} were refused by automation and handed to finance.
              </p>
              <div className="mt-3 space-y-2.5">
                {review.map((e) => (
                  <div key={e.id} className="rounded-lg border border-border bg-card p-3.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[13.5px] font-medium">{e.customer}</p>
                      <p className="font-display text-base font-semibold text-warning">{inr(e.amount)}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {e.category} · {e.rootCause}{e.daysOverdue ? ` · ${e.daysOverdue} days overdue` : ""} · escalation level {e.escalationLevel}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">AI recommendation: escalate to Finance Manager — {e.rationale}</p>
                    <div className="mt-2.5 flex gap-2">
                      <Button size="sm" className="bg-gold-gradient text-primary-foreground font-semibold" onClick={() => toast.success(`${e.id} assigned to Finance Manager`)}>Assign to finance</Button>
                      <Button size="sm" variant="outline" onClick={() => setSelected(e)}>Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* 7 — AUDIT */}
      {phase === "measured" && (
        <Section n={7} title="Audit trail" note="Every AI-assisted action is attributable and reconstructable.">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    {["Event", "Customer", "At risk", "Root cause", "AI recommendation", "Policy applied", "Approval", "Executed", "Attempts", "Outcome", "Recovered", "Stop reason", "Approved by", "Timestamp"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-[13px]">
                  {resolved.slice(0, 12).map((e) => (
                    <tr key={e.id}>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{e.id}</td>
                      <td className="whitespace-nowrap px-4 py-3">{e.customer}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-destructive">{inr(e.amount)}</td>
                      <td className="whitespace-nowrap px-4 py-3">{e.rootCause}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gold-soft">{e.decision}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">max {3} retries · {e.probability}% ≥ 60% floor</td>
                      <td className="whitespace-nowrap px-4 py-3">{e.decision === "Do not contact" ? "Blocked by policy" : e.decision === "Escalate to human" ? "Pending human" : "Approved"}</td>
                      <td className="whitespace-nowrap px-4 py-3">{e.attempted ? "Yes" : "No"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{e.attempted ? e.attempts + 1 : e.attempts}/{3}</td>
                      <td className="whitespace-nowrap px-4 py-3"><OutcomePill outcome={e.outcome} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-success">{e.recovered ? inr(e.recovered) : "—"}</td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-xs text-muted-foreground">{e.stopReason ?? "Open"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{e.decision === "Do not contact" ? "System policy" : "priya@company.in"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">Today {e.detectedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
              {resolved.length} audit records written for this batch · immutable · exportable for finance reconciliation.
            </p>
          </div>
        </Section>
      )}

      <EventSheet event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function LoopStrip({ phase }: { phase: Phase }) {
  const stages: { key: string; label: string; done: Phase[] }[] = [
    { key: "detect", label: "Detect", done: ["detected", "analysing", "decided", "executing", "measured"] },
    { key: "diagnose", label: "Diagnose", done: ["analysing", "decided", "executing", "measured"] },
    { key: "decide", label: "Decide", done: ["decided", "executing", "measured"] },
    { key: "act", label: "Act", done: ["executing", "measured"] },
    { key: "measure", label: "Measure", done: ["measured"] },
    { key: "stop", label: "Stop", done: ["measured"] },
  ];
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
      {stages.map((s, i) => {
        const active = s.done.includes(phase);
        return (
          <div key={s.key} className="flex items-center gap-2">
            <span className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12.5px] font-medium ${active ? "border-gold/40 bg-gold/10 text-gold" : "border-border text-muted-foreground"}`}>
              {active ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-muted-foreground/50" />}
              {s.label}
            </span>
            {i < stages.length - 1 && <span className="text-muted-foreground">→</span>}
          </div>
        );
      })}
    </div>
  );
}

function Section({ n, title, note, children }: { n: number; title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 animate-rise">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-xs text-gold">STEP {n}</span>
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
      {children}
    </section>
  );
}

function OutcomePill({ outcome }: { outcome: RiskEvent["outcome"] }) {
  const tone: Record<string, string> = {
    Recovered: "border-success/40 bg-success/10 text-success",
    "Partially recovered": "border-success/30 bg-success/5 text-success",
    Pending: "border-gold/30 bg-gold/5 text-gold-soft",
    Failed: "border-destructive/40 bg-destructive/10 text-destructive",
    Expired: "border-border bg-secondary text-muted-foreground",
    Escalated: "border-warning/50 bg-warning/10 text-warning",
    Stopped: "border-border bg-secondary text-muted-foreground",
    "Customer declined": "border-destructive/30 bg-destructive/5 text-destructive",
  };
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tone[outcome]}`}>{outcome}</span>;
}

function EventSheet({ event, onClose }: { event: RiskEvent | null; onClose: () => void }) {
  return (
    <Sheet open={event !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {event && (
          <>
            <SheetHeader>
              <SheetTitle className="font-display">AI recovery decision · {event.id}</SheetTitle>
              <SheetDescription>{event.customer} · {event.category}</SheetDescription>
            </SheetHeader>

            <div className="mt-5 space-y-5 px-4 pb-8 text-sm">
              <dl className="grid grid-cols-2 gap-3">
                {[
                  { k: "Revenue at risk", v: inr(event.amount) },
                  { k: "Root cause", v: event.rootCause },
                  { k: "Recovery probability", v: `${event.probability}%` },
                  { k: "Recommended intervention", v: event.decision },
                  { k: "Expected recovery (modeled)", v: event.expectedRecovery ? inr(event.expectedRecovery) : "—" },
                  { k: "Maximum attempts", v: `${event.maxAttemptsAllowed}` },
                  { k: "Attempts used", v: `${event.attempts}/3` },
                  { k: "Contact attempts used", v: `${event.contactAttempts}/3` },
                  { k: "Escalation level", v: event.escalationLevel === 0 ? "None — blocked" : `Level ${event.escalationLevel}` },
                  { k: "Outcome", v: event.outcome },
                ].map((r) => (
                  <div key={r.k} className="rounded-lg border border-border p-3">
                    <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{r.k}</dt>
                    <dd className="mt-1 font-medium">{r.v}</dd>
                  </div>
                ))}
              </dl>

              <div className="rounded-lg border border-gold/25 bg-gold/5 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold"><Sparkles className="size-3.5" /> Why this intervention</p>
                <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">{event.rationale}</p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-sm font-medium"><Ban className="size-4 text-warning" /> Stopping conditions</p>
                <ul className="mt-2 space-y-1.5 text-[13px] text-muted-foreground">
                  {event.stopConditions.map((s) => <li key={s} className="flex gap-2"><span className="text-gold">·</span>{s}</li>)}
                </ul>
                {event.stopReason && (
                  <p className="mt-3 rounded-lg border border-warning/40 bg-warning/5 p-3 text-[13px] text-warning">
                    Workflow stopped — {event.stopReason}
                  </p>
                )}
              </div>

              <div>
                <p className="flex items-center gap-2 text-sm font-medium"><CircleDollarSign className="size-4 text-gold" /> Recovery timeline</p>
                <ol className="mt-3 space-y-2.5">
                  {timelineFor(event).map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-11 shrink-0 font-mono text-xs text-muted-foreground">{s.t}</span>
                      <span className={`text-[13px] ${s.tone === "success" ? "text-success" : s.tone === "danger" ? "text-destructive" : s.tone === "gold" ? "text-gold-soft" : ""}`}>{s.label}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {event.recovered > 0 && (
                <p className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 p-3 text-[13.5px] font-medium text-success">
                  <Check className="size-4" /> Verified recovered: {inr(event.recovered)}
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
