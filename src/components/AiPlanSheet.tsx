import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { reasoningTraces, type RecoveryPlan } from "@/lib/ai-engine";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import { Sparkles, ShieldAlert, Check, X, Loader2, BadgeCheck, CircleDollarSign } from "lucide-react";

type Phase = "thinking" | "plan" | "executing" | "done" | "rejected";

export function AiPlanSheet({
  planKey,
  plan,
  open,
  onOpenChange,
  onExecuted,
}: {
  planKey: keyof typeof reasoningTraces;
  plan: RecoveryPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecuted?: (outcome: "approved" | "rejected") => void;
}) {
  const [phase, setPhase] = useState<Phase>("thinking");
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lines = useMemo(() => reasoningTraces[planKey] ?? [], [planKey]);

  useEffect(() => {
    if (!open) return;
    setPhase("thinking");
    setVisibleLines(0);
    setProgress(0);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    lines.forEach((_, i) => {
      timers.current.push(setTimeout(() => setVisibleLines(i + 1), 420 * (i + 1)));
    });
    timers.current.push(setTimeout(() => setPhase("plan"), 420 * (lines.length + 1)));
    return () => timers.current.forEach(clearTimeout);
  }, [open, lines]);

  function execute() {
    setPhase("executing");
    setProgress(0);
    const step = 100 / plan.steps.length;
    plan.steps.forEach((_, i) => {
      timers.current.push(setTimeout(() => setProgress(Math.round(step * (i + 1))), 500 * (i + 1)));
    });
    timers.current.push(
      setTimeout(() => {
        setPhase("done");
        toast.success("Recovery plan executed", {
          description: `${plan.steps.length} actions scheduled. Estimated recovery ${inr(plan.estimatedRecovery)}.`,
        });
        onExecuted?.("approved");
      }, 500 * (plan.steps.length + 1))
    );
  }

  function reject() {
    setPhase("rejected");
    toast("Plan rejected", { description: "No financial action was taken. The plan was logged to the audit trail." });
    onExecuted?.("rejected");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl bg-popover border-l-border p-0 flex flex-col">
        <SheetHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-2 text-gold">
            <Sparkles className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">AI recovery plan</span>
          </div>
          <SheetTitle className="font-display text-xl">{plan.subject}</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Nothing is charged or sent until you approve. Confidence {plan.confidence}%.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 px-6 py-6">
            {/* Reasoning trace */}
            <div className="rounded-lg border border-border bg-secondary/50 p-4 font-mono text-[12.5px] leading-6">
              {lines.slice(0, visibleLines).map((line, i) => (
                <p key={i} className="text-muted-foreground animate-rise">
                  <span className="text-gold">▸</span> {line}
                </p>
              ))}
              {phase === "thinking" && (
                <p className="text-gold flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" /> analysing…
                </p>
              )}
            </div>

            {phase !== "thinking" && (
              <div className="space-y-6 animate-rise">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Diagnosis</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{plan.diagnosis}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">At risk</p>
                    <p className="font-display text-lg font-semibold text-destructive">{inr(plan.atRisk)}</p>
                  </div>
                  <div className="rounded-lg border border-gold/30 bg-gold/5 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Est. recovery</p>
                    <p className="font-display text-lg font-semibold text-gold">{inr(plan.estimatedRecovery)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Evidence</h4>
                  <ul className="space-y-1.5">
                    {plan.evidence.map((e, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <BadgeCheck className="size-4 shrink-0 text-gold mt-0.5" /> {e}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Planned actions</h4>
                  <ol className="space-y-3">
                    {plan.steps.map((s) => (
                      <li key={s.order} className="flex gap-3 rounded-lg border border-border p-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold text-xs font-semibold">
                          {s.order}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">{s.channel}</span>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">{s.timing}</Badge>
                          </div>
                          <p className="mt-1 text-[13px] text-muted-foreground">{s.detail}</p>
                        </div>
                        {phase === "executing" && progress >= (100 / plan.steps.length) * s.order && (
                          <Check className="ml-auto size-4 shrink-0 text-success" />
                        )}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <div className="flex items-center gap-2 text-warning text-sm font-medium mb-1.5">
                    <ShieldAlert className="size-4" /> Risks & guardrails
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[13px] text-muted-foreground">
                    {plan.risks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>

                <div className="rounded-lg border border-gold/30 bg-gold/5 p-4 flex gap-3">
                  <CircleDollarSign className="size-5 shrink-0 text-gold" />
                  <div>
                    <p className="text-sm font-medium">Financial action on approval</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{plan.financialAction}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border px-6 py-4">
          {phase === "plan" && (
            <div className="flex gap-3">
              <Button className="flex-1 bg-gold-gradient text-primary-foreground font-semibold shadow-gold hover:opacity-90" onClick={execute}>
                <Check className="size-4" /> Approve & execute
              </Button>
              <Button variant="outline" className="flex-1" onClick={reject}>
                <X className="size-4" /> Reject
              </Button>
            </div>
          )}
          {phase === "executing" && (
            <div>
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-2"><Loader2 className="size-3.5 animate-spin text-gold" /> Executing approved actions…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gold-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {phase === "done" && (
            <div className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 px-4 py-3 animate-rise">
              <span className="flex size-8 items-center justify-center rounded-full bg-success text-success-foreground"><Check className="size-4" /></span>
              <div>
                <p className="text-sm font-semibold text-success">Plan executed</p>
                <p className="text-xs text-muted-foreground">Actions are live. Results stream into the dashboard and audit log.</p>
              </div>
            </div>
          )}
          {phase === "rejected" && (
            <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"><X className="size-4" /></span>
              <p className="text-sm text-muted-foreground">Rejected — no charges or messages were sent.</p>
            </div>
          )}
          {phase === "thinking" && (
            <p className="text-center text-xs text-muted-foreground">The AI is analysing before proposing anything.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
