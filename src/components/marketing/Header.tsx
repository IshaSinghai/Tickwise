"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const nav = [
  { to: "/pricing", label: "Pricing" },
  { to: "/docs", label: "Docs" },
  { to: "/explore", label: "Explore" },
  { to: "/status", label: "Status" },
  { to: "/changelog", label: "Changelog" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "border-b border-border/60 bg-background/60 backdrop-blur-2xl shadow-card"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center gap-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground shadow-glow transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
            <span className="font-mono text-xs">TW</span>
          </span>
          <span className="transition-colors group-hover:text-primary-glow">Tickwise</span>
          <span className="ml-1 rounded-md border border-border/60 bg-surface/70 px-1.5 py-0.5 font-sans text-[0.625rem] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur">
            Dex API
          </span>
        </Link>
        {/*
         * Desktop bar switches in at lg, not md. Its contents need ~795px and a
         * 768px viewport only offers ~710px inside the gutters, so at md the logo
         * badge wrapped to two lines and "Get an API key" was clipped off the
         * right edge — visible in the pre-change screenshots too, since px-6 only
         * ever gave it 720px. Holding the mobile menu to 1024 is what makes the
         * 768–1023 band fit; the alternative was shaving 85px out of the nav's
         * own spacing, which would have cost more than it bought.
         */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                href={n.to}
                className={`group relative rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
                <span
                  className={`pointer-events-none absolute inset-x-3 -bottom-0.5 h-px origin-left bg-gradient-primary transition-transform duration-500 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="transition-colors hover:bg-surface/60"
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="group relative overflow-hidden bg-gradient-primary shadow-glow transition-transform duration-300 hover:scale-[1.03]"
          >
            <Link href="/signup">
              <span className="relative z-10">Get an API key</span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
          </Button>
        </div>
        <button
          className="ml-auto rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background/90 backdrop-blur-2xl lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                href={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 px-1">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="flex-1 bg-gradient-primary">
                <Link href="/signup">Get key</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
