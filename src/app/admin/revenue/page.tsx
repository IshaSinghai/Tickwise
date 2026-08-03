import { PLANS } from "@/lib/mock";

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

export default function AdminRevenuePage() {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const data = months.map((m, i) => ({ m, paid: 2500 + i * 350, pending: 400 + i * 80 }));
  const max = Math.max(...data.map((d) => d.paid + d.pending));
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Revenue</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label="MRR" value="$4,782" delta="+12%" />
        <Kpi label="New this month" value="8" delta="+3" />
        <Kpi label="Churned" value="2" delta="-1" negative />
      </div>
      <div className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
        <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
          Monthly · paid vs pending
        </div>
        <div className="flex h-48 items-end gap-3">
          {data.map((d) => (
            <div key={d.m} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="flex w-full flex-col"
                style={{ height: `${((d.paid + d.pending) / max) * 100}%` }}
              >
                <div
                  className="w-full flex-1 rounded-t-md bg-warning/50"
                  title={`Pending ${d.pending}`}
                  style={{ flexGrow: d.pending }}
                />
                <div className="w-full flex-1 bg-gradient-primary" style={{ flexGrow: d.paid }} />
              </div>
              <div className="text-xs text-muted-foreground">{d.m}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
        <div className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">By plan</div>
        <table className="w-full text-sm">
          <thead className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="py-2">Plan</th>
              <th className="py-2">Active subs</th>
              <th className="py-2">MRR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {PLANS.filter((p) => p.monthlyPrice > 0).map((p, i) => (
              <tr key={p.id}>
                <td className="py-3">{p.name}</td>
                <td className="py-3 font-mono">{20 - i * 5}</td>
                <td className="py-3 font-mono">
                  ${(p.monthlyPrice * (20 - i * 5)).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
