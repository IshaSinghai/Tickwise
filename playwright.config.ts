import { defineConfig, devices } from "@playwright/test";

/*
 * Dev-only verification harness for the Lovable-dependency removal migration
 * (see docs/frontend-surface-spec.md and the approved plan). Never imported by
 * app code — this does not affect what ships to production.
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  // 4 workers hammering one Node server on Windows exhausts sockets and drops
  // connections (net::ERR_CONNECTION_CLOSED on random routes), which reads as a
  // product failure but is pure harness load. 2 workers is stable here.
  workers: 2,
  // One retry absorbs genuinely transient network flake without hiding real
  // bugs: a deterministic failure still fails every attempt. Any test that only
  // passes on retry is worth investigating rather than shrugging at.
  retries: 1,
  // Full-page screenshots of the long marketing pages exceed the 30s default.
  timeout: 90_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  webServer: {
    // Production build, deliberately — not `next dev`.
    //
    // The suite's job is to prove the migrated app behaves identically to what
    // *ships*, and a dev server turned out to be an unusable target for it:
    // it compiles routes on demand (so the first tests on a cold server time
    // out waiting for webpack) and it drops connections under parallel load
    // (net::ERR_CONNECTION_CLOSED on random routes). Both produced failures
    // that looked like product bugs but were purely harness artifacts. A prod
    // build compiles everything once up front and serves it from a static
    // server, which is both stable and representative.
    //
    // Trade-off accepted: prod minifies React's hydration-mismatch messages.
    // When a mismatch needs diagnosing, re-run against dev with
    // `NEXT_DIST_DIR=.next-e2e npm run dev -- -p 3100` in one terminal and
    // `npx playwright test` in another to get the readable message.
    //
    // NEXT_DIST_DIR keeps this build out of `.next`, so running the suite never
    // corrupts a `npm run dev` you have open on port 3000. Without it both
    // processes write the same manifests and the loser dies with
    // "Expected clientReferenceManifest to be defined".
    command: "npm run build && npm run start -- -p 3100",
    env: { NEXT_DIST_DIR: ".next-e2e" },
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  expect: {
    /*
     * An absolute pixel budget, not a ratio — the ratio was actively hiding
     * layout bugs.
     *
     * `maxDiffPixelRatio: 0.01` scales the allowance with page height, so the
     * taller the page the more it forgives. /pricing is a 1280x2335 full-page
     * shot, i.e. 2,988,800 pixels, which bought it a 29,888-pixel free pass.
     * Moving its unit-cost panel 128px left and widening it by 256px registered
     * 15,721 differing pixels — a change you can see across the room — and the
     * sweep passed it. Two admin pages passed the same way during the same
     * change. A ratio also means the same regression is caught on a short page
     * and missed on a long one, which is the opposite of useful.
     *
     * 100 absolute pixels sits between the two things measured on this suite:
     * run-to-run drift on the asserted routes is 0 pixels (two consecutive runs
     * at maxDiffPixelRatio: 0 both passed against freshly regenerated
     * baselines), and the smallest real signal worth catching is ~1,200 pixels
     * — one border line of a full-width panel moving a single pixel. So it is
     * >100x above the noise and >10x below the smallest thing it must catch.
     *
     * `threshold` is Playwright's default, pinned explicitly because it is
     * load-bearing here: it is the per-pixel colour distance below which pixels
     * count as identical, and this palette is dark-on-dark (surface oklch 0.18
     * on background oklch 0.14). Panel *fills* shift without registering at
     * 0.2; borders and text still do, which is what makes the budget above
     * work. Lower it before loosening the budget if that ever stops holding.
     *
     * Continuous-animation routes are excluded from assertion in sweep.spec.ts
     * rather than absorbed by tolerance here — see CONTINUOUS_ANIMATION_ROUTES.
     */
    toHaveScreenshot: { maxDiffPixels: 100, threshold: 0.2 },
  },
});
