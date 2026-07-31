import { useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Activity, Database, Layers, Timer } from "lucide-react";
import { LIVE_STATS } from "@/lib/mock";
import { seeded } from "./motion-primitives";

function Counter({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (reduce) return setV(value);
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1800);
      setV(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

function MicroChart({ seed }: { seed: number }) {
  const pts = Array.from({ length: 20 }, (_, i) => seeded(i, seed));
  const d = pts.map((p, i) => `${(i / 19) * 100},${24 - p * 18 - 2}`).join(" ");
  return (
    <svg viewBox="0 0 100 24" className="h-full w-full">
      <polyline points={d} fill="none" stroke="var(--primary-glow)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const stats = [
  { icon: Database, label: "Pools tracked", value: LIVE_STATS.poolsTracked, suffix: "" },
  { icon: Layers, label: "Positions tracked", value: LIVE_STATS.positionsTracked, suffix: "" },
  { icon: Timer, label: "Indexing lag", value: LIVE_STATS.indexingLagMinutes, prefix: "~", suffix: " min" },
  { icon: Activity, label: "Chains live", value: 2, suffix: "" },
];

export function LiveStats() {
  const reduce = useReducedMotion();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
          className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface/50 p-5 shadow-card backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/40"
        >
          <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)" }} />
          <div className="relative flex items-start justify-between">
            <s.icon className="h-5 w-5 text-primary transition-transform duration-700 group-hover:rotate-12" />
            <span className="h-1.5 w-1.5 animate-ping-slow rounded-full bg-success" />
          </div>
          <div className="relative mt-6 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
          </div>
          <div className="relative mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
          <div className="relative mt-3 h-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <MicroChart seed={i + 3} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
