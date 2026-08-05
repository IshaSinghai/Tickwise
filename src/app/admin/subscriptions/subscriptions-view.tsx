"use client";

import { EmptyState, InlineError, SkeletonRows } from "@/components/DataState";
import { getAdminSubscriptions, type AdminSubscriptionsResponse } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

/*
 * Subscriptions, from GET /admin/subscriptions through lib/api.
 *
 * The three header stats used to be literals ("$4,782", "$57,384", "98") sitting
 * beside a generated table, so the summary and the rows could disagree without
 * anyone noticing. They come from the same response now.
 */
export function AdminSubscriptions() {
  const { status, data, error, retry } = useAsync<AdminSubscriptionsResponse>(
    (signal) => getAdminSubscriptions(signal),
    "Could not load subscriptions.",
  );

  const summary = data?.summary;
  const rows = data?.subscriptions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Subscriptions</h1>
        {summary && (
          <div className="flex gap-6">
            <Stat label="MRR" value={`$${summary.mrr.toLocaleString()}`} />
            <Stat label="ARR" value={`$${summary.arr.toLocaleString()}`} />
            <Stat label="Active" value={String(summary.active)} />
          </div>
        )}
      </div>

      {status === "error" ? (
        <InlineError message={error} onRetry={retry} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead className="text-left text-[0.625rem] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-4 py-3">Sub id</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Period ends</th>
              </tr>
            </thead>
            {status === "ready" && rows.length > 0 && (
              <tbody className="divide-y divide-border/60">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{r.id}</td>
                    <td className="px-4 py-3">{r.client}</td>
                    <td className="px-4 py-3">{r.plan}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[0.625rem] ${r.status === "active" ? "border-success/40 bg-success/10 text-success" : r.status === "grace" ? "border-warning/40 bg-warning/10 text-warning" : "border-border/60 bg-surface-2 text-muted-foreground"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {r.periodEnd}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {status === "loading" && (
            <div className="px-4">
              <SkeletonRows rows={5} lines={1} />
            </div>
          )}

          {status === "ready" && rows.length === 0 && (
            <EmptyState
              title="No subscriptions yet"
              body="Every account is on the free tier — a subscription appears here once a checkout confirms."
            />
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.625rem] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-semibold">{value}</div>
    </div>
  );
}
