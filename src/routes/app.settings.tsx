import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { auditLog } from "@/lib/data";
import { inr } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Approvals & Security — RecoverAI" },
      { name: "description", content: "Configure approval thresholds, channel permissions and review the full recovery audit trail." },
      { property: "og:title", content: "Approvals & Security — RecoverAI" },
      { property: "og:description", content: "Approval thresholds, channel permissions and audit trail." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

const toggles = [
  { id: "retry", label: "Allow AI to propose payment retries", hint: "Proposals only — execution still needs approval." },
  { id: "discount", label: "Allow discount offers in plans", hint: "Capped at 10% of cart value." },
  { id: "whatsapp", label: "WhatsApp & SMS outreach", hint: "Uses your registered business sender." },
  { id: "auto", label: "Auto-execute below threshold", hint: "Off by default. Keeps zero unapproved charges." },
];

function SettingsPage() {
  const [on, setOn] = useState<Record<string, boolean>>({ retry: true, discount: true, whatsapp: true, auto: false });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Approvals & security" sub="The AI proposes. You approve. Every action is logged, attributable and reversible." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold">AI permissions</h2>
          <div className="mt-4 space-y-4">
            {toggles.map((t) => (
              <div key={t.id} className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={t.id} className="text-[13.5px]">{t.label}</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.hint}</p>
                </div>
                <Switch
                  id={t.id}
                  checked={on[t.id] ?? false}
                  onCheckedChange={(v) => { setOn((s) => ({ ...s, [t.id]: v })); toast.success(`${t.label}: ${v ? "enabled" : "disabled"}`); }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-semibold">Approval thresholds</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="single">Single action requires approval above</Label>
              <Input id="single" defaultValue="₹1,000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="batch">Batch value requires dual approval above</Label>
              <Input id="batch" defaultValue="₹50,000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="approver">Secondary approver</Label>
              <Input id="approver" defaultValue="arjun@company.in" />
            </div>
            <Button onClick={() => toast.success("Approval policy saved")} className="bg-gold-gradient text-primary-foreground font-semibold shadow-gold hover:opacity-90">
              Save policy
            </Button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-gold" /> Role-based access · PCI-safe tokens only · no raw card data stored
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold">Audit trail</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/40">
              <tr>
                {["When", "Actor", "Action", "Target", "Amount", "Outcome"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLog.map((a) => (
                <tr key={a.id} className="text-[13.5px]">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{a.at}</td>
                  <td className="whitespace-nowrap px-4 py-3">{a.actor}</td>
                  <td className="whitespace-nowrap px-4 py-3">{a.action}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{a.target}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gold">{a.amount ? inr(a.amount) : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">{a.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
