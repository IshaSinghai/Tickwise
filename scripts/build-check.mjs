/*
 * Runs `next build` purely to verify the app compiles, without touching `.next`.
 *
 * Why this exists: `next build` and `next dev` both write the same build
 * directory, and they write incompatible things into it. Running a build while a
 * dev server is up leaves that server holding references to manifests and chunks
 * the build replaced underneath it, and it then dies with things like
 * "Cannot read properties of undefined (reading 'call')",
 * "Cannot find module './5611.js'", or
 * "Expected clientReferenceManifest to be defined" — and can serve the page with
 * no CSS at all. None of those are app bugs; they are two processes fighting over
 * one directory.
 *
 * So: use `npm run build:check` for verification builds (safe alongside a running
 * dev server), and plain `npm run build` only for real deploy output.
 * The Playwright harness isolates itself the same way, via NEXT_DIST_DIR.
 */
import { spawnSync } from "node:child_process";

const DIST_DIR = ".next-verify";

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: DIST_DIR },
});

process.exit(result.status ?? 1);
