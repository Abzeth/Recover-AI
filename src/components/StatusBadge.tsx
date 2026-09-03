import { cn } from "@/lib/utils";
import type { RecoveryStatus } from "@/lib/data";

const styles: Record<RecoveryStatus, string> = {
  New: "border-border bg-secondary text-muted-foreground",
  "AI analysed": "border-gold/40 bg-gold/10 text-gold",
  "Awaiting approval": "border-warning/50 bg-warning/10 text-warning",
  "In progress": "border-gold/30 bg-gold/5 text-gold-soft",
  Recovered: "border-success/40 bg-success/10 text-success",
  Lost: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function StatusBadge({ status, className }: { status: RecoveryStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap", styles[status], className)}>
      {status === "In progress" && <span className="size-1.5 rounded-full bg-gold animate-pulse-gold" />}
      {status}
    </span>
  );
}
