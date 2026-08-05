import type { Metadata } from "next";

import { getPublicPlans, getPublicUnitCosts } from "@/lib/public-data";

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

/*
 * Plans and unit costs are fetched here and passed down, rather than imported by
 * the view. The view is `"use client"` because the monthly/annual toggle is state,
 * but the *data* must be in the server-rendered HTML — a pricing page whose prices
 * only appear after hydration is a pricing page Google cannot read. Fetching in
 * the server component keeps both: real SSR content, client-side interactivity.
 */
export default async function PricingPage() {
  const [plans, unitCosts] = await Promise.all([getPublicPlans(), getPublicUnitCosts()]);
  return <Pricing plans={plans} unitCosts={unitCosts} />;
}
