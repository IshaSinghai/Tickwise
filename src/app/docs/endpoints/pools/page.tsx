import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Pools endpoints — Tickwise docs",
  description: "List and detail endpoints for Uniswap v4 pools.",
};

export default function PoolsEndpointsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-semibold">Pools</h1>
      <p className="text-muted-foreground">Top Uniswap v4 pools by TVL, volume, or fee APR.</p>
      <h2 className="font-display text-xl font-semibold">GET /v1/pools</h2>
      <CodeBlock
        code={`curl https://api.tickwise.io/v1/pools?chain=ethereum&sort=tvl.desc -H "KC-APIKey: …"`}
      />
      <h2 className="font-display text-xl font-semibold">GET /v1/pools/:id</h2>
      <p className="text-sm text-muted-foreground">
        Detail with fee tier, tokens, TVL, 24h volume.
      </p>
    </div>
  );
}
