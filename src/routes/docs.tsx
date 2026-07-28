import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { MarketingShell } from "@/components/marketing/MarketingShell";

const nav = [
  { section: "Getting started", items: [
    ["/docs", "Overview"],
    ["/docs/quickstart", "Quickstart"],
    ["/docs/authentication", "Authentication"],
    ["/docs/units-and-limits", "Units & limits"],
  ]},
  { section: "Endpoints", items: [
    ["/docs/endpoints/positions", "Positions"],
    ["/docs/endpoints/pools", "Pools"],
    ["/docs/endpoints/metadata", "Metadata"],
  ]},
  { section: "Reference", items: [
    ["/docs/errors", "Errors"],
    ["/docs/coverage", "Coverage"],
  ]},
];

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — CopyPools API" },
      { name: "description", content: "Quickstart, authentication, endpoint reference and error codes for the CopyPools API." },
      { property: "og:title", content: "CopyPools docs" },
      { property: "og:description", content: "Ship in five minutes. Every endpoint documented with real examples." },
    ],
  }),
  component: DocsLayout,
});

function DocsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <MarketingShell>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-6">
            {nav.map((g) => (
              <div key={g.section}>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{g.section}</div>
                <ul className="space-y-0.5">
                  {g.items.map(([to, label]) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className={`block rounded-md px-2 py-1 text-sm ${
                          pathname === to ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"
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
        <article className="min-w-0 max-w-3xl">
          <Outlet />
        </article>
      </div>
    </MarketingShell>
  );
}
