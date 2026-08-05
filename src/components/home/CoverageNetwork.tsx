"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { ChainMetricsMap } from "@/lib/public-data";

/*
 * No `latency` field, deliberately. The brief (§8) forbids showing any uptime,
 * SLA or latency number because there is no status monitoring behind it — a
 * figure here would be invented.
 *
 * The same rule caught this panel's own numbers. It used to carry `tvl: "$1.02B"`,
 * `pools: "4,820"` and `indexing: "~5 min"` per chain and render them under a
 * heading reading "Coverage — kept honest" — three measurements per chain, none of
 * them measured. They come from `getChainMetrics()` now, threaded down from the
 * server component, and each cell reports itself unmeasured on its own.
 *
 * What stays here is what isn't a measurement: which chains exist, whether each is
 * servable, and the x/y coordinates its node sits at. Those are product facts and
 * layout, so the graph draws identically whether or not any figure resolved.
 */
type Chain = {
  name: string;
  state: "live" | "indexed";
  x: number;
  y: number;
};

const chains: Chain[] = [
  { name: "Ethereum", state: "live", x: 26, y: 30 },
  { name: "Avalanche", state: "live", x: 72, y: 26 },
  { name: "Arbitrum", state: "indexed", x: 22, y: 74 },
  { name: "Optimism", state: "indexed", x: 76, y: 72 },
];

/** Matches the "$1.02B" / "$264M" forms this panel has always printed. */
function formatTvl(usd: number): string {
  return usd >= 1e9 ? `$${(usd / 1e9).toFixed(2)}B` : `$${Math.round(usd / 1e6)}M`;
}

const UNMEASURED = "—";

export function CoverageNetwork({ metrics }: { metrics: ChainMetricsMap | null }) {
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/40 shadow-card backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: active ? 1 : 0.35,
          background:
            "radial-gradient(50% 50% at 50% 50%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 72%)",
        }}
      />
      <div className="relative border-b border-border/60 p-6 md:p-8">
        <div className="text-xs uppercase tracking-widest text-primary">Coverage — kept honest</div>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          What’s actually live today
        </h2>
      </div>

      <div className="relative grid gap-6 p-6 md:grid-cols-[1.15fr_1fr] md:p-8">
        {/* network */}
        <div className="relative aspect-[4/3] w-full">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" fill="none">
            {chains.map((c) => {
              const on = active === c.name;
              return (
                <g key={c.name}>
                  <line
                    x1="50"
                    y1="50"
                    x2={c.x}
                    y2={c.y}
                    stroke={c.state === "live" ? "var(--primary-glow)" : "var(--border)"}
                    strokeWidth={on ? 0.8 : 0.4}
                    strokeDasharray={c.state === "live" ? undefined : "2 2"}
                    opacity={on ? 0.95 : 0.5}
                    className="transition-all duration-500"
                  />
                  {c.state === "live" && !reduce && (
                    <circle r="0.9" fill="var(--primary-glow)">
                      <animateMotion
                        dur="3.6s"
                        repeatCount="indefinite"
                        path={`M50,50 L${c.x},${c.y}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* hub */}
          <motion.div
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-primary/40 bg-surface/80 font-mono text-[0.625rem] uppercase tracking-widest text-muted-foreground backdrop-blur"
            animate={
              reduce
                ? undefined
                : {
                    boxShadow: [
                      "0 0 0 0 rgba(0,0,0,0)",
                      "var(--shadow-glow)",
                      "0 0 0 0 rgba(0,0,0,0)",
                    ],
                  }
            }
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            api
          </motion.div>

          {chains.map((c) => (
            <button
              key={c.name}
              onMouseEnter={() => setActive(c.name)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(c.name)}
              onBlur={() => setActive(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/60 bg-surface/80 px-3 py-2 text-left text-xs backdrop-blur transition-all duration-500 hover:-translate-y-[55%] hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <span className="flex items-center gap-1.5 font-medium">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${c.state === "live" ? "bg-success animate-ping-slow" : "bg-muted-foreground/60"}`}
                />
                {c.name}
              </span>
            </button>
          ))}
        </div>

        {/* detail panel */}
        <div className="relative rounded-2xl border border-border/60 bg-background/40 p-5">
          {(() => {
            const c = chains.find((x) => x.name === active);
            const m = c ? metrics?.[c.name] : undefined;
            if (!c)
              return (
                <div className="flex h-full min-h-40 flex-col justify-center text-sm text-muted-foreground">
                  <div className="font-display text-lg text-foreground">Hover a chain node</div>
                  <p className="mt-1">
                    TVL, pool count and indexing state for every network we touch — including the
                    ones we index but don’t serve yet.
                  </p>
                </div>
              );
            return (
              <motion.dl
                key={c.name}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="grid grid-cols-2 gap-4 text-sm"
              >
                <div className="col-span-2 flex items-center justify-between">
                  <span className="font-display text-xl font-semibold">{c.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      c.state === "live"
                        ? "border border-success/40 bg-success/10 text-success"
                        : "border border-border/60 bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {c.state === "live" ? "live" : "indexed, not servable"}
                  </span>
                </div>
                {[
                  ["TVL", m?.tvlUsd === undefined ? UNMEASURED : formatTvl(m.tvlUsd)],
                  ["Pools", m?.pools === undefined ? UNMEASURED : m.pools.toLocaleString()],
                  [
                    "Indexing",
                    /* "backfilling" is a state we know, not a figure we measured, so
                       the two non-servable chains keep it. A servable chain shows
                       its measured lag or nothing. */
                    c.state === "indexed"
                      ? "backfilling"
                      : m?.indexingLagMinutes === undefined
                        ? UNMEASURED
                        : `~${m.indexingLagMinutes} min`,
                  ],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[0.625rem] uppercase tracking-widest text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="mt-1 font-display text-lg tabular-nums">{v}</dd>
                  </div>
                ))}
              </motion.dl>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
