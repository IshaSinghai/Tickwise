"use client";

import { EmptyState, InlineError, SkeletonRows } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { getAdminPayments } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

/*
 * The payment ledger, from GET /admin/payments through lib/api.
 *
 * Reconciliation is a write and the endpoint is backend-planned, so both
 * Reconcile buttons say what they need. Reporting "reconciled" against a stub
 * would be the payments-side version of the fake "confirmed" §4.2 forbids on the
 * checkout return page, and this is the ledger it would be lying about.
 */
const NEEDS_ADMIN_API = "Reconciliation needs the admin API, which isn’t wired up yet.";

export function AdminPayments() {
  const { status, data, error, retry } = useAsync(
    (signal) => getAdminPayments(signal),
    "Could not load payments.",
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Payments</h1>
        <Button variant="outline" onClick={() => toast.error(NEEDS_ADMIN_API)}>
          Reconcile
        </Button>
      </div>

      {status === "error" ? (
        <InlineError message={error} onRetry={retry} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead className="text-left text-[0.625rem] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Tx</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            {status === "ready" && data.length > 0 && (
              <tbody className="divide-y divide-border/60">
                {data.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono text-xs">{p.date}</td>
                    <td className="px-4 py-3 font-mono">${p.amount}</td>
                    <td className="px-4 py-3">{p.plan}</td>
                    <td className="px-4 py-3 text-muted-foreground">crypto · ETH</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{p.tx}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[0.625rem] text-success">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.error(NEEDS_ADMIN_API)}
                      >
                        Manual reconcile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {status === "loading" && (
            <div className="px-4">
              <SkeletonRows rows={4} lines={1} />
            </div>
          )}

          {status === "ready" && data.length === 0 && (
            <EmptyState
              title="No payments recorded"
              body="Confirmed on-chain payments appear here as soon as the processor reports them."
            />
          )}
        </div>
      )}
    </div>
  );
}
