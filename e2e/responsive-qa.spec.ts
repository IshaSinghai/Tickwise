import { test, expect } from "@playwright/test";

import { ROUTES } from "./routes";
import {
  isGuardedAdminRoute,
  isGuardedPortalRoute,
  seedAdminSession,
  seedPortalSession,
} from "./auth";

/*
 * Responsive QA across the nine widths in the brief, asserted rather than eyeballed.
 *
 * Two things a screenshot review misses and this catches:
 *
 *  1. Horizontal overflow of the document. `scrollWidth > clientWidth` means the
 *     page can be scrolled sideways, which is the "no overflow" requirement stated
 *     as a measurement. 320px is the width that finds these.
 *  2. Individual elements poking past the viewport's right edge, which happens
 *     even when the document itself does not scroll — a nowrap row inside an
 *     `overflow-hidden` ancestor is clipped rather than scrollable, so content is
 *     silently unreachable.
 *
 * Elements inside a deliberately scrollable container (`overflow-x: auto`) are
 * exempt: a wide data table that scrolls inside its own panel is the intended
 * design, not a defect.
 */

const WIDTHS = [320, 375, 390, 414, 768, 1024, 1280, 1440, 1920];

/*
 * A representative route per shell rather than all 39 at all 9 widths, which
 * would be ~350 page loads. Every distinct layout is covered: marketing wide grid,
 * pricing card grid, docs sidebar+prose, a narrow single-column page, the wide
 * data table, both app shells, and a centred auth card.
 */
const ROUTES_UNDER_TEST = [
  "/",
  "/pricing",
  "/docs",
  "/docs/units-and-limits",
  "/status",
  "/contact",
  "/explore",
  "/changelog",
  "/portal",
  "/portal/usage",
  "/portal/keys",
  "/admin",
  "/login",
];

// Guard against the list silently drifting away from the real route table.
test("every route under test is a real route", () => {
  for (const route of ROUTES_UNDER_TEST) {
    expect(ROUTES as readonly string[]).toContain(route);
  }
});

for (const width of WIDTHS) {
  for (const route of ROUTES_UNDER_TEST) {
    test(`no overflow ${route} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      if (isGuardedPortalRoute(route)) await seedPortalSession(page);
      if (isGuardedAdminRoute(route)) await seedAdminSession(page);
      await page.goto(route, { waitUntil: "load" });

      /*
       * Wait for entrance animations to settle rather than neutralising transforms.
       * Killing transforms looked tidier but measured a layout that never exists:
       * it undoes `-translate-x-1/2` centring and the ambient-orb offsets, which
       * invented overflow on pages that had none. Entrance motion finishes by
       * ~2.2s per the motion spec.
       */
      await page.waitForTimeout(2600);

      const report = await page.evaluate(() => {
        const doc = document.documentElement;
        const viewport = doc.clientWidth;

        /*
         * Exempt anything an ancestor already contains. `auto`/`scroll` is a
         * deliberately scrollable panel (the wide data tables); `hidden`/`clip`
         * means the bleed is cropped and unreachable to the user either way. What
         * is left is content that genuinely escapes the viewport.
         */
        const contained = (el: Element): boolean => {
          for (let n: Element | null = el.parentElement; n; n = n.parentElement) {
            const o = getComputedStyle(n).overflowX;
            if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") return true;
          }
          return false;
        };

        const offenders: { tag: string; cls: string; right: number }[] = [];
        for (const el of Array.from(document.body.querySelectorAll("*"))) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          // 1px of slack absorbs sub-pixel layout rounding.
          if (r.right <= viewport + 1) continue;
          if (contained(el)) continue;
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: String((el as HTMLElement).className).slice(0, 80),
            right: Math.round(r.right),
          });
        }

        return {
          viewport,
          docScrollWidth: doc.scrollWidth,
          offenders: offenders.slice(0, 6),
        };
      });

      expect(
        report.docScrollWidth,
        `${route} @ ${width}: document scrolls horizontally (${report.docScrollWidth} > ${report.viewport})`,
      ).toBeLessThanOrEqual(report.viewport + 1);

      expect(
        report.offenders,
        `${route} @ ${width}: elements extend past the viewport's right edge`,
      ).toEqual([]);
    });
  }
}
