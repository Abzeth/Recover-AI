import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — RecoverAI" },
      { name: "description", content: "Sign in to your RecoverAI workspace to review AI recovery plans and approve revenue recovery actions." },
      { property: "og:title", content: "Sign in — RecoverAI" },
      { property: "og:description", content: "Access your AI revenue recovery workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      toast.success(mode === "signin" ? "Welcome back, Priya" : "Workspace created");
      navigate({ to: "/app" });
    }, 900);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card/40 p-10 lg:flex">
        <div className="absolute inset-0 bg-grid-gold opacity-50" aria-hidden />
        <div className="relative"><Logo /></div>
        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-[12px] text-gold">
            <Sparkles className="size-3.5" /> Live in your workspace
          </span>
          <p className="mt-5 font-display text-2xl font-semibold leading-snug">
            "The AI already found the problem, explained it, and built the recovery plan. I just approve."
          </p>
          <p className="mt-3 text-sm text-muted-foreground">— Head of Finance Ops, subscription commerce</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { k: "₹4.82L", v: "at risk detected" },
              { k: "68%", v: "retry success" },
              { k: "0", v: "unapproved charges" },
            ].map((s) => (
              <div key={s.k}>
                <p className="font-display text-xl font-semibold text-gold">{s.k}</p>
                <p className="text-[12px] text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-gold" /> Role-based approvals · full audit trail
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm animate-rise">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Sign in to RecoverAI" : "Create your workspace"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "signin" ? "Demo workspace — any credentials will do." : "Start with the pre-loaded demo dataset."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Northloop Commerce" required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" defaultValue="priya@company.in" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="demo-password" required />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-gold-gradient text-primary-foreground font-semibold shadow-gold hover:opacity-90">
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create workspace"}
            </Button>
          </form>

          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            {mode === "signin" ? "No workspace yet? " : "Already have one? "}
            <button className="text-gold hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">← Back to site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
