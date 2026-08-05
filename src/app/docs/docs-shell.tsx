"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";

const nav = [
  {
    section: "Getting started",
    items: [
      ["/docs", "Overview"],
      ["/docs/quickstart", "Quickstart"],
      ["/docs/authentication", "Authentication"],
      ["/docs/units-and-limits", "Units & limits"],
    ],
  },
  {
    section: "Endpoints",
    items: [
      ["/docs/endpoints/positions", "Positions"],
      ["/docs/endpoints/pools", "Pools"],
      ["/docs/endpoints/metadata", "Metadata"],
    ],
  },
  {
    section: "Reference",
    items: [
      ["/docs/errors", "Errors"],
      ["/docs/coverage", "Coverage"],
    ],
  },
];

export function DocsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <MarketingShell>
      <div className="container-page grid gap-8 py-10 md:grid-cols-[13.75rem_1fr]">
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-6">
            {nav.map((g) => (
              <div key={g.section}>
                <div className="mb-2 text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  {g.section}
                </div>
                <ul className="space-y-0.5">
                  {g.items.map(([to, label]) => (
                    <li key={to}>
                      <Link
                        href={to}
                        className={`block rounded-md px-2 py-1 text-sm ${
                          pathname === to
                            ? "bg-surface text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        <article className="container-prose min-w-0">{children}</article>
      </div>
    </MarketingShell>
  );
}
