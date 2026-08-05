import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SkeletonBlock, SkeletonRows } from "@/components/DataState";

/*
 * The loading state for /explore.
 *
 * A server-rendered page can't hold its own loading state the way the useAsync
 * views do — by the time the component runs, the data is already there. The route
 * segment's `loading.tsx` is where that state lives instead: Next streams this
 * while the positions request is in flight, and on every search/sort/page
 * navigation after that.
 *
 * /explore is the one public page that needs it. The others fetch catalog data
 * behind a `revalidate` cache, so their server render doesn't wait on the network.
 */
export default function ExploreLoading() {
  return (
    <MarketingShell>
      <div className="container-page py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">Open positions</h1>
            <p className="text-sm text-muted-foreground">
              Live preview of the API — only positions with &gt; $500,000 pooled assets.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <SkeletonBlock className="h-10" />
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-surface px-4 shadow-card">
          <SkeletonRows rows={8} lines={1} />
        </div>
      </div>
    </MarketingShell>
  );
}
