import { createFileRoute } from "@tanstack/react-router";
import { Card } from "./portal.index";
import { QuotaMeter } from "@/components/QuotaMeter";
import { USAGE_MONTHLY, UNIT_COSTS } from "@/lib/mock";

export const Route = createFileRoute("/portal/usage")({
  head: () => ({ meta: [{ title: "Usage — Tickwise portal" }] }),
  component: Usage,
});

function Usage() {
  const max = Math.max(...USAGE_MONTHLY.map((m) => m.units));
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Usage</h1>
      <Card><QuotaMeter /></Card>

      <Card>
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">By month</div>
            <div className="mt-1 font-display text-lg font-semibold">Last 6 months</div>
          </div>
          <div className="text-xs text-muted-foreground">Aggregate only — we don’t capture per-request data today.</div>
        </div>
        <div className="flex h-48 items-end gap-3">
          {USAGE_MONTHLY.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full flex-1 rounded-t-md bg-gradient-primary shadow-glow" style={{ height: `${(m.units / max) * 100}%`, minHeight: 4 }} />
              <div className="text-xs text-muted-foreground">{m.month}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{Math.round(m.units / 1000)}k</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Per-endpoint unit cost</div>
        <table className="mt-3 w-full text-sm">
          <tbody className="divide-y divide-border/60">
            {UNIT_COSTS.map((u) => (
              <tr key={u.endpoint}>
                <td className="py-2 font-mono text-xs">{u.endpoint}</td>
                <td className="py-2 text-right font-mono">{u.units}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
