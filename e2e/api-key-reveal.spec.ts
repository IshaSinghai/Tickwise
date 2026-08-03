import { test, expect } from "@playwright/test";
import { isAllowlistedError } from "./allowlist";

/*
 * Flagship security-property test (docs/frontend-surface-spec.md §4.1): the
 * one-time key reveal must be un-dismissible except via the explicit
 * acknowledgment flow. This is exactly the interaction class a static
 * screenshot cannot exercise, and exactly the class of bug (DOM lifecycle on
 * mount/unmount, dialog open/close state) that a prior change in this
 * migration's history broke silently (an `insertBefore` crash) — this test
 * exists so that class of regression fails a build instead of reaching a user.
 */
test.beforeEach(async ({ context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
});

test("create-key dialog to key-reveal: full acknowledgment gate", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => { if (!isAllowlistedError(err.message)) errors.push(err.message); });

  await page.goto("/portal/keys");
  await page.getByRole("button", { name: /new key/i }).click();

  const createDialog = page.getByRole("dialog", { name: /create api key/i });
  await expect(createDialog).toBeVisible();

  await createDialog.getByPlaceholder(/production/i).fill("Playwright test key");
  await createDialog.getByText("Browser key").click();
  await createDialog.getByRole("button", { name: /^create key$/i }).click();

  await expect(createDialog).toBeHidden();

  const revealDialog = page.getByRole("dialog", { name: /your new api key/i });
  await expect(revealDialog).toBeVisible();
  const doneButton = revealDialog.getByRole("button", { name: /^done$/i });
  await expect(doneButton).toBeDisabled();

  // Escape must NOT close the dialog before acknowledgment.
  await page.keyboard.press("Escape");
  await expect(revealDialog).toBeVisible();

  // Clicking the backdrop must NOT close the dialog before acknowledgment.
  await page.mouse.click(10, 10);
  await expect(revealDialog).toBeVisible();

  // Copy button works and fires a success toast.
  await revealDialog.getByRole("button").first().click(); // the copy icon button next to the key
  await expect(page.getByText(/copied to clipboard/i)).toBeVisible();

  // Acknowledge, then Done must actually close it.
  await revealDialog.getByRole("checkbox").check();
  await expect(doneButton).toBeEnabled();
  await doneButton.click();
  await expect(revealDialog).toBeHidden();

  expect(errors, `uncaught page errors:\n${errors.join("\n")}`).toEqual([]);
});

test("create-key dialog: cancel and backdrop-click both dismiss normally", async ({ page }) => {
  await page.goto("/portal/keys");

  await page.getByRole("button", { name: /new key/i }).click();
  let dialog = page.getByRole("dialog", { name: /create api key/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /cancel/i }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: /new key/i }).click();
  dialog = page.getByRole("dialog", { name: /create api key/i });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("revoking a key fires a toast and removes it from the list", async ({ page }) => {
  await page.goto("/portal/keys");
  const rows = page.locator("li");
  const before = await rows.count();
  await rows.first().getByRole("button").click();
  await expect(page.getByText(/key revoked/i)).toBeVisible();
  // Toast auto-dismisses — this is the closest analogue to the earlier
  // insertBefore crash (timer-driven unmount), so wait past its duration and
  // confirm no console/page error, not just that it disappeared visually.
  await page.waitForTimeout(4500);
  await expect(page.getByText(/key revoked/i)).toBeHidden();
  await expect(rows).toHaveCount(before - 1);
});
