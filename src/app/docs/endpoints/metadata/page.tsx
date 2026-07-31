import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";

export const metadata: Metadata = {
  title: "Metadata endpoints — Tickwise docs",
  description: "Free, unmetered endpoints for chains and protocols supported.",
};

export default function MetadataEndpointsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-semibold">Metadata</h1>
      <p className="text-muted-foreground">Free and unmetered. Useful for populating filters in your UI.</p>
      <h2 className="font-display text-xl font-semibold">GET /v1/chains</h2>
      <CodeBlock lang="json" code={`{ "data": [{ "id": "ethereum", "name": "Ethereum" }, { "id": "avalanche", "name": "Avalanche" }] }`} />
      <h2 className="font-display text-xl font-semibold">GET /v1/protocols</h2>
      <CodeBlock lang="json" code={`{ "data": [{ "id": "uniswap-v4", "name": "Uniswap v4" }] }`} />
    </div>
  );
}
