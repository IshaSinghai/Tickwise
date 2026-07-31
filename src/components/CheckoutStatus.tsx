"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

type Status = "pending" | "confirmed" | "underpaid" | "expired" | "failed";

const CONFIG: Record<Status, { icon: typeof Clock; tone: string; title: string; body: string }> = {
  pending: {
    icon: Loader2,
    tone: "text-primary",
    title: "Payment seen · waiting for confirmations",
    body: "We have seen your payment and are waiting for the network to confirm it. You can close this page — we will email you and your plan activates automatically.",
  },
  confirmed: {
    icon: CheckCircle2,
    tone: "text-success",
    title: "Payment confirmed",
    body: "Your plan is active. Your API keys already reflect the new limits.",
  },
  underpaid: {
    icon: AlertTriangle,
    tone: "text-warning",
    title: "Amount was short",
    body: "We received less than the invoice amount. Send the remaining balance to the same address, or contact support.",
  },
  expired: {
    icon: XCircle,
    tone: "text-muted-foreground",
    title: "Checkout expired",
    body: "This checkout window closed before a payment was seen. Start a new checkout to try again.",
  },
  failed: {
    icon: XCircle,
    tone: "text-destructive",
    title: "Payment failed",
    body: "The processor reported the payment failed. If you were charged, contact support with the transaction id.",
  },
};

// Poller stub — cycles through likely states so the design of each is easy to verify.
export function CheckoutStatus() {
  const [status, setStatus] = useState<Status>("pending");
  useEffect(() => {
    const t = setTimeout(() => setStatus("confirmed"), 6000);
    return () => clearTimeout(t);
  }, []);

  const c = CONFIG[status];
  const Icon = c.icon;

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-border/60 bg-surface p-8 shadow-card">
      <div className="flex items-center gap-3">
        <Icon className={`h-8 w-8 ${c.tone} ${status === "pending" ? "animate-spin" : ""}`} />
        <div>
          <div className="font-display text-lg font-semibold">{c.title}</div>
          <div className="text-xs text-muted-foreground">Checking · ref chk_9a2f</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{c.body}</p>

      {status === "underpaid" && (
        <div className="rounded-md border border-warning/40 bg-warning/10 p-3 font-mono text-xs">
          Remaining: 0.0034 ETH → 0xa7f2…c119
        </div>
      )}

      <div className="border-t border-border/60 pt-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">preview status</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {(Object.keys(CONFIG) as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded border border-border/60 px-2 py-1 font-mono text-[10px] transition-colors ${
                s === status ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
