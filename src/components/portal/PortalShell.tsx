"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KeyRound,
  Gauge,
  CreditCard,
  Settings,
  PlayCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LifecycleBanner } from "@/components/LifecycleBanner";

const items = [
  { to: "/portal", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/portal/keys", label: "API keys", icon: KeyRound },
  { to: "/portal/usage", label: "Usage", icon: Gauge },
  { to: "/portal/billing", label: "Billing", icon: CreditCard },
  { to: "/portal/playground", label: "Playground", icon: PlayCircle },
  { to: "/portal/settings", label: "Settings", icon: Settings },
];

export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5 font-display font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground shadow-glow">
            <span className="font-mono text-xs">TW</span>
          </span>
          <span>Tickwise</span>
          <span className="ml-1 rounded-md border border-sidebar-border bg-background/40 px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Dex API
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
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
          <div className="mb-2 px-2 text-xs text-sidebar-foreground/60">
            signed in as
            <div className="truncate font-mono text-sidebar-foreground">alex@doryoku.io</div>
          </div>
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link href="/login">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Link>
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border/60 bg-background/70 px-6 backdrop-blur-xl">
          <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link> <span className="mx-1">/</span>{" "}
            <span className="text-foreground">Portal</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface px-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Starter
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-6">
          <LifecycleBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
