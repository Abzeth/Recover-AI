import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, Prob, Td, Th } from "@/components/ModulePage";
import { StatusBadge } from "@/components/StatusBadge";
import { subscriptions } from "@/lib/data";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/app/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscription Recovery — RecoverAI" },
      { name: "description", content: "Churn risk, failed billing cycles and AI dunning plans for at-risk subscriptions." },
      { property: "og:title", content: "Subscription Recovery — RecoverAI" },
      { property: "og:description", content: "Churn risk and AI dunning plans for at-risk subscriptions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const mrr = subscriptions.reduce((a, s) => a + s.mrr, 0);
  return (
    <ModulePage
      title="Subscription recovery"
      sub="Failed billing cycles become churn unless the AI intervenes with the right sequence at the right hour."
      planKey="subs"
      stats={[
        { label: "At-risk subscriptions", value: "18" },
        { label: "MRR exposed", value: inr(mrr) },
        { label: "Avg churn risk", value: "70%" },
        { label: "Awaiting approval", value: "1 plan" },
      ]}
    >
      <table className="w-full">
        <thead className="border-b border-border bg-secondary/40">
          <tr>
            <Th>Customer</Th><Th>Plan</Th><Th>MRR</Th><Th>Cycle failures</Th>
            <Th>Churn risk</Th><Th>State</Th><Th>Next retry</Th><Th>AI recommends</Th><Th>Status</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {subscriptions.map((s) => (
            <tr key={s.id} className="transition-colors hover:bg-secondary/30">
              <Td className="font-medium">{s.customer}</Td>
              <Td className="text-muted-foreground">{s.plan}</Td>
              <Td className="font-medium text-gold">{inr(s.mrr)}</Td>
              <Td className="text-muted-foreground">{s.cycleFailures}</Td>
              <Td><Prob value={100 - s.churnRisk} /></Td>
              <Td>{s.state}</Td>
              <Td className="text-muted-foreground">{s.nextRetry}</Td>
              <Td className="text-gold-soft">{s.recommended}</Td>
              <Td><StatusBadge status={s.status} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModulePage>
  );
}
