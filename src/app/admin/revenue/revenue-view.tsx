"use client";

import { EmptyState, InlineError, SkeletonBlock } from "@/components/DataState";
import { getAdminRevenue, type AdminRevenue } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

/*
 * Revenue, from GET /admin/revenue through lib/api.
 *
 * The three KPIs and both panels were literals in the JSX — "$4,782", "+12%", a
 * bar series generated from `2500 + i * 350`. They come from the endpoint's
 * response now, which is what makes the loading and error states below reachable
 * rather than decorative.
 */
export function AdminRevenueView() {
  const { status, data, error, retry } = useAsync<AdminRevenue>(
    (signal) => getAdminRevenue(signal),
    "Could not load revenue.",
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Revenue</h1>

      {status === "error" ? (
        <InlineError message={error} onRetry={retry} />
      ) : status === "loading" ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <SkeletonBlock key={i} className="h-24" />
            ))}
          </div>
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-56" />
        </>
      ) : (
        <Populated data={data} />
      )}
    </div>
  );
}

function Populated({ data }: { data: AdminRevenue }) {
  const { kpis, monthly, byPlan } = data;
  const max = monthly.length > 0 ? Math.max(...monthly.map((d) => d.paid + d.pending)) : 0;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label="MRR" value={`$${kpis.mrr.toLocaleString()}`} delta={kpis.mrrDelta} />
        <Kpi label="New this month" value={String(kpis.newThisMonth)} delta={kpis.newDelta} />
        <Kpi label="Churned" value={String(kpis.churned)} delta={kpis.churnedDelta} negative />
      </div>

      <div className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
        <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
          Monthly · paid vs pending
        </div>
        {monthly.length === 0 ? (
          <EmptyState
            title="No revenue recorded yet"
            body="Months appear here once a payment confirms in them."
          />
        ) : (
          <div className="flex h-48 items-end gap-3">
            {monthly.map((d) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="flex w-full flex-col"
                  style={{ height: max > 0 ? `${((d.paid + d.pending) / max) * 100}%` : "4px" }}
                >
                  <div
                    className="w-full flex-1 rounded-t-md bg-warning/50"
                    title={`Pending ${d.pending}`}
                    style={{ flexGrow: d.pending }}
                  />
                  <div className="w-full flex-1 bg-gradient-primary" style={{ flexGrow: d.paid }} />
                </div>
                <div className="text-xs text-muted-foreground">{d.month}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
        <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">By plan</div>
        {byPlan.length === 0 ? (
          <EmptyState title="No paid plans" body="Only the free tier is in use right now." />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-[0.625rem] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="py-2">Plan</th>
                <th className="py-2">Active subs</th>
                <th className="py-2">MRR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {byPlan.map((p) => (
                <tr key={p.planId}>
                  <td className="py-3">{p.name}</td>
                  <td className="py-3 font-mono">{p.activeSubs}</td>
                  <td className="py-3 font-mono">${p.mrr.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function Kpi({
  label,
  value,
  delta,
  negative,
}: {
  label: string;
  value: string;
  delta: string;
  negative?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="font-display text-2xl font-semibold">{value}</div>
        <div className={`text-xs ${negative ? "text-destructive" : "text-success"}`}>{delta}</div>
      </div>
    </div>
  );
}
