import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { PLANS, UNIT_COSTS } from "@/lib/mock";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Tickwise Dex API" },
      { name: "description", content: "Simple monthly plans. Metered by units, not by request. Every plan uses the same endpoints." },
      { property: "og:title", content: "Tickwise pricing" },
      { property: "og:description", content: "Free, Starter, Growth, Scale. Pay in crypto. No surprise overage." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-10 text-center">
        <div className="text-xs uppercase tracking-widest text-primary">Pricing</div>
        <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">
          One API. Four price points.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Metered by units. Different endpoints cost different amounts — see the unit table below. Quotas reset the 1st of each month, UTC.
        </p>
        <div className="mt-8 inline-flex rounded-full border border-border/60 bg-surface p-1 text-sm">
          {(["monthly", "annual"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                cycle === c ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {c === "monthly" ? "Monthly" : "Annual · save 16%"}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-16 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`relative flex flex-col rounded-2xl border p-6 shadow-card ${
              p.featured ? "border-primary/60 bg-surface shadow-glow" : "border-border/60 bg-surface"
            }`}
          >
            {p.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
                Most popular
              </div>
            )}
            <div className="font-display text-lg font-semibold">{p.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold">
                ${cycle === "annual" ? Math.round(p.annualPrice / 12) : p.monthlyPrice}
              </span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {cycle === "annual" && p.annualPrice > 0 ? `Billed $${p.annualPrice}/yr` : "Billed monthly"}
            </div>
            <div className="mt-5 space-y-1 border-y border-border/60 py-4 text-sm">
              <Row label="Units / month" value={p.quota.toLocaleString()} />
              <Row label="Rate limit" value={p.rateLimit} />
              <Row label="API keys" value={String(p.maxKeys)} />
              <Row label="Browser keys" value={p.allowBrowserKeys ? "Yes" : "No"} />
            </div>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className={`mt-6 ${p.featured ? "bg-gradient-primary" : ""}`} variant={p.featured ? "default" : "outline"}>
              <Link to="/signup" search={{ plan: p.id } as never}>{p.cta}</Link>
            </Button>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-border/60 bg-surface shadow-card">
          <div className="border-b border-border/60 p-6">
            <div className="text-xs uppercase tracking-widest text-primary">Unit costs</div>
            <h2 className="mt-1 font-display text-2xl font-semibold">What each endpoint costs</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A “unit” is our metering token. Simple lists are cheap, computed responses cost more.
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-3 font-medium">Endpoint</th>
                <th className="px-6 py-3 font-medium">Units</th>
                <th className="px-6 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {UNIT_COSTS.map((u) => (
                <tr key={u.endpoint}>
                  <td className="px-6 py-3 font-mono text-xs">{u.endpoint}</td>
                  <td className="px-6 py-3 font-mono">{u.units}</td>
                  <td className="px-6 py-3 text-muted-foreground">{u.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-6 text-center font-display text-3xl font-semibold">Frequently asked</h2>
        <Accordion type="single" collapsible>
          {[
            ["How do I pay?", "Crypto only, on a hosted checkout page. USDC on Ethereum by default. We never touch your wallet — you pay to a one-time address and we confirm on-chain."],
            ["What happens when I hit my quota?", "Requests over quota return 429 with a clear reason header. Your keys keep working next month or as soon as you upgrade — nothing is destroyed."],
            ["Do you rate-limit per key or per account?", "Rate limits are per account. Quota is per account. Keys are just credentials."],
            ["Can I cancel any time?", "Yes. Your plan runs to the end of the current period and then drops to Free. Keys keep working at free-tier limits."],
            ["Is there an SLA?", "Not yet. We won’t claim uptime numbers we can’t back up. See the status page for indexing lag."],
          ].map(([q, a], i) => (
            <AccordionItem value={`i${i}`} key={q}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </MarketingShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
