import type { Metadata } from "next";

import { Pricing } from "./pricing-view";

export const metadata: Metadata = {
  title: "Pricing — Tickwise Dex API",
  description:
    "Simple monthly plans. Metered by units, not by request. Every plan uses the same endpoints.",
  openGraph: {
    title: "Tickwise pricing",
    description: "Free, Starter, Growth, Scale. Pay in crypto. No surprise overage.",
  },
};

export default function PricingPage() {
  return <Pricing />;
}
