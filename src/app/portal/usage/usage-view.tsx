"use client";

import { Card } from "@/components/portal/Card";
import { QuotaMeter } from "@/components/QuotaMeter";
import { EmptyState, InlineError, SkeletonBlock } from "@/components/DataState";
import { getAccountUsage, type UsageResponse } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

/*
 * Monthly bars and a unit-cost table, and nothing finer.
 *
 * §8 forbids a daily or per-endpoint usage chart because usage is stored as one
 * aggregate row per customer per month — anything more granular would be invented.
 * The note in the panel header states that limitation to the customer rather than
 * leaving them to infer it.
 */
export function Usage() {
  const { status, data, error, retry } = useAsync<UsageResponse>(
    (signal) => getAccountUsage(signal),
    "Could not load your usage.",
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Usage</h1>

      {status === "error" ? (
        <InlineError message={error} onRetry={retry} />
      ) : status === "loading" ? (
        <>
          <Card>
            <SkeletonBlock className="h-20" />
          </Card>
          <Card>
            <SkeletonBlock className="h-48" />
          </Card>
          <Card>
            <SkeletonBlock className="h-32" />
          </Card>
        </>
      ) : (
        <Populated data={data} />
      )}
    </div>
  );
}

function Populated({ data }: { data: UsageResponse }) {
  const { monthly, current, unitCosts } = data;
  const max = monthly.length > 0 ? Math.max(...monthly.map((m) => m.units)) : 0;

  return (
    <>
      <Card>
        <QuotaMeter usage={current} />
      </Card>

      <Card>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">By month</div>
            <div className="mt-1 font-display text-lg font-semibold">Last 6 months</div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            Aggregate only — we don’t capture per-request data today.
          </div>
        </div>
        {monthly.length === 0 ? (
          <EmptyState
            title="No usage recorded yet"
            body="Your first metered request will show up here after the month it lands in."
          />
        ) : (
          <div className="flex h-48 items-end gap-3">
            {monthly.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full flex-1 rounded-t-md bg-gradient-primary shadow-glow"
                  style={{ height: max > 0 ? `${(m.units / max) * 100}%` : "4px", minHeight: 4 }}
                />
                <div className="text-xs text-muted-foreground">{m.month}</div>
                <div className="font-mono text-[0.625rem] text-muted-foreground">
                  {Math.round(m.units / 1000)}k
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Per-endpoint unit cost
        </div>
        {unitCosts.length === 0 ? (
          <EmptyState title="Unit costs unavailable" body="Try again in a moment." />
        ) : (
          <table className="mt-3 w-full text-sm">
            <tbody className="divide-y divide-border/60">
              {unitCosts.map((u) => (
                <tr key={u.endpoint}>
                  <td className="py-2 font-mono text-xs">{u.endpoint}</td>
                  <td className="py-2 text-right font-mono">{u.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
