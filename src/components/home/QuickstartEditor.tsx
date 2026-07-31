"use client";

import { useEffect, useState } from "react";
import { useSafeReducedMotion } from "@/components/home/hero/primitives";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useRef } from "react";

const CODE = `const res = await fetch(
  "https://api.tickwise.io/v1/pools?chain=ethereum",
  { headers: { "KC-APIKey": process.env.CP_KEY! } }
);
const pools = await res.json();`;

const JSON_RES = `{
  "chain": "ethereum",
  "protocol": "uniswap-v4",
  "pools": [
    { "id": "0x8f2a…", "pair": "USDC/WETH", "tvl": 184920331, "apr": 18.6 },
    { "id": "0x31c9…", "pair": "WETH/USDT", "tvl":  92140820, "apr": 11.2 }
  ],
  "units_charged": 1
}`;

/** naive syntax colouring for the demo snippet */
function highlight(line: string) {
  const parts = line.split(/("[^"]*")/g);
  return parts.map((p, i) => {
    if (p.startsWith('"')) return <span key={i} className="text-success">{p}</span>;
    return (
      <span key={i}>
        {p.split(/\b(const|await|fetch|process|env|return)\b/g).map((w, j) =>
          ["const", "await", "return"].includes(w) ? (
            <span key={j} className="text-primary-glow">{w}</span>
          ) : ["fetch", "process", "env"].includes(w) ? (
            <span key={j} className="text-chart-5">{w}</span>
          ) : (
            <span key={j}>{w}</span>
          ),
        )}
      </span>
    );
  });
}

export function QuickstartEditor() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const reduce = useSafeReducedMotion();
  const [typed, setTyped] = useState(reduce ? CODE : "");
  const [phase, setPhase] = useState<"idle" | "typing" | "running" | "done">(reduce ? "done" : "idle");

  useEffect(() => {
    if (reduce || !inView) return;
    let i = 0;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setPhase("typing");
    const type = () => {
      if (cancelled) return;
      i += 1;
      setTyped(CODE.slice(0, i));
      if (i < CODE.length) timers.push(setTimeout(type, 16));
      else {
        timers.push(
          setTimeout(() => {
            setPhase("running");
            timers.push(setTimeout(() => setPhase("done"), 1200));
          }, 500),
        );
      }
    };
    timers.push(setTimeout(type, 300));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [inView, reduce]);

  const lines = typed.split("\n");

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-border/70 bg-surface/50 shadow-card backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        <div className="flex gap-1.5">
          {["pools.ts", "positions.ts"].map((f, i) => (
            <span
              key={f}
              className={`rounded-md px-2.5 py-1 font-mono text-[11px] ${i === 0 ? "bg-surface-2 text-foreground" : "text-muted-foreground"}`}
            >
              {f}
            </span>
          ))}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">node 22</span>
      </div>

      <div className="grid font-mono text-[12.5px] leading-relaxed">
        <div className="p-4">
          {lines.map((l, i) => (
            <div key={i} className="flex gap-4">
              <span className="w-4 select-none text-right text-muted-foreground/50">{i + 1}</span>
              <span className="whitespace-pre-wrap break-all text-foreground/90">
                {highlight(l)}
                {phase === "typing" && i === lines.length - 1 && (
                  <span className="ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] animate-caret bg-primary-glow" />
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-border/60 bg-background/50 p-4">
          <AnimatePresence mode="wait">
            {phase !== "done" ? (
              <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                {phase === "running" ? "executing request…" : "waiting for input"}
              </motion.div>
            ) : (
              <motion.div
                key="res"
                initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7 }}
              >
                <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-success">200 OK</span>
                  <span className="text-muted-foreground">168 ms</span>
                  <motion.span
                    className="text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    1 unit consumed · 24,999 left
                  </motion.span>
                </div>
                <pre className="max-h-56 overflow-auto text-[12px] text-foreground/75">{JSON_RES}</pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
