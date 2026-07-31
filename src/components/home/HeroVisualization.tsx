import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { seeded } from "./motion-primitives";

function useCountUp(target: number, duration = 2000, decimals = 0) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) return setV(target);
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduce]);
  return v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Tiny continuously-animating sparkline. */
function Spark({ seed = 1, tone = "primary" }: { seed?: number; tone?: "primary" | "success" | "accent" }) {
  const reduce = useReducedMotion();
  const pts = Array.from({ length: 18 }, (_, i) => seeded(i, seed));
  const d = pts
    .map((p, i) => `${((i / (pts.length - 1)) * 100).toFixed(2)},${(26 - p * 20 - 3).toFixed(2)}`)
    .join(" ");
  const stroke =
    tone === "success" ? "var(--success)" : tone === "accent" ? "var(--chart-5)" : "var(--primary-glow)";
  return (
    <svg viewBox="0 0 100 26" className="h-6 w-full overflow-visible">
      <motion.polyline
        points={d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? undefined : { pathLength: 0, opacity: 0.2 }}
        animate={reduce ? undefined : { pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.4, ease: "easeOut", delay: seed * 0.15 }}
      />
      <motion.circle
        r="2"
        fill={stroke}
        cx="100"
        cy={26 - pts[pts.length - 1] * 20 - 3}
        animate={reduce ? undefined : { opacity: [0.3, 1, 0.3], r: [1.6, 2.6, 1.6] }}
        transition={{ duration: 3 + seed * 0.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

function GlassCard({
  className,
  style,
  depth = 1,
  children,
  float = 0,
}: {
  className?: string;
  style?: React.CSSProperties;
  depth?: number;
  children: React.ReactNode;
  float?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`absolute rounded-2xl border border-border/70 bg-surface/60 p-3 shadow-card backdrop-blur-xl ${className ?? ""}`}
      style={{ transformStyle: "preserve-3d", translateZ: depth * 40, ...style }}
      initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={
        reduce
          ? { opacity: 1 }
          : {
              opacity: 1,
              y: [0, -6 - float, 0],
              filter: "blur(0px)",
              rotate: [0, float * 0.35, 0],
            }
      }
      transition={{
        opacity: { duration: 0.9, delay: 0.2 + depth * 0.12 },
        filter: { duration: 0.9, delay: 0.2 + depth * 0.12 },
        y: { duration: 9 + float * 2.2, repeat: Infinity, ease: "easeInOut", delay: depth * 0.6 },
        rotate: { duration: 12 + float * 2, repeat: Infinity, ease: "easeInOut", delay: depth * 0.4 },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The holographic live-liquidity engine: a glowing core, orbiting metric rings,
 * connected glass terminals and API requests travelling along the paths.
 */
export function HeroVisualization() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [8, -8]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-7, 7]);
  const glowX = useTransform(sx, [-0.5, 0.5], ["35%", "65%"]);
  const glowY = useTransform(sy, [-0.5, 0.5], ["35%", "65%"]);

  const tvl = useCountUp(1_284_930_000 / 1e9, 2600, 2);
  const apr = useCountUp(18.6, 2200, 1);
  const reqs = useCountUp(42_318, 2400);

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative mx-auto aspect-square w-full max-w-[620px] select-none"
      style={{ perspective: 1400 }}
    >
      {/* reactive glow follows cursor */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-[3rem] opacity-70"
        style={{
          background: `radial-gradient(38% 38% at ${"var(--gx)"} ${"var(--gy)"}, color-mix(in oklab, var(--primary) 42%, transparent), transparent 70%)`,
          // @ts-expect-error custom props
          "--gx": glowX,
          "--gy": glowY,
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* camera breathing */}
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={reduce ? undefined : { scale: [1, 1.025, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* blockchain rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full border border-primary/25"
              style={{
                width: `${44 + i * 18}%`,
                height: `${44 + i * 18}%`,
                x: "-50%",
                y: "-50%",
                borderStyle: i === 1 ? "dashed" : "solid",
              }}
              animate={reduce ? undefined : { rotate: i % 2 ? -360 : 360 }}
              transition={{ duration: 90 + i * 45, repeat: Infinity, ease: "linear" }}
            >
              <span
                className="absolute h-2 w-2 rounded-full bg-primary-glow shadow-glow"
                style={{ left: "50%", top: -4, transform: "translateX(-50%)" }}
              />
            </motion.div>
          ))}

          {/* expanding ripple rings from the core */}
          {!reduce &&
            [0, 1, 2].map((i) => (
              <motion.div
                key={`r${i}`}
                className="absolute left-1/2 top-1/2 rounded-full border border-primary/30"
                style={{ width: 140, height: 140, x: "-50%", y: "-50%" }}
                animate={{ scale: [0.6, 2.6], opacity: [0.55, 0] }}
                transition={{ duration: 7, repeat: Infinity, delay: i * 2.33, ease: "easeOut" }}
              />
            ))}

          {/* connection paths + travelling API requests */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="hv-path" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.05" />
                <stop offset="50%" stopColor="var(--primary-glow)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {[
              "M18,22 C34,34 40,44 50,50",
              "M84,20 C66,32 58,42 50,50",
              "M14,74 C30,66 40,58 50,50",
              "M86,78 C70,68 60,58 50,50",
              "M50,8 C50,24 50,36 50,50",
            ].map((d, i) => (
              <g key={i}>
                <path d={d} stroke="url(#hv-path)" strokeWidth="0.5" />
                {!reduce && (
                  <>
                    <circle r="0.9" fill="var(--primary-glow)">
                      <animateMotion dur={`${4.5 + i * 0.9}s`} repeatCount="indefinite" path={d} />
                    </circle>
                    <circle r="0.55" fill="var(--chart-5)" opacity="0.8">
                      <animateMotion
                        dur={`${6.2 + i * 0.7}s`}
                        begin={`${i * 1.1}s`}
                        repeatCount="indefinite"
                        path={d}
                        keyPoints="1;0"
                        keyTimes="0;1"
                        calcMode="linear"
                      />
                    </circle>
                  </>
                )}
              </g>
            ))}
          </svg>

          {/* glowing liquidity core */}
          <motion.div
            className="absolute left-1/2 top-1/2 flex h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)", translateZ: 60 }}
            animate={reduce ? undefined : { scale: [1, 1.06, 1], opacity: [0.92, 1, 0.92] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-[3px] rounded-full bg-background/70 backdrop-blur-xl" />
            <div className="relative text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">TVL indexed</div>
              <div className="font-display text-xl font-semibold tabular-nums md:text-2xl">${tvl}B</div>
              <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-success">
                <span className="h-1.5 w-1.5 animate-ping-slow rounded-full bg-success" /> live
              </div>
            </div>
          </motion.div>

          {/* floating terminals */}
          <GlassCard className="left-[-2%] top-[6%] w-[42%]" depth={2} float={1.2}>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>ETH · USDC / WETH</span>
              <span className="text-success">+{apr}%</span>
            </div>
            <div className="mt-1 font-display text-lg font-semibold tabular-nums">APR</div>
            <Spark seed={2} tone="success" />
          </GlassCard>

          <GlassCard className="right-[-3%] top-[10%] w-[38%]" depth={3} float={0.8}>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Requests / min</div>
            <div className="font-display text-lg font-semibold tabular-nums">{reqs}</div>
            <Spark seed={5} />
          </GlassCard>

          <GlassCard className="bottom-[8%] left-[-4%] w-[40%]" depth={2.4} float={1.6}>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Fee flow · 24h</div>
            <div className="mt-1 flex items-end gap-1">
              {Array.from({ length: 12 }, (_, i) => (
                <motion.span
                  key={i}
                  className="w-full rounded-sm bg-gradient-primary"
                  style={{ height: Number((8 + seeded(i, 7) * 26).toFixed(2)) }}
                  animate={reduce ? undefined : { scaleY: [0.7, 1, 0.75, 1], opacity: [0.6, 1, 0.7, 1] }}
                  transition={{ duration: 4 + seeded(i, 8) * 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
                />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="bottom-[12%] right-[-2%] w-[36%]" depth={3.2} float={1}>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Open positions</div>
            <div className="font-display text-lg font-semibold tabular-nums">128,447</div>
            <div className="mt-1 flex gap-1">
              {["ETH", "AVAX", "USDC"].map((t) => (
                <span key={t} className="rounded-full border border-border/60 bg-surface-2/70 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* orbiting metric chips */}
          {!reduce &&
            [
              { label: "yield", r: 40, dur: 46 },
              { label: "fees", r: 46, dur: 62 },
              { label: "ticks", r: 34, dur: 38 },
            ].map((o, i) => (
              <motion.div
                key={o.label}
                className="absolute left-1/2 top-1/2"
                style={{ width: `${o.r * 2}%`, height: `${o.r * 2}%`, x: "-50%", y: "-50%" }}
                animate={{ rotate: i % 2 ? -360 : 360 }}
                transition={{ duration: o.dur, repeat: Infinity, ease: "linear" }}
              >
                <motion.span
                  className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full border border-border/60 bg-surface/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground backdrop-blur"
                  animate={{ rotate: i % 2 ? 360 : -360 }}
                  transition={{ duration: o.dur, repeat: Infinity, ease: "linear" }}
                >
                  {o.label}
                </motion.span>
              </motion.div>
            ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
