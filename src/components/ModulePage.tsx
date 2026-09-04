import { useState, type ReactNode } from "react";
import { PageHeader } from "./AppShell";
import { AiPlanSheet } from "./AiPlanSheet";
import { recoveryPlans, type PlanKey } from "@/lib/ai-engine";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function ModulePage({
  title,
  sub,
  planKey,
  stats,
  children,
}: {
  title: string;
  sub: string;
  planKey: PlanKey;
  stats: { label: string; value: string }[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const plan = recoveryPlans[planKey]!;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={title} sub={sub}>
        <Button onClick={() => setOpen(true)} className="bg-gold-gradient text-primary-foreground font-semibold shadow-gold hover:opacity-90">
          <Sparkles className="size-4" /> Ask AI to build recovery plan
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-xl font-semibold text-gold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">{children}</div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        AI recovery estimate for this module: <span className="text-gold">{inr(plan.estimatedRecovery)}</span> · confidence {plan.confidence}% · approval required before any charge.
      </p>

      <AiPlanSheet planKey={planKey} plan={plan} open={open} onOpenChange={setOpen} />
    </div>
  );
}

export function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${className}`}>{children}</th>;
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 text-[13.5px] ${className}`}>{children}</td>;
}

export function Prob({ value }: { value: number }) {
  const tone = value >= 65 ? "text-success" : value >= 45 ? "text-warning" : "text-destructive";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-secondary">
        <span className="block h-full rounded-full bg-gold-gradient" style={{ width: `${value}%` }} />
      </span>
      <span className={`text-xs font-medium ${tone}`}>{value}%</span>
    </span>
  );
}
