import type { Metadata } from "next";
import Link from "next/link";
import { PLANS } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Change plan — Tickwise portal",
};

export default function BillingPlansPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Change plan</h1>
      <p className="text-sm text-muted-foreground">You’ll be redirected to a hosted checkout to complete payment. Plan activates once the payment confirms on-chain.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div key={p.id} className={`flex flex-col rounded-xl border p-5 ${p.featured ? "border-primary/60 bg-surface shadow-glow" : "border-border/60 bg-surface"}`}>
            <div className="font-display font-semibold">{p.name}</div>
            <div className="mt-2 font-display text-2xl font-semibold">${p.monthlyPrice}<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
            <div className="mt-3 flex-1 space-y-1 text-xs text-muted-foreground">
              <div><Check className="mr-1 inline h-3 w-3 text-success" /> {p.quota.toLocaleString()} units/mo</div>
              <div><Check className="mr-1 inline h-3 w-3 text-success" /> {p.rateLimit}</div>
              <div><Check className="mr-1 inline h-3 w-3 text-success" /> {p.maxKeys} keys</div>
            </div>
            <Button asChild className={`mt-4 ${p.featured ? "bg-gradient-primary" : ""}`} variant={p.featured ? "default" : "outline"}>
              <Link href="/portal/checkout/return">Continue to checkout</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
