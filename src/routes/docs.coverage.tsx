import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/coverage")({
  head: () => ({ meta: [{ title: "Coverage — Tickwise docs" }, { name: "description", content: "Chains and protocols supported today, and what’s on the roadmap." }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-semibold">Coverage</h1>
      <p className="text-muted-foreground">We list only what’s truly servable. Indexed-but-not-servable chains are marked as such so you don’t plan around them.</p>
      <div className="overflow-hidden rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-surface"><tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
            <th className="px-4 py-2 font-medium">Chain</th><th className="px-4 py-2 font-medium">Protocol</th><th className="px-4 py-2 font-medium">State</th>
          </tr></thead>
          <tbody className="divide-y divide-border/60">
            {[
              ["Ethereum", "Uniswap v4", "live"],
              ["Avalanche", "Uniswap v4", "live"],
              ["Arbitrum", "Uniswap v4", "indexed, not servable"],
              ["Optimism", "Uniswap v4", "indexed, not servable"],
              ["Base", "Uniswap v4", "roadmap"],
            ].map(([c, p, s]) => (
              <tr key={c}><td className="px-4 py-2">{c}</td><td className="px-4 py-2 text-muted-foreground">{p}</td>
                <td className="px-4 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${s === "live" ? "border border-success/40 bg-success/10 text-success" : "border border-border/60 bg-surface text-muted-foreground"}`}>{s}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
});
