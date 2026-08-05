"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EmptyState, InlineError, SkeletonBlock, SkeletonRows } from "@/components/DataState";
import { getAdminClient } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import type { AdminClientDetail } from "@/lib/mock";

/*
 * One client, from GET /admin/clients/:id through lib/api.
 *
 * Built from the panel/table language the rest of the admin realm already uses —
 * `rounded-xl border-border/60 bg-surface shadow-card`, the same `[0.625rem]`
 * uppercase table heads, the same status pills as /admin/subscriptions — rather
 * than a new one, so this reads as part of the panel it was missing from.
 *
 * An unknown id resolves to a 404 from the wrapper, which lands in the error state
 * with the server's own message and a way back to the list.
 */
export function AdminClientDetailView({ id }: { id: string }) {
  const { status, data, error, retry } = useAsync<AdminClientDetail>(
    (signal) => getAdminClient(id, signal),
    "Could not load this client.",
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> All clients
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">
          {status === "ready" ? data.email : "Client"}
        </h1>
        <div className="mt-1 font-mono text-xs text-muted-foreground">{id}</div>
      </div>

      {status === "error" ? (
        <InlineError message={error} onRetry={retry} />
      ) : status === "loading" ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonBlock key={i} className="h-24" />
            ))}
          </div>
          <Panel title="API keys">
            <SkeletonRows rows={2} lines={1} />
          </Panel>
          <Panel title="Payments">
            <SkeletonRows rows={3} lines={1} />
          </Panel>
        </>
      ) : (
        <Populated client={data} />
      )}
    </div>
  );
}

function Populated({ client }: { client: AdminClientDetail }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Plan" value={client.plan} />
        <Stat label="Units MTD" value={client.units.toLocaleString()} />
        <Stat label="Monthly quota" value={client.quota.toLocaleString()} />
        <Stat label="Rate limit" value={client.rateLimit} />
      </div>

      <div className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Subscription</div>
        <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <StatusPill status={client.status} />
          </div>
          <div>
            <span className="text-muted-foreground">Period ends </span>
            <span className="font-mono text-xs">{client.periodEnd}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Client since </span>
            <span className="font-mono text-xs">{client.createdAt}</span>
          </div>
        </div>
      </div>

      <Panel title={`API keys · ${client.apiKeys.length}`}>
        {client.apiKeys.length === 0 ? (
          <EmptyState
            title="No API keys"
            body="This client has not created a key yet, so nothing of theirs is calling the API."
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-[0.625rem] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Prefix</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Last used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {client.apiKeys.map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-3">{k.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{k.prefix}</td>
                  <td className="px-4 py-3">
                    <span className="rounded border border-border/60 bg-surface-2 px-2 py-0.5 text-xs">
                      {k.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{k.createdAt}</td>
                  <td className="px-4 py-3 text-muted-foreground">{k.lastUsed ?? "never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="Payments">
        {client.payments.length === 0 ? (
          <EmptyState
            title="No payments"
            body="This client is on the Free plan, so there is nothing to reconcile."
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-[0.625rem] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Tx</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {client.payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono text-xs">{p.date}</td>
                  <td className="px-4 py-3 font-mono">${p.amount}</td>
                  <td className="px-4 py-3">{p.plan}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{p.tx}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[0.625rem] text-success">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
      <div className="border-b border-border/60 px-6 py-4 text-xs uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="px-2 py-1">{children}</div>
    </div>
  );
}

/** Same three states and the same pill styling as /admin/subscriptions. */
function StatusPill({ status }: { status: AdminClientDetail["status"] }) {
  const tone =
    status === "active"
      ? "border-success/40 bg-success/10 text-success"
      : status === "grace"
        ? "border-warning/40 bg-warning/10 text-warning"
        : "border-border/60 bg-surface-2 text-muted-foreground";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[0.625rem] ${tone}`}>{status}</span>
  );
}
