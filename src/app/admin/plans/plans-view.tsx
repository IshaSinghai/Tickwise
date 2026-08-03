"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PLANS } from "@/lib/mock";

/*
 * The two switches were previously uncontrolled `defaultChecked` with no
 * onCheckedChange, so toggling them changed nothing and the UI silently lied
 * about the plan's configuration. They are now controlled by real state.
 *
 * Persistence still needs PATCH /admin/plans, which is backend-planned — so a
 * toggle is local for now, and the control says so rather than pretending to
 * have saved.
 */
type PlanFlags = { selfServe: boolean; allowBrowserKeys: boolean };

export function AdminPlans() {
  const [flags, setFlags] = useState<Record<string, PlanFlags>>(() =>
    Object.fromEntries(
      PLANS.map((p) => [p.id, { selfServe: true, allowBrowserKeys: p.allowBrowserKeys }]),
    ),
  );
  const [dirty, setDirty] = useState(false);

  const toggle = (planId: string, key: keyof PlanFlags) => {
    setFlags((prev) => ({ ...prev, [planId]: { ...prev[planId], [key]: !prev[planId][key] } }));
    setDirty(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Plans</h1>
        <Button className="bg-gradient-primary">New plan</Button>
      </div>
      {dirty && (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-muted-foreground">
          Changes are local — saving plans needs the admin API, which isn’t wired up yet.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {PLANS.map((p) => (
          <div key={p.id} className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
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
                  checked={flags[p.id].selfServe}
                  onCheckedChange={() => toggle(p.id, "selfServe")}
                  aria-label={`Self-serve for ${p.name}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-muted-foreground">Browser keys</dt>
                <Switch
                  checked={flags[p.id].allowBrowserKeys}
                  onCheckedChange={() => toggle(p.id, "allowBrowserKeys")}
                  aria-label={`Browser keys for ${p.name}`}
                />
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="ghost" size="sm">
                Archive
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
