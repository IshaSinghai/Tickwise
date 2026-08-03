import Link from "next/link";
import { CURRENT_USAGE } from "@/lib/mock";

export function QuotaMeter({ compact = false }: { compact?: boolean }) {
  const pct = Math.min(100, (CURRENT_USAGE.used / CURRENT_USAGE.planQuota) * 100);
  const tone = pct > 90 ? "bg-destructive" : pct > 70 ? "bg-warning" : "bg-gradient-primary";
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Units this month
          </div>
          <div className="mt-1 font-display text-2xl font-semibold">
            {CURRENT_USAGE.used.toLocaleString()}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              / {CURRENT_USAGE.planQuota.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          Resets 1 Aug · UTC
          <div>
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
