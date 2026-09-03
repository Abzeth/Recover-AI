import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import {
  CreditCard, ShoppingCart, Repeat, FileText, Sparkles, BarChart3, ShieldCheck,
  ArrowRight, Command, Check, Search, Brain, MousePointerClick, LineChart,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RecoverAI — Recover the revenue you're losing. Automatically." },
      { name: "description", content: "AI finds your failed payments, abandoned checkouts, subscription churn and overdue invoices, explains why revenue is at risk, and proposes recovery plans you approve." },
      { property: "og:title", content: "RecoverAI — Your AI-powered revenue recovery engine" },
      { property: "og:description", content: "₹4.82L at risk found automatically. AI diagnoses the cause, drafts a plan, and waits for your approval before any charge." },
    ],
  }),
  component: Landing,
});

const modules = [
  { icon: CreditCard, title: "Failed payment recovery", body: "Every decline is classified — insufficient funds, issuer decline, expired card, auth failure — and matched to the retry window that actually converts.", stat: "68% retry success" },
  { icon: ShoppingCart, title: "Checkout recovery", body: "See exactly where carts die: payment friction, price hesitation or OTP failure. Each cohort gets its own nudge on its own clock.", stat: "312 carts triaged" },
  { icon: Repeat, title: "Subscription recovery", body: "Separates involuntary churn from real cancellations, then runs dunning cadences before an account lapses instead of after.", stat: "₹72.3K MRR saved" },
  { icon: FileText, title: "Receivables automation", body: "Ageing buckets, escalation ladders and one-click payment links, prioritised by amount and prior payment behaviour.", stat: "6 days faster" },
];

const how = [
  { icon: Search, step: "01", title: "Connect & detect", body: "RecoverAI ingests payment, checkout, subscription and invoice events, and continuously flags revenue at risk." },
  { icon: Brain, step: "02", title: "Diagnose & quantify", body: "The AI explains why each rupee is at risk, scores recovery probability, and tells you how much is realistically collectable." },
  { icon: MousePointerClick, step: "03", title: "Approve the plan", body: "You get a staged recovery plan with evidence, risks and the exact financial action. Nothing executes until you approve." },
  { icon: LineChart, step: "04", title: "Measure what worked", body: "Every action is attributed back to recovered revenue, per channel, per cohort, in a full audit trail." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5">
          <Logo />
          <nav className="ml-10 hidden items-center gap-7 text-[13.5px] text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#modules" className="hover:text-foreground transition-colors">Modules</a>
            <a href="#ai" className="hover:text-foreground transition-colors">AI Command Center</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm" className="bg-gold-gradient text-primary-foreground font-semibold shadow-gold hover:opacity-90">
              <Link to="/app">Start Recovering Revenue</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid-gold opacity-60" aria-hidden />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--gold), transparent)" }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[12px] text-gold">
              <Sparkles className="size-3.5" /> Your AI-powered revenue recovery engine
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Recover the revenue<br />you're losing.{" "}
              <span className="text-gold-gradient">Automatically.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">
              RecoverAI uses AI to identify failed payments, abandoned checkouts, subscription churn, and
              overdue receivables, then turns them into actionable recovery opportunities — with a human
              approval gate on every financial action.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold-gradient text-primary-foreground font-semibold shadow-gold hover:opacity-90">
                <Link to="/app">Start Recovering Revenue <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/app">View Demo</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-[12.5px] text-muted-foreground">
              {["No code required", "Approval-gated actions", "Full audit trail"].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><Check className="size-3.5 text-gold" /> {t}</span>
              ))}
            </div>
          </div>

          {/* Hero product visual */}
          <div className="card-surface p-5 animate-rise" style={{ animationDelay: "120ms" }}>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-gold animate-pulse-gold" /> Live recovery monitor
              </div>
              <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">⌘K</span>
            </div>
            <div className="pt-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Revenue at risk</p>
              <p className="font-display text-4xl font-bold text-gold-gradient">{inr(482000)}</p>
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/40 p-3">
                  <Sparkles className="size-4 shrink-0 text-gold" />
                  <p className="text-[13px]">AI identified <span className="font-semibold text-foreground">37 opportunities</span> across 4 modules</p>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg border border-gold/25 bg-gold/5 p-3">
                  <BarChart3 className="size-4 shrink-0 text-gold" />
                  <p className="text-[13px]">Estimated recovery <span className="font-semibold text-gold">₹61,400</span> this cycle</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { r: "Insufficient funds", v: 11 },
                  { r: "Bank decline", v: 8 },
                  { r: "Expired card", v: 6 },
                ].map((f) => (
                  <div key={f.r} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-[12px] text-muted-foreground">{f.r}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-gold-gradient" style={{ width: `${(f.v / 11) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-[12px] text-muted-foreground">{f.v}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-5 w-full bg-gold-gradient text-primary-foreground font-semibold hover:opacity-90">
                <Link to="/app">Review AI Plan</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight">How it works</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Four steps from silent revenue leakage to money back in the account — with you in control of the last one.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {how.map((s) => (
            <div key={s.step} className="card-surface p-5">
              <div className="flex items-center justify-between">
                <s.icon className="size-5 text-gold" />
                <span className="font-mono text-xs text-gold-dim">{s.step}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{s.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Four recovery engines, one workspace</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {modules.map((m) => (
              <div key={m.title} className="card-surface p-6">
                <div className="flex size-10 items-center justify-center rounded-lg border border-gold/25 bg-gold/8">
                  <m.icon className="size-5 text-gold" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{m.body}</p>
                <p className="mt-4 inline-flex rounded-full border border-gold/25 bg-gold/5 px-2.5 py-0.5 text-[11.5px] font-medium text-gold">{m.stat}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Command Center */}
      <section id="ai" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[12px] text-gold">
              <Command className="size-3.5" /> AI Command Center
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight">
              You don't analyse hundreds of failures. The AI already did.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Hit ⌘K anywhere and ask for a recovery plan. The AI shows its reasoning, quantifies what's
              collectable, drafts the exact sequence of retries and messages — then stops and waits for you.
              Recommendation and execution are deliberately separate.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "What revenue is at risk, right now",
                "Why it's at risk, with evidence per cohort",
                "How much is realistically recoverable",
                "What to do, in what order, on what timing",
                "What actually happened after you approved",
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-surface overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
              <Search className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Why did payments fail this week?</span>
            </div>
            <div className="space-y-2 p-4 font-mono text-[12.5px] text-muted-foreground">
              <p><span className="text-gold">▸</span> Reading 37 failed payment events…</p>
              <p><span className="text-gold">▸</span> Clustering by decline code and issuer…</p>
              <p><span className="text-gold">▸</span> 11 map to insufficient funds — salary-cycle correlated.</p>
              <p><span className="text-gold">▸</span> Drafting staged plan with approval gate.</p>
            </div>
            <div className="border-t border-border bg-secondary/30 p-4">
              <p className="text-[13px]">
                <span className="font-semibold text-foreground">Plan ready.</span>{" "}
                <span className="text-muted-foreground">5 actions · est. recovery </span>
                <span className="font-semibold text-gold">₹61,400</span>
              </p>
              <div className="mt-3 flex gap-2">
                <span className="rounded-md bg-gold-gradient px-3 py-1.5 text-xs font-semibold text-primary-foreground">Approve &amp; execute</span>
                <span className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">Reject</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex items-center gap-2.5 text-gold">
            <ShieldCheck className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Security &amp; controls</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">AI recommends. Humans authorise money.</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: "Approval gate on every charge", b: "No retry, message or credit is executed without an explicit operator approval, recorded with actor and timestamp." },
              { t: "Separated recommendation & execution", b: "The AI layer can propose. Only the execution service, called after approval, can move money." },
              { t: "Complete audit trail", b: "Every plan, approval, rejection and outcome is logged immutably for finance and compliance review." },
              { t: "Least-privilege access", b: "Role-based permissions split analysts who review from approvers who authorise financial action." },
              { t: "Validated inputs, rate limits", b: "All API inputs are schema-validated and rate limited; retries respect issuer risk thresholds." },
              { t: "Secrets stay server-side", b: "Payment credentials live in server-side environment configuration and are never exposed to the browser." },
            ].map((c) => (
              <div key={c.t} className="card-surface p-5">
                <h3 className="text-[14.5px] font-semibold">{c.t}</h3>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-24 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Stop writing off revenue you could still collect.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          Open the demo workspace and watch the AI find ₹4.82L at risk — then wait for your approval before touching a rupee.
        </p>
        <Button asChild size="lg" className="mt-8 bg-gold-gradient text-primary-foreground font-semibold shadow-gold hover:opacity-90">
          <Link to="/app">Start Recovering Revenue <ArrowRight className="size-4" /></Link>
        </Button>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-8 text-xs text-muted-foreground">
          <Logo size={26} />
          <span className="ml-auto">Turn failed payments into recovered revenue.</span>
          <span>© {new Date().getFullYear()} RecoverAI · Demo product</span>
        </div>
      </footer>
    </div>
  );
}
