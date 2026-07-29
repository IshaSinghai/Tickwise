import { createFileRoute } from "@tanstack/react-router";
import { CheckoutStatus } from "@/components/CheckoutStatus";

export const Route = createFileRoute("/portal/checkout/return")({
  head: () => ({ meta: [{ title: "Checkout — Tickwise" }] }),
  component: () => (
    <div className="mx-auto py-10">
      <CheckoutStatus />
    </div>
  ),
});
