"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, RefreshCw, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { EmptyState, InlineError } from "@/components/DataState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  POSITION_SORTS,
  type PositionQuery,
  type PositionSort,
  type PublicPositions,
} from "@/lib/public-data";

/*
 * The public preview of GET /v1/positions.
 *
 * Two things changed here beyond swapping the data source.
 *
 * The rows used to come from a 24-item fixture generated from `Math.sin(i)`,
 * printed under "Live preview of the API" beside "data indexed to 7/28/2026".
 * They come from the endpoint now, and when the endpoint can't be reached the
 * panel says so — §8's rule about invented claims applies most sharply to the page
 * whose entire heading is a claim about being live.
 *
 * And the controls drive search params instead of local state. Search over 24 rows
 * held in the browser would report "no matches" for a token sitting on page 5 of
 * 239, so filtering has to happen where the data is. The server reads the params
 * and passes them to the API; see the note in lib/public-data.ts.
 */
export function Explore({
  tab,
  query,
  positions,
}: {
  tab: "positions" | "pools";
  query: PositionQuery;
  positions: PublicPositions | null;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(query.q);

  /** A URL with `next` merged over the current query. Empty values drop out. */
  const hrefWith = (next: Partial<PositionQuery & { tab: string }>): string => {
    const merged = { tab, ...query, ...next };
    const params = new URLSearchParams();
    if (merged.tab !== "positions") params.set("tab", merged.tab);
    if (merged.q) params.set("q", merged.q);
    if (merged.sort !== "APR") params.set("sort", merged.sort);
    if (!merged.includeRisky) params.set("risky", "0");
    if (merged.page > 1) params.set("page", String(merged.page));
    const search = params.toString();
    return search ? `/explore?${search}` : "/explore";
  };

  const previewScope = () =>
    toast.error(
      "The public preview serves Uniswap v4 on Ethereum and Avalanche. Chain and protocol filters need a key — try the playground in the portal.",
    );

  return (
    <MarketingShell>
      <div className="container-page py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">Open positions</h1>
            <p className="text-sm text-muted-foreground">
              Live preview of the API — only positions with &gt; $500,000 pooled assets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full border border-border/60 bg-surface p-1 text-sm">
              {(["positions", "pools"] as const).map((t) => (
                <Link
                  key={t}
                  href={hrefWith({ tab: t, page: 1 })}
                  className={`rounded-full px-4 py-1 capitalize transition-colors ${tab === t ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  {t}
                </Link>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={previewScope}>
              All chains
            </Button>
            <Button variant="outline" size="sm" onClick={previewScope}>
              Uniswap v4
            </Button>
            <Button variant="outline" size="sm" onClick={previewScope}>
              <Filter className="mr-1 h-3.5 w-3.5" /> filters
            </Button>
          </div>
        </div>

        <form
          className="mt-4 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(hrefWith({ q: draft, page: 1 }));
          }}
        >
          <div className="relative flex-1 min-w-[17.5rem]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search token, pool, owner, position"
              className="pl-9"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Search token, pool, owner, position"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={query.includeRisky}
              onChange={(e) => router.push(hrefWith({ includeRisky: e.target.checked, page: 1 }))}
              className="accent-[color:var(--primary)]"
            />{" "}
            risky
          </label>
          {/* router.refresh() discards the cached RSC payload and re-runs the
              server fetch, which is what this button always claimed to do. */}
          <Button variant="ghost" size="icon" type="button" onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap gap-1">
          {POSITION_SORTS.map((s) => (
            <Link
              key={s}
              href={hrefWith({ sort: s as PositionSort, page: 1 })}
              className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs transition-colors ${query.sort === s ? "border-primary/50 bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
            >
              <ArrowUpDown className="h-3 w-3" /> {s}
            </Link>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground">
          Updated hourly from on-chain data. Values may slightly differ from live market conditions.
          {/* The "· 2 integrations · data indexed to 7/28/2026" that used to close
              this line was a literal. The date is only stated when the response
              carries it. */}
          {positions?.indexedTo ? ` · data indexed to ${positions.indexedTo}` : ""}
        </div>

        {tab === "pools" ? (
          <div className="mt-4 rounded-xl border border-border/60 bg-surface p-2 shadow-card">
            <EmptyState
              title="Pools aren’t in the public preview yet"
              body="GET /v1/pools is live for key holders — the preview on this page covers positions only."
              action={
                <Button asChild variant="outline">
                  <Link href="/docs/endpoints/pools">Read the pools endpoint</Link>
                </Button>
              }
            />
          </div>
        ) : positions === null ? (
          <div className="mt-4">
            <InlineError
              message="We can’t reach the positions index from here, so there are no rows to show. Nothing is cached from an earlier load — we’d rather show none than stale ones."
              onRetry={() => router.refresh()}
            />
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-[0.625rem] uppercase tracking-widest text-muted-foreground">
                    <Th>pool / fee tier</Th>
                    <Th>NFT id</Th>
                    <Th>owner</Th>
                    <Th>pool assets</Th>
                    <Th>PnL</Th>
                    <Th>APR</Th>
                    <Th>fee APR</Th>
                    <Th>ROI</Th>
                    <Th>age</Th>
                  </tr>
                </thead>
                {positions.items.length > 0 && (
                  <tbody className="divide-y divide-border/60">
                    {positions.items.map((p) => (
                      <tr key={p.id} className="transition-colors hover:bg-surface-2/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-10 -space-x-2">
                              <span className="h-6 w-6 rounded-full border border-border/60 bg-gradient-to-br from-primary/40 to-primary-glow/40" />
                              <span className="h-6 w-6 rounded-full border border-border/60 bg-gradient-to-br from-primary-glow/40 to-primary/20" />
                            </span>
                            <span className="font-mono font-medium">{p.pair}</span>
                            <span className="text-xs text-muted-foreground">{p.fee}</span>
                            <span className="rounded bg-surface-2 px-1 text-[0.625rem] text-muted-foreground">
                              {p.version}
                            </span>
                            <span className="rounded bg-surface-2 px-1 text-[0.625rem] text-muted-foreground">
                              {p.chain}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-primary">{p.nftId}</td>
                        <td className="px-4 py-3 font-mono text-primary">{p.owner}</td>
                        <td className="px-4 py-3 font-mono">${p.poolAssets.toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-success">
                          ${p.pnl.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono">{p.apr.toLocaleString()}%</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {p.feeApr.toLocaleString()}%
                        </td>
                        <td className="px-4 py-3 font-mono text-success">{p.roi}%</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.age}</td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>

            {positions.items.length === 0 && (
              <EmptyState
                title={query.q ? `Nothing matches “${query.q}”` : "No positions to show"}
                body={
                  query.q
                    ? "Try a token symbol, a pool address, or an owner address."
                    : "No open position currently clears the $500,000 threshold this preview filters on."
                }
                action={
                  query.q || !query.includeRisky ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/explore">Clear filters</Link>
                    </Button>
                  ) : undefined
                }
              />
            )}

            <div className="flex items-center justify-end gap-2 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
              <PageArrow
                href={hrefWith({ page: positions.page - 1 })}
                disabled={positions.page <= 1}
                label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </PageArrow>
              <span>
                {positions.page} / {Math.max(1, positions.pageCount)}
              </span>
              <PageArrow
                href={hrefWith({ page: positions.page + 1 })}
                disabled={positions.page >= positions.pageCount}
                label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </PageArrow>
            </div>
          </div>
        )}
      </div>
    </MarketingShell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

/**
 * Pagination arrow. A real link when there is a page to go to, and a disabled
 * button at the ends — an `<a>` that goes nowhere is the inert control this page
 * had two of.
 */
function PageArrow({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <Button size="icon" variant="ghost" className="h-7 w-7" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <Button asChild size="icon" variant="ghost" className="h-7 w-7">
      <Link href={href} aria-label={label}>
        {children}
      </Link>
    </Button>
  );
}
