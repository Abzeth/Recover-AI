import { useEffect, useState, type ReactNode } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { AiPlanSheet } from "./AiPlanSheet";
import { recoveryPlans, type PlanKey } from "@/lib/ai-engine";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard, CreditCard, ShoppingCart, Repeat, FileText, BarChart3, Settings,
  Sparkles, Search, Bell, ChevronDown, LogOut, Play, ShieldCheck, Command as CommandIcon,
} from "lucide-react";

const nav = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/failed-payments", label: "Failed Payments", icon: CreditCard, exact: false },
  { to: "/app/checkouts", label: "Checkout Recovery", icon: ShoppingCart, exact: false },
  { to: "/app/subscriptions", label: "Subscriptions", icon: Repeat, exact: false },
  { to: "/app/receivables", label: "Receivables", icon: FileText, exact: false },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3, exact: false },
  { to: "/app/settings", label: "Settings", icon: Settings, exact: false },
] as const;


export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [planKey, setPlanKey] = useState<PlanKey | null>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const aiAction = (key: PlanKey) => {
    setPaletteOpen(false);
    setPlanKey(key);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Logo size={30} />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                  active ? "bg-sidebar-accent text-gold" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="mt-6 rounded-xl border border-gold/25 bg-gold/5 p-3.5">
            <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="size-3.5" /> AI standing by
            </div>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              ₹4.82L at risk. 37 opportunities found. Press <kbd className="rounded border border-border bg-secondary px-1 font-mono text-[10px]">⌘K</kbd> to act.
            </p>
            <button
              onClick={() => setPlanKey("failed")}
              className="mt-2.5 w-full rounded-md bg-gold-gradient px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-gold hover:opacity-90 transition-opacity"
            >
              Review AI plan
            </button>
          </div>
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => { toast("Signed out of demo workspace"); navigate({ to: "/auth" }); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="lg:hidden"><Logo size={28} withWord={false} /></div>
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 w-full max-w-md items-center gap-2.5 rounded-lg border border-input bg-secondary/60 px-3 text-sm text-muted-foreground hover:border-gold/40 transition-colors"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">Ask AI or search…</span>
            <span className="hidden items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] sm:flex">
              <CommandIcon className="size-3" />K
            </span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => toast.info("3 new AI findings", { description: "2 failed-payment clusters and 1 churn spike since yesterday." })}
              className="relative flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-gold" />
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border py-1.5 pl-1.5 pr-2.5 hover:border-gold/40 transition-colors">
              <span className="flex size-6 items-center justify-center rounded-md bg-gold-gradient text-[11px] font-bold text-primary-foreground">P</span>
              <span className="hidden text-[13px] font-medium sm:block">Priya Sharma</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
          RecoverAI demo workspace · AI proposes, you approve — no financial action executes without sign-off.
        </footer>
      </div>

      {/* ⌘K AI Command Center */}
      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Ask RecoverAI, or pick an action…" />
        <CommandList>
          <CommandEmpty>
            <div className="py-2 text-sm text-muted-foreground">
              No direct match — the AI can still analyse this. Try "why did payments fail this week?".
            </div>
          </CommandEmpty>
          <CommandGroup heading="AI actions — approval required before execution">
            {(["failed", "checkout", "subs", "receivables"] as PlanKey[]).map((key) => (
              <CommandItem key={key} onSelect={() => aiAction(key)} className="gap-2.5">
                <Sparkles className="size-4 text-gold" />
                <span>{recoveryPlans[key]!.subject}</span>
                <CommandShortcut>AI</CommandShortcut>
              </CommandItem>
            ))}
            <CommandItem onSelect={() => { setPaletteOpen(false); toast.success("Simulation started", { description: "Demo: AI would run a dry-run across all modules here." }); }} className="gap-2.5">
              <Play className="size-4 text-gold" /> Run full recovery simulation (dry-run)
            </CommandItem>
            <CommandItem onSelect={() => { setPaletteOpen(false); navigate({ to: "/app/settings" }); }} className="gap-2.5">
              <ShieldCheck className="size-4 text-gold" /> Review approval & security settings
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigate">
            {nav.map((item) => (
              <CommandItem key={item.to} onSelect={() => { setPaletteOpen(false); navigate({ to: item.to }); }} className="gap-2.5">
                <item.icon className="size-4 text-muted-foreground" /> {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {planKey && (
        <AiPlanSheet
          planKey={planKey}
          plan={recoveryPlans[planKey]!}
          open={planKey !== null}
          onOpenChange={(o) => !o && setPlanKey(null)}
        />
      )}
    </div>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
