import { test, expect } from "@playwright/test";
import {
  isGuardedAdminRoute,
  isGuardedPortalRoute,
  seedAdminSession,
  seedPortalSession,
} from "./auth";

/*
 * Asserts the edge-margin contract numerically rather than by eye: the gutter at
 * each viewport, the frame cap, the margin those two produce together, and one
 * single left edge per viewport across every page frame on the page.
 *
 * This is the part of the spacing pass a screenshot can't hold onto. A visual
 * baseline notices that a page changed; it can't say whether the change put the
 * left edge back at 344px, and it says nothing at all about the three widths the
 * asserted sweep never runs. The regression this guards against is exactly the
 * one the pass exists to fix — a new section wrapper picking its own `mx-auto
 * max-w-* px-*` trio and quietly reintroducing a second left edge.
 *
 * Measured against `.container-page` boxes, which is where the contract lives.
 * `px-gutter` bars (the portal/admin top bars, the auth and error pages) take
 * the same padding from the same custom property, but they are full-bleed
 * elements whose own box has no gutter to measure.
 */

const MARKETING = [
  { route: "/", name: "landing" },
  { route: "/pricing", name: "pricing" },
  { route: "/docs", name: "docs" },
  { route: "/status", name: "status" },
  { route: "/changelog", name: "changelog" },
  { route: "/support", name: "support" },
  { route: "/contact", name: "contact" },
  { route: "/legal/terms", name: "legal-terms" },
  { route: "/explore", name: "explore" },
];

/*
 * Sidebar realms: the frame sits inside the content column beside a fixed
 * sidebar, so its gutter is measured from the column's edge rather than the
 * viewport's. A viewport-relative margin is impossible there — the sidebar
 * occupies it — and the same gutter measured from the column edge gives the same
 * visual result the marketing pages have, which is the point.
 */
const SIDEBAR = [
  { route: "/portal", name: "portal" },
  { route: "/admin", name: "admin" },
];

/*
 * `--gutter` ramps twice: a 16px floor to 640 reaching 24px at 720, then flat to
 * 1280, then 24px -> 48px across 1280..1536 and flat again.
 *
 * `edge` is the margin actually visible beside the content, which is the gutter
 * plus whatever the 1536 frame cap leaves over. The two diverge above 1536: at
 * 1920 the gutter is still 48px but the visible margin is 240px, because content
 * has stopped growing and the margin absorbs the rest.
 */
const WIDTHS = [
  { width: 375, gutter: 16, edge: 16 },
  { width: 768, gutter: 24, edge: 24 },
  { width: 1280, gutter: 24, edge: 24 },
  { width: 1440, gutter: 39, edge: 39 },
  // 240 = the 192px each side left over once the 1536 cap bites, plus the gutter.
  { width: 1920, gutter: 48, edge: 240 },
];

/*
 * `--container-page`. The frame caps here and centres in whatever contains it.
 *
 * Asserting the gutter and the cap separately, and deriving the expected edge from
 * them, is deliberate. A table of per-route, per-width pixel expectations would
 * have to be rewritten by hand every time either number is retuned, and a stale
 * hand-written number is indistinguishable from a real regression.
 */
const CAP = 1536;

/*
 * Chromium resolves `vw` against the viewport including any classic scrollbar,
 * so a computed gutter can land a fraction off the ideal on a scrolling page.
 * 2px absorbs that without letting a real regression — which moves edges by tens
 * or hundreds of pixels — through.
 */
const TOLERANCE = 2;

for (const { width, gutter, edge } of WIDTHS) {
  for (const { route, name, sidebar } of [
    ...MARKETING.map((c) => ({ ...c, sidebar: false })),
    ...SIDEBAR.map((c) => ({ ...c, sidebar: true })),
  ]) {
    test(`gutter ${name} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      if (isGuardedPortalRoute(route)) await seedPortalSession(page);
      if (isGuardedAdminRoute(route)) await seedAdminSession(page);
      /*
       * `load`, not `networkidle`. Gutters come from CSS, and stylesheets block
       * `load`, so layout is settled by then. Waiting for `networkidle` on top of
       * that made this spec time out intermittently on `/` — the one route the
       * sweep already flags as never going quiet (CONTINUOUS_ANIMATION_ROUTES) —
       * which is a harness artefact, not a spacing failure.
       */
      await page.goto(route, { waitUntil: "load" });

      /*
       * Neutralise transforms before measuring. The landing page's `Reveal`
       * sections animate in from `scale(0.985)`, and a scaled box reports a
       * bounding rect inset by 14.4px at 1920 while its padding is exactly the
       * gutter — a motion artefact on any section still below the fold, not a
       * spacing bug. This spec is about layout, so it measures the layout box;
       * animation is checked by eye per the migration plan.
       */
      await page.addStyleTag({ content: `*, *::before, *::after { transform: none !important; }` });

      const frames = page.locator(".container-page");
      const count = await frames.count();
      expect(count, `${route} should have at least one .container-page frame`).toBeGreaterThan(0);

      const measured = [];
      for (let i = 0; i < count; i++) {
        const box = await frames.nth(i).evaluate((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          /*
           * The frame's containing block, which is what it centres itself in and
           * what the cap is measured against: the viewport for marketing pages,
           * the content column for the sidebar realms. Taking it from the DOM
           * rather than assuming it keeps the sidebar's own width out of the
           * expectations.
           */
          const parent = el.parentElement!;
          const pr = parent.getBoundingClientRect();
          const pcs = getComputedStyle(parent);
          return {
            frameWidth: r.width,
            padLeft: parseFloat(cs.paddingLeft),
            padRight: parseFloat(cs.paddingRight),
            contentLeft: r.left + parseFloat(cs.paddingLeft),
            contentRight: r.right - parseFloat(cs.paddingRight),
            blockLeft: pr.left + parseFloat(pcs.paddingLeft),
            blockWidth: pr.width - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight),
          };
        });
        // The collapsed mobile nav is a `.container-page` that isn't laid out;
        // there is no gutter to check on a zero-width box.
        if (box.frameWidth === 0) continue;
        measured.push(box);
      }

      for (const m of measured) {
        const where = `${route} @ ${width}`;

        // 1. The gutter itself, both sides.
        expect(m.padLeft, `${where}: left gutter`).toBeGreaterThan(gutter - TOLERANCE);
        expect(m.padLeft, `${where}: left gutter`).toBeLessThan(gutter + TOLERANCE);
        expect(m.padRight, `${where}: right gutter`).toBeGreaterThan(gutter - TOLERANCE);
        expect(m.padRight, `${where}: right gutter`).toBeLessThan(gutter + TOLERANCE);

        // 2. The cap, and that the frame centres once the cap bites.
        const expectedFrame = Math.min(m.blockWidth, CAP);
        expect(m.frameWidth, `${where}: frame width should cap at ${CAP}`).toBeGreaterThan(
          expectedFrame - TOLERANCE,
        );
        expect(m.frameWidth, `${where}: frame width should cap at ${CAP}`).toBeLessThan(
          expectedFrame + TOLERANCE,
        );

        // 3. The margin actually visible beside the content — gutter plus whatever
        //    the cap left over. For marketing this is the number from the spec
        //    table; in the sidebar realms it is measured from the column, since a
        //    viewport-relative margin is not reachable past a fixed sidebar.
        const visibleLeft = m.contentLeft - m.blockLeft;
        const visibleRight = m.blockLeft + m.blockWidth - m.contentRight;
        const expectedVisible = sidebar ? Math.max(0, (m.blockWidth - CAP) / 2) + gutter : edge;
        expect(visibleLeft, `${where}: visible left margin`).toBeGreaterThan(
          expectedVisible - TOLERANCE,
        );
        expect(visibleLeft, `${where}: visible left margin`).toBeLessThan(
          expectedVisible + TOLERANCE,
        );
        expect(visibleRight, `${where}: visible right margin`).toBeGreaterThan(
          expectedVisible - TOLERANCE,
        );
        expect(visibleRight, `${where}: visible right margin`).toBeLessThan(
          expectedVisible + TOLERANCE,
        );
      }

      // Every frame on the page must share one left edge. This is the
      // "consistent" half of the requirement, and the half that had regressed —
      // and it holds regardless of what the gutter and cap are tuned to.
      const lefts = [...new Set(measured.map((m) => Math.round(m.contentLeft)))];
      expect(lefts, `${route} @ ${width}: every .container-page shares one left edge`).toHaveLength(
        1,
      );
    });
  }
}

/*
 * Content must never shrink as the viewport grows.
 *
 * This is the invariant the gutter ramp and the frame cap have to respect
 * *jointly*, and neither one can be checked for it alone: a gutter that kept
 * growing after the frame capped would quietly eat into content, so the page
 * would get narrower as the screen got wider. It is why the ramp's 48px ceiling
 * is reached at exactly 1536, the cap width.
 *
 * Sweeps widths inside one test rather than across the parameterised tests above,
 * because those are distributed over parallel workers and could not accumulate a
 * sequence reliably.
 */
for (const route of ["/pricing", "/docs"]) {
  test(`content width never shrinks as the viewport grows — ${route}`, async ({ page }) => {
    const sweep = [1024, 1280, 1366, 1440, 1536, 1600, 1728, 1920, 2560];
    const seen: { width: number; content: number }[] = [];

    for (const width of sweep) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route, { waitUntil: "load" });
      const content = await page
        .locator(".container-page")
        .first()
        .evaluate((el) => {
          const cs = getComputedStyle(el);
          return (
            el.getBoundingClientRect().width -
            parseFloat(cs.paddingLeft) -
            parseFloat(cs.paddingRight)
          );
        });
      seen.push({ width, content: Math.round(content) });
    }

    const trace = seen.map((s) => `${s.width}->${s.content}`).join("  ");
    for (let i = 1; i < seen.length; i++) {
      expect(
        seen[i].content,
        `${route}: content shrank between ${seen[i - 1].width} and ${seen[i].width}\n  ${trace}`,
      ).toBeGreaterThanOrEqual(seen[i - 1].content - 1);
    }

    // And it must actually stop, rather than tracking the viewport forever.
    const widest = Math.max(...seen.map((s) => s.content));
    expect(widest, `${route}: content should cap near 1440\n  ${trace}`).toBeLessThan(1460);
  });
}
