import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { getPublicChangelog } from "@/lib/public-data";
import { EmptyState } from "@/components/DataState";

export const metadata: Metadata = {
  title: "Changelog — Tickwise",
  description: "API changes, new chains, new endpoints.",
  openGraph: {
    title: "Tickwise changelog",
    description: "What shipped, when.",
  },
};

export default async function ChangelogPage() {
  const entries = await getPublicChangelog();

  return (
    <MarketingShell>
      <div className="container-page py-16">
        <div className="container-narrow">
          <div className="text-xs uppercase tracking-widest text-primary">Changelog</div>
          <h1 className="mt-2 font-display text-4xl font-semibold">What shipped</h1>
          {entries.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title="Nothing shipped yet"
                body="Changes will be listed here as we ship them."
              />
            </div>
          ) : (
            <ol className="mt-10 space-y-8 border-l border-border/60 pl-6">
              {entries.map((e) => (
                <li key={e.date} className="relative">
                  <span className="absolute -left-[1.8125rem] top-1.5 h-2 w-2 rounded-full bg-gradient-primary shadow-glow" />
                  <div className="font-mono text-xs text-muted-foreground">{e.date}</div>
                  <div className="mt-1 font-display text-xl font-semibold">{e.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{e.body}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </MarketingShell>
  );
}
