import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The Playwright harness sets NEXT_DIST_DIR so its dev server builds into its
  // own directory. Two Next processes sharing one .next (e.g. your `npm run dev`
  // plus a `next build` or the e2e server) overwrite each other's manifests and
  // the survivor fails with "Expected clientReferenceManifest to be defined".
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Lint is its own step (`npm run lint`), as it was under Vite — `next build`
  // should not fail on style rules.
  eslint: { ignoreDuringBuilds: true },
  // Pin the trace root to the project. Locally this stops a stray lockfile in
  // the user's home directory being picked as the workspace root. process.cwd()
  // is used rather than import.meta.dirname so the config stays portable across
  // the Node versions and module formats CI/Vercel may load it under.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
