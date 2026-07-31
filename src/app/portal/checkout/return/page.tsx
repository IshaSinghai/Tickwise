import type { Metadata } from "next";
import { CheckoutStatus } from "@/components/CheckoutStatus";

export const metadata: Metadata = {
  title: "Checkout — Tickwise",
};

export default function CheckoutReturnPage() {
  return (
    <div className="mx-auto py-10">
      <CheckoutStatus />
    </div>
  );
}
