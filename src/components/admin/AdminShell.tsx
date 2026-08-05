"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Package, Zap, Repeat, Receipt, LineChart } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

const items = [
  // Clients is the panel index, so it has to match exactly or it would light up on
  // every other page — but a client's detail page lives at /admin/clients/:id and
  // is still "Clients", hence the second prefix.
  { to: "/admin", label: "Clients", icon: Users, exact: true, alsoMatches: "/admin/clients" },
  { to: "/admin/plans", label: "Plans", icon: Package },
  { to: "/admin/endpoints", label: "Endpoints", icon: Zap },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: Repeat },
  { to: "/admin/payments", label: "Payments", icon: Receipt },
  { to: "/admin/revenue", label: "Revenue", icon: LineChart },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5 font-display font-semibold">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-destructive/20 font-mono text-[0.625rem] text-destructive">
            AD
          </span>
          Admin panel
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((it) => {
            const active = it.exact
              ? pathname === it.to || (!!it.alsoMatches && pathname.startsWith(it.alsoMatches))
              : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                href={it.to}
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
          <SignOutButton realm="admin" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Same frame as the `main` below, so the bar and the page content share
            one left edge at every width — see the note in PortalShell. */}
        <header className="flex h-14 items-center border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="container-page flex items-center justify-between">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Internal · Admin
            </div>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to site
            </Link>
          </div>
        </header>
        <main className="container-page flex-1 space-y-6 py-6">{children}</main>
      </div>
    </div>
  );
}
