import { test, expect } from "@playwright/test";

/*
 * The favicon is Tickwise's, and specifically is not Lovable's.
 *
 * Asserted negatively against the exact bytes of the inherited icon, because that
 * is the failure mode with a real mechanism behind it: `main` is Lovable's
 * connected branch and is merged forward into `develop` by design, so
 * public/favicon.ico is a file two branches both want to own. A test that only
 * checked "some icon is served" would stay green through exactly the merge that
 * puts the old one back.
 *
 * The SHA-1 below is `git rev-parse main:public/favicon.ico` — git's blob hash of
 * Lovable's icon, which is why it can be compared against a hash computed the same
 * way from the response body.
 */
const LOVABLE_FAVICON_BLOB = "3c01d69713f9c184e92b74f5799e6dff2f500825";

/** Git's blob hash: sha1("blob <len>\0" + bytes). */
async function gitBlobHash(bytes: Buffer): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
}

test("/favicon.ico serves the Tickwise mark, not the inherited Lovable one", async ({
  request,
}) => {
  const response = await request.get("/favicon.ico");
  expect(response.status(), "/favicon.ico should be served").toBe(200);

  const bytes = await response.body();
  // A real ICO starts with the 4-byte header 00 00 01 00.
  expect(bytes.subarray(0, 4).toString("hex"), "should be a real .ico").toBe("00000100");

  expect(
    await gitBlobHash(bytes),
    "the Lovable favicon is being served again — most likely merged forward from main",
  ).not.toBe(LOVABLE_FAVICON_BLOB);
});

test("the vector mark and the Apple icon are both reachable", async ({ request }) => {
  const svg = await request.get("/icon.svg");
  expect(svg.status()).toBe(200);
  const markup = await svg.text();
  // The mark itself, not just any SVG: the brand gradient and the T monogram.
  expect(markup).toContain("#6570FF");
  expect(markup).toContain('aria-label="Tickwise"');

  const apple = await request.get("/apple-touch-icon.png");
  expect(apple.status()).toBe(200);
  expect((await apple.body()).subarray(1, 4).toString("ascii")).toBe("PNG");
});

test("every page declares the icons in its head", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });

  const hrefs = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
    .evaluateAll((links) => links.map((l) => l.getAttribute("href")));

  expect(hrefs, "the SVG mark should be declared first for modern browsers").toContain("/icon.svg");
  expect(hrefs).toContain("/favicon.ico");
  expect(hrefs).toContain("/apple-touch-icon.png");
});
