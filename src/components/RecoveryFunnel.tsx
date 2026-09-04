import { inr } from "@/lib/format";

export function RecoveryFunnel({
  steps,
}: {
  steps: { label: string; value: number; kind: "risk" | "estimate" | "attempt" | "actual" | "outstanding" }[];
}) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  const tone: Record<string, string> = {
    risk: "from-destructive/70 to-destructive/30",
    estimate: "from-gold-dim to-gold-dim/40",
    attempt: "from-gold/80 to-gold/30",
    actual: "from-success/80 to-success/30",
    outstanding: "from-muted-foreground/50 to-muted-foreground/20",
  };
  const labelTag: Record<string, string> = {
    estimate: "modeled estimate",
    attempt: "verified attempts",
    actual: "verified recovered",
    risk: "detected exposure",
    outstanding: "not recovered",
  };

  return (
    <div className="space-y-2.5">
      {steps.map((s) => (
        <div key={s.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium">{s.label}</span>
            <span className="font-display text-base font-semibold">{inr(s.value)}</span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-secondary">
            <div className={`h-full rounded-full bg-gradient-to-r ${tone[s.kind]}`} style={{ width: `${Math.max(4, (s.value / max) * 100)}%` }} />
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{labelTag[s.kind]}</p>
        </div>
      ))}
    </div>
  );
}
