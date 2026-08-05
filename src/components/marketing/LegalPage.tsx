import { MarketingShell } from "@/components/marketing/MarketingShell";

export function LegalPage({ title, body }: { title: string; body: string }) {
  return (
    <MarketingShell>
      <div className="container-page py-16">
        {/* Running text, so this one takes the reading measure rather than the
            wider `container-narrow` used for panels and forms. */}
        <div className="container-prose">
          <div className="text-xs uppercase tracking-widest text-primary">Legal</div>
          <h1 className="mt-2 font-display text-4xl font-semibold">{title}</h1>
          <p className="mt-6 text-muted-foreground">{body}</p>
        </div>
      </div>
    </MarketingShell>
  );
}
