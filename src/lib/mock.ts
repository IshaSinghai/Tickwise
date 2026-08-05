/*
 * Fallback data for endpoints the backend has not shipped yet.
 *
 * No page reads a value out of this file any more — only its types. Every value is
 * reached through lib/api.ts (authenticated realms) or lib/public-data.ts (public,
 * server-side), so a page's data path is identical whether it is being served a
 * fallback or a real response — which is what makes the loading/empty/error states
 * real code paths rather than ones that only light up after the backend lands.
 *
 * Two kinds of thing live in this file, and they are treated differently:
 *
 *  - **Catalog / config** — plans, per-endpoint unit costs, the coverage matrix.
 *    These are our own product facts, they have no live endpoint, and a pricing
 *    page that renders nothing when the API is down is worse than one that
 *    renders the catalog. They are used as a graceful fallback.
 *  - **Metrics** — pools tracked, indexing lag, live positions. These are
 *    claims about the world, derivable from endpoints that *are* live
 *    (`/v1/pools`, `/v1/positions`). Per §3 and §8 they must be genuine, so
 *    there is deliberately **no** metric fallback: when the live source can't be
 *    reached the UI says so instead of inventing a number. See
 *    lib/public-data.ts.
 */

export type Chain = "ETH" | "AVAX";
export type Plan = {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  quota: number; // units / month
  rateLimit: string;
  maxKeys: number;
  allowBrowserKeys: boolean;
  features: string[];
  cta: string;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    quota: 25_000,
    rateLimit: "5 req/s",
    maxKeys: 2,
    allowBrowserKeys: false,
    features: ["All read endpoints", "Uniswap v4 · ETH + AVAX", "Community support"],
    cta: "Start free",
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 49,
    annualPrice: 490,
    quota: 500_000,
    rateLimit: "25 req/s",
    maxKeys: 5,
    allowBrowserKeys: true,
    features: ["Everything in Free", "Browser keys w/ allowed origins", "Email support · 48h"],
    cta: "Choose Starter",
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 199,
    annualPrice: 1990,
    quota: 3_000_000,
    rateLimit: "100 req/s",
    maxKeys: 20,
    allowBrowserKeys: true,
    features: ["Everything in Starter", "Higher rate limits", "Priority support · 24h"],
    cta: "Choose Growth",
    featured: true,
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPrice: 799,
    annualPrice: 7990,
    quota: 20_000_000,
    rateLimit: "500 req/s",
    maxKeys: 100,
    allowBrowserKeys: true,
    features: ["Everything in Growth", "Custom chain requests", "Dedicated Slack channel"],
    cta: "Choose Scale",
  },
];

export type UnitCost = { endpoint: string; units: number; note: string };

export const UNIT_COSTS: UnitCost[] = [
  { endpoint: "GET /v1/pools", units: 1, note: "List of top pools" },
  { endpoint: "GET /v1/pools/:id", units: 2, note: "Single pool detail" },
  { endpoint: "GET /v1/positions", units: 1, note: "List of top positions" },
  { endpoint: "GET /v1/positions/:id", units: 3, note: "Position detail + math" },
  { endpoint: "GET /v1/positions/:id/chart", units: 5, note: "Reconstructed series" },
  { endpoint: "GET /v1/chains", units: 0, note: "Free · unmetered" },
  { endpoint: "GET /v1/protocols", units: 0, note: "Free · unmetered" },
];

export type Position = {
  id: string;
  pair: string;
  fee: string;
  chain: Chain;
  version: "v4";
  nftId: string;
  owner: string;
  poolAssets: number;
  pnl: number;
  apr: number;
  feeApr: number;
  roi: number;
  age: string;
  risky?: boolean;
};

const rand = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

/*
 * There is deliberately no POSITIONS fixture and no LIVE_STATS fixture here.
 *
 * Both used to exist and both were rendered as fact: a 24-row table headed "Live
 * preview of the API", and four landing-page counters reading "12,480 pools
 * tracked · ~5 min indexing lag". §3 requires those proof numbers be genuine and
 * §8 bans invented public claims, so the only honest fallback for a metric is to
 * say it is unavailable. `/v1/pools` and `/v1/positions` are live endpoints —
 * these numbers have a real source, and lib/public-data.ts reads it.
 */

export type ApiKey = {
  id: string;
  label: string;
  prefix: string;
  type: "server" | "browser";
  origins: string[];
  createdAt: string;
  lastUsed: string | null;
};

export const MOCK_KEYS: ApiKey[] = [
  {
    id: "k1",
    label: "Production · server",
    prefix: "kc_live_9f2a4c8ed11b3e7c",
    type: "server",
    origins: [],
    createdAt: "2026-07-10",
    lastUsed: "2 minutes ago",
  },
  {
    id: "k2",
    label: "Marketing dashboard",
    prefix: "kc_live_3d17b6f0aa88c214",
    type: "browser",
    origins: ["https://app.example.com"],
    createdAt: "2026-06-22",
    lastUsed: "1 hour ago",
  },
];

/*
 * The signed-in customer's profile.
 *
 * These two strings were literals in /portal/settings' JSX — an invented name and
 * email rendered into the account form as though they were the visitor's own. That
 * is the same defect as a fixture metric, except the reader is being told something
 * about themselves. Behind GET /account/profile now, which is backend-planned, so
 * this is its fallback.
 */
export type AccountProfile = { name: string; billingEmail: string };

export const ACCOUNT_PROFILE: AccountProfile = {
  name: "Alex Rivera",
  billingEmail: "alex@doryoku.io",
};

export const USAGE_MONTHLY = [
  { month: "Feb", units: 120_400 },
  { month: "Mar", units: 218_300 },
  { month: "Apr", units: 342_900 },
  { month: "May", units: 401_500 },
  { month: "Jun", units: 388_120 },
  { month: "Jul", units: 213_450 },
];

export const CURRENT_USAGE = {
  planQuota: 500_000,
  used: 213_450,
  resetOn: "2026-08-01T00:00:00Z",
};

export const PAYMENTS = [
  {
    id: "pay_01",
    date: "2026-07-01",
    amount: 49,
    status: "confirmed",
    tx: "0xabc…9f21",
    plan: "Starter",
  },
  {
    id: "pay_02",
    date: "2026-06-01",
    amount: 49,
    status: "confirmed",
    tx: "0xdd7…41ac",
    plan: "Starter",
  },
  {
    id: "pay_03",
    date: "2026-05-01",
    amount: 49,
    status: "confirmed",
    tx: "0x8c1…77e0",
    plan: "Starter",
  },
];

export const CHANGELOG = [
  {
    date: "2026-07-20",
    title: "Avalanche indexing live",
    body: "Uniswap v4 on Avalanche is now servable via /v1/pools and /v1/positions.",
  },
  {
    date: "2026-07-04",
    title: "Position chart endpoint",
    body: "New /v1/positions/:id/chart returns a reconstructed, indicative series.",
  },
  {
    date: "2026-06-11",
    title: "Portal beta",
    body: "Self-serve API keys and usage now available for all customers.",
  },
];

/*
 * The status page's chain list, split from its lag numbers.
 *
 * Which chain/protocol pairs are servable is a product fact we own — the same
 * matrix /docs/coverage publishes — so it belongs here and is safe to serve as a
 * fallback. The lag *value* beside each servable row is a metric, and comes from
 * the live source or not at all (see lib/public-data.ts). Keeping them in one
 * object was what made the page state "5 min" whether or not anything had been
 * measured.
 */
export type CoverageRow = { chain: string; servable: boolean };

export const COVERAGE_ROWS: CoverageRow[] = [
  { chain: "Ethereum · Uniswap v4", servable: true },
  { chain: "Avalanche · Uniswap v4", servable: true },
  { chain: "Arbitrum · Uniswap v4", servable: false },
  { chain: "Optimism · Uniswap v4", servable: false },
];

// ── Admin realm (every endpoint below is backend-planned) ────────────────────

export type AdminClient = {
  id: string;
  email: string;
  plan: string;
  /** Units consumed month-to-date. */
  units: number;
  keys: number;
};

export type AdminClientDetail = AdminClient & {
  createdAt: string;
  status: "active" | "grace" | "canceled";
  periodEnd: string;
  quota: number;
  rateLimit: string;
  apiKeys: ApiKey[];
  payments: typeof PAYMENTS;
};

export const ADMIN_CLIENTS: AdminClient[] = Array.from({ length: 12 }, (_, i) => ({
  id: `cli_${100 + i}`,
  email: `client${i + 1}@example.com`,
  plan: ["Free", "Starter", "Growth", "Scale"][i % 4],
  units: Math.floor(rand(i + 1) * 500_000),
  keys: (i % 4) + 1,
}));

/** Builds the detail record for one client id, or undefined if there is no such client. */
export function adminClientDetail(id: string): AdminClientDetail | undefined {
  const client = ADMIN_CLIENTS.find((c) => c.id === id);
  if (!client) return undefined;
  const index = ADMIN_CLIENTS.indexOf(client);
  const plan = PLANS.find((p) => p.name === client.plan) ?? PLANS[0];
  return {
    ...client,
    // Literal rather than derived from today's date: a computed date renders
    // differently on the server than on the client and trips a hydration
    // mismatch, and these are placeholders until the endpoint is live.
    createdAt: `2026-0${(index % 6) + 1}-0${(index % 8) + 1}`,
    status: (["active", "grace", "canceled"] as const)[index % 3],
    periodEnd: `2026-0${(index % 8) + 1}-15`,
    quota: plan.quota,
    rateLimit: plan.rateLimit,
    apiKeys: MOCK_KEYS.slice(0, client.keys > MOCK_KEYS.length ? MOCK_KEYS.length : client.keys),
    payments: plan.monthlyPrice > 0 ? PAYMENTS : [],
  };
}

export type AdminSubscription = {
  id: string;
  client: string;
  plan: string;
  status: "active" | "grace" | "canceled";
  periodEnd: string;
};

export const ADMIN_SUBSCRIPTIONS: AdminSubscription[] = Array.from({ length: 10 }, (_, i) => ({
  id: `sub_${200 + i}`,
  client: `client${i + 1}@example.com`,
  plan: ["Starter", "Growth", "Scale"][i % 3],
  status: (["active", "grace", "canceled"] as const)[i % 3],
  periodEnd: `2026-0${(i % 8) + 1}-15`,
}));

export const ADMIN_SUBSCRIPTION_SUMMARY = { mrr: 4782, arr: 57_384, active: 98 };

export const ADMIN_REVENUE = {
  kpis: {
    mrr: 4782,
    mrrDelta: "+12%",
    newThisMonth: 8,
    newDelta: "+3",
    churned: 2,
    churnedDelta: "-1",
  },
  monthly: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month, i) => ({
    month,
    paid: 2500 + i * 350,
    pending: 400 + i * 80,
  })),
  byPlan: PLANS.filter((p) => p.monthlyPrice > 0).map((p, i) => ({
    planId: p.id,
    name: p.name,
    activeSubs: 20 - i * 5,
    mrr: p.monthlyPrice * (20 - i * 5),
  })),
};
