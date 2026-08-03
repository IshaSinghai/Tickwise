import type { Page } from "@playwright/test";

/*
 * Test helpers for the two authenticated realms.
 *
 * Tokens are seeded via addInitScript so they exist before any page script runs
 * — the route guards read localStorage in their first effect, so setting the
 * token after navigation would lose the race and bounce to the login page.
 */

export const PORTAL_TOKEN_KEY = "cp-portal-token";
export const ADMIN_TOKEN_KEY = "cp-admin-token";

export async function seedPortalSession(page: Page): Promise<void> {
  await page.addInitScript(
    ([key]) => window.localStorage.setItem(key, "e2e.portal.token"),
    [PORTAL_TOKEN_KEY],
  );
}

export async function seedAdminSession(page: Page): Promise<void> {
  await page.addInitScript(
    ([key]) => window.localStorage.setItem(key, "e2e.admin.token"),
    [ADMIN_TOKEN_KEY],
  );
}

/*
 * Sets a token on the current page without an init script.
 *
 * Use this — not the seed* helpers — in any test that then *clears* a token.
 * addInitScript re-runs on every navigation, so a seeded token comes back after
 * sign-out, which would both fail a "sign-out blocks access" assertion and make
 * a "the other realm survived" assertion pass for the wrong reason.
 *
 * Requires the page to already be on the app's origin.
 */
export async function setTokenDirect(page: Page, key: string, value: string): Promise<void> {
  await page.evaluate(([k, v]) => window.localStorage.setItem(k, v), [key, value]);
}

/** Routes that live behind the portal guard. */
export function isGuardedPortalRoute(route: string): boolean {
  // The checkout return page is deliberately reachable without a session.
  return route.startsWith("/portal") && !route.startsWith("/portal/checkout/return");
}

/** Routes that live behind the admin guard. */
export function isGuardedAdminRoute(route: string): boolean {
  return route.startsWith("/admin") && route !== "/admin/login";
}
