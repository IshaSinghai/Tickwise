import { createFileRoute, Link } from "@tanstack/react-router";
import { UNIT_COSTS } from "@/lib/mock";
import { CodeBlock } from "@/components/CodeBlock";

export const Route = createFileRoute("/docs/units-and-limits")({
  head: () => ({ meta: [{ title: "Units & limits — Tickwise docs" }, { name: "description", content: "How units are counted, per-endpoint costs, rate limits, and quota headers." }] }),
  component: () => (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary">Getting started</div>
        <h1 className="font-display text-4xl font-semibold">Units & limits</h1>
        <p className="text-muted-foreground">
          We meter by <em>units</em>, not requests. Simple lists are 1 unit; computed responses cost more.
          Quotas reset on the <strong>1st of each month, UTC</strong> — not on your subscription anniversary.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-2 font-medium">Endpoint</th>
              <th className="px-4 py-2 font-medium">Units</th>
              <th className="px-4 py-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {UNIT_COSTS.map((u) => (
              <tr key={u.endpoint}>
                <td className="px-4 py-2 font-mono text-xs">{u.endpoint}</td>
                <td className="px-4 py-2 font-mono">{u.units}</td>
                <td className="px-4 py-2 text-muted-foreground">{u.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-display text-2xl font-semibold">Rate vs quota — they’re different</h2>
      <p className="text-sm text-muted-foreground">
        <strong>Rate</strong> is requests-per-second and is per-account. <strong>Quota</strong> is units-per-month.
        Both return <code>429</code>, but the reason header tells you which. See <Link to="/docs/errors" className="text-primary hover:underline">/docs/errors</Link>.
      </p>
      <CodeBlock lang="http" code={`HTTP/1.1 429 Too Many Requests\nX-RateLimit-Reason: rate\nRetry-After: 1`} />
      <CodeBlock lang="http" code={`HTTP/1.1 429 Too Many Requests\nX-RateLimit-Reason: quota\nX-Quota-Reset: 2026-08-01T00:00:00Z`} />
    </div>
  ),
});
