"use client";

import { useState } from "react";

import { EmptyState, InlineError, SkeletonRows } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { getAdminEndpointCosts } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import type { UnitCost } from "@/lib/mock";

/*
 * Per-endpoint unit costs, from GET /admin/endpoints through lib/api.
 *
 * The units column had the same defect the plan switches had: an `Input` with
 * `defaultValue` and no `onChange`, beside a Save button with no handler. Typing
 * a new cost appeared to work and then quietly wasn't there on reload. The inputs
 * are controlled now, and Save says it needs PATCH /admin/endpoints rather than
 * reporting a success that didn't happen.
 */
const NEEDS_ADMIN_API = "Saving unit costs needs the admin API, which isn’t wired up yet.";

export function AdminEndpoints() {
  const { status, data, error, retry } = useAsync<UnitCost[]>(
    (signal) => getAdminEndpointCosts(signal),
    "Could not load the unit-cost table.",
  );

  const [edits, setEdits] = useState<Record<string, string>>({});
  const dirty = Object.keys(edits).length > 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Endpoints & unit cost</h1>

      {dirty && (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-muted-foreground">
          Changes are local — saving unit costs needs the admin API, which isn’t wired up yet.
        </div>
      )}

      {status === "error" ? (
        <InlineError message={error} onRetry={retry} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead className="text-left text-[0.625rem] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            {status === "ready" && data.length > 0 && (
              <tbody className="divide-y divide-border/60">
                {data.map((u) => (
                  <tr key={u.endpoint}>
                    <td className="px-4 py-3 font-mono text-xs">{u.endpoint}</td>
                    <td className="px-4 py-3">
                      <Input
                        value={edits[u.endpoint] ?? String(u.units)}
                        onChange={(e) =>
                          setEdits((prev) => ({ ...prev, [u.endpoint]: e.target.value }))
                        }
                        inputMode="numeric"
                        className="h-8 w-20 font-mono"
                        aria-label={`Units for ${u.endpoint}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.note}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.error(NEEDS_ADMIN_API)}
                      >
                        Save
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {status === "loading" && (
            <div className="px-4">
              <SkeletonRows rows={5} lines={1} />
            </div>
          )}

          {status === "ready" && data.length === 0 && (
            <EmptyState
              title="No metered endpoints"
              body="Nothing is priced yet, so every call would be unmetered."
            />
          )}
        </div>
      )}
    </div>
  );
}
