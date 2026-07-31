import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Seeded so the server and client renders agree — Math.random() here would
// hydrate to different numbers than were sent in the HTML.
const seeded = (i: number) => {
  const x = Math.sin(i) * 10000;
  return x - Math.floor(x);
};

export default function AdminClientsPage() {

    const clients = Array.from({ length: 12 }).map((_, i) => ({
      id: `cli_${100 + i}`,
      email: `client${i + 1}@example.com`,
      plan: ["Free", "Starter", "Growth", "Scale"][i % 4],
      units: Math.floor(seeded(i + 1) * 500_000),
      keys: (i % 4) + 1,
    }));
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold">Clients</h1>
          <div className="flex gap-2">
            <Input placeholder="Search email…" className="w-64" />
            <Button variant="outline">Export CSV</Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-4 py-3">Client id</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Keys</th><th className="px-4 py-3">Units MTD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-surface-2/50">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{c.id}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3"><span className="rounded border border-border/60 bg-surface-2 px-2 py-0.5 text-xs">{c.plan}</span></td>
                  <td className="px-4 py-3 font-mono">{c.keys}</td>
                  <td className="px-4 py-3 font-mono">{c.units.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
}
