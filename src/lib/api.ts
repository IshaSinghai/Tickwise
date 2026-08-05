/*
 * Typed fetch wrapper for the authenticated realms.
 *
 * The brief specifies no data-fetching library: "fetching is useEffect plus a
 * typed fetch wrapper". This is that wrapper.
 *
 * The transport is real — it attaches the correct realm's bearer token, parses
 * JSON, throws a typed ApiError, and clears only the offending realm's token on
 * 401. What isn't real yet is the server: the account and admin endpoints are
 * marked "backend planned" in the brief, so when no API base URL is configured
 * each endpoint resolves the stubbed data instead of making a request. Setting
 * NEXT_PUBLIC_API_BASE_URL switches every call to the network with no change to
 * any calling component.
 *
 * Only endpoints an actual page consumes are defined here. Writing out the
 * brief's full endpoint list up front would just be dead code of the kind this
 * migration has been deleting.
 */

import {
  ACCOUNT_PROFILE,
  ADMIN_CLIENTS,
  ADMIN_REVENUE,
  ADMIN_SUBSCRIPTIONS,
  ADMIN_SUBSCRIPTION_SUMMARY,
  CURRENT_USAGE,
  MOCK_KEYS,
  PAYMENTS,
  PLANS,
  UNIT_COSTS,
  USAGE_MONTHLY,
  adminClientDetail,
  type AccountProfile,
  type AdminClient,
  type AdminClientDetail,
  type AdminSubscription,
  type ApiKey,
  type Plan,
  type UnitCost,
} from "@/lib/mock";
import { clearToken, getToken, type Realm } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/** True when a real backend is configured; otherwise endpoints serve stub data. */
export function hasBackend(): boolean {
  return BASE_URL.length > 0;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

/**
 * Performs an authenticated request against the API for `realm`.
 *
 * A 401 clears that realm's token and only that realm's, so an expired portal
 * session never signs you out of the admin panel — the reason the two use
 * separate storage keys in the first place.
 */
export async function apiRequest<T>(
  realm: Realm,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getToken(realm);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  if (response.status === 401) {
    clearToken(realm);
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  if (!response.ok) {
    // Surface the server's own message where there is one — the brief asks for
    // errors shown inline "showing the server's own message".
    let message = `Request failed with ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string; error?: string };
      message = payload.message ?? payload.error ?? message;
    } catch {
      /* non-JSON error body; keep the status-based message */
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Resolves stub data with the same async shape a real request would have. */
function stub<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

/**
 * Current-month usage with the reset date computed rather than fixed.
 *
 * §4.4 requires the meter to say the quota resets on the 1st of the month, UTC.
 * The mock module carries a literal `2026-08-01`, which is frozen at build time
 * and drifts into the past — the meter would then claim a reset that had already
 * happened. Computing the next 1st keeps the stub honest for as long as it is in
 * use, and the field is replaced wholesale once the endpoint is live.
 */
function stubCurrentUsage(): typeof CURRENT_USAGE {
  const now = new Date();
  const nextFirst = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  return { ...CURRENT_USAGE, resetOn: nextFirst.toISOString() };
}

/**
 * Unauthenticated request against a capability URL.
 *
 * Separate from apiRequest because §4.2's checkout-status endpoint must work
 * with no session at all: the customer often finishes paying inside a wallet's
 * in-app browser, and the processor's redirect lands them on a page where they
 * were never signed in. The opaque `ref` in the path is the credential, so
 * attaching a realm token here would be both useless and misleading.
 */
async function publicRequest<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string; error?: string };
      message = payload.message ?? payload.error ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

// ── Types the UI consumes ────────────────────────────────────────────────────

export type AccountOverview = {
  plan: Plan;
  keyCount: number;
  usage: { planQuota: number; used: number; resetOn: string };
  lastPayment: (typeof PAYMENTS)[number] | null;
};

export type UsageResponse = {
  monthly: typeof USAGE_MONTHLY;
  current: typeof CURRENT_USAGE;
  unitCosts: typeof UNIT_COSTS;
};

export type CreatedKey = { apiKey: ApiKey; secret: string };

/**
 * What §4.3's banner needs in order to pick its own state.
 *
 * The five banner states are derived from this rather than sent by the server, so
 * the rule ("7 days or fewer means renewal due") lives in one pure function next
 * to the component instead of being duplicated in the backend. See
 * `lifecycleStateFor` in components/LifecycleBanner.tsx.
 */
export type Subscription = {
  status: "active" | "grace" | "free";
  planName: string;
  /** ISO date the current period ends, or ended if the status is grace/free. */
  currentPeriodEnd: string;
  /** ISO date the grace window closes. Only meaningful while status is "grace". */
  graceEndsAt: string | null;
  /** The customer has asked to cancel; the plan runs to currentPeriodEnd. */
  cancelAtPeriodEnd: boolean;
};

// ── Portal endpoints ─────────────────────────────────────────────────────────

export function getAccountOverview(signal?: AbortSignal): Promise<AccountOverview> {
  if (!hasBackend()) {
    const starter = PLANS.find((p) => p.id === "starter") ?? PLANS[0];
    return stub({
      plan: starter,
      keyCount: MOCK_KEYS.length,
      usage: stubCurrentUsage(),
      lastPayment: PAYMENTS[0] ?? null,
    });
  }
  return apiRequest<AccountOverview>("portal", "/account/overview", { signal });
}

export function getAccountKeys(signal?: AbortSignal): Promise<ApiKey[]> {
  if (!hasBackend()) return stub(MOCK_KEYS);
  return apiRequest<ApiKey[]>("portal", "/account/keys", { signal });
}

export function createAccountKey(input: {
  label: string;
  type: ApiKey["type"];
}): Promise<CreatedKey> {
  if (!hasBackend()) {
    // The real endpoint returns the raw secret exactly once; mirroring that here
    // keeps the one-time-reveal UI honest about what it is handling.
    const prefix = `kc_live_${Math.random().toString(36).slice(2, 18)}`;
    return stub({
      apiKey: {
        id: crypto.randomUUID(),
        label: input.label,
        prefix,
        type: input.type,
        origins: [],
        createdAt: new Date().toISOString().slice(0, 10),
        lastUsed: null,
      },
      secret: `${prefix}_${Math.random().toString(36).slice(2, 32)}`,
    });
  }
  return apiRequest<CreatedKey>("portal", "/account/keys", { method: "POST", body: input });
}

export function revokeAccountKey(id: string): Promise<void> {
  if (!hasBackend()) return stub(undefined);
  return apiRequest<void>("portal", `/account/keys/${id}`, { method: "DELETE" });
}

export function getAccountProfile(signal?: AbortSignal): Promise<AccountProfile> {
  if (!hasBackend()) return stub(ACCOUNT_PROFILE);
  return apiRequest<AccountProfile>("portal", "/account/profile", { signal });
}

export function getAccountUsage(signal?: AbortSignal): Promise<UsageResponse> {
  if (!hasBackend()) {
    return stub({ monthly: USAGE_MONTHLY, current: stubCurrentUsage(), unitCosts: UNIT_COSTS });
  }
  return apiRequest<UsageResponse>("portal", "/account/usage", { signal });
}

export function getAccountPayments(signal?: AbortSignal): Promise<typeof PAYMENTS> {
  if (!hasBackend()) return stub(PAYMENTS);
  return apiRequest<typeof PAYMENTS>("portal", "/account/payments", { signal });
}

export function getSubscription(signal?: AbortSignal): Promise<Subscription> {
  if (!hasBackend()) {
    /*
     * Dates are computed per call, not at module scope. A literal date would be
     * frozen at build time and drift into the past — the banner this replaces
     * hardcoded "1 August 2026", which had already gone stale.
     */
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 20);
    const starter = PLANS.find((p) => p.id === "starter") ?? PLANS[0];
    return stub({
      status: "active" as const,
      planName: starter?.name ?? "Starter",
      currentPeriodEnd: periodEnd.toISOString(),
      graceEndsAt: null,
      cancelAtPeriodEnd: false,
    });
  }
  return apiRequest<Subscription>("portal", "/account/subscription", { signal });
}

// ── Checkout status (public capability URL, no session) ──────────────────────

/** The five outcomes §4.2 requires the return page to distinguish. */
export type CheckoutState = "pending" | "confirmed" | "underpaid" | "expired" | "failed";

export type CheckoutStatusResponse = {
  state: CheckoutState;
  /** Present when underpaid: what is still owed, and where to send it. */
  remaining?: { amount: string; address: string };
};

/**
 * Reads a checkout's status. Throws ApiError(503) when no backend is configured,
 * which the return page renders as "cannot confirm yet" — deliberately NOT as a
 * success or a failure, because §4.2 forbids claiming an outcome we have not
 * been told. There is no stub happy-path here on purpose: a fake "confirmed"
 * is exactly the bug the brief warns about.
 */
export function getCheckoutStatus(
  ref: string,
  signal?: AbortSignal,
): Promise<CheckoutStatusResponse> {
  if (!hasBackend()) {
    return Promise.reject(
      new ApiError(503, "We can’t reach the payment processor from this environment yet."),
    );
  }
  return publicRequest<CheckoutStatusResponse>(
    `/public/checkout/${encodeURIComponent(ref)}/status`,
    signal,
  );
}

// ── Admin endpoints ──────────────────────────────────────────────────────────

/*
 * Every endpoint in this section is backend-planned, so each one resolves its
 * fallback from lib/mock while no API base URL is configured. That is the
 * arrangement §1 allows for planned endpoints — and unlike the public metrics, an
 * internal panel behind an admin token is not making a claim to a customer.
 *
 * What the fallbacks do *not* do is fake a write. Nothing here pretends a PATCH
 * succeeded; the pages that offer an edit say the write needs the admin API
 * instead, which is the same rule the checkout return page follows.
 */

export function getAdminPlans(signal?: AbortSignal): Promise<Plan[]> {
  if (!hasBackend()) return stub(PLANS);
  return apiRequest<Plan[]>("admin", "/admin/plans", { signal });
}

export function getAdminPayments(signal?: AbortSignal): Promise<typeof PAYMENTS> {
  if (!hasBackend()) return stub(PAYMENTS);
  return apiRequest<typeof PAYMENTS>("admin", "/admin/payments", { signal });
}

export function getAdminClients(signal?: AbortSignal): Promise<AdminClient[]> {
  if (!hasBackend()) return stub(ADMIN_CLIENTS);
  return apiRequest<AdminClient[]>("admin", "/admin/clients", { signal });
}

/**
 * One client's detail record.
 *
 * Rejects with a 404 for an id that doesn't exist rather than resolving something
 * empty, so `/admin/clients/nope` renders the error state with a real message
 * instead of a page of blanks.
 */
export function getAdminClient(id: string, signal?: AbortSignal): Promise<AdminClientDetail> {
  if (!hasBackend()) {
    const detail = adminClientDetail(id);
    return detail ? stub(detail) : Promise.reject(new ApiError(404, `No client with id ${id}.`));
  }
  return apiRequest<AdminClientDetail>("admin", `/admin/clients/${encodeURIComponent(id)}`, {
    signal,
  });
}

export function getAdminEndpointCosts(signal?: AbortSignal): Promise<UnitCost[]> {
  if (!hasBackend()) return stub(UNIT_COSTS);
  return apiRequest<UnitCost[]>("admin", "/admin/endpoints", { signal });
}

export type AdminSubscriptionsResponse = {
  subscriptions: AdminSubscription[];
  summary: typeof ADMIN_SUBSCRIPTION_SUMMARY;
};

export function getAdminSubscriptions(signal?: AbortSignal): Promise<AdminSubscriptionsResponse> {
  if (!hasBackend()) {
    return stub({ subscriptions: ADMIN_SUBSCRIPTIONS, summary: ADMIN_SUBSCRIPTION_SUMMARY });
  }
  return apiRequest<AdminSubscriptionsResponse>("admin", "/admin/subscriptions", { signal });
}

export type AdminRevenue = typeof ADMIN_REVENUE;

export function getAdminRevenue(signal?: AbortSignal): Promise<AdminRevenue> {
  if (!hasBackend()) return stub(ADMIN_REVENUE);
  return apiRequest<AdminRevenue>("admin", "/admin/revenue", { signal });
}

// ── Playground ───────────────────────────────────────────────────────────────

export type PlaygroundResult = { status: number; body: string; unitsSpent: number | null };

/**
 * Runs one playground request against the real API on the customer's behalf.
 *
 * The previous implementation fabricated a response body — `{ pair: "USDC/WETH",
 * tvl_usd: 12480322, units_spent: 1 }` — and printed it in a JSON viewer under a
 * heading promising "your real key. Units spent are counted." A made-up API
 * response is the most misleading kind of invented data on the site, so there is
 * no offline happy path here: with no API configured this rejects, exactly as the
 * checkout-status endpoint does.
 */
export async function sendPlaygroundRequest(
  endpoint: string,
  chain: string,
  signal?: AbortSignal,
): Promise<PlaygroundResult> {
  if (!hasBackend()) {
    throw new ApiError(
      503,
      "The playground sends real requests, so it needs a live API — this environment isn’t connected to one yet.",
    );
  }

  // Endpoints arrive as they are printed in the docs, e.g. "GET /v1/pools".
  const path = endpoint.replace(/^[A-Z]+\s+/, "");
  const url = `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}chain=${encodeURIComponent(chain)}`;
  const token = getToken("portal");
  const response = await fetch(url, {
    headers: token
      ? { Accept: "application/json", Authorization: `Bearer ${token}` }
      : { Accept: "application/json" },
    signal,
  });

  const text = await response.text();
  let body = text;
  try {
    body = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    /* not JSON; show it verbatim */
  }

  const spent = Number(response.headers.get("X-Units-Spent"));
  return {
    status: response.status,
    body,
    unitsSpent: Number.isFinite(spent) && response.headers.has("X-Units-Spent") ? spent : null,
  };
}
