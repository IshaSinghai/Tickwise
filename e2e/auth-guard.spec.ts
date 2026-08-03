import { test, expect } from "@playwright/test";

import type { Page } from "@playwright/test";

import {
  ADMIN_TOKEN_KEY,
  PORTAL_TOKEN_KEY,
  seedAdminSession,
  seedPortalSession,
  setTokenDirect,
} from "./auth";

/** Signs in via the real form, so the token is issued by the app itself. */
async function signInThroughUi(page: Page): Promise<void> {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill("dev@example.com");
  await page.locator('input[type="password"]').fill("hunter2");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/portal$/);
}

/*
 * Covers the auth behaviour the brief specifies: tokens in localStorage under
 * separate per-realm keys, layouts guarding routes in an effect and redirecting,
 * and a session in one realm granting nothing in the other.
 *
 * The realm-isolation cases are the ones worth having: they're the difference
 * between two independent sessions and one shared login, and nothing about the
 * UI would look wrong if they were broken.
 */

test.describe("portal guard", () => {
  test("redirects to /login with no session", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("renders the portal with a portal session", async ({ page }) => {
    await seedPortalSession(page);
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("an admin session does NOT grant portal access", async ({ page }) => {
    await seedAdminSession(page);
    await page.goto("/portal/keys");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("the checkout return page stays reachable without any session", async ({ page }) => {
    // Reached from the payment processor's redirect, often in a wallet's in-app
    // browser with no session at all — gating it would break paid activation.
    await page.goto("/portal/checkout/return");
    await expect(page).toHaveURL(/\/portal\/checkout\/return$/);
  });
});

test.describe("admin guard", () => {
  test("redirects to /admin/login with no session", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("renders the panel with an admin session", async ({ page }) => {
    await seedAdminSession(page);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("a portal session does NOT grant admin access", async ({ page }) => {
    await seedPortalSession(page);
    await page.goto("/admin/plans");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("/admin/login is reachable without a session", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test.describe("sign-in and sign-out", () => {
  test("signing in stores a portal token and lands in the portal", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("dev@example.com");
    await page.locator('input[type="password"]').fill("hunter2");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/portal$/);
    const token = await page.evaluate((k) => window.localStorage.getItem(k), PORTAL_TOKEN_KEY);
    expect(token).not.toBeNull();
    // Signing into the portal must not create an admin session.
    const adminToken = await page.evaluate((k) => window.localStorage.getItem(k), ADMIN_TOKEN_KEY);
    expect(adminToken).toBeNull();
  });

  test("signing out clears the token and blocks the portal again", async ({ page }) => {
    // Signs in through the real UI rather than seeding, because a seeded token
    // is reinstalled on every navigation and would mask the very thing under
    // test here.
    await signInThroughUi(page);

    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    const token = await page.evaluate((k) => window.localStorage.getItem(k), PORTAL_TOKEN_KEY);
    expect(token, "sign-out must clear the token, not just navigate").toBeNull();

    // The regression this guards against: sign-out used to be a plain link, so
    // going back to /portal let you straight back in.
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signing out of the portal leaves an admin session intact", async ({ page }) => {
    await signInThroughUi(page);
    // Set directly, not via init script, so this assertion can't pass merely
    // because the token was reinstalled on navigation.
    await setTokenDirect(page, ADMIN_TOKEN_KEY, "e2e.admin.token");

    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    const adminToken = await page.evaluate((k) => window.localStorage.getItem(k), ADMIN_TOKEN_KEY);
    expect(adminToken, "portal sign-out must not clear the admin realm").not.toBeNull();
  });
});
