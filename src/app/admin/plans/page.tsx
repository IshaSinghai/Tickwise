import type { Metadata } from "next";

import { AdminPlans } from "./plans-view";

export const metadata: Metadata = {
  title: "Plans — Tickwise admin",
  robots: { index: false, follow: false },
};

export default function AdminPlansPage() {
  return <AdminPlans />;
}
