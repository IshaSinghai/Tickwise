import { createFileRoute } from "@tanstack/react-router";
import { PLANS } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/plans")({
  component: () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Plans</h1>
        <Button className="bg-gradient-primary">New plan</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {PLANS.map((p) => (
          <div key={p.id} className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div className="font-display text-xl font-semibold">{p.name}</div>
              <div className="text-sm text-muted-foreground">${p.monthlyPrice}/mo · ${p.annualPrice}/yr</div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div><dt className="text-xs text-muted-foreground">Quota</dt><dd className="font-mono">{p.quota.toLocaleString()}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Rate</dt><dd className="font-mono">{p.rateLimit}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Max keys</dt><dd className="font-mono">{p.maxKeys}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-xs text-muted-foreground">Self-serve</dt><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><dt className="text-xs text-muted-foreground">Browser keys</dt><Switch defaultChecked={p.allowBrowserKeys} /></div>
            </dl>
            <div className="mt-4 flex gap-2"><Button variant="outline" size="sm">Edit</Button><Button variant="ghost" size="sm">Archive</Button></div>
          </div>
        ))}
      </div>
    </div>
  ),
});
