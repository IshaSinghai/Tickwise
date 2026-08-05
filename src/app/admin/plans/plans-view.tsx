"use client";

import { useState } from "react";

import { EmptyState, InlineError, SkeletonBlock } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { getAdminPlans } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import type { Plan } from "@/lib/mock";

/*
 * The plan catalog, from GET /admin/plans through lib/api.
 *
 * The two switches were previously uncontrolled `defaultChecked` with no
 * onCheckedChange, so toggling them changed nothing and the UI silently lied
 * about the plan's configuration. They are now controlled by real state.
 *
 * Persistence still needs PATCH /admin/plans, which is backend-planned — so a
 * toggle is local for now, and the control says so rather than pretending to
 * have saved. The same goes for New plan / Edit / Archive: each says what it
 * needs instead of doing nothing when clicked.
 */
type PlanFlags = { selfServe: boolean; allowBrowserKeys: boolean };

const NEEDS_ADMIN_API = "Saving plans needs the admin API, which isn’t wired up yet.";

export function AdminPlans() {
  const { status, data, error, retry } = useAsync<Plan[]>(
    (signal) => getAdminPlans(signal),
    "Could not load the plan catalog.",
  );

  /*
   * Overrides rather than a seeded copy of the flags. State can't be initialised
   * from data that arrives later, and re-seeding it in an effect once the request
   * resolves would silently discard whatever the operator had already toggled. A
   * sparse override map layered over the loaded plan needs neither.
   */
  const [overrides, setOverrides] = useState<Record<string, Partial<PlanFlags>>>({});
  const [dirty, setDirty] = useState(false);

  const flagsFor = (p: Plan): PlanFlags => ({
    selfServe: overrides[p.id]?.selfServe ?? true,
    allowBrowserKeys: overrides[p.id]?.allowBrowserKeys ?? p.allowBrowserKeys,
  });

  const toggle = (p: Plan, key: keyof PlanFlags) => {
    const next = !flagsFor(p)[key];
    setOverrides((prev) => ({ ...prev, [p.id]: { ...prev[p.id], [key]: next } }));
    setDirty(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Plans</h1>
        <Button className="bg-gradient-primary" onClick={() => toast.error(NEEDS_ADMIN_API)}>
          New plan
        </Button>
      </div>
      {dirty && (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-muted-foreground">
          Changes are local — saving plans needs the admin API, which isn’t wired up yet.
        </div>
      )}

      {status === "error" ? (
        <InlineError message={error} onRetry={retry} />
      ) : status === "loading" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonBlock key={i} className="h-64" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          title="No plans configured"
          body="Create a plan before anyone can subscribe to one."
          action={
            <Button variant="outline" onClick={() => toast.error(NEEDS_ADMIN_API)}>
              New plan
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((p) => {
            const flags = flagsFor(p);
            return (
              <div
                key={p.id}
                className="rounded-xl border border-border/60 bg-surface p-6 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-xl font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${p.monthlyPrice}/mo · ${p.annualPrice}/yr
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Quota</dt>
                    <dd className="font-mono">{p.quota.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Rate</dt>
                    <dd className="font-mono">{p.rateLimit}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Max keys</dt>
                    <dd className="font-mono">{p.maxKeys}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-muted-foreground">Self-serve</dt>
                    <Switch
                      checked={flags.selfServe}
                      onCheckedChange={() => toggle(p, "selfServe")}
                      aria-label={`Self-serve for ${p.name}`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-muted-foreground">Browser keys</dt>
                    <Switch
                      checked={flags.allowBrowserKeys}
                      onCheckedChange={() => toggle(p, "allowBrowserKeys")}
                      aria-label={`Browser keys for ${p.name}`}
                    />
                  </div>
                </dl>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.error(NEEDS_ADMIN_API)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.error(NEEDS_ADMIN_API)}>
                    Archive
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
