import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { POSITIONS } from "@/lib/mock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Live Uniswap v4 pools & positions · CopyPools" },
      { name: "description", content: "Browse live Uniswap v4 open positions and pools indexed by CopyPools. Free, public preview of the API." },
      { property: "og:title", content: "CopyPools · Explore live positions" },
      { property: "og:description", content: "Live Uniswap v4 positions on Ethereum and Avalanche." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const [tab, setTab] = useState<"positions" | "pools">("positions");
  const sorts = ["APR", "Fee APR", "ROI", "Age", "PnL", "Value"] as const;
  const [sort, setSort] = useState<typeof sorts[number]>("APR");

  return (
    <MarketingShell>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">Open positions</h1>
            <p className="text-sm text-muted-foreground">Live preview of the API — only positions with &gt; $500,000 pooled assets.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full border border-border/60 bg-surface p-1 text-sm">
              {(["positions", "pools"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1 capitalize transition-colors ${tab === t ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"}`}>{t}</button>
              ))}
            </div>
            <Button variant="outline" size="sm">All chains</Button>
            <Button variant="outline" size="sm">Uniswap v4</Button>
            <Button variant="outline" size="sm"><Filter className="mr-1 h-3.5 w-3.5" /> filters</Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search token, pool, owner, position" className="pl-9" />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" defaultChecked className="accent-[color:var(--primary)]" /> risky
          </label>
          <Button variant="ghost" size="icon"><RefreshCw className="h-4 w-4" /></Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {sorts.map((s) => (
            <button key={s} onClick={() => setSort(s)} className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs transition-colors ${sort === s ? "border-primary/50 bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"}`}>
              <ArrowUpDown className="h-3 w-3" /> {s}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground">
          Updated hourly from on-chain data. Values may slightly differ from live market conditions. · 2 integrations · data indexed to 7/28/2026
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <Th>pool / fee tier</Th><Th>NFT id</Th><Th>owner</Th><Th>pool assets</Th><Th>PnL</Th><Th>APR</Th><Th>fee APR</Th><Th>ROI</Th><Th>age</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {POSITIONS.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-surface-2/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-10 -space-x-2">
                          <span className="h-6 w-6 rounded-full border border-border/60 bg-gradient-to-br from-primary/40 to-primary-glow/40" />
                          <span className="h-6 w-6 rounded-full border border-border/60 bg-gradient-to-br from-primary-glow/40 to-primary/20" />
                        </span>
                        <span className="font-mono font-medium">{p.pair}</span>
                        <span className="text-xs text-muted-foreground">{p.fee}</span>
                        <span className="rounded bg-surface-2 px-1 text-[10px] text-muted-foreground">v4</span>
                        <span className="rounded bg-surface-2 px-1 text-[10px] text-muted-foreground">ETH</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-primary">{p.nftId}</td>
                    <td className="px-4 py-3 font-mono text-primary">{p.owner}</td>
                    <td className="px-4 py-3 font-mono">${p.poolAssets.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-success">${p.pnl.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono">{p.apr.toLocaleString()}%</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{p.feeApr.toLocaleString()}%</td>
                    <td className="px-4 py-3 font-mono text-success">{p.roi}%</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
            <Button size="icon" variant="ghost" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
            <span>1 / 239</span>
            <Button size="icon" variant="ghost" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
