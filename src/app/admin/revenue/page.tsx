import type { Metadata } from "next";

import { AdminRevenueView } from "./revenue-view";

export const metadata: Metadata = {
  title: "Revenue — Tickwise admin",
  robots: { index: false, follow: false },
};

export default function AdminRevenuePage() {
  return <AdminRevenueView />;
}
