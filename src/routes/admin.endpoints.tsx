import { createFileRoute } from "@tanstack/react-router";
import { UNIT_COSTS } from "@/lib/mock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/endpoints")({
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Endpoints & unit cost</h1>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border/60"><th className="px-4 py-3">Endpoint</th><th className="px-4 py-3">Units</th><th className="px-4 py-3">Note</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {UNIT_COSTS.map((u) => (
              <tr key={u.endpoint}>
                <td className="px-4 py-3 font-mono text-xs">{u.endpoint}</td>
                <td className="px-4 py-3"><Input defaultValue={u.units} className="h-8 w-20 font-mono" /></td>
                <td className="px-4 py-3 text-muted-foreground">{u.note}</td>
                <td className="px-4 py-3 text-right"><Button size="sm" variant="ghost">Save</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
});
