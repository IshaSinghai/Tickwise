// Stubbed data for all UIs. Wire to real backend calls when they land.

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
    features: [
      "All read endpoints",
      "Uniswap v4 · ETH + AVAX",
      "Community support",
    ],
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
    features: [
      "Everything in Free",
      "Browser keys w/ allowed origins",
      "Email support · 48h",
    ],
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
    features: [
      "Everything in Starter",
      "Higher rate limits",
      "Priority support · 24h",
    ],
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
    features: [
      "Everything in Growth",
      "Custom chain requests",
      "Dedicated Slack channel",
    ],
    cta: "Choose Scale",
  },
];

export const UNIT_COSTS = [
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

export const POSITIONS: Position[] = Array.from({ length: 24 }).map((_, i) => {
  const pairs = [
    ["USDC", "CATE"],
    ["USDT", "TRUU"],
    ["BINI", "USDC"],
    ["ETH", "WCUP"],
    ["USDC", "sUSDS"],
    ["WLD", "USDT"],
    ["PENGU", "USDT"],
    ["ETH", "BMC"],
    ["DAM", "USDT"],
    ["GIVE", "USDT"],
    ["ETH", "WIN"],
    ["SWFTC", "USDT"],
    ["LA", "USDT"],
    ["ETH", "RALLY"],
    ["COINDEPO", "USDT"],
    ["ETH", "DIMO"],
    ["ETH", "FWAres"],
    ["etrUSD", "USDT"],
    ["wPAW", "USDT"],
    ["PPT", "USDT"],
    ["COINx", "USDC"],
    ["USDT", "NEX"],
    ["ETH", "GROW"],
    ["USDC", "PEPE"],
  ];
  const [a, b] = pairs[i];
  const r = rand(i + 1);
  return {
    id: `p${i}`,
    pair: `${a}/${b}`,
    fee: `${(r * 30 + 0.05).toFixed(2)}%`,
    chain: "ETH" as const,
    version: "v4" as const,
    nftId: String(310000 + Math.floor(r * 40000)),
    owner: `0x${(r * 1e16).toString(16).padStart(4, "0").slice(0, 4)}…${(r * 1e10).toString(16).padStart(4, "0").slice(0, 4)}`,
    poolAssets: Math.floor(500 + r * 8000) * 1000,
    pnl: Math.floor(50 + r * 45000) * 100,
    apr: Math.floor(1000 + r * 34000) / 10,
    feeApr: Math.floor(900 + r * 36000) / 10,
    roi: Math.floor(60 + r * 2500) / 10,
    age: `${Math.floor(1 + r * 220)}d`,
    risky: r > 0.85,
  };
});

export const LIVE_STATS = {
  poolsTracked: 12_480,
  positionsTracked: 148_920,
  indexingLagMinutes: 5,
};

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
  { id: "pay_01", date: "2026-07-01", amount: 49, status: "confirmed", tx: "0xabc…9f21", plan: "Starter" },
  { id: "pay_02", date: "2026-06-01", amount: 49, status: "confirmed", tx: "0xdd7…41ac", plan: "Starter" },
  { id: "pay_03", date: "2026-05-01", amount: 49, status: "confirmed", tx: "0x8c1…77e0", plan: "Starter" },
];

export const CHANGELOG = [
  { date: "2026-07-20", title: "Avalanche indexing live", body: "Uniswap v4 on Avalanche is now servable via /v1/pools and /v1/positions." },
  { date: "2026-07-04", title: "Position chart endpoint", body: "New /v1/positions/:id/chart returns a reconstructed, indicative series." },
  { date: "2026-06-11", title: "Portal beta", body: "Self-serve API keys and usage now available for all customers." },
];

export const STATUS_ROWS = [
  { chain: "Ethereum · Uniswap v4", lag: "5 min", state: "ok" as const },
  { chain: "Avalanche · Uniswap v4", lag: "7 min", state: "ok" as const },
  { chain: "Arbitrum · Uniswap v4", lag: "indexed, not servable", state: "note" as const },
  { chain: "Optimism · Uniswap v4", lag: "indexed, not servable", state: "note" as const },
];
