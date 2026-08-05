import type { Metadata } from "next";

import { Billing } from "./billing-view";

export const metadata: Metadata = {
  title: "Billing — Tickwise portal",
};

export default function BillingPage() {
  return <Billing />;
}
