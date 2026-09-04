import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, Prob, Td, Th } from "@/components/ModulePage";
import { StatusBadge } from "@/components/StatusBadge";
import { failedPayments } from "@/lib/data";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/app/failed-payments")({
  head: () => ({
    meta: [
      { title: "Failed Payments — RecoverAI" },
      { name: "description", content: "AI-clustered failed payments with retry probability and recommended recovery channel." },
      { property: "og:title", content: "Failed Payments — RecoverAI" },
      { property: "og:description", content: "Retry probability and recommended recovery channel per failure." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FailedPaymentsPage,
});

function FailedPaymentsPage() {
  const atRisk = failedPayments.reduce((a, p) => a + p.amount, 0);
  return (
    <ModulePage
      title="Failed payments"
      sub="Every decline clustered by cause, scored for retry success, and mapped to the cheapest winning channel."
      planKey="failed"
      stats={[
        { label: "Failures (24h)", value: "37" },
        { label: "Value at risk", value: inr(atRisk) },
        { label: "Avg retry probability", value: "64%" },
        { label: "Awaiting approval", value: "2 plans" },
      ]}
    >
      <table className="w-full">
        <thead className="border-b border-border bg-secondary/40">
          <tr>
            <Th>Customer</Th><Th>Amount</Th><Th>Method</Th><Th>Reason</Th><Th>Attempts</Th>
            <Th>Failed</Th><Th>Retry probability</Th><Th>AI recommends</Th><Th>Status</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {failedPayments.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-secondary/30">
              <Td>
                <span className="font-medium">{p.customer}</span>
                <span className="block text-xs text-muted-foreground">{p.email}</span>
              </Td>
              <Td className="font-medium text-gold">{inr(p.amount)}</Td>
              <Td className="text-muted-foreground">{p.method}</Td>
              <Td>{p.reason}</Td>
              <Td className="text-muted-foreground">{p.attempts}</Td>
              <Td className="text-muted-foreground">{p.failedAt}</Td>
              <Td><Prob value={p.probability} /></Td>
              <Td className="text-gold-soft">{p.recommended}</Td>
              <Td><StatusBadge status={p.status} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModulePage>
  );
}
