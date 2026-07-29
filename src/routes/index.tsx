import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Zap, Shield, Gauge, Terminal, Layers, Copy, Check } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/CodeBlock";
import { LIVE_STATS } from "@/lib/mock";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tickwise — The metered API for Uniswap v4 pools & positions" },
      {
        name: "description",
        content:
          "Near-real-time Uniswap v4 pools and positions on Ethereum and Avalanche. Get an API key, ship in five minutes.",
      },
      { property: "og:title", content: "Tickwise Dex API" },
      {
        property: "og:description",
        content: "Near-real-time Uniswap v4 pools and positions. Built for teams that would rather build product than index chains.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <MarketingShell>
      <Hero />
      <Proof />
      <Features />
      <Snippet />
      <Coverage />
      <CTA />
    </MarketingShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="pointer-events-none absolute inset-0 opacity-40 grid-lines" />
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Uniswap v4 · Ethereum & Avalanche · near-real-time
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            <span className="text-gradient">Pools & positions</span>
            <br />
            as one clean API.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            We index Uniswap v4 so you don’t have to. Metered endpoints, honest quotas, one header of auth.
            Ship a positions dashboard, a portfolio tracker, or a research tool in an afternoon.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-glow">
              <Link to="/signup">
                Get an API key <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/docs/quickstart">Read the quickstart</Link>
            </Button>
            <Link to="/explore" className="ml-2 text-sm text-muted-foreground hover:text-foreground">
              or try the live data →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Proof() {
  const stats = [
    { label: "Pools tracked", value: LIVE_STATS.poolsTracked.toLocaleString() },
    { label: "Positions tracked", value: LIVE_STATS.positionsTracked.toLocaleString() },
    { label: "Indexing lag", value: `~${LIVE_STATS.indexingLagMinutes} min` },
    { label: "Chains live", value: "2" },
  ];
  return (
    <section className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-border/60 px-6 py-10 md:grid-cols-4 md:divide-x">
        {stats.map((s, i) => (
          <div key={s.label} className={`px-4 py-2 ${i > 0 ? "md:pl-8" : ""}`}>
            <div className="font-display text-3xl font-semibold tracking-tight">{s.value}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Zap,
      title: "Near-real-time",
      body: "Positions re-price about every 5 minutes. On-chain fee state refreshes roughly hourly on Ethereum.",
    },
    {
      icon: Gauge,
      title: "Metered, not throttled to death",
      body: "Per-endpoint unit costs and monthly quotas. Every response carries X-Quota-* and X-RateLimit-* headers.",
    },
    {
      icon: Shield,
      title: "Two key types",
      body: "Server keys are 403’d from browsers. Browser keys ship with allowed-origin lists. Both explained in the docs.",
    },
    {
      icon: Layers,
      title: "One shape across chains",
      body: "The same JSON on Ethereum and Avalanche. Add a chain with one query param.",
    },
    {
      icon: Terminal,
      title: "curl-first",
      body: "One header of auth. Every endpoint is copy-pasteable from the docs. No SDK required.",
    },
    {
      icon: Zap,
      title: "Honest about what we don’t do",
      body: "No fake uptime, no invented accuracy scores. See the coverage page for the true footprint.",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-widest text-primary">Why teams pick Tickwise</div>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          Boring where boring matters. Fast where it doesn’t.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="rounded-2xl border border-border/60 bg-surface p-6 shadow-card transition-colors hover:border-primary/40">
            <it.icon className="h-5 w-5 text-primary" />
            <div className="mt-3 font-display text-lg font-semibold">{it.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Snippet() {
  const [tab, setTab] = useState<"curl" | "js">("curl");
  const curl = `curl https://api.tickwise.io/v1/pools?chain=ethereum \\
  -H "KC-APIKey: kc_live_9f2a4c8e…"`;
  const js = `const res = await fetch(
  "https://api.tickwise.io/v1/pools?chain=ethereum",
  { headers: { "KC-APIKey": process.env.CP_KEY! } }
);
const pools = await res.json();`;
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">Five-minute quickstart</div>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">One header. Real data.</h2>
          <p className="mt-4 text-muted-foreground">
            Sign up, create a key in the portal, drop this into your terminal. If the response returns pools, you’re done.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild className="bg-gradient-primary"><Link to="/signup">Get a free key</Link></Button>
            <Button asChild variant="outline"><Link to="/docs/quickstart">Full quickstart</Link></Button>
          </div>
        </div>
        <div>
          <div className="mb-2 flex gap-1">
            {(["curl", "js"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1 text-xs font-mono uppercase ${
                  tab === t ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <CodeBlock code={tab === "curl" ? curl : js} lang={tab} />
        </div>
      </div>
    </section>
  );
}

function Coverage() {
  const rows = [
    { chain: "Ethereum", protocol: "Uniswap v4", state: "live" },
    { chain: "Avalanche", protocol: "Uniswap v4", state: "live" },
    { chain: "Arbitrum", protocol: "Uniswap v4", state: "indexed, not servable" },
    { chain: "Optimism", protocol: "Uniswap v4", state: "indexed, not servable" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-2xl border border-border/60 bg-surface shadow-card">
        <div className="border-b border-border/60 p-6">
          <div className="text-xs uppercase tracking-widest text-primary">Coverage — kept honest</div>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">What’s actually live today</h2>
        </div>
        <div className="divide-y divide-border/60">
          {rows.map((r) => (
            <div key={r.chain} className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="font-medium">{r.chain}</div>
                <div className="text-xs text-muted-foreground">{r.protocol}</div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs ${
                  r.state === "live"
                    ? "border border-success/40 bg-success/10 text-success"
                    : "border border-border/60 bg-surface-2 text-muted-foreground"
                }`}
              >
                {r.state}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-primary p-10 text-primary-foreground shadow-glow">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="font-display text-3xl font-semibold tracking-tight">Start on Free. Upgrade when it hurts.</h3>
            <p className="mt-2 text-primary-foreground/80">
              25,000 units a month at no cost. Every plan uses the same endpoints — just more of them.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button asChild size="lg" variant="secondary"><Link to="/signup">Create free account</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10">
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
