import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PAYMENTS } from "@/lib/mock";

export const Route = createFileRoute("/admin/payments")({
  component: () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Payments</h1>
        <Button variant="outline">Reconcile</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border/60"><th className="px-4 py-3">Date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Tx</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {PAYMENTS.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-xs">{p.date}</td>
                <td className="px-4 py-3 font-mono">${p.amount}</td>
                <td className="px-4 py-3">{p.plan}</td>
                <td className="px-4 py-3 text-muted-foreground">crypto · ETH</td>
                <td className="px-4 py-3 font-mono text-xs text-primary">{p.tx}</td>
                <td className="px-4 py-3"><span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] text-success">{p.status}</span></td>
                <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm">Manual reconcile</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
});
