import { test, expect } from "@playwright/test";
import { isAllowlistedError } from "./allowlist";

test.describe("Accordion (/pricing FAQ) — single-open exclusivity", () => {
  test("opening one item closes any other, and re-clicking the open one closes it", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => { if (!isAllowlistedError(err.message)) errors.push(err.message); });

    await page.goto("/pricing");
    const q1 = page.getByRole("button", { name: /how do i pay/i });
    const a1 = page.getByText(/USDC on Ethereum by default/i);
    const q2 = page.getByRole("button", { name: /what happens when i hit my quota/i });
    const a2 = page.getByText(/requests over quota return 429/i);

    await expect(a1).toBeHidden();
    await q1.click();
    await expect(a1).toBeVisible();
    await expect(a2).toBeHidden();

    await q2.click();
    await expect(a2).toBeVisible();
    await expect(a1).toBeHidden(); // opening #2 must close #1 — exclusivity

    await q2.click();
    await expect(a2).toBeHidden(); // clicking the open one closes it

    expect(errors).toEqual([]);
  });
});

test.describe("Switch (/admin/plans)", () => {
  test("toggles visual state on click with no console error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => { if (!isAllowlistedError(err.message)) errors.push(err.message); });

    await page.goto("/admin/plans");
    const firstSwitch = page.getByRole("switch").first();
    const before = await firstSwitch.getAttribute("aria-checked");
    await firstSwitch.click();
    await expect(firstSwitch).toHaveAttribute("aria-checked", before === "true" ? "false" : "true");

    expect(errors).toEqual([]);
  });
});

test.describe("Toast (/contact)", () => {
  test("submitting the contact form fires a success toast that auto-dismisses cleanly", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => { if (!isAllowlistedError(err.message)) errors.push(err.message); });

    await page.goto("/contact");
    await page.locator('input[name="name"]').fill("Playwright Test");
    await page.locator('input[name="email"]').fill("test@example.com");
    await page.locator('textarea[name="message"]').fill("Playwright migration test message");

    await page.getByRole("button", { name: /send/i }).click();
    await expect(page.getByText(/we.ll be in touch|thanks/i)).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(4500); // past auto-dismiss — the unmount-timing risk, not just visibility
    expect(errors).toEqual([]);
  });
});
