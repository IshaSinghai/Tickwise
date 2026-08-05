"use client";

import { AlertCircle, Info } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/DataState";
import { getSubscription, type Subscription } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

export type LifecycleState = "active" | "renewal_due" | "grace" | "downgraded" | "canceled";

/** Whole days from `now` until `iso`, rounded up. Negative once `iso` has passed. */
function daysUntil(iso: string, now: Date): number {
  const ms = new Date(iso).getTime() - now.getTime();
  return Math.ceil(ms / 86_400_000);
}

/**
 * Picks which of §4.3's five states a subscription is in.
 *
 * Exported and pure so the rule is readable and testable on its own — the banner
 * used to take its state as a prop that nothing ever passed, so it rendered
 * "renewal due" to every customer on every portal page regardless of their
 * actual subscription.
 *
 * Order matters: a lapsed subscription is checked before a cancellation request,
 * because a customer who cancelled *and* then lapsed is already on Free and
 * telling them their plan "ends on" a past date would be wrong.
 */
export function lifecycleStateFor(sub: Subscription, now: Date = new Date()): LifecycleState {
  if (sub.status === "free") return "downgraded";
  if (sub.status === "grace") return "grace";
  if (sub.cancelAtPeriodEnd) return "canceled";
  return daysUntil(sub.currentPeriodEnd, now) <= 7 ? "renewal_due" : "active";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type Copy = {
  tone: "info" | "warn" | "muted";
  title: string;
  body: string;
  cta?: { label: string; to: string };
};

/*
 * Copy is built from the subscription rather than held in a static table, so
 * every date shown is the customer's real period end. Wording follows §4.3,
 * including its tone note on the downgraded state: keys keep working at free-tier
 * limits, and this is never phrased as access being revoked or suspended.
 */
function copyFor(state: LifecycleState, sub: Subscription): Copy {
  const periodEnd = formatDate(sub.currentPeriodEnd);
  switch (state) {
    case "renewal_due": {
      const days = Math.max(0, daysUntil(sub.currentPeriodEnd, new Date()));
      return {
        tone: "info",
        title:
          days === 0 ? "Renewal due today" : `Renewal due in ${days} day${days === 1 ? "" : "s"}`,
        body: `Your plan renews on ${periodEnd}. Pay now to avoid interruption.`,
        cta: { label: "Pay renewal", to: "/portal/billing" },
      };
    }
    case "grace":
      return {
        tone: "warn",
        title: "Payment overdue",
        body: sub.graceEndsAt
          ? `Your period ended. Your plan drops to Free on ${formatDate(sub.graceEndsAt)}.`
          : "Your period ended. Your plan drops to Free shortly unless renewed.",
        cta: { label: "Pay now", to: "/portal/billing" },
      };
    case "downgraded":
      return {
        tone: "muted",
        title: "You’re on the Free plan",
        body: "Your subscription lapsed. Your keys still work at free-tier limits — reactivate any time to lift them.",
        cta: { label: "Reactivate", to: "/portal/billing/plans" },
      };
    case "canceled":
      return {
        tone: "info",
        title: "Cancellation scheduled",
        body: `Your plan ends on ${periodEnd}. You can resume any time before then.`,
        cta: { label: "Resume plan", to: "/portal/billing" },
      };
    case "active":
      return {
        tone: "muted",
        title: "Subscription active",
        body: `Your ${sub.planName} plan renews on ${periodEnd} · UTC.`,
      };
  }
}

const TONES: Record<Copy["tone"], string> = {
  info: "border-primary/40 bg-primary/10 text-foreground",
  warn: "border-warning/40 bg-warning/10 text-foreground",
  muted: "border-border/60 bg-surface text-muted-foreground",
};

export function LifecycleBanner() {
  const { status, data, error, retry } = useAsync<Subscription>(
    (signal) => getSubscription(signal),
    "Could not load your subscription.",
  );

  /*
   * No skeleton while loading. This banner sits above the page content on every
   * portal route, so a placeholder here would push the whole page down and then
   * reflow it — worse than appearing a beat late. Its absence says nothing
   * untrue, which is the bar that matters for this component.
   */
  if (status === "loading") return null;
  if (status === "error") return <InlineError message={error} onRetry={retry} />;

  const state = lifecycleStateFor(data);
  const c = copyFor(state, data);

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between ${TONES[c.tone]}`}
    >
      <div className="flex items-start gap-3">
        {c.tone === "warn" ? (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <div>
          <div className="text-sm font-medium text-foreground">{c.title}</div>
          <div className="text-sm">{c.body}</div>
        </div>
      </div>
      {c.cta && (
        <Button asChild size="sm" className="bg-gradient-primary">
          <Link href={c.cta.to}>{c.cta.label}</Link>
        </Button>
      )}
    </div>
  );
}
