"use client";

import Link from "next/link";

import { Card } from "@/components/portal/Card";
import { EmptyState, InlineError, SkeletonBlock, SkeletonRows } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { getAccountPayments, getSubscription, type Subscription } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

type Payments = Awaited<ReturnType<typeof getAccountPayments>>;
type BillingData = { subscription: Subscription; payments: Payments };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/*
 * Subscription state and payment history are one view, so they load as one unit —
 * two independent spinners resolving at different moments on the same card would
 * read as jank rather than as progress. Both requests share the abort signal, so
 * navigating away cancels them together.
 */
export function Billing() {
  const { status, data, error, retry } = useAsync<BillingData>(async (signal) => {
    const [subscription, payments] = await Promise.all([
      getSubscription(signal),
      getAccountPayments(signal),
    ]);
    return { subscription, payments };
  }, "Could not load your billing details.");

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Billing</h1>

      {status === "error" ? (
        <InlineError message={error} onRetry={retry} />
      ) : status === "loading" ? (
        <>
          <Card>
            <SkeletonBlock className="h-20" />
          </Card>
          <Card>
            <SkeletonRows rows={3} />
          </Card>
        </>
      ) : (
        <Populated data={data} />
      )}
    </div>
  );
}

function Populated({ data }: { data: BillingData }) {
  const { subscription, payments } = data;
  const isFree = subscription.status === "free";

  return (
    <>
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Current plan
            </div>
            <div className="mt-1 font-display text-2xl font-semibold">{subscription.planName}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {isFree
                ? "Free plan. Upgrade any time — crypto payment, hosted checkout."
                : `${subscription.cancelAtPeriodEnd ? "Ends" : "Renews"} ${formatDate(subscription.currentPeriodEnd)} · UTC. Crypto payment, hosted checkout.`}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/portal/billing/plans">{isFree ? "See plans" : "Change plan"}</Link>
            </Button>
            {/* Only offered when there is something to pay. A "Pay renewal"
                button on a Free account has nothing to charge.

                Starting a renewal means opening a hosted checkout, which needs
                POST /checkout — backend-planned. So it says that, rather than
                being a button that swallows the click. */}
            {!isFree && (
              <Button
                className="bg-gradient-primary"
                onClick={() =>
                  toast.error(
                    "Paying a renewal opens a hosted checkout, which needs the billing API — that isn’t wired up yet.",
                  )
                }
              >
                Pay renewal
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
          Payment history
        </div>
        {payments.length === 0 ? (
          <EmptyState
            title="No payments yet"
            body="Invoices and transaction hashes appear here after your first payment."
            action={
              <Button asChild variant="outline">
                <Link href="/portal/billing/plans">See plans</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[0.625rem] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Plan</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Tx</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 font-mono text-xs">{p.date}</td>
                    <td className="py-3">{p.plan}</td>
                    <td className="py-3 font-mono">${p.amount}</td>
                    <td className="py-3 font-mono text-xs text-primary">{p.tx}</td>
                    <td className="py-3 text-right">
                      <StatusPill status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

/*
 * The pill used to be hardcoded green regardless of status, so a pending or
 * failed payment rendered as confirmed. §4.2's rule about never claiming an
 * unconfirmed success applies to the history table too.
 */
function StatusPill({ status }: { status: string }) {
  const tone =
    status === "confirmed" || status === "paid"
      ? "border-success/40 bg-success/10 text-success"
      : status === "pending"
        ? "border-warning/40 bg-warning/10 text-warning"
        : status === "failed" || status === "expired"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border/60 bg-surface-2 text-muted-foreground";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[0.625rem] ${tone}`}>{status}</span>
  );
}
