import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { getCoverageRows, getIndexingLag } from "@/lib/public-data";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Status — Tickwise",
  description: "Indexing freshness and lag by chain. Incident notes.",
  openGraph: {
    title: "Tickwise status",
    description: "Live indexing freshness per chain.",
  },
};

/*
 * Stays a server component: this is a marketing page and the rows belong in the
 * HTML. The chain list is a product fact and always renders; the lag beside each
 * servable row is a measurement, so it renders only when there is one.
 *
 * The page's own promise — "we show real indexing lag per chain rather than an
 * uptime number we can't back up" — is the reason it can't fall back to a fixture.
 * It used to print "5 min" and "7 min" from a constant, which is precisely the
 * thing the sentence says the page doesn't do.
 */
export default async function StatusPage() {
  const rows = getCoverageRows();
  const lag = await getIndexingLag();

  return (
    <MarketingShell>
      <div className="container-page py-16">
        {/* Heading takes the reading measure; the panel below spans the whole
            frame. Its rows are chain/lag pairs on a `justify-between`, which is a
            status table — that reads correctly at full width, where a capped
            panel would just leave the right half of the page unaccounted for. */}
        <div className="container-prose">
          <div className="text-xs uppercase tracking-widest text-primary">Status</div>
          <h1 className="mt-2 font-display text-4xl font-semibold">Indexing freshness</h1>
          <p className="mt-2 text-muted-foreground">
            We show real indexing lag per chain rather than an uptime number we can’t back up.
          </p>
        </div>
        <div className="mt-8 overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
          {rows.map((r) => (
            <div
              key={r.chain}
              className="flex items-center justify-between border-b border-border/60 px-6 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                {r.servable ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{r.chain}</span>
              </div>
              <span className="font-mono text-sm text-muted-foreground">
                {r.servable ? (lag?.[r.chain] ?? "lag unavailable") : "indexed, not servable"}
              </span>
            </div>
          ))}
        </div>
        {lag === null && (
          <div className="mt-6 rounded-md border border-warning/40 bg-warning/10 p-4 text-sm text-muted-foreground">
            We can’t reach the indexer from here, so there is no lag figure to show. The chains
            listed above are still the ones we serve — only the freshness numbers are missing.
          </div>
        )}
        <div className="mt-6 rounded-md border border-border/60 bg-surface p-4 text-sm text-muted-foreground">
          No open incidents. Historical incident notes will appear here once we ship the log.
        </div>
      </div>
    </MarketingShell>
  );
}
