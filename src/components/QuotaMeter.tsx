import Link from "next/link";

export type QuotaUsage = { planQuota: number; used: number; resetOn: string };

/**
 * Formats the reset date in UTC explicitly.
 *
 * §4.4 requires the label to say the quota resets on the 1st of the month, UTC —
 * not on the subscription anniversary. Without `timeZone: "UTC"` a customer west
 * of Greenwich would see "31 Jul" for a 1 Aug 00:00Z reset, which is precisely
 * the confusion the spec is guarding against. The date it replaces was a
 * hardcoded "1 Aug".
 */
function formatReset(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/*
 * Presentational. The usage figures arrive as a prop rather than being imported
 * from the mock module, so the meter renders whatever the caller fetched through
 * lib/api — and the caller owns the loading and error states.
 */
export function QuotaMeter({ usage, compact = false }: { usage: QuotaUsage; compact?: boolean }) {
  const pct = usage.planQuota > 0 ? Math.min(100, (usage.used / usage.planQuota) * 100) : 0;
  const tone = pct > 90 ? "bg-destructive" : pct > 70 ? "bg-warning" : "bg-gradient-primary";
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Units this month
          </div>
          <div className="mt-1 font-display text-2xl font-semibold">
            {usage.used.toLocaleString()}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              / {usage.planQuota.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          Resets {formatReset(usage.resetOn)} · UTC
          <div>
            {/* §4.4's second honesty constraint: different endpoints cost
                different numbers of units, so the meter must link to the unit
                table or it reads as a request count. */}
            <Link href="/docs/units-and-limits" className="text-primary hover:underline">
              What’s a unit?
            </Link>
          </div>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div className={`h-full ${tone} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
