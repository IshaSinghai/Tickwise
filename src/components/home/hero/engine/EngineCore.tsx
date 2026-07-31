import { motion } from "motion/react";
import { EASE } from "../primitives";

/** Concentric orbit ring that draws itself in, then rotates forever. */
function Ring({
  size,
  duration,
  reverse,
  dashed,
  opacity,
  delay,
  reduce,
  node,
}: {
  size: number;
  duration: number;
  reverse?: boolean;
  dashed?: boolean;
  opacity: number;
  delay: number;
  reduce: boolean;
  node?: boolean;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full border border-primary/40"
      style={{
        width: `${size}%`,
        height: `${size}%`,
        marginLeft: `-${size / 2}%`,
        marginTop: `-${size / 2}%`,
        opacity,
        borderStyle: dashed ? "dashed" : "solid",
        willChange: "transform",
      }}
      initial={reduce ? false : { scale: 0.55, opacity: 0, rotate: reverse ? 40 : -40 }}
      animate={
        reduce
          ? { opacity }
          : { scale: 1, opacity, rotate: reverse ? -360 : 360 }
      }
      transition={{
        scale: { duration: 1.4, delay, ease: EASE },
        opacity: { duration: 1.4, delay, ease: EASE },
        rotate: { duration, repeat: Infinity, ease: "linear" },
      }}
    >
      {node && (
        <span
          className="absolute h-1.5 w-1.5 rounded-full bg-primary-glow shadow-glow"
          style={{ left: "50%", top: -3, transform: "translateX(-50%)" }}
        />
      )}
    </motion.div>
  );
}

/**
 * The Liquidity Core — layered orbit rings, rotating holographic geometry,
 * breathing glow, scan sweep and outward energy waves.
 */
export function EngineCore({ reduce = false, pulse = 0 }: { reduce?: boolean; pulse?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* orbit rings */}
      <Ring size={74} duration={150} dashed opacity={0.18} delay={0.55} reduce={reduce} />
      <Ring size={60} duration={110} reverse opacity={0.26} delay={0.45} reduce={reduce} node />
      <Ring size={46} duration={78} opacity={0.34} delay={0.35} reduce={reduce} node />
      <Ring size={34} duration={52} reverse dashed opacity={0.45} delay={0.25} reduce={reduce} />

      {/* energy waves */}
      {!reduce &&
        [0, 2.6, 5.2].map((d) => (
          <motion.span
            key={d}
            className="absolute left-1/2 top-1/2 rounded-full border border-primary/35"
            style={{ width: "22%", height: "22%", marginLeft: "-11%", marginTop: "-11%" }}
            animate={{ scale: [0.7, 3.4], opacity: [0.5, 0] }}
            transition={{ duration: 7.8, delay: d, repeat: Infinity, ease: "easeOut" }}
          />
        ))}

      {/* breathing bloom */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 48%, transparent), transparent 72%)",
          filter: "blur(46px)",
          willChange: "transform, opacity",
        }}
        animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.55, 0.95, 0.55] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* core body */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[27%] w-[27%] -translate-x-1/2 -translate-y-1/2"
        initial={reduce ? false : { opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.3, delay: 0.2, ease: EASE }}
      >
        {/* rotating holographic shell */}
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/45"
          style={{
            background:
              "conic-gradient(from 0deg, color-mix(in oklab, var(--primary) 65%, transparent), color-mix(in oklab, var(--chart-5) 45%, transparent), color-mix(in oklab, var(--primary-glow) 80%, transparent), color-mix(in oklab, var(--primary) 65%, transparent))",
            boxShadow: "var(--shadow-glow)",
            willChange: "transform",
          }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-[8px] rounded-full bg-background shadow-[inset_0_0_40px_-10px_color-mix(in_oklab,var(--primary)_60%,transparent)] backdrop-blur-xl" />

        {/* animated radial gradient */}
        <motion.div
          className="absolute inset-[10%] rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--primary-glow) 55%, transparent), transparent 78%)",
          }}
          animate={reduce ? undefined : { opacity: [0.45, 1, 0.45], scale: [0.9, 1.06, 0.9] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* inner rotating geometry */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-[19%]"
          animate={reduce ? undefined : { rotate: -360 }}
          transition={{ duration: 44, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "transform" }}
        >
          <polygon
            points="50,6 88,28 88,72 50,94 12,72 12,28"
            fill="none"
            stroke="color-mix(in oklab, var(--primary-glow) 60%, transparent)"
            strokeWidth="1"
          />
          <polygon
            points="50,20 76,35 76,65 50,80 24,65 24,35"
            fill="none"
            stroke="color-mix(in oklab, var(--chart-5) 45%, transparent)"
            strokeWidth="0.8"
            strokeDasharray="4 6"
          />
          <circle cx="50" cy="50" r="30" fill="none" stroke="color-mix(in oklab, var(--primary) 40%, transparent)" strokeWidth="0.6" />
        </motion.svg>

        {/* scan sweep */}
        {!reduce && (
          <div className="absolute inset-[6px] overflow-hidden rounded-full">
            <motion.div
              className="absolute inset-x-0 h-[26%]"
              style={{
                background:
                  "linear-gradient(180deg, transparent, color-mix(in oklab, var(--primary-glow) 30%, transparent), transparent)",
              }}
              animate={{ y: ["-30%", "330%"] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.4 }}
            />
          </div>
        )}

        {/* emit flash when a packet leaves */}
        <motion.div
          key={pulse}
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 60px 4px color-mix(in oklab, var(--primary) 45%, transparent)" }}
          initial={reduce ? false : { opacity: 0.85, scale: 0.96 }}
          animate={{ opacity: 0, scale: 1.15 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
            liquidity
          </span>
          <span className="font-display text-sm font-semibold tracking-tight md:text-base">core</span>
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-success">
            indexing
          </span>
        </div>
      </motion.div>
    </div>
  );
}
