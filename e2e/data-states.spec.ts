import { test, expect, type Page } from "@playwright/test";

import { seedAdminSession, seedPortalSession } from "./auth";

/**
 * The app's own inline error panel.
 *
 * `getByRole("alert")` alone matches two elements on every App Router page: the
 * InlineError, and Next's `#__next-route-announcer__`, which also carries
 * role="alert". Excluding the announcer by id keeps the assertion pointed at the
 * thing under test instead of failing strict mode.
 */
const inlineError = (page: Page) =>
  page.locator('[role="alert"]:not([id="__next-route-announcer__"])');

/*
 * The four-state contract, and the invented-metric ban, asserted rather than
 * eyeballed.
 *
 * Two distinct things are checked here.
 *
 * **Populated / empty / error.** Every data-driven screen has to have all four
 * states. Three of them are reachable in this environment and are asserted below.
 * The fourth — loading — is not observably reachable here and is deliberately not
 * faked: with no API base URL configured, `lib/api` resolves its fallback in a
 * microtask, so the skeleton exists for zero frames after hydration, and the
 * server-rendered pages have their data before the first byte. A test that
 * "passed" by asserting nothing would be worse than this comment. Wiring the
 * skeletons is verified by review; they become observable the moment a real
 * backend adds latency.
 *
 * **No invented metrics.** These assertions are negative on purpose: they name the
 * exact figures that used to be printed as fact — "12,480" pools, a "5 min" lag, a
 * "USDC/CATE" position, "units_spent: 1" — and fail if any of them comes back. A
 * positive test ("shows a number") cannot distinguish a measured number from a
 * fixture, which is the entire distinction §3 and §8 care about.
 */

test.describe("no invented metrics", () => {
  test("the landing page shows placeholders, not fixture counts", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    /*
     * The four proof cards still exist — the layout is unchanged.
     *
     * `.last()` because the hero scene labels one of its readouts "Indexing lag"
     * too, and the hero renders before the stats grid. Taking the last match keeps
     * this pointed at the card rather than the hero chip.
     */
    for (const label of ["Pools tracked", "Positions tracked", "Indexing lag", "TVL indexed"]) {
      await expect(page.getByText(label, { exact: true }).last()).toBeVisible();
    }

    // And each one reads as unmeasured rather than inventing a figure.
    await expect(
      page.getByText("Live counts are unavailable right now", { exact: false }),
    ).toBeVisible();

    const body = await page.locator("body").innerText();
    for (const fixture of ["12,480", "148,920", "~5 min", "$4.87B"]) {
      expect(body, `landing page must not print the retired fixture "${fixture}"`).not.toContain(
        fixture,
      );
    }
  });

  test("the hero panels report themselves unmeasured too", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    /*
     * The hero is the first thing anyone sees, and it used to print six literals
     * while the cards a few hundred pixels below it read "—" — the page contradicted
     * itself in one scroll. All six now come from the same getPublicStats().
     *
     * Each panel still exists and is still labelled; only the figure is withheld.
     */
    for (const label of [
      "APR · ETH/USDC 0.05%",
      "TVL indexed",
      "Yield · fee APR",
      "GET /v1/positions",
      "Indexing lag",
      "Pool metrics · 24h vol",
    ]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }

    // The pool-count subtitle keeps its line, so the panel height is unchanged.
    await expect(page.getByText("across — v4 pools")).toBeVisible();

    const body = await page.locator("body").innerText();
    for (const fixture of [
      "22.14", // APR
      "24.68",
      "4.81", // TVL indexed
      "1,284", // "across 1,284 v4 pools"
      "17.82", // fee APR
      "38,412", // positions
      "~38s", // indexing lag, previously in seconds
      "612.4", // 24h volume
    ]) {
      expect(body, `the hero must not print the retired fixture "${fixture}"`).not.toContain(
        fixture,
      );
    }
  });

  test("the coverage panel withholds per-chain TVL, pools and lag", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    const panel = page.locator("section", {
      has: page.getByRole("heading", { name: "What’s actually live today" }),
    });

    /*
     * focus(), not hover(). The node buttons carry `hover:-translate-y-[55%]`, so
     * hovering slides the element out from under the pointer, `onMouseLeave` fires,
     * and the detail panel closes again — this test failed intermittently that way,
     * getting past "TVL" and then finding the panel gone by the time it asked for
     * "Pools". The component sets `active` on focus too, and focus survives layout
     * movement. It also exercises the keyboard path rather than only the mouse one.
     */
    await panel.getByRole("button", { name: "Ethereum" }).focus();

    /*
     * One innerText snapshot rather than a sequence of re-queried locators. Three
     * separate `expect`s each re-resolve against the live DOM, so a panel that
     * closes midway makes the assertions disagree with each other; a single read
     * cannot race.
     */
    const detail = panel.locator("dl");
    await expect(detail).toBeVisible();
    /*
     * Upper-cased before comparing, because the `<dt>`s carry Tailwind's
     * `uppercase` and innerText reports text as rendered — the labels reach the DOM
     * as "POOLS" and "INDEXING" however they are written in the source. Asserting
     * the source casing is what made this test fail on "Pools" while passing on
     * "TVL", which was already uppercase either way.
     */
    const shown = (await detail.innerText()).toUpperCase();

    // Servability is a product fact and still shown.
    expect(shown).toContain("LIVE");
    // The three measurements are labelled but unmeasured.
    for (const term of ["TVL", "POOLS", "INDEXING"]) {
      expect(shown, `the coverage detail should label "${term}"`).toContain(term);
    }
    // One dash per measurement, so none of the three is quietly still a figure.
    expect(shown.match(/—/g) ?? [], "all three measurements read as unmeasured").toHaveLength(3);

    const body = await page.locator("body").innerText();
    for (const fixture of ["$1.02B", "$264M", "$318M", "$141M", "4,820", "1,190", "2,140"]) {
      expect(
        body,
        `the coverage panel must not print the retired fixture "${fixture}"`,
      ).not.toContain(fixture);
    }
  });

  test("the pricing banner quotes the plan catalog, not its own numbers", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    const banner = page.locator("section", {
      has: page.getByRole("heading", { name: /Start on Free/ }),
    });
    await banner.scrollIntoViewIfNeeded();

    /*
     * Positive assertions, unlike the rest of this file, because these are catalog
     * values rather than metrics — they should be present and correct. The banner
     * used to hardcode "1M" and "10M" against a catalog holding 3,000,000 and
     * 20,000,000, so the landing page understated two plans that /pricing reported
     * correctly. These fail if the two ever drift apart again.
     */
    await expect(banner.getByText("25,000", { exact: true })).toBeVisible();
    await expect(banner.getByText("3M", { exact: true })).toBeVisible();
    await expect(banner.getByText("20M", { exact: true })).toBeVisible();

    const text = await banner.innerText();
    expect(text, "the retired 1M quota must not come back").not.toContain("1M units");
    for (const stale of ["10M", "1M\n"]) {
      expect(text, `the banner must not print the stale quota "${stale}"`).not.toContain(stale);
    }
  });

  test("the status page lists chains but claims no lag it hasn't measured", async ({ page }) => {
    await page.goto("/status", { waitUntil: "load" });

    // The chain list is a product fact and still renders in full.
    await expect(page.getByText("Ethereum · Uniswap v4")).toBeVisible();
    await expect(page.getByText("Avalanche · Uniswap v4")).toBeVisible();
    // Indexed-but-not-servable is also a fact, not a measurement.
    await expect(page.getByText("indexed, not servable").first()).toBeVisible();

    await expect(page.getByText("lag unavailable").first()).toBeVisible();
    const body = await page.locator("body").innerText();
    expect(body, "the status page must not print a fixture lag").not.toContain("5 min");
    expect(body).not.toContain("7 min");
  });

  test("/explore reports that it cannot reach the index instead of showing fixture rows", async ({
    page,
  }) => {
    await page.goto("/explore", { waitUntil: "load" });

    await expect(inlineError(page)).toContainText("can’t reach the positions index");

    const body = await page.locator("body").innerText();
    // Three of the 24 generated pairs, and the hardcoded freshness claim.
    for (const fixture of ["USDC/CATE", "USDT/TRUU", "ETH/WCUP", "data indexed to 7/28/2026"]) {
      expect(body, `/explore must not print the retired fixture "${fixture}"`).not.toContain(
        fixture,
      );
    }
  });

  test("the playground refuses to invent a response", async ({ page }) => {
    await seedPortalSession(page); // /portal/playground is behind the portal guard
    await page.goto("/portal/playground", { waitUntil: "load" });
    await page.getByRole("button", { name: "Send" }).click();

    await expect(inlineError(page)).toContainText("needs a live API");
    const body = await page.locator("body").innerText();
    expect(body, "the playground must not print its old fabricated body").not.toContain(
      "units_spent",
    );
    expect(body).not.toContain("USDC/WETH");
  });
});

test.describe("admin data states", () => {
  test.beforeEach(async ({ page }) => {
    await seedAdminSession(page);
  });

  test("populated: every admin page renders its own data", async ({ page }) => {
    // One assertion per page that could only pass with real rows behind it.
    await page.goto("/admin", { waitUntil: "load" });
    await expect(page.getByRole("link", { name: "cli_100" })).toBeVisible();

    await page.goto("/admin/plans", { waitUntil: "load" });
    await expect(page.getByRole("switch", { name: "Self-serve for Growth" })).toBeVisible();

    await page.goto("/admin/endpoints", { waitUntil: "load" });
    await expect(page.getByLabel("Units for GET /v1/pools", { exact: true })).toHaveValue("1");

    await page.goto("/admin/payments", { waitUntil: "load" });
    await expect(page.getByText("Manual reconcile").first()).toBeVisible();

    await page.goto("/admin/subscriptions", { waitUntil: "load" });
    await expect(page.getByText("sub_200")).toBeVisible();

    await page.goto("/admin/revenue", { waitUntil: "load" });
    // The KPI figure rather than its label: "MRR" is also a column header in the
    // by-plan table, and the number is the part that has to come from the response.
    await expect(page.getByText("$4,782", { exact: true })).toBeVisible();
    await expect(page.getByText("Monthly · paid vs pending")).toBeVisible();
  });

  test("empty: a search with no matches offers a way out", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "load" });
    await page.getByLabel("Search clients by email or id").fill("nobody-by-this-name");

    await expect(page.getByText("No clients match that search")).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear search" })).toBeVisible();

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page.getByRole("link", { name: "cli_100" })).toBeVisible();
  });

  test("error: an unknown client id shows the server's message and a retry", async ({ page }) => {
    await page.goto("/admin/clients/cli_does_not_exist", { waitUntil: "load" });

    const alert = inlineError(page);
    await expect(alert).toContainText("No client with id cli_does_not_exist");
    await expect(alert.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("populated: a known client id renders that client's detail", async ({ page }) => {
    await page.goto("/admin/clients/cli_100", { waitUntil: "load" });

    await expect(page.getByRole("heading", { name: "client1@example.com" })).toBeVisible();
    await expect(page.getByText("Monthly quota")).toBeVisible();
    // Free plan, so the payments panel is legitimately empty rather than absent.
    await expect(page.getByText("No payments")).toBeVisible();
  });
});

test.describe("controls that used to be inert", () => {
  test("the client search filters the table", async ({ page }) => {
    await seedAdminSession(page);
    await page.goto("/admin", { waitUntil: "load" });

    const rows = page.locator("tbody tr");
    const before = await rows.count();
    expect(before).toBeGreaterThan(1);

    await page.getByLabel("Search clients by email or id").fill("client3@");
    await expect(rows).toHaveCount(1);
  });

  test("Export CSV is disabled with nothing to export", async ({ page }) => {
    await seedAdminSession(page);
    await page.goto("/admin", { waitUntil: "load" });

    const exportButton = page.getByRole("button", { name: "Export CSV" });
    await expect(exportButton).toBeEnabled();

    await page.getByLabel("Search clients by email or id").fill("nobody-by-this-name");
    await expect(exportButton).toBeDisabled();
  });

  test("/explore controls write to the URL rather than nowhere", async ({ page }) => {
    await page.goto("/explore", { waitUntil: "load" });

    await page.getByRole("link", { name: "ROI" }).click();
    await expect(page).toHaveURL(/[?&]sort=ROI/);

    /*
     * `.click()`, not `.uncheck()`. The box is controlled by the URL, so the click
     * fires a navigation and React holds the DOM at `checked` until the new render
     * lands — `.uncheck()` reads the box back too early and reports "clicking did
     * not change its state". The URL is what this is asserting anyway.
     */
    await page.getByRole("checkbox").click();
    await expect(page).toHaveURL(/[?&]risky=0/);
    await expect(page.getByRole("checkbox")).not.toBeChecked();

    await page.getByLabel("Search token, pool, owner, position").fill("usdc");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/[?&]q=usdc/);
  });

  test("the pools tab says what it is instead of doing nothing", async ({ page }) => {
    await page.goto("/explore", { waitUntil: "load" });
    await page.getByRole("link", { name: "pools" }).click();

    await expect(page).toHaveURL(/[?&]tab=pools/);
    await expect(page.getByText("Pools aren’t in the public preview yet")).toBeVisible();
  });
});
