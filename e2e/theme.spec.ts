import { test, expect } from "@playwright/test";

import { seedPortalSession } from "./auth";

/*
 * The theme contract from §7: light and dark via data-theme, persisted in
 * localStorage, with every component following the CSS custom properties rather
 * than hardcoded colours.
 *
 * Dark is asserted to be the default because the whole visual baseline is dark —
 * if the default ever flipped, every screenshot in the sweep would change at once
 * and the cause would be far from obvious.
 */

const THEME_KEY = "cp-theme";

test("defaults to dark, before any script runs", async ({ page }) => {
  await page.goto("/pricing", { waitUntil: "load" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("a persisted light choice is applied before first paint", async ({ page }) => {
  await page.addInitScript(([key]) => window.localStorage.setItem(key, "light"), [THEME_KEY]);
  await page.goto("/pricing", { waitUntil: "load" });

  // Applied by the inline head script, so it is correct on the very first paint
  // rather than corrected a frame later by a provider effect.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  // And the tokens actually resolved to the light palette, rather than the
  // attribute being set with no stylesheet behind it.
  const { bg, fg } = await page.evaluate(() => {
    const s = getComputedStyle(document.body);
    return { bg: s.backgroundColor, fg: s.color };
  });

  /*
   * This palette is authored in OKLCH and Chromium reports it back as OKLCH, not
   * rgb(). Read the lightness channel specifically — an earlier version of this
   * test ran the three components through an sRGB luminance formula, which
   * compared a 0.985 lightness against a 260 hue and failed a page that was
   * rendering correctly.
   */
  const lightness = (colour: string): number => {
    const m = /^oklch\(\s*([\d.]+)(%?)/.exec(colour);
    expect(m, `expected an oklch() colour, got ${colour}`).not.toBeNull();
    const value = Number(m![1]);
    return m![2] === "%" ? value / 100 : value;
  };

  expect(lightness(bg), "light theme background should be near-white").toBeGreaterThan(0.9);
  expect(lightness(fg), "light theme text should be near-black").toBeLessThan(0.3);
});

test("garbage in storage falls back to dark rather than an unset attribute", async ({ page }) => {
  await page.addInitScript(([key]) => window.localStorage.setItem(key, "chartreuse"), [THEME_KEY]);
  await page.goto("/pricing", { waitUntil: "load" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("choosing a theme in settings persists it across a reload", async ({ page }) => {
  await seedPortalSession(page);
  await page.goto("/portal/settings", { waitUntil: "load" });

  await page.getByRole("radio", { name: "Light" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(([k]) => window.localStorage.getItem(k), [THEME_KEY])).toBe("light");

  await page.reload({ waitUntil: "load" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("radio", { name: "Light" })).toHaveAttribute("aria-checked", "true");

  // And back, so the control is not one-way.
  await page.getByRole("radio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

/*
 * Informational light-theme captures for manual review. Not asserted: the light
 * palette has no approved baseline, and pinning one now would freeze colours that
 * have never been signed off.
 */
const LIGHT_PAGES = ["/", "/pricing", "/docs", "/portal", "/admin"];

for (const route of LIGHT_PAGES) {
  test(`light theme renders ${route}`, async ({ page }) => {
    await page.addInitScript(([key]) => window.localStorage.setItem(key, "light"), [THEME_KEY]);
    if (route.startsWith("/portal") || route.startsWith("/admin")) {
      await page.addInitScript(() => {
        window.localStorage.setItem("cp-portal-token", "e2e.portal.token");
        window.localStorage.setItem("cp-admin-token", "e2e.admin.token");
      });
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route, { waitUntil: "load" });
    await page.waitForTimeout(600);
    const name = route === "/" ? "home" : route.replace(/\//g, "-").slice(1);
    await page.screenshot({ path: `e2e/manual-review/theme/light-${name}.png` });
  });
}
