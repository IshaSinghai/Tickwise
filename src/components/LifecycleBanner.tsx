import { AlertCircle, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type State = "active" | "renewal_due" | "grace" | "downgraded" | "canceled";

const COPY: Record<
  State,
  { tone: "info" | "warn" | "danger" | "muted"; title: string; body: string; cta?: { label: string; to: string } }
> = {
  active: {
    tone: "muted",
    title: "Subscription active",
    body: "Your Starter plan renews on 1 August 2026 · UTC.",
  },
  renewal_due: {
    tone: "info",
    title: "Renewal due in 5 days",
    body: "Your plan renews on 1 August 2026. Pay now to avoid interruption.",
    cta: { label: "Pay renewal", to: "/portal/billing" },
  },
  grace: {
    tone: "warn",
    title: "Payment overdue",
    body: "Your period ended. Your plan drops to Free on 3 August 2026 unless renewed.",
    cta: { label: "Pay now", to: "/portal/billing" },
  },
  downgraded: {
    tone: "muted",
    title: "You’re on the Free plan",
    body: "Your subscription lapsed. Your keys still work at free-tier limits — reactivate any time to lift them.",
    cta: { label: "Reactivate", to: "/portal/billing/plans" },
  },
  canceled: {
    tone: "info",
    title: "Cancellation scheduled",
    body: "Your plan ends on 1 August 2026. You can resume any time before then.",
    cta: { label: "Resume plan", to: "/portal/billing" },
  },
};

export function LifecycleBanner({ initial = "renewal_due" as State }) {
  const [state, setState] = useState<State>(initial);
  const c = COPY[state];
  const tone =
    c.tone === "info"
      ? "border-primary/40 bg-primary/10 text-foreground"
      : c.tone === "warn"
      ? "border-warning/40 bg-warning/10 text-foreground"
      : c.tone === "danger"
      ? "border-destructive/40 bg-destructive/10 text-foreground"
      : "border-border/60 bg-surface text-muted-foreground";

  return (
    <div className="space-y-2">
      <div className={`flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between ${tone}`}>
        <div className="flex items-start gap-3">
          {c.tone === "warn" || c.tone === "danger" ? (
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
            <Link to={c.cta.to}>{c.cta.label}</Link>
          </Button>
        )}
      </div>
      {/* Dev helper — cycle states so the design of all 5 is easy to review */}
      <div className="flex flex-wrap gap-1 text-[10px] text-muted-foreground">
        <span className="mr-1 uppercase tracking-widest">preview state:</span>
        {(Object.keys(COPY) as State[]).map((s) => (
          <button
            key={s}
            onClick={() => setState(s)}
            className={`rounded border border-border/60 px-1.5 py-0.5 font-mono transition-colors ${
              state === s ? "bg-surface-2 text-foreground" : "hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
