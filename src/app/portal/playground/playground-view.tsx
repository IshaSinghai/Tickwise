"use client";

import { useState } from "react";

import { Card } from "@/components/portal/Card";
import { InlineError } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, sendPlaygroundRequest, type PlaygroundResult } from "@/lib/api";
import type { UnitCost } from "@/lib/mock";
import { CodeBlock } from "@/components/CodeBlock";

/*
 * Sends real requests, or says it can't.
 *
 * The Send button used to call `setResp(JSON.stringify({ data: [{ id: "0xabc",
 * pair: "USDC/WETH", tvl_usd: 12480322 }], units_spent: 1 }))` — a fabricated
 * response body, printed in a JSON viewer, under a heading that reads "Try
 * endpoints against your real key. Units spent are counted." Nothing on the site
 * misrepresented itself more directly. It goes through lib/api now, which means
 * this environment (no API base URL configured) reports that it has nothing to
 * send to, and a configured one gets the actual response.
 *
 * `useAsync` isn't the right tool here: it loads on mount, and this request fires
 * on submit. The error presentation is still the shared InlineError, so a failed
 * send looks like every other failure in the portal.
 */
type SendState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "error"; message: string }
  | { status: "done"; result: PlaygroundResult };

export function Playground({ endpoints }: { endpoints: UnitCost[] }) {
  const [endpoint, setEndpoint] = useState(endpoints[0]?.endpoint ?? "GET /v1/pools");
  const [chain, setChain] = useState("ethereum");
  const [state, setState] = useState<SendState>({ status: "idle" });

  const send = async () => {
    setState({ status: "sending" });
    try {
      const result = await sendPlaygroundRequest(endpoint, chain);
      setState({ status: "done", result });
    } catch (err: unknown) {
      setState({
        status: "error",
        message:
          err instanceof ApiError
            ? err.message
            : "Could not send the request. Check your connection and try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Playground</h1>
      <p className="text-sm text-muted-foreground">
        Try endpoints against your real key. Units spent are counted.
      </p>
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="playground-endpoint"
              className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground"
            >
              Endpoint
            </label>
            <select
              id="playground-endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-surface px-3 font-mono text-sm"
            >
              {endpoints.map((u) => (
                <option key={u.endpoint}>{u.endpoint}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="playground-chain"
              className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground"
            >
              Chain
            </label>
            <Input id="playground-chain" value={chain} onChange={(e) => setChain(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <Button
            className="bg-gradient-primary"
            onClick={send}
            disabled={state.status === "sending"}
          >
            {state.status === "sending" ? "Sending…" : "Send"}
          </Button>
        </div>

        {state.status === "error" && (
          <div className="mt-4">
            <InlineError message={state.message} onRetry={send} />
          </div>
        )}

        {state.status === "done" && (
          <>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-mono">HTTP {state.result.status}</span>
              {/* Only stated when the response actually carried the header. The
                  old build printed "units_spent: 1" every time, measured or not. */}
              {state.result.unitsSpent !== null && (
                <span>
                  {state.result.unitsSpent} {state.result.unitsSpent === 1 ? "unit" : "units"} spent
                </span>
              )}
            </div>
            {state.result.body.length > 0 ? (
              <CodeBlock lang="json" code={state.result.body} />
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">The response had an empty body.</p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
