/*
 * Server-side getters for the public, unauthenticated surface.
 *
 * Separate from lib/api.ts on purpose. That module is the *client* transport for
 * the two authenticated realms: it reads a bearer token out of localStorage and
 * is imported by `"use client"` views. None of that works — or is wanted — for
 * the marketing pages, which must stay server-rendered for SEO. So these run on
 * the server, take no token, and are awaited inside the `page.tsx` server
 * component that owns each route's `metadata`. The data arrives in the HTML.
 *
 * Two rules shape every function here.
 *
 * 1. **Never throw.** A marketing page that 500s because the API is down is a
 *    worse outcome than one that renders without a number. Every getter catches
 *    and degrades.
 *
 * 2. **Catalog degrades to the fallback; metrics degrade to `null`.** Plans, unit
 *    costs and the coverage matrix are our own product facts with no live
 *    endpoint behind them, so serving the bundled catalog is correct. Pools
 *    tracked, indexing lag and live positions are claims about the world with a
 *    real source (`/v1/pools`, `/v1/positions`); §3 requires they be genuine and
 *    §8 bans inventing them, so when the source is unreachable these return
 *    `null` and the page says so. A returned number from this module is always a
 *    measured number.
 */

import {
  CHANGELOG,
  COVERAGE_ROWS,
  PLANS,
  UNIT_COSTS,
  type CoverageRow,
  type Plan,
  type Position,
  type UnitCost,
} from "@/lib/mock";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/** True when a public API base URL is configured. */
export function hasPublicBackend(): boolean {
  return BASE_URL.length > 0;
}

/**
 * GETs a public endpoint, or returns null.
 *
 * `revalidate` puts each route on ISR rather than making it dynamic, so the pages
 * stay statically served — the SEO requirement — while the numbers stay fresh.
 */
async function publicGet<T>(path: string, revalidate: number): Promise<T | null> {
  if (!hasPublicBackend()) return null;
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    // DNS failure, timeout, malformed JSON — all the same to the caller.
    return null;
  }
}

// ── Catalog: falls back to the bundled product facts ─────────────────────────

/** The plan catalog. Falls back to the bundled catalog; never null. */
export async function getPublicPlans(): Promise<Plan[]> {
  const live = await publicGet<Plan[]>("/public/plans", 3600);
  return live && live.length > 0 ? live : PLANS;
}

/** Per-endpoint unit costs. Falls back to the bundled catalog; never null. */
export async function getPublicUnitCosts(): Promise<UnitCost[]> {
  const live = await publicGet<UnitCost[]>("/public/unit-costs", 3600);
  return live && live.length > 0 ? live : UNIT_COSTS;
}

/** Which chain/protocol pairs are servable. A product fact, not a metric. */
export function getCoverageRows(): CoverageRow[] {
  return COVERAGE_ROWS;
}

export type ChangelogEntry = { date: string; title: string; body: string };

/** Release notes. Authored content, so the bundled copy is the source, not a stub. */
export async function getPublicChangelog(): Promise<ChangelogEntry[]> {
  const live = await publicGet<ChangelogEntry[]>("/public/changelog", 3600);
  return live && live.length > 0 ? live : CHANGELOG;
}

// ── Metrics: null rather than invented ──────────────────────────────────────

/**
 * The landing page's four proof numbers, or null if they can't be measured.
 *
 * §3 names three of them ("pools tracked, positions tracked, current indexing
 * lag"); the fourth is TVL indexed, which replaced a chain count §8 prohibits
 * outright. All four are derivable from `/v1/pools` and `/v1/positions`.
 */
export type PublicStats = {
  poolsTracked: number;
  positionsTracked: number;
  indexingLagMinutes: number;
  tvlIndexedUsd: number;
};

export async function getPublicStats(): Promise<PublicStats | null> {
  const live = await publicGet<Partial<PublicStats>>("/public/stats", 300);
  if (!live) return null;
  // A partial response is not a licence to fill the gaps in. Either every card
  // has a measured number behind it or the section reports itself unavailable.
  const { poolsTracked, positionsTracked, indexingLagMinutes, tvlIndexedUsd } = live;
  if (
    typeof poolsTracked !== "number" ||
    typeof positionsTracked !== "number" ||
    typeof indexingLagMinutes !== "number" ||
    typeof tvlIndexedUsd !== "number"
  ) {
    return null;
  }
  return { poolsTracked, positionsTracked, indexingLagMinutes, tvlIndexedUsd };
}

/**
 * Measured indexing lag per chain, keyed by the same chain label COVERAGE_ROWS
 * uses, or null when nothing has been measured.
 *
 * A map rather than a row list because the rows themselves are static: the status
 * page always shows every chain, and only the lag column depends on this.
 */
export type IndexingLag = Record<string, string>;

export async function getIndexingLag(): Promise<IndexingLag | null> {
  const live = await publicGet<IndexingLag>("/public/indexing-lag", 60);
  if (!live || Object.keys(live).length === 0) return null;
  return live;
}

/**
 * A page of live positions for /explore, or null when the source is unreachable.
 *
 * `indexedTo` is the timestamp the page prints in its freshness note — previously
 * a hardcoded "7/28/2026", which is the same class of invented claim as the lag.
 */
export type PublicPositions = {
  items: Position[];
  total: number;
  page: number;
  pageCount: number;
  indexedTo: string | null;
};

/** The sort keys /explore offers, exactly as the chips are labelled. */
export const POSITION_SORTS = ["APR", "Fee APR", "ROI", "Age", "PnL", "Value"] as const;
export type PositionSort = (typeof POSITION_SORTS)[number];

export type PositionQuery = {
  page: number;
  q: string;
  sort: PositionSort;
  includeRisky: boolean;
};

export const DEFAULT_POSITION_QUERY: PositionQuery = {
  page: 1,
  q: "",
  sort: "APR",
  includeRisky: true,
};

/**
 * Reads the query /explore's controls encode into the URL.
 *
 * The controls drive search params rather than local component state on purpose.
 * There are hundreds of pages of positions, so filtering the two dozen rows
 * already in the browser would answer "no matches" for tokens that exist on the
 * next page — worse than not offering search at all. In the URL, the query reaches
 * the server, the server passes it to the API, and the result is both correct and
 * linkable.
 */
export function parsePositionQuery(
  params: Record<string, string | string[] | undefined>,
): PositionQuery {
  const first = (key: string): string | undefined => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const page = Number(first("page"));
  const sort = POSITION_SORTS.find((s) => s === first("sort"));
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    q: (first("q") ?? "").slice(0, 120),
    sort: sort ?? DEFAULT_POSITION_QUERY.sort,
    // Risky positions are shown by default, matching the checkbox's checked state.
    includeRisky: first("risky") !== "0",
  };
}

export async function getPublicPositions(
  query: PositionQuery = DEFAULT_POSITION_QUERY,
): Promise<PublicPositions | null> {
  const search = new URLSearchParams({
    page: String(query.page),
    sort: query.sort,
    risky: query.includeRisky ? "1" : "0",
  });
  if (query.q) search.set("q", query.q);

  const live = await publicGet<PublicPositions>(`/v1/positions?${search.toString()}`, 60);
  if (!live || !Array.isArray(live.items)) return null;
  return live;
}
