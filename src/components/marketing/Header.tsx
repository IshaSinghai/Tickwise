import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { to: "/pricing", label: "Pricing" },
  { to: "/docs", label: "Docs" },
  { to: "/explore", label: "Explore" },
  { to: "/status", label: "Status" },
  { to: "/changelog", label: "Changelog" },
];

export function MarketingHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground shadow-glow">
            <span className="font-mono text-xs">CP</span>
          </span>
          <span>Tickwise</span>
          <span className="ml-1 rounded-md border border-border/60 bg-surface px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            API
          </span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to))
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-primary shadow-glow">
            <Link to="/signup">Get an API key</Link>
          </Button>
        </div>
        <button
          className="ml-auto rounded-md p-2 text-muted-foreground md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-surface hover:text-foreground">
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 px-1">
              <Button asChild variant="outline" className="flex-1"><Link to="/login">Sign in</Link></Button>
              <Button asChild className="flex-1 bg-gradient-primary"><Link to="/signup">Get key</Link></Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
