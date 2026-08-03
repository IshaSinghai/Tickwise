import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/portal/Card";
import { PAYMENTS } from "@/lib/mock";
import { Button } from "@/components/ui/button";

function Billing() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Billing</h1>
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Current plan
            </div>
            <div className="mt-1 font-display text-2xl font-semibold">Starter · $49/mo</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Renews 1 Aug 2026 · UTC. Crypto payment, hosted checkout.
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/portal/billing/plans">Change plan</Link>
            </Button>
            <Button className="bg-gradient-primary">Pay renewal</Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
          Payment history
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="py-2">Date</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Tx</th>
              <th className="py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {PAYMENTS.map((p) => (
              <tr key={p.id}>
                <td className="py-3 font-mono text-xs">{p.date}</td>
                <td className="py-3">{p.plan}</td>
                <td className="py-3 font-mono">${p.amount}</td>
                <td className="py-3 font-mono text-xs text-primary">{p.tx}</td>
                <td className="py-3 text-right">
                  <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] text-success">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Billing — Tickwise portal",
};

export default function BillingPage() {
  return <Billing />;
}
