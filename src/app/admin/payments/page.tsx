import type { Metadata } from "next";

import { AdminPayments } from "./payments-view";

export const metadata: Metadata = {
  title: "Payments — Tickwise admin",
  robots: { index: false, follow: false },
};

export default function AdminPaymentsPage() {
  return <AdminPayments />;
}
