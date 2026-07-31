import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lint is its own step (`npm run lint`), as it was under Vite — `next build`
  // should not fail on style rules.
  eslint: { ignoreDuringBuilds: true },
  // Pin the trace root to this project; a stray lockfile in the user's home
  // directory otherwise gets picked as the workspace root.
  outputFileTracingRoot: path.join(import.meta.dirname, "."),
};

export default nextConfig;
