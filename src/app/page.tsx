import type { Metadata } from "next";

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

export default function HomePage() {
  return <Landing />;
}
