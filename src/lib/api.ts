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
  CURRENT_USAGE,
  MOCK_KEYS,
  PAYMENTS,
  PLANS,
  UNIT_COSTS,
  USAGE_MONTHLY,
  type ApiKey,
  type Plan,
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

// ── Portal endpoints ─────────────────────────────────────────────────────────

export function getAccountOverview(signal?: AbortSignal): Promise<AccountOverview> {
  if (!hasBackend()) {
    const starter = PLANS.find((p) => p.id === "starter") ?? PLANS[0];
    return stub({
      plan: starter,
      keyCount: MOCK_KEYS.length,
      usage: CURRENT_USAGE,
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

export function getAccountUsage(signal?: AbortSignal): Promise<UsageResponse> {
  if (!hasBackend()) {
    return stub({ monthly: USAGE_MONTHLY, current: CURRENT_USAGE, unitCosts: UNIT_COSTS });
  }
  return apiRequest<UsageResponse>("portal", "/account/usage", { signal });
}

export function getAccountPayments(signal?: AbortSignal): Promise<typeof PAYMENTS> {
  if (!hasBackend()) return stub(PAYMENTS);
  return apiRequest<typeof PAYMENTS>("portal", "/account/payments", { signal });
}

// ── Admin endpoints ──────────────────────────────────────────────────────────

export function getAdminPlans(signal?: AbortSignal): Promise<Plan[]> {
  if (!hasBackend()) return stub(PLANS);
  return apiRequest<Plan[]>("admin", "/admin/plans", { signal });
}

export function getAdminPayments(signal?: AbortSignal): Promise<typeof PAYMENTS> {
  if (!hasBackend()) return stub(PAYMENTS);
  return apiRequest<typeof PAYMENTS>("admin", "/admin/payments", { signal });
}
