import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/docs/endpoints/positions")({
  head: () => ({ meta: [{ title: "Positions endpoints — Tickwise docs" }, { name: "description", content: "List, detail, and reconstructed chart endpoints for Uniswap v4 positions." }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-semibold">Positions</h1>
      <p className="text-muted-foreground">Uniswap v4 LP positions on Ethereum and Avalanche.</p>
      <h2 className="font-display text-xl font-semibold">GET /v1/positions</h2>
      <CodeBlock code={`curl https://api.tickwise.io/v1/positions?chain=ethereum&sort=apr.desc&limit=25 -H "KC-APIKey: …"`} />
      <div className="rounded-md border border-border/60 bg-surface p-4 text-sm">
        <div className="font-medium">Query params</div>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li><code>chain</code> — <code>ethereum</code> or <code>avalanche</code></li>
          <li><code>sort</code> — <code>apr|fee_apr|roi|pnl|value|age.(asc|desc)</code></li>
          <li><code>limit</code>, <code>cursor</code> — pagination</li>
          <li><code>risky</code> — include potentially risky pools</li>
        </ul>
      </div>
      <h2 className="font-display text-xl font-semibold">GET /v1/positions/:id</h2>
      <p className="text-sm text-muted-foreground">Detail with pool assets, PnL, APR, ROI, age.</p>
      <h2 className="font-display text-xl font-semibold">GET /v1/positions/:id/chart</h2>
      <p className="text-sm text-muted-foreground">
        Reconstructed value series. This is <strong>indicative only</strong> — reconstructed from transaction amounts and clamped.
        Don’t frame it to end-users as an audited history.
      </p>
    </div>
  ),
});
