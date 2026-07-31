import { motion } from "motion/react";
import { EASE } from "./primitives";

/** Glowing liquidity core: layered pulses, refraction sheen, inner rotation. */
export function HolographicCore({ reduce = false }: { reduce?: boolean }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={reduce ? false : { opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.3, delay: 0.25, ease: EASE }}
    >
      {/* outer bloom */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 45%, transparent), transparent 70%)",
          filter: "blur(24px)",
          willChange: "transform, opacity",
        }}
        animate={reduce ? undefined : { scale: [1, 1.16, 1], opacity: [0.6, 0.95, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* pulse ripple */}
      {!reduce &&
        [0, 1.6].map((d) => (
          <motion.span
            key={d}
            className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/40"
            style={{ willChange: "transform, opacity" }}
            animate={{ scale: [0.7, 2.4], opacity: [0.55, 0] }}
            transition={{ duration: 4, delay: d, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
      {/* core body */}
      <motion.div
        className="relative grid h-24 w-24 place-items-center rounded-full border border-primary/50"
        style={{
          background:
            "conic-gradient(from 0deg, color-mix(in oklab, var(--primary) 70%, transparent), color-mix(in oklab, var(--chart-5) 55%, transparent), color-mix(in oklab, var(--primary-glow) 75%, transparent), color-mix(in oklab, var(--primary) 70%, transparent))",
          boxShadow: "var(--shadow-glow)",
          willChange: "transform",
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-1.5 rounded-full bg-background/70 backdrop-blur-xl" />
        <motion.div
          className="absolute inset-3 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--primary-glow) 60%, transparent), transparent 75%)",
          }}
          animate={reduce ? undefined : { opacity: [0.5, 1, 0.5], scale: [0.92, 1.05, 0.92] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/80">liquidity</div>
        <div className="font-display text-xs font-semibold tracking-tight text-foreground">core</div>
      </div>
    </motion.div>
  );
}
