import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/docs/quickstart")({
  head: () => ({ meta: [{ title: "Quickstart — Tickwise docs" }, { name: "description", content: "Sign up, create a key, make your first metered request." }] }),
  component: () => (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary">Getting started</div>
        <h1 className="font-display text-4xl font-semibold">Quickstart</h1>
        <p className="text-muted-foreground">First successful call in five minutes. If it takes longer, that’s a docs bug — <a href="/support" className="text-primary hover:underline">tell us</a>.</p>
      </div>
      <h2 className="font-display text-2xl font-semibold">1 · Create a key</h2>
      <p className="text-sm text-muted-foreground">Free accounts get 25,000 units a month and up to 2 keys. Create a <strong>server</strong> key for server-to-server use.</p>
      <h2 className="font-display text-2xl font-semibold">2 · Make a request</h2>
      <CodeBlock code={`curl https://api.tickwise.io/v1/pools?chain=ethereum&limit=10 \\\n  -H "KC-APIKey: kc_live_…"`} />
      <h2 className="font-display text-2xl font-semibold">3 · Read the response</h2>
      <CodeBlock lang="json" code={`{\n  "data": [\n    {\n      "id": "0x…",\n      "chain": "ethereum",\n      "protocol": "uniswap-v4",\n      "pair": "USDC/WETH",\n      "fee_tier": "0.05%",\n      "tvl_usd": 12480322.5,\n      "volume_24h_usd": 984210.1\n    }\n  ],\n  "page": { "cursor": null }\n}`} />
      <h2 className="font-display text-2xl font-semibold">4 · Read the headers</h2>
      <p className="text-sm text-muted-foreground">Every metered response carries usage headers. Use them; don’t poll <code>/account/usage</code> from clients.</p>
      <CodeBlock lang="http" code={`X-Quota-Limit: 500000\nX-Quota-Remaining: 286512\nX-Quota-Reset: 2026-08-01T00:00:00Z\nX-RateLimit-Limit: 25\nX-RateLimit-Remaining: 24`} />
    </div>
  ),
});
