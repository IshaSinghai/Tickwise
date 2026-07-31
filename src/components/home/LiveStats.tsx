import { useEffect, useState } from "react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Activity, Database, Layers, Timer } from "lucide-react";
import { LIVE_STATS } from "@/lib/mock";
import { seeded } from "./motion-primitives";
import { useSafeReducedMotion } from "./hero/primitives";

function Counter({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const reduce = useSafeReducedMotion();
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
  const d = pts.map((p, i) => `${((i / 19) * 100).toFixed(2)},${(24 - p * 18 - 2).toFixed(2)}`).join(" ");
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
  const reduce = useSafeReducedMotion();
  return (
    <div className="relative">
      {/* connection lines travelling down from the hero scene into the cards */}
      <svg
        aria-hidden
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -top-10 left-0 h-10 w-full opacity-70"
      >
        <defs>
          <linearGradient id="stats-feed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--primary-glow)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {[12.5, 37.5, 62.5, 87.5].map((x, i) => {
          const d = `M 50 0 Q ${(50 + x) / 2} 6 ${x} 10`;
          return (
            <g key={x}>
              <motion.path
                d={d}
                fill="none"
                stroke="url(#stats-feed)"
                strokeWidth="0.4"
                vectorEffect="non-scaling-stroke"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              />
              {!reduce && (
                <circle r="0.6" fill="var(--primary-glow)">
                  <animateMotion dur={`${2.6 + i * 0.4}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" path={d} />
                  <animate attributeName="opacity" values="0;1;0" dur={`${2.6 + i * 0.4}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
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
    </div>
  );
}

