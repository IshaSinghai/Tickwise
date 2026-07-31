import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/portal/Card";
import { QuotaMeter } from "@/components/QuotaMeter";
import { MOCK_KEYS, PAYMENTS } from "@/lib/mock";
import { ArrowRight, KeyRound } from "lucide-react";

function PortalOverview() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Overview</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <QuotaMeter />
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Plan</div>
          <div className="mt-1 font-display text-2xl font-semibold">Starter</div>
          <div className="mt-1 text-xs text-muted-foreground">$49/mo · renews 1 Aug</div>
          <Link href="/portal/billing" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">Manage billing <ArrowRight className="h-3 w-3" /></Link>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">API keys</div>
            <div className="mt-1 font-display text-xl font-semibold">{MOCK_KEYS.length} active</div>
          </div>
          <Link href="/portal/keys" className="text-sm text-primary hover:underline">Manage →</Link>
        </div>
        <ul className="mt-4 divide-y divide-border/60">
          {MOCK_KEYS.map((k) => (
            <li key={k.id} className="flex items-center gap-3 py-3">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm">{k.label}</div>
                <div className="font-mono text-xs text-muted-foreground">{k.prefix}…</div>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] ${k.type === "server" ? "border-primary/40 bg-primary/10 text-primary" : "border-warning/40 bg-warning/10 text-warning"}`}>{k.type}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Last payment</div>
        <div className="mt-1 font-display text-xl font-semibold">${PAYMENTS[0].amount} · {PAYMENTS[0].date}</div>
        <div className="mt-1 font-mono text-xs text-muted-foreground">tx {PAYMENTS[0].tx}</div>
      </Card>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Overview — Tickwise portal",
};

export default function PortalOverviewPage() {
  return <PortalOverview />;
}
