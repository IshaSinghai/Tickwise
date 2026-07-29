import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/CodeBlock";
export const Route = createFileRoute("/docs/endpoints/pools")({
  head: () => ({ meta: [{ title: "Pools endpoints — Tickwise docs" }, { name: "description", content: "List and detail endpoints for Uniswap v4 pools." }] }),
  component: () => (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-semibold">Pools</h1>
      <p className="text-muted-foreground">Top Uniswap v4 pools by TVL, volume, or fee APR.</p>
      <h2 className="font-display text-xl font-semibold">GET /v1/pools</h2>
      <CodeBlock code={`curl https://api.tickwise.io/v1/pools?chain=ethereum&sort=tvl.desc -H "KC-APIKey: …"`} />
      <h2 className="font-display text-xl font-semibold">GET /v1/pools/:id</h2>
      <p className="text-sm text-muted-foreground">Detail with fee tier, tokens, TVL, 24h volume.</p>
    </div>
  ),
});
