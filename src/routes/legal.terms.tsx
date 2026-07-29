import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell } from "@/components/marketing/MarketingShell";
export const Route = createFileRoute("/legal/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Tickwise" }, { name: "description", content: "The rules of using the Tickwise Dex API." }] }),
  component: () => <LegalPage title="Terms of Service" body="These are placeholder terms. Replace with counsel-reviewed copy before charging real money." />,
});

export function LegalPage({ title, body }: { title: string; body: string }) {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-xs uppercase tracking-widest text-primary">Legal</div>
        <h1 className="mt-2 font-display text-4xl font-semibold">{title}</h1>
        <p className="mt-6 text-muted-foreground">{body}</p>
      </div>
    </MarketingShell>
  );
}
