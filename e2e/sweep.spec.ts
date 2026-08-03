import { test, expect } from "@playwright/test";
import { ROUTES } from "./routes";
import { isAllowlistedError } from "./allowlist";

/*
 * Visits every routed page, asserts zero unexpected console/page errors, and
 * takes a full-page visual-regression screenshot. Screenshots are taken with
 * animations disabled (Playwright freezes finite CSS transitions at their end
 * state and pauses infinite ones) so the baseline is deterministic regardless
 * of which animation implementation (Framer Motion today, hand-rolled CSS
 * later) is currently mounted — this sweep is checking DOM/visual output, not
 * animation timing/feel, which stays a manual check per the migration plan.
 *
 * Known pre-existing errors unrelated to this migration are filtered via
 * allowlist.ts (shared across every spec file).
 */

/*
 * Routes with native SVG SMIL (<animateMotion>/<animate>) or other animation
 * that Playwright's `animations: "disabled"` cannot freeze (that option only
 * pauses CSS animations/transitions). A pixel-diff assertion against these
 * never converges — it's not flaky, it's structurally unable to stabilize.
 * These get console/status checks plus a best-effort informational screenshot
 * (not asserted), rather than a strict comparison. See migration plan: "static
 * screenshots ... prove final-state correctness, not animation fidelity" —
 * this is that same limitation, stated as code instead of prose.
 */
const CONTINUOUS_ANIMATION_ROUTES = new Set(["/"]);

for (const route of ROUTES) {
  test(`sweep ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isAllowlistedError(msg.text())) errors.push(msg.text());
    });
    page.on("pageerror", (err) => {
      if (!isAllowlistedError(err.message)) errors.push(err.message);
    });

    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), `${route} should return 200`).toBe(200);

    // Let any mount-triggered timers/typewriters/phase machines settle so the
    // screenshot captures a stable frame rather than mid-sequence.
    await page.waitForTimeout(500);

    expect(errors, `console/page errors on ${route}:\n${errors.join("\n")}`).toEqual([]);

    const name = route === "/" ? "home" : route.replace(/\//g, "-").slice(1);
    if (CONTINUOUS_ANIMATION_ROUTES.has(route)) {
      await page.screenshot({ path: `e2e/manual-review/${name}.png`, fullPage: true });
    } else {
      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        animations: "disabled",
        timeout: 15_000,
      });
    }
  });
}
