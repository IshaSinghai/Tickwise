import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — CopyPools" }, { name: "description", content: "Common issues, error codes, escalation path." }, { property: "og:title", content: "CopyPools support" }, { property: "og:description", content: "How to get help." }] }),
  component: () => (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-xs uppercase tracking-widest text-primary">Support</div>
        <h1 className="mt-2 font-display text-4xl font-semibold">Help centre</h1>
        <p className="mt-2 text-muted-foreground">Ninety percent of tickets are one of these five things. Check them first — you’ll be unblocked faster.</p>
        <ul className="mt-10 space-y-3">
          {[
            ["401 · missing or invalid key", "You forgot the KC-APIKey header, or the key was revoked."],
            ["403 · server_key_from_browser", "You used a server key from a browser. Create a browser key with allowed origins."],
            ["403 · origin_not_allowed", "The Origin sending the request isn’t in the key’s allowed_origins."],
            ["429 · rate", "Too many requests per second. See rate limits on your plan."],
            ["429 · quota", "You’ve exhausted your monthly units. Upgrade or wait for the 1st, UTC."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-xl border border-border/60 bg-surface p-4">
              <div className="font-mono text-sm">{t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{d}</div>
            </li>
          ))}
        </ul>
        <div className="mt-10 rounded-2xl border border-primary/40 bg-primary/5 p-6">
          <div className="font-display text-lg font-semibold">Still stuck?</div>
          <p className="mt-1 text-sm text-muted-foreground">Send us the request id from the response headers and we’ll trace it.</p>
          <Link to="/contact" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Contact support →</Link>
        </div>
      </div>
    </MarketingShell>
  ),
});
