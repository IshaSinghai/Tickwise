"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { EmptyState, InlineError, SkeletonRows } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminClients } from "@/lib/api";
import { useAsync } from "@/lib/use-async";
import type { AdminClient } from "@/lib/mock";

/*
 * The client list, from GET /admin/clients through lib/api.
 *
 * Two controls on this page used to be inert: the search box was an Input with a
 * placeholder and no state, and Export CSV was a Button with no handler. Both now
 * do what they say, against the rows already loaded — neither needs an endpoint,
 * so leaving them dead was never the backend's fault.
 */
export function AdminClients() {
  const { status, data, error, retry } = useAsync<AdminClient[]>(
    (signal) => getAdminClients(signal),
    "Could not load the client list.",
  );
  const [query, setQuery] = useState("");

  // `data ?? []` inline would be a fresh array every render, so the filter below
  // would recompute on each one.
  const clients = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) => c.email.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
    );
  }, [clients, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Clients</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search email…"
            className="w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search clients by email or id"
          />
          <Button
            variant="outline"
            onClick={() => downloadClientsCsv(filtered)}
            disabled={filtered.length === 0}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {status === "error" ? (
        <InlineError message={error} onRetry={retry} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead className="text-left text-[0.625rem] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="px-4 py-3">Client id</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Keys</th>
                <th className="px-4 py-3">Units MTD</th>
              </tr>
            </thead>
            {status === "ready" && filtered.length > 0 && (
              <tbody className="divide-y divide-border/60">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-2/50">
                    <td className="px-4 py-3 font-mono text-xs text-primary">
                      <Link href={`/admin/clients/${c.id}`} className="hover:underline">
                        {c.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{c.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded border border-border/60 bg-surface-2 px-2 py-0.5 text-xs">
                        {c.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{c.keys}</td>
                    <td className="px-4 py-3 font-mono">{c.units.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {status === "loading" && (
            <div className="px-4">
              <SkeletonRows rows={6} lines={1} />
            </div>
          )}

          {status === "ready" && filtered.length === 0 && (
            <EmptyState
              title={clients.length === 0 ? "No clients yet" : "No clients match that search"}
              body={
                clients.length === 0
                  ? "Accounts appear here as soon as someone signs up."
                  : "Try a different email or client id."
              }
              action={
                clients.length > 0 ? (
                  <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                    Clear search
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Builds the CSV in the browser from rows already on screen.
 *
 * Deliberately not a `GET /admin/clients.csv`: the export the operator wants is
 * the list they are looking at, filter included, and doing it client-side needs
 * no endpoint and no dependency.
 */
function downloadClientsCsv(rows: AdminClient[]) {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    ["client_id", "email", "plan", "keys", "units_mtd"],
    ...rows.map((r) => [r.id, r.email, r.plan, r.keys, r.units]),
  ]
    .map((cells) => cells.map(escape).join(","))
    .join("\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "tickwise-clients.csv";
  a.click();
  URL.revokeObjectURL(url);
}
