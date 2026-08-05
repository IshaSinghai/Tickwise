import type { Metadata } from "next";

import { PortalOverview } from "./overview-view";

export const metadata: Metadata = {
  title: "Overview — Tickwise portal",
};

export default function PortalOverviewPage() {
  return <PortalOverview />;
}
