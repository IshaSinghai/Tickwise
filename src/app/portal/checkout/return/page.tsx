import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutStatus } from "@/components/CheckoutStatus";

export const metadata: Metadata = {
  title: "Checkout — Tickwise",
  // Reached from a payment processor's redirect; nothing here for a crawler.
  robots: { index: false, follow: false },
};

export default function CheckoutReturnPage() {
  return (
    <div className="mx-auto py-10">
      {/* CheckoutStatus reads ?ref= via useSearchParams, which Next requires to
          sit under a Suspense boundary so the rest of the page can prerender. */}
      <Suspense
        fallback={
          <div className="mx-auto max-w-lg rounded-2xl border border-border/60 bg-surface p-8 text-sm text-muted-foreground shadow-card">
            Loading your checkout…
          </div>
        }
      >
        <CheckoutStatus />
      </Suspense>
    </div>
  );
}
