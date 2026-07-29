import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { STATUS_ROWS } from "@/lib/mock";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/status")({
  head: () => ({ meta: [{ title: "Status — Tickwise" }, { name: "description", content: "Indexing freshness and lag by chain. Incident notes." }, { property: "og:title", content: "Tickwise status" }, { property: "og:description", content: "Live indexing freshness per chain." }] }),
  component: () => (
    <MarketingShell>
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-xs uppercase tracking-widest text-primary">Status</div>
        <h1 className="mt-2 font-display text-4xl font-semibold">Indexing freshness</h1>
        <p className="mt-2 text-muted-foreground">We show real indexing lag per chain rather than an uptime number we can’t back up.</p>
        <div className="mt-8 overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
          {STATUS_ROWS.map((r) => (
            <div key={r.chain} className="flex items-center justify-between border-b border-border/60 px-6 py-4 last:border-b-0">
              <div className="flex items-center gap-3">
                {r.state === "ok" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-muted-foreground" />}
                <span className="font-medium">{r.chain}</span>
              </div>
              <span className="font-mono text-sm text-muted-foreground">{r.lag}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-md border border-border/60 bg-surface p-4 text-sm text-muted-foreground">
          No open incidents. Historical incident notes will appear here once we ship the log.
        </div>
      </div>
    </MarketingShell>
  ),
});
