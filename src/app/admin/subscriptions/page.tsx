
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-semibold">{value}</div>
    </div>
  );
}

export default function AdminSubscriptionsPage() {

    const rows = Array.from({ length: 10 }).map((_, i) => ({
      id: `sub_${200 + i}`,
      client: `client${i + 1}@example.com`,
      plan: ["Starter", "Growth", "Scale"][i % 3],
      status: ["active", "grace", "canceled"][i % 3],
      periodEnd: `2026-0${(i % 8) + 1}-15`,
    }));
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold">Subscriptions</h1>
          <div className="flex gap-6">
            <Stat label="MRR" value="$4,782" />
            <Stat label="ARR" value="$57,384" />
            <Stat label="Active" value="98" />
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/60"><th className="px-4 py-3">Sub id</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Period ends</th></tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{r.id}</td>
                  <td className="px-4 py-3">{r.client}</td>
                  <td className="px-4 py-3">{r.plan}</td>
                  <td className="px-4 py-3"><span className={`rounded-full border px-2 py-0.5 text-[10px] ${r.status === "active" ? "border-success/40 bg-success/10 text-success" : r.status === "grace" ? "border-warning/40 bg-warning/10 text-warning" : "border-border/60 bg-surface-2 text-muted-foreground"}`}>{r.status}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.periodEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
}
