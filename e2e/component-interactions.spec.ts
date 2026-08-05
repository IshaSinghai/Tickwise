import { test, expect } from "@playwright/test";
import { isAllowlistedError } from "./allowlist";
import { seedAdminSession } from "./auth";

test.describe("Accordion (/pricing FAQ) — single-open exclusivity", () => {
  test("opening one item closes any other, and re-clicking the open one closes it", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      if (!isAllowlistedError(err.message, "/pricing")) errors.push(err.message);
    });

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
    page.on("pageerror", (err) => {
      if (!isAllowlistedError(err.message, "/admin/plans")) errors.push(err.message);
    });

    await seedAdminSession(page); // /admin/plans is behind the admin guard
    await page.goto("/admin/plans");
    const firstSwitch = page.getByRole("switch").first();
    const before = await firstSwitch.getAttribute("aria-checked");
    await firstSwitch.click();
    await expect(firstSwitch).toHaveAttribute("aria-checked", before === "true" ? "false" : "true");

    expect(errors).toEqual([]);
  });
});

test.describe("Toast (/contact)", () => {
  test("submitting the contact form fires a success toast that auto-dismisses cleanly", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      if (!isAllowlistedError(err.message, "/contact")) errors.push(err.message);
    });

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

test.describe("Pointer springs (/) — hand-rolled integrator", () => {
  /*
   * These springs replaced motion's `useSpring`. The migration was verified by
   * running this integrator against motion's own `spring` generator at 1ms
   * resolution (bit-identical across both configs and mid-flight retargets),
   * but that check dies with the dependency. What survives is behavioural: the
   * spring must respond to the pointer, approach its target monotonically
   * without overshoot (both configs are overdamped — zeta 1.67 and 1.29), and
   * come to rest at the mapped target rather than drifting or sticking.
   *
   * Read the transform AFTER the frame's rAF callbacks. Reading inside the rAF
   * phase returns a one-frame-stale value depending on callback registration
   * order, which reads as a spurious lag.
   */
  const readTx = async (page: import("@playwright/test").Page, index: number) =>
    page.evaluate(
      ([i]) =>
        new Promise<number>((resolve) => {
          const hero = document.querySelector(
            '[class*="max-w-[820px]"][class*="select-none"]',
          ) as HTMLElement;
          const el = hero.children[i] as HTMLElement;
          requestAnimationFrame(() =>
            setTimeout(() => {
              const t = getComputedStyle(el).transform;
              if (!t || t === "none") return resolve(0);
              const open = t.indexOf("(");
              const n = t
                .slice(open + 1, t.lastIndexOf(")"))
                .split(",")
                .map(Number);
              resolve(t.startsWith("matrix3d") ? n[12] : n[4]);
            }, 0),
          );
        }),
      [index],
    );

  test("scene parallax tracks the pointer, settles without overshoot, and returns to rest", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      if (!isAllowlistedError(err.message, "/")) errors.push(err.message);
    });

    await page.goto("/");
    const hero = page.locator('[class*="max-w-[820px]"][class*="select-none"]').first();
    await hero.scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000); // entrance animations settle by ~2.2s
    const box = (await hero.boundingBox())!;

    // at rest in the centre the parallax layer sits at zero
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(1500);
    expect(Math.abs(await readTx(page, 1))).toBeLessThan(0.5);

    // pointer.x = -1 maps to translateX +10px
    await page.mouse.move(box.x + 2, box.y + box.height / 2);
    const samples: number[] = [];
    for (let i = 0; i < 12; i++) {
      samples.push(await readTx(page, 1));
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(2500);
    const settled = await readTx(page, 1);

    // lands on the mapped target
    expect(settled).toBeGreaterThan(9.5);
    expect(settled).toBeLessThanOrEqual(10.001);

    // it actually animated rather than snapping in one frame
    expect(samples.filter((v) => v > 0.05 && v < settled - 0.05).length).toBeGreaterThan(2);

    // overdamped: monotonic approach, never past the target
    expect(Math.max(...samples)).toBeLessThanOrEqual(10.001);
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1] - 0.01);
    }

    // leaving the scene springs it back to rest
    await page.mouse.move(5, 5);
    await page.waitForTimeout(3000);
    expect(Math.abs(await readTx(page, 1))).toBeLessThan(0.5);

    expect(errors).toEqual([]);
  });
});
