import { createFileRoute } from "@tanstack/react-router";
import { ModulePage, Prob, Td, Th } from "@/components/ModulePage";
import { StatusBadge } from "@/components/StatusBadge";
import { abandonedCheckouts } from "@/lib/data";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/app/checkouts")({
  head: () => ({
    meta: [
      { title: "Checkout Recovery — RecoverAI" },
      { name: "description", content: "Abandoned checkouts with AI cause analysis and the recovery nudge most likely to convert." },
      { property: "og:title", content: "Checkout Recovery — RecoverAI" },
      { property: "og:description", content: "AI cause analysis for every abandoned cart." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutsPage,
});

function CheckoutsPage() {
  const value = abandonedCheckouts.reduce((a, c) => a + c.cartValue, 0);
  return (
    <ModulePage
      title="Checkout recovery"
      sub="AI reads drop-off stage and behaviour to decide who needs a nudge, a link, or a discount."
      planKey="checkout"
      stats={[
        { label: "Abandoned (24h)", value: "312" },
        { label: "Cart value at risk", value: inr(value) },
        { label: "Top cause", value: "Payment friction" },
        { label: "Awaiting approval", value: "1 plan" },
      ]}
    >
      <table className="w-full">
        <thead className="border-b border-border bg-secondary/40">
          <tr>
            <Th>Customer</Th><Th>Cart value</Th><Th>Drop-off stage</Th><Th>AI cause</Th>
            <Th>Abandoned</Th><Th>Recovery probability</Th><Th>AI recommends</Th><Th>Status</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {abandonedCheckouts.map((c) => (
            <tr key={c.id} className="transition-colors hover:bg-secondary/30">
              <Td>
                <span className="font-medium">{c.customer}</span>
                <span className="block text-xs text-muted-foreground">{c.email}</span>
              </Td>
              <Td className="font-medium text-gold">{inr(c.cartValue)}</Td>
              <Td>{c.stage}</Td>
              <Td>{c.cause}</Td>
              <Td className="text-muted-foreground">{c.minutesAgo} min ago</Td>
              <Td><Prob value={c.probability} /></Td>
              <Td className="text-gold-soft">{c.recommended}</Td>
              <Td><StatusBadge status={c.status} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModulePage>
  );
}
