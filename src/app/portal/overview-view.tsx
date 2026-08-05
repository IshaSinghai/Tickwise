"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, Plus } from "lucide-react";

import { Card } from "@/components/portal/Card";
import { QuotaMeter } from "@/components/QuotaMeter";
import { EmptyState, InlineError, SkeletonBlock, SkeletonRows } from "@/components/DataState";
import { Button } from "@/components/ui/button";
import { getAccountOverview, type AccountOverview } from "@/lib/api";
import { useAsync } from "@/lib/use-async";

/*
 * Client-rendered, per the brief: the portal is behind a localStorage token and
 * stays out of SSR. The route's metadata lives in the server page beside this.
 *
 * Data comes from GET /account/overview through lib/api, which falls back to stub
 * data while that endpoint is backend-planned — so the four states below are real
 * code paths today rather than ones that only light up after the backend lands.
 */
export function PortalOverview() {
  const { status, data, error, retry } = useAsync<AccountOverview>(
    (signal) => getAccountOverview(signal),
    "Could not load your account overview.",
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Overview</h1>

      {status === "error" ? (
        <InlineError message={error} onRetry={retry} />
      ) : status === "loading" ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <SkeletonBlock className="h-20" />
            </Card>
            <Card>
              <SkeletonBlock className="h-20" />
            </Card>
          </div>
          <Card>
            <SkeletonRows rows={2} />
          </Card>
        </>
      ) : (
        <Populated data={data} />
      )}
    </div>
  );
}

function Populated({ data }: { data: AccountOverview }) {
  const { plan, keyCount, usage, lastPayment } = data;
  const price = plan.monthlyPrice > 0 ? `$${plan.monthlyPrice}/mo` : "Free";

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <QuotaMeter usage={usage} />
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Plan</div>
          <div className="mt-1 font-display text-2xl font-semibold">{plan.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{price}</div>
          <Link
            href="/portal/billing"
            className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Manage billing <ArrowRight className="h-3 w-3" />
          </Link>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">API keys</div>
            <div className="mt-1 font-display text-xl font-semibold">{keyCount} active</div>
          </div>
          <Link href="/portal/keys" className="text-sm text-primary hover:underline">
            Manage →
          </Link>
        </div>
        {keyCount === 0 ? (
          <EmptyState
            title="No API keys yet"
            body="Create one to make your first request."
            action={
              <Button asChild className="bg-gradient-primary">
                <Link href="/portal/keys">
                  <Plus className="mr-1 h-4 w-4" /> New key
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <KeyRound className="h-4 w-4" />
            {keyCount === 1 ? "1 key" : `${keyCount} keys`} in use · manage them on the keys page.
          </div>
        )}
      </Card>

      <Card>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Last payment</div>
        {lastPayment ? (
          <>
            <div className="mt-1 font-display text-xl font-semibold">
              ${lastPayment.amount} · {lastPayment.date}
            </div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">tx {lastPayment.tx}</div>
          </>
        ) : (
          <EmptyState
            title="No payments yet"
            body="You’re on the Free plan. Upgrade when you need higher limits."
            action={
              <Button asChild variant="outline">
                <Link href="/portal/billing/plans">See plans</Link>
              </Button>
            }
          />
        )}
      </Card>
    </>
  );
}
