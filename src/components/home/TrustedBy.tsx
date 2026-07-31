import { motion, useReducedMotion } from "motion/react";

const logos = ["Meridian", "Bloomrail", "Tesseract", "Northwind", "Halcyon", "Vantage"];

export function TrustedBy() {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        Powering data teams at
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {logos.map((l, i) => (
          <motion.span
            key={l}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.07 }}
            className="cursor-default font-display text-lg font-semibold tracking-tight text-muted-foreground/50 grayscale transition-all duration-500 hover:text-foreground hover:grayscale-0"
          >
            {l}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
