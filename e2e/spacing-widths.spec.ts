import { test } from "@playwright/test";
import {
  isGuardedAdminRoute,
  isGuardedPortalRoute,
  seedAdminSession,
  seedPortalSession,
} from "./auth";

/*
 * Manual-review capture for the edge-margin / container work: the same pages at
 * four representative widths, written to e2e/manual-review/spacing/<phase>/.
 *
 * Not part of the asserted suite — it produces images for a human to compare,
 * the same role e2e/manual-review/toast-*.png played for the toast swap. It is
 * skipped unless SPACING_PHASE is set, so `npm run e2e` is unaffected:
 *
 *   SPACING_PHASE=before npx playwright test spacing-widths
 *   SPACING_PHASE=after  npx playwright test spacing-widths
 *
 * Screenshots are viewport-only (not fullPage) because the thing under review is
 * the left/right edge margin, and a viewport shot at a known width is the honest
 * way to see it — a full-page shot of a 6000px marketing page scaled down in a
 * review tool hides exactly the tens-of-pixels differences that matter here.
 */

const PHASE = process.env.SPACING_PHASE;

const WIDTHS = [
  { name: "375-mobile", width: 375, height: 900 },
  { name: "768-tablet", width: 768, height: 1000 },
  { name: "1280-laptop", width: 1280, height: 900 },
  // 1440 sits mid-ramp and 1600 just past the content cap, which is where the
  // large-viewport scale-up either reads as designed or as spread out.
  { name: "1440-desktop", width: 1440, height: 900 },
  { name: "1600-desktop", width: 1600, height: 1000 },
  { name: "1920-desktop", width: 1920, height: 1080 },
];

/*
 * One route per distinct container shape found in the audit, so a regression in
 * any of them shows up here rather than only in the asserted 1280 sweep:
 * marketing wide grid, pricing's three different widths, the narrow single-column
 * pages, the docs sidebar+article grid, and both app shells.
 */
const PAGES = [
  { route: "/", name: "landing" },
  { route: "/pricing", name: "pricing" },
  { route: "/docs", name: "docs" },
  { route: "/status", name: "status" },
  { route: "/changelog", name: "changelog" },
  { route: "/support", name: "support" },
  { route: "/contact", name: "contact" },
  { route: "/legal/terms", name: "legal-terms" },
  { route: "/explore", name: "explore" },
  { route: "/portal", name: "portal" },
  { route: "/portal/usage", name: "portal-usage" },
  { route: "/admin", name: "admin" },
  { route: "/login", name: "login" },
];

test.describe("spacing widths", () => {
  test.skip(!PHASE, "set SPACING_PHASE=before|after to capture");

  for (const page_ of PAGES) {
    for (const vp of WIDTHS) {
      test(`${page_.name} @ ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        if (isGuardedPortalRoute(page_.route)) await seedPortalSession(page);
        if (isGuardedAdminRoute(page_.route)) await seedAdminSession(page);
        await page.goto(page_.route, { waitUntil: "networkidle" });
        await page.waitForTimeout(600);
        await page.screenshot({
          path: `e2e/manual-review/spacing/${PHASE}/${page_.name}--${vp.name}.png`,
        });
      });
    }
  }
});
