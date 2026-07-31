import type { Metadata } from "next";

import { Explore } from "./explore-view";

export const metadata: Metadata = {
  title: "Explore — Live Uniswap v4 pools & positions · Tickwise",
  description:
    "Browse live Uniswap v4 open positions and pools indexed by Tickwise. Free, public preview of the API.",
  openGraph: {
    title: "Tickwise · Explore live positions",
    description: "Live Uniswap v4 positions on Ethereum and Avalanche.",
  },
};

export default function ExplorePage() {
  return <Explore />;
}
