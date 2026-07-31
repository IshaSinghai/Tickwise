import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "motion/react";
import { EASE, rnd, type Pointer } from "../primitives";

/** Live sparkline that shifts one step whenever the module receives a packet. */
function LiveSpark({
  seed,
  color,
  pulseKey,
  reduce,
}: {
  seed: number;
  color: string;
  pulseKey: number;
  reduce: boolean;
}) {
  const N = 22;
  const [pts, setPts] = useState<number[]>(() =>
    Array.from({ length: N }, (_, i) => 0.2 + rnd(i, seed) * 0.7),
  );
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPts((p) => {
      const last = p[p.length - 1];
      const next = Math.min(0.96, Math.max(0.08, last + (Math.random() - 0.45) * 0.34));
      return [...p.slice(1), next];
    });
  }, [pulseKey]);

  const step = 100 / (N - 1);
  const d = pts.map((p, i) => `${(i * step).toFixed(2)},${(30 - p * 24 - 2).toFixed(2)}`).join(" ");

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-2 h-8 w-full overflow-visible">
      <defs>
        <linearGradient id={`sp-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon
        points={`0,30 ${d} 100,30`}
        fill={`url(#sp-${seed})`}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
      />
      <motion.polyline
        points={d}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, delay: 0.6, ease: EASE }}
      />
      <motion.circle
        r="1.8"
        fill={color}
        cx={100}
        cy={30 - pts[pts.length - 1] * 24 - 2}
        animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.6 + (seed % 5) * 0.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

export type ModuleTone = "primary" | "success" | "accent";

const TONE: Record<ModuleTone, string> = {
  primary: "var(--primary-glow)",
  success: "var(--success)",
  accent: "var(--chart-5)",
};

/**
 * A glass data module wired to the liquidity core. It floats on its own
 * rhythm and flares whenever a data packet lands on it.
 */
export function MetricModule({
  pointer,
  label,
  sublabel,
  value,
  pulseKey,
  active,
  tone = "primary",
  seed,
  depth,
  floatDur,
  amplitude,
  tilt,
  entryFrom,
  entryDelay,
  className,
  reduce = false,
}: {
  pointer: Pointer;
  label: string;
  sublabel?: string;
  value: string;
  pulseKey: number;
  active: boolean;
  tone?: ModuleTone;
  seed: number;
  depth: number;
  floatDur: number;
  amplitude: number;
  tilt: number;
  entryFrom: { x: number; y: number; z: number };
  entryDelay: number;
  className?: string;
  reduce?: boolean;
}) {
  const px = useTransform(pointer.x, [-1, 1], [-20 * depth, 20 * depth]);
  const py = useTransform(pointer.y, [-1, 1], [-15 * depth, 15 * depth]);
  const ry = useTransform(pointer.x, [-1, 1], [9 * depth, -9 * depth]);
  const rx = useTransform(pointer.y, [-1, 1], [-7 * depth, 7 * depth]);
  const color = TONE[tone];

  return (
    <motion.div
      className={`absolute ${className ?? ""}`}
      style={{ x: px, y: py, willChange: "transform" }}
      initial={
        reduce
          ? false
          : { opacity: 0, x: entryFrom.x, y: entryFrom.y, scale: 0.7, z: entryFrom.z, filter: "blur(14px)" }
      }
      animate={{ opacity: 1, scale: 1, z: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.25, delay: 0.75 + entryDelay, ease: EASE }}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000, willChange: "transform" }}
      >
        <motion.div
          animate={
            reduce
              ? undefined
              : {
                  y: [0, -amplitude, 0, amplitude * 0.55, 0],
                  rotate: [0, tilt, 0, -tilt * 0.6, 0],
                }
          }
          transition={{ duration: floatDur, repeat: Infinity, ease: "easeInOut", delay: seed * 0.31 }}
          style={{ willChange: "transform" }}
          whileHover={reduce ? undefined : { scale: 1.045, y: -6 }}
          className="group relative -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-surface/45 p-3 backdrop-blur-xl transition-colors duration-500"
        >
          {/* border + glow flare on packet arrival */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            animate={{
              boxShadow: active
                ? `0 0 0 1px color-mix(in oklab, ${color} 55%, transparent), 0 0 34px -6px ${color}`
                : `0 0 0 1px color-mix(in oklab, var(--border) 70%, transparent), 0 0 0 0 transparent`,
            }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
          {/* moving highlight */}
          {!reduce && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -inset-y-6 w-1/2 opacity-40"
              style={{
                background: `linear-gradient(90deg, transparent, color-mix(in oklab, ${color} 22%, transparent), transparent)`,
              }}
              animate={{ x: ["-120%", "260%"] }}
              transition={{ duration: 9 + seed * 1.7, repeat: Infinity, ease: "easeInOut", delay: seed * 1.3 }}
            />
          )}

          <div className="relative flex items-center justify-between gap-3">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </span>
            <motion.span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color }}
              animate={reduce ? undefined : { opacity: active ? [1, 0.35, 1] : [0.35, 0.85, 0.35] }}
              transition={{ duration: active ? 0.6 : 3.4 + seed * 0.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <motion.div
            key={pulseKey}
            initial={reduce ? false : { opacity: 0.4, y: 6, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative mt-1.5 font-display text-[clamp(1.1rem,1.5vw,1.6rem)] font-semibold tabular-nums tracking-tight"
            style={{ color: tone === "success" ? "var(--success)" : undefined }}
          >
            {value}
          </motion.div>
          {sublabel && (
            <div className="relative mt-0.5 font-mono text-[10px] text-muted-foreground">{sublabel}</div>
          )}
          <div className="relative">
            <LiveSpark seed={seed} color={color} pulseKey={pulseKey} reduce={reduce} />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
