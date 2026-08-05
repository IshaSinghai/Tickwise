import type { Metadata } from "next";

import { getPublicPositions, parsePositionQuery, type PublicPositions } from "@/lib/public-data";

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

/*
 * Server-rendered, and dynamic rather than static: the rows are live data and the
 * search/sort/page controls are search params, so there is nothing to prerender.
 * The table still arrives in the HTML, which is what the SEO requirement is about.
 *
 * The `pools` tab is read here too. It has no endpoint in the public preview, so
 * selecting it skips the positions fetch rather than loading rows it won't show.
 */
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = parsePositionQuery(params);
  const tab = params.tab === "pools" ? "pools" : "positions";

  const positions: PublicPositions | null =
    tab === "positions" ? await getPublicPositions(query) : null;

  return <Explore tab={tab} query={query} positions={positions} />;
}
