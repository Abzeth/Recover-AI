import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, Prob, Td, Th } from "@/components/ModulePage";
import { StatusBadge } from "@/components/StatusBadge";
import { agingBuckets, invoices } from "@/lib/data";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/app/receivables")({
  head: () => ({
    meta: [
      { title: "Receivables — RecoverAI" },
      { name: "description", content: "Overdue invoices by aging bucket with AI-prioritised collection sequences." },
      { property: "og:title", content: "Receivables — RecoverAI" },
      { property: "og:description", content: "AI-prioritised collection sequences for overdue invoices." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReceivablesPage,
});

function ReceivablesPage() {
  const total = invoices.reduce((a, i) => a + i.amount, 0);
  return (
    <ModulePage
      title="Receivables recovery"
      sub="Aging invoices ranked by collectability, not by age — so effort goes where money actually returns."
      planKey="receivables"
      stats={[
        { label: "Open invoices", value: "24" },
        { label: "Outstanding", value: inr(total) },
        { label: "Oldest bucket", value: `90+ · ${inr(agingBuckets[3]!.amount)}` },
        { label: "Awaiting approval", value: "1 plan" },
      ]}
    >
      <table className="w-full">
        <thead className="border-b border-border bg-secondary/40">
          <tr>
            <Th>Invoice</Th><Th>Customer</Th><Th>Amount</Th><Th>Overdue</Th>
            <Th>Bucket</Th><Th>Collection probability</Th><Th>AI recommends</Th><Th>Status</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invoices.map((i) => (
            <tr key={i.id} className="transition-colors hover:bg-secondary/30">
              <Td className="font-mono text-xs">{i.id}</Td>
              <Td>
                <span className="font-medium">{i.customer}</span>
                <span className="block text-xs text-muted-foreground">{i.contact}</span>
              </Td>
              <Td className="font-medium text-gold">{inr(i.amount)}</Td>
              <Td className="text-muted-foreground">{i.dueDays} days</Td>
              <Td>{i.bucket}</Td>
              <Td><Prob value={i.probability} /></Td>
              <Td className="text-gold-soft">{i.recommended}</Td>
              <Td><StatusBadge status={i.status} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModulePage>
  );
}
