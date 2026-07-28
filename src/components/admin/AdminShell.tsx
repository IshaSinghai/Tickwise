import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Users, Package, Zap, Repeat, Receipt, LineChart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin", label: "Clients", icon: Users, exact: true },
  { to: "/admin/plans", label: "Plans", icon: Package },
  { to: "/admin/endpoints", label: "Endpoints", icon: Zap },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: Repeat },
  { to: "/admin/payments", label: "Payments", icon: Receipt },
  { to: "/admin/revenue", label: "Revenue", icon: LineChart },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5 font-display font-semibold">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-destructive/20 font-mono text-[10px] text-destructive">
            AD
          </span>
          Admin panel
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link to="/admin/login">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Link>
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border/60 bg-background/70 px-6 backdrop-blur-xl">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Internal · Admin</div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6">{children}</main>
      </div>
    </div>
  );
}
