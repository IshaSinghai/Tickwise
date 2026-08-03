import { defineConfig, devices } from "@playwright/test";

/*
 * Dev-only verification harness for the Lovable-dependency removal migration
 * (see docs/frontend-surface-spec.md and the approved plan). Never imported by
 * app code — this does not affect what ships to production.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  webServer: {
    // Dev server for fast iteration across migration phases. Phase 6's final
    // verification additionally runs the suite against a production build
    // (see e2e/README or the phase-6 command) since dev and prod can differ
    // (render-blocking behavior, React strict-mode double-invoke, etc).
    command: "npm run dev -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
});
