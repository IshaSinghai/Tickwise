import { test, expect } from "@playwright/test";

import { seedAdminSession, seedPortalSession } from "./auth";

/*
 * Accessibility contract for the four primitives that were built on Radix.
 *
 * These tests were written and made green *against Radix*, so they record what
 * Radix actually guaranteed rather than what a replacement happens to do. The
 * hand-rolled versions then have to satisfy the same assertions.
 *
 * This exists because keyboard and screen-reader behaviour is the real risk in
 * dropping these packages: nothing here is visible in a screenshot, so a
 * regression would sail past the visual sweep. Focus traps, focus return, arrow
 * navigation and ARIA wiring are exactly what gets quietly lost when an
 * accessible primitive is replaced by a div that looks the same.
 */

test.describe("Switch (/admin/plans)", () => {
  test("exposes switch role and checked state, and is keyboard operable", async ({ page }) => {
    await seedAdminSession(page);
    await page.goto("/admin/plans");

    const sw = page.getByRole("switch").first();
    await expect(sw).toBeVisible();
    const before = await sw.getAttribute("aria-checked");

    // Space is the required activation key for role=switch.
    await sw.focus();
    await expect(sw).toBeFocused();
    await page.keyboard.press("Space");
    await expect(sw).toHaveAttribute("aria-checked", before === "true" ? "false" : "true");
  });
});

test.describe("Accordion (/pricing FAQ)", () => {
  test("wires aria-expanded and aria-controls to the panel it controls", async ({ page }) => {
    await page.goto("/pricing");
    const trigger = page.getByRole("button", { name: /how do i pay/i });

    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    // aria-controls is only required while open: the panel is removed from the
    // DOM when collapsed, and pointing at a non-existent id would be worse than
    // omitting the attribute. (Measured against Radix, which behaves this way.)
    const controls = await trigger.getAttribute("aria-controls");
    expect(controls, "an open trigger must point at its panel").toBeTruthy();
    await expect(page.locator(`#${controls}`)).toBeVisible();
  });

  test("is keyboard operable via Enter and Space", async ({ page }) => {
    await page.goto("/pricing");
    const trigger = page.getByRole("button", { name: /can i cancel any time/i });

    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Space");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("RadioGroup (create-key dialog)", () => {
  test("exposes radiogroup/radio roles with correct checked state", async ({ page }) => {
    await seedPortalSession(page);
    await page.goto("/portal/keys");
    await page.getByRole("button", { name: /new key/i }).click();

    const group = page.getByRole("radiogroup");
    await expect(group).toBeVisible();
    const radios = page.getByRole("radio");
    await expect(radios).toHaveCount(2);
    await expect(radios.nth(0)).toBeChecked();
    await expect(radios.nth(1)).not.toBeChecked();
  });

  test("arrow keys move focus between the options (roving tabindex)", async ({ page }) => {
    await seedPortalSession(page);
    await page.goto("/portal/keys");
    await page.getByRole("button", { name: /new key/i }).click();

    const radios = page.getByRole("radio");
    // Focusing the group lands on the checked radio, per radio-group semantics.
    await page.getByRole("radiogroup").focus();
    await expect(radios.nth(0)).toBeFocused();

    await page.keyboard.press("ArrowDown");
    // Arrow navigation is the behaviour a set of clickable divs would silently
    // lose. Only focus movement is asserted, because that is all the current
    // implementation does — Radix here moves focus without changing selection.
    // Native radio inputs additionally select on arrow, which is an improvement
    // over this baseline, so the assertion is deliberately not "still unchecked".
    await expect(radios.nth(1)).toBeFocused();
  });

  test("clicking an option selects it", async ({ page }) => {
    await seedPortalSession(page);
    await page.goto("/portal/keys");
    await page.getByRole("button", { name: /new key/i }).click();

    const radios = page.getByRole("radio");
    await expect(radios.nth(0)).toBeChecked();
    // Clicking the label text, not the control, must still select — the option
    // rows are labels wrapping the radio.
    await page.getByText("Browser key", { exact: true }).click();
    await expect(radios.nth(1)).toBeChecked();
    await expect(radios.nth(0)).not.toBeChecked();
  });
});

test.describe("Dialog (create-key + key reveal)", () => {
  test("is a modal dialog with an accessible name from its title", async ({ page }) => {
    await seedPortalSession(page);
    await page.goto("/portal/keys");
    await page.getByRole("button", { name: /new key/i }).click();

    // getByRole("dialog", {name}) only matches if aria-modal/role and the
    // title-to-dialog labelling are both wired up.
    const dialog = page.getByRole("dialog", { name: /create api key/i });
    await expect(dialog).toBeVisible();
  });

  test("traps focus inside the dialog while open", async ({ page }) => {
    await seedPortalSession(page);
    await page.goto("/portal/keys");
    await page.getByRole("button", { name: /new key/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Tab repeatedly; focus must never escape to the page behind the dialog.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const insideDialog = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active || active === document.body) return true; // tolerate body
        return Boolean(active.closest('[role="dialog"], dialog'));
      });
      expect(insideDialog, `focus escaped the dialog after ${i + 1} Tab press(es)`).toBe(true);
    }
  });

  test("Escape closes it and focus does not end up stranded", async ({ page }) => {
    await seedPortalSession(page);
    await page.goto("/portal/keys");
    const trigger = page.getByRole("button", { name: /new key/i });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();

    // Note: focus is NOT returned to the opening button today. Radix only does
    // that for a DialogTrigger, and these dialogs are opened from a plain
    // <Button> with controlled state, so focus falls back to <body>. That is a
    // pre-existing accessibility gap, recorded here rather than asserted, so a
    // replacement isn't held to a standard the current code doesn't meet.
    const landed = await page.evaluate(() => {
      const active = document.activeElement;
      return {
        onBody: active === document.body || active === null,
        insideDialog: Boolean(active?.closest?.('[role="dialog"], dialog')),
      };
    });
    expect(landed.insideDialog, "focus must not stay inside a closed dialog").toBe(false);
  });

  test("the key-reveal dialog keeps its dismissal gate under keyboard use", async ({ page }) => {
    await seedPortalSession(page);
    await page.goto("/portal/keys");
    await page.getByRole("button", { name: /new key/i }).click();
    await page
      .getByRole("dialog")
      .getByPlaceholder(/production/i)
      .fill("a11y key");
    await page.getByRole("button", { name: /^create key$/i }).click();

    const reveal = page.getByRole("dialog", { name: /your new api key/i });
    await expect(reveal).toBeVisible();

    // Escape must not close it before acknowledgment, however it is pressed.
    await page.keyboard.press("Escape");
    await expect(reveal).toBeVisible();

    await reveal.getByRole("checkbox").check();
    await reveal.getByRole("button", { name: /^done$/i }).click();
    await expect(reveal).toBeHidden();
  });
});
