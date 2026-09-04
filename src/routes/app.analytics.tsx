import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { agingBuckets, channelPerformance, failureBreakdown, recoveryTrend } from "@/lib/data";
import { inr, pct } from "@/lib/format";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [
      { title: "Recovery Analytics — RecoverAI" },
      { name: "description", content: "Channel success rates, failure causes and receivables aging across your recovery programme." },
      { property: "og:title", content: "Recovery Analytics — RecoverAI" },
      { property: "og:description", content: "Channel success rates and failure-cause analytics." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 } as const;

function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Recovery analytics" sub="What the AI learns from every approved plan — and where the next rupee is hiding." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Recovery rate", value: pct(62) },
          { label: "Recovered (30d)", value: inr(1184000) },
          { label: "Best channel", value: "Payment retry · 68%" },
          { label: "Avg time to recover", value: "7.4 hrs" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</p>
            <p className="mt-2 font-display text-xl font-semibold text-gold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Channel success rate">
          <BarChart data={channelPerformance}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="channel" fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-muted-foreground" />
            <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-muted-foreground" unit="%" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="success" radius={[6, 6, 0, 0]}>
              {channelPerformance.map((c) => (
                <Cell key={c.channel} fill={c.success >= 60 ? "var(--gold)" : c.success >= 40 ? "var(--gold-soft)" : "var(--gold-dim)"} />
              ))}
            </Bar>
          </BarChart>
        </Panel>

        <Panel title="Failure causes by value">
          <BarChart data={failureBreakdown} layout="vertical">
            <CartesianGrid stroke="var(--border)" horizontal={false} />
            <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
            <YAxis type="category" dataKey="reason" width={130} fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-muted-foreground" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => inr(Number(v))} />
            <Bar dataKey="value" fill="var(--gold)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </Panel>

        <Panel title="Recovered value trend">
          <LineChart data={recoveryTrend}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-muted-foreground" />
            <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => inr(Number(v))} />
            <Line type="monotone" dataKey="recovered" stroke="var(--gold)" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="atRisk" stroke="var(--destructive)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </Panel>

        <Panel title="Receivables aging">
          <BarChart data={agingBuckets}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="bucket" fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-muted-foreground" />
            <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-muted-foreground" tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => inr(Number(v))} />
            <Bar dataKey="amount" fill="var(--gold-soft)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  );
}
