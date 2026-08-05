import type { Metadata } from "next";

import { AdminEndpoints } from "./endpoints-view";

export const metadata: Metadata = {
  title: "Endpoints & unit cost — Tickwise admin",
  robots: { index: false, follow: false },
};

export default function AdminEndpointsPage() {
  return <AdminEndpoints />;
}
