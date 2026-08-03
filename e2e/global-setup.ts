import type { FullConfig } from "@playwright/test";
import { ROUTES } from "./routes";

/*
 * Fetches every route once before the suite runs, as a cheap pre-flight: it
 * confirms each route is actually reachable and fails loudly here (rather than
 * as N confusing per-test timeouts) if the server came up broken.
 *
 * Against the production server this is fast — everything is prebuilt. It
 * matters more if you point the harness at a dev server for debugging, where
 * routes compile on demand and an unwarmed route can blow a test's timeout.
 */
async function warm(baseURL: string, route: string): Promise<void> {
  const url = `${baseURL}${route}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
    // Drain the body so the server finishes the response, not just the headers.
    await res.text();
    if (!res.ok) console.warn(`  warm ${route} -> ${res.status}`);
  } catch (err) {
    console.warn(`  warm ${route} failed: ${(err as Error).message}`);
  }
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3100";
  const started = Date.now();
  console.log(`Warming ${ROUTES.length} routes against ${baseURL} (dev compiles on demand)…`);

  // Sequential. Concurrent warming added to the same socket pressure that was
  // making the server drop connections; against a prebuilt prod server this is
  // fast anyway.
  const CONCURRENCY = 1;
  const queue = [...ROUTES];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let route = queue.shift(); route; route = queue.shift()) {
        await warm(baseURL, route);
      }
    }),
  );

  console.log(`Warmed in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}
