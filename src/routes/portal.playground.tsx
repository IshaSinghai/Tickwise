import { createFileRoute } from "@tanstack/react-router";
import { Card } from "./portal.index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UNIT_COSTS } from "@/lib/mock";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/portal/playground")({
  head: () => ({ meta: [{ title: "API playground — CopyPools portal" }] }),
  component: () => {
    const [endpoint, setEndpoint] = useState("GET /v1/pools");
    const [chain, setChain] = useState("ethereum");
    const [resp, setResp] = useState<string | null>(null);
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-semibold">Playground</h1>
        <p className="text-sm text-muted-foreground">Try endpoints against your real key. Units spent are counted.</p>
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">Endpoint</label>
              <select value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="h-10 w-full rounded-md border border-input bg-surface px-3 font-mono text-sm">
                {UNIT_COSTS.map((u) => <option key={u.endpoint}>{u.endpoint}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">Chain</label>
              <Input value={chain} onChange={(e) => setChain(e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <Button className="bg-gradient-primary" onClick={() => setResp(JSON.stringify({ data: [{ id: "0xabc", pair: "USDC/WETH", tvl_usd: 12480322 }], units_spent: 1 }, null, 2))}>Send</Button>
          </div>
          {resp && <CodeBlock lang="json" code={resp} />}
        </Card>
      </div>
    );
  },
});
