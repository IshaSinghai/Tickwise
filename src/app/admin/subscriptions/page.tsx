import type { Metadata } from "next";

import { AdminSubscriptions } from "./subscriptions-view";

export const metadata: Metadata = {
  title: "Subscriptions — Tickwise admin",
  robots: { index: false, follow: false },
};

export default function AdminSubscriptionsPage() {
  return <AdminSubscriptions />;
}
