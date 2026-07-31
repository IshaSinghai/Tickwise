import { motion, useTransform } from "motion/react";
import { EASE, type Pointer } from "./primitives";

/** A chain node (Ethereum / Avalanche) sitting in the holographic field. */
export function TokenNode({
  pointer,
  label,
  symbol,
  status = "live",
  className = "",
  depth = 0.6,
  delay = 0,
  duration = 9,
  reduce = false,
}: {
  pointer: Pointer;
  label: string;
  symbol: string;
  status?: "live" | "indexing";
  className?: string;
  depth?: number;
  delay?: number;
  duration?: number;
  reduce?: boolean;
}) {
  const px = useTransform(pointer.x, [-1, 1], [-22 * depth, 22 * depth]);
  const py = useTransform(pointer.y, [-1, 1], [-18 * depth, 18 * depth]);

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ x: px, y: py, willChange: "transform" }}
      initial={reduce ? false : { opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.7 + delay, ease: EASE }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -8, 0, 6, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
        className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/50 py-1.5 pl-1.5 pr-3 shadow-card backdrop-blur-xl"
        style={{ willChange: "transform" }}
      >
        <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full border border-primary/40 bg-background/70 font-mono text-[10px] font-semibold text-primary-glow">
          {symbol}
          {!reduce && (
            <motion.span
              className="absolute inset-0 rounded-full border border-primary/50"
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay }}
            />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-medium leading-tight">{label}</span>
          <span
            className={`block font-mono text-[9px] uppercase tracking-[0.16em] ${
              status === "live" ? "text-success" : "text-warning"
            }`}
          >
            {status}
          </span>
        </span>
      </motion.div>
    </motion.div>
  );
}
