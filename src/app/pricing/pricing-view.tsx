"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import type { Plan, UnitCost } from "@/lib/mock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

/*
 * The plan catalog and the unit table arrive as props from the server component
 * that owns this route's metadata — see the note in page.tsx. This view keeps only
 * the billing-cycle toggle, which is what it needed to be a client component for.
 */
export function Pricing({ plans, unitCosts }: { plans: Plan[]; unitCosts: UnitCost[] }) {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  return (
    <MarketingShell>
      <section className="container-page pt-20 pb-10 text-center">
        <div className="text-xs uppercase tracking-widest text-primary">Pricing</div>
        <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">
          One API. Four price points.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Metered by units. Different endpoints cost different amounts — see the unit table below.
          Quotas reset the 1st of each month, UTC.
        </p>
        <div className="mt-8 inline-flex rounded-full border border-border/60 bg-surface p-1 text-sm">
          {(["monthly", "annual"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                cycle === c
                  ? "bg-gradient-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {c === "monthly" ? "Monthly" : "Annual · save 16%"}
            </button>
          ))}
        </div>
      </section>

      {/* One gap at every width. An earlier revision widened it at 2xl because
          content kept growing to 1760px there and the four cards were reading as
          stretched; content now caps at 1440px and the gap scales with the root
          font size, so the cards land ~5% wider than at 1280 in proportional
          terms and there is nothing left to compensate for. */}
      <section className="container-page grid gap-4 pb-16 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`relative flex flex-col rounded-2xl border p-6 shadow-card ${
              p.featured
                ? "border-primary/60 bg-surface shadow-glow"
                : "border-border/60 bg-surface"
            }`}
          >
            {p.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-primary-foreground">
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
              {cycle === "annual" && p.annualPrice > 0
                ? `Billed $${p.annualPrice}/yr`
                : "Billed monthly"}
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
            <Button
              asChild
              className={`mt-6 ${p.featured ? "bg-gradient-primary" : ""}`}
              variant={p.featured ? "default" : "outline"}
            >
              <Link href={`/signup?plan=${p.id}`}>{p.cta}</Link>
            </Button>
          </div>
        ))}
      </section>

      {/* Spans the full frame so its panel edges line up with the plan cards
          above it, which is the alignment the three-different-max-widths version
          of this page never had. */}
      <section className="container-page py-10">
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
              {unitCosts.map((u) => (
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

      {/* Centred rather than left-aligned like the other narrow blocks in the
          site: this section's heading is `text-center`, so centring is the
          existing design intent here, not a spacing accident. */}
      <section className="container-page py-16">
        <div className="container-narrow mx-auto">
          <h2 className="mb-6 text-center font-display text-3xl font-semibold">Frequently asked</h2>
          <Accordion type="single" collapsible>
            {[
              [
                "How do I pay?",
                "Crypto only, on a hosted checkout page. USDC on Ethereum by default. We never touch your wallet — you pay to a one-time address and we confirm on-chain.",
              ],
              [
                "What happens when I hit my quota?",
                "Requests over quota return 429 with a clear reason header. Your keys keep working next month or as soon as you upgrade — nothing is destroyed.",
              ],
              [
                "Do you rate-limit per key or per account?",
                "Rate limits are per account. Quota is per account. Keys are just credentials.",
              ],
              [
                "Can I cancel any time?",
                "Yes. Your plan runs to the end of the current period and then drops to Free. Keys keep working at free-tier limits.",
              ],
              [
                "Is there an SLA?",
                "Not yet. We won’t claim uptime numbers we can’t back up. See the status page for indexing lag.",
              ],
            ].map(([q, a], i) => (
              <AccordionItem value={`i${i}`} key={q}>
                <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
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
