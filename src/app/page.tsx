import type { Metadata } from "next";

import { getPublicStats } from "@/lib/public-data";

import { Landing } from "./landing";

export const metadata: Metadata = {
  title: "Tickwise — The metered API for Uniswap v4 pools & positions",
  description:
    "Near-real-time Uniswap v4 pools and positions on Ethereum and Avalanche. Get an API key, ship in five minutes.",
  openGraph: {
    type: "website",
    title: "Tickwise Dex API",
    description:
      "Near-real-time Uniswap v4 pools and positions. Built for teams that would rather build product than index chains.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tickwise Dex API",
    description: "Live DeFi intelligence as one clean, metered API.",
  },
};

/*
 * The proof numbers are fetched here, in the server component, rather than in the
 * client view that renders them: this route has to stay server-rendered for SEO,
 * and the numbers are part of what the crawler should see. `getPublicStats()`
 * never throws and returns null when it couldn't measure, so a dead API costs the
 * landing page four numbers rather than the whole page.
 */
export default async function HomePage() {
  const stats = await getPublicStats();
  return <Landing stats={stats} />;
}
