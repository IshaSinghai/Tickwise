"use client";

import { AlertTriangle, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError, getCheckoutStatus, type CheckoutState } from "@/lib/api";

/*
 * Checkout return page — §4.2, "the screen most likely to be designed wrong".
 *
 * What this replaces: a stub that did `setTimeout(() => setStatus("confirmed"),
 * 6000)`. It reported a confirmed payment after six seconds regardless of
 * whether anything had been paid, which is precisely what the brief forbids
 * ("never claim a success it has not confirmed").
 *
 * Design constraints taken from the brief:
 * - Status comes from a capability URL that works with no session, because the
 *   customer often pays inside a wallet's in-app browser and lands here signed
 *   out. Hence the `ref` query param, and why the route is exempt from the
 *   portal auth guard.
 * - The processor's redirect is NOT proof of payment, so arriving here shows
 *   "checking", never "paid".
 * - Polls with a visible checking state until a terminal outcome.
 * - `cannot-verify` is a distinct state from `failed`. Not being able to read the
 *   status is not the same as the payment failing, and saying otherwise would
 *   scare a customer whose money is fine.
 *
 * Polling is a plain useEffect + setTimeout over the typed fetch wrapper, per
 * §7 — no data-fetching library.
 */

const POLL_INTERVAL_MS = 5000;
/** ~2 minutes of attempts before backing off to a manual retry. */
const MAX_ATTEMPTS = 24;

type UiState = CheckoutState | "checking" | "cannot-verify" | "no-ref";

const COPY: Record<
  UiState,
  { icon: typeof Clock; tone: string; spin?: boolean; title: string; body: string }
> = {
  checking: {
    icon: Loader2,
    tone: "text-primary",
    spin: true,
    title: "Checking your payment…",
    body: "We’re asking the processor for the current status. This usually takes a few seconds.",
  },
  pending: {
    icon: Loader2,
    tone: "text-primary",
    spin: true,
    title: "Payment seen · waiting for confirmations",
    body: "We have seen your payment and are waiting for confirmations. You can close this page — we will email you, and your plan activates automatically.",
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
    body: "We received less than the invoice amount. Send the remaining balance to the same address and we’ll activate your plan automatically, or contact support.",
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
  "cannot-verify": {
    icon: Clock,
    tone: "text-muted-foreground",
    title: "We can’t confirm this payment yet",
    body: "We couldn’t reach the payment processor. This does not mean your payment failed — if it went through, we will email you and your plan activates automatically. You can safely close this page.",
  },
  "no-ref": {
    icon: AlertTriangle,
    tone: "text-warning",
    title: "Missing checkout reference",
    body: "This link is missing its checkout reference, so we can’t look the payment up. Open the link from your email, or check billing for the latest state.",
  },
};

/** States where there is nothing left to wait for. */
const TERMINAL: ReadonlySet<UiState> = new Set(["confirmed", "expired", "failed", "no-ref"]);

export function CheckoutStatus() {
  const searchParams = useSearchParams();
  const ref = searchParams?.get("ref") ?? null;

  /*
   * The UI state is derived, not seeded into useState. On a prerendered page
   * useSearchParams() is null during render and only has the query string after
   * hydration — seeding "no-ref" from that first pass would latch a terminal
   * state and the poller would never start for a real ?ref= link.
   */
  const [pollState, setPollState] = useState<CheckoutState | "cannot-verify" | null>(null);
  const [remaining, setRemaining] = useState<{ amount: string; address: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  // Held in a ref so the polling effect doesn't restart on every tick.
  const attemptsRef = useRef(0);

  const poll = useCallback(
    async (signal: AbortSignal) => {
      if (!ref) return;
      try {
        const result = await getCheckoutStatus(ref, signal);
        if (signal.aborted) return;
        setPollState(result.state);
        setRemaining(result.remaining ?? null);
        setDetail(null);
      } catch (err) {
        if (signal.aborted) return;
        // Keep retrying while attempts remain: a transient network blip must not
        // be presented as an outcome.
        attemptsRef.current += 1;
        setAttempts(attemptsRef.current);
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          setPollState("cannot-verify");
          setDetail(err instanceof ApiError ? err.message : null);
        }
      } finally {
        if (!signal.aborted) {
          setLastCheckedAt(new Date().toLocaleTimeString());
        }
      }
    },
    [ref],
  );

  // Derived so it tracks `ref` becoming available after hydration.
  const state: UiState = !ref ? "no-ref" : (pollState ?? "checking");

  useEffect(() => {
    if (!ref) return;
    if (TERMINAL.has(state) || state === "cannot-verify") return;

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      await poll(controller.signal);
      if (!controller.signal.aborted) {
        timer = setTimeout(() => void tick(), POLL_INTERVAL_MS);
      }
    };
    void tick();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
    // `state` is intentionally in the deps: reaching a terminal outcome must stop
    // the loop. The guard above makes re-running cheap.
  }, [ref, state, poll]);

  const retry = () => {
    attemptsRef.current = 0;
    setAttempts(0);
    setDetail(null);
    setPollState(null); // back to "checking", restarting the poll effect
  };

  const c = COPY[state];
  const Icon = c.icon;
  const isWaiting = state === "checking" || state === "pending";

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-border/60 bg-surface p-8 shadow-card">
      <div className="flex items-start gap-3">
        <Icon className={`h-8 w-8 shrink-0 ${c.tone} ${c.spin ? "animate-spin" : ""}`} />
        <div className="min-w-0">
          <div className="font-display text-lg font-semibold">{c.title}</div>
          {ref && (
            <div className="mt-0.5 truncate font-mono text-xs text-muted-foreground">ref {ref}</div>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{c.body}</p>

      {state === "underpaid" && remaining && (
        <div className="rounded-md border border-warning/40 bg-warning/10 p-3 font-mono text-xs">
          Remaining: {remaining.amount} → {remaining.address}
        </div>
      )}

      {/* Visible checking state, per §4.2 — including when the last check ran, so
          a page left open doesn't look frozen. */}
      {isWaiting && (
        <div
          className="flex items-center gap-2 text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Checking every {POLL_INTERVAL_MS / 1000}s
          {lastCheckedAt && <span>· last checked {lastCheckedAt}</span>}
          {attempts > 0 && <span>· retry {attempts}</span>}
        </div>
      )}

      {detail && <p className="text-xs text-muted-foreground/80">{detail}</p>}

      <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
        {state === "cannot-verify" && (
          <Button size="sm" variant="outline" onClick={retry}>
            Check again
          </Button>
        )}
        {(state === "expired" || state === "failed") && (
          <Button asChild size="sm" className="bg-gradient-primary">
            <Link href="/portal/billing/plans">Start a new checkout</Link>
          </Button>
        )}
        {state === "confirmed" && (
          <Button asChild size="sm" className="bg-gradient-primary">
            <Link href="/portal">Go to your portal</Link>
          </Button>
        )}
        <Button asChild size="sm" variant="ghost">
          <Link href="/support">Contact support</Link>
        </Button>
      </div>
    </div>
  );
}
