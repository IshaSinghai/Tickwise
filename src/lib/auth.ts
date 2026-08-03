/*
 * Client-side auth for the two authenticated realms.
 *
 * Per the frontend brief: tokens live in localStorage, layouts guard routes in a
 * useEffect and redirect, and there is no middleware.ts. Portal and admin use
 * separate token keys deliberately, so both sessions can coexist in one browser
 * and a 401 in one realm clears only that realm.
 */

export type Realm = "portal" | "admin";

const TOKEN_KEYS: Record<Realm, string> = {
  portal: "cp-portal-token",
  admin: "cp-admin-token",
};

/** Where to send an unauthenticated visitor for each realm. */
export const LOGIN_PATH: Record<Realm, string> = {
  portal: "/login",
  admin: "/admin/login",
};

/** Routes inside a realm that must stay reachable without a token. */
export const REALM_PUBLIC_PATHS: Record<Realm, readonly string[]> = {
  // The checkout return page is reached from the payment processor's redirect,
  // often inside a wallet's in-app browser with no session at all — the brief
  // calls this out specifically, so it must never be gated.
  portal: ["/portal/checkout/return"],
  admin: ["/admin/login"],
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getToken(realm: Realm): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(TOKEN_KEYS[realm]);
  } catch {
    // Safari private mode and similar can throw on localStorage access.
    return null;
  }
}

export function setToken(realm: Realm, token: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(TOKEN_KEYS[realm], token);
  } catch {
    /* non-fatal: the user simply won't stay signed in */
  }
}

/** Clears only this realm's token, leaving the other realm's session intact. */
export function clearToken(realm: Realm): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(TOKEN_KEYS[realm]);
  } catch {
    /* ignore */
  }
}

export function isAuthenticated(realm: Realm): boolean {
  return getToken(realm) !== null;
}

/*
 * Stands in for a real sign-in until the auth endpoints exist (the brief marks
 * POST /account/auth/login and /signup as "backend planned").
 *
 * The token is a placeholder string, but everything around it is real: it's
 * stored under the correct per-realm key, the route guards read it, sign-out
 * clears it, and the fetch wrapper sends it and clears it on 401. When the
 * backend lands, the only change is that this returns a server-issued token —
 * no guard, shell or page has to be rewritten.
 */
export function issuePlaceholderSession(realm: Realm): void {
  setToken(realm, `placeholder.${realm}.${Date.now()}`);
}

/** True if `pathname` is reachable within `realm` without a token. */
export function isRealmPublicPath(realm: Realm, pathname: string): boolean {
  return REALM_PUBLIC_PATHS[realm].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
