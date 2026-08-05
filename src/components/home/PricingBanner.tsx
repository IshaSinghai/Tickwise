"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpringValue, mapRange } from "@/components/home/hero/spring";

const tiers = [
  { name: "Free", units: "25,000", note: "no card" },
  { name: "Growth", units: "1M", note: "most picked" },
  { name: "Scale", units: "10M", note: "priority lanes" },
];

export function PricingBanner() {
  const reduce = useReducedMotion();
  const tiltRef = useRef<HTMLDivElement>(null);

  // Same physics the `useSpring` here used: stiffness 60, damping 20, and
  // motion's default mass of 1.
  const springs = useMemo(
    () => ({
      x: new SpringValue(0, { stiffness: 60, damping: 20, mass: 1 }),
      y: new SpringValue(0, { stiffness: 60, damping: 20, mass: 1 }),
    }),
    [],
  );

  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;

    let lastX = NaN;
    let lastY = NaN;
    const run = () => {
      const x = springs.x.get();
      const y = springs.y.get();
      if (x === lastX && y === lastY) return;
      lastX = x;
      lastY = y;
      const rotateY = mapRange(x, -0.5, 0.5, 5, -5);
      const rotateX = mapRange(y, -0.5, 0.5, -4, 4);
      el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    run();
    const offX = springs.x.subscribe(run);
    const offY = springs.y.subscribe(run);
    return () => {
      offX();
      offY();
      springs.x.destroy();
      springs.y.destroy();
    };
  }, [springs]);

  return (
    <div
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        springs.x.set((e.clientX - r.left) / r.width - 0.5);
        springs.y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        springs.x.set(0);
        springs.y.set(0);
      }}
      style={{ perspective: 1200 }}
      className="relative"
    >
      <div
        ref={tiltRef}
        style={{ transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/40 p-8 shadow-card backdrop-blur-xl md:p-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{ background: "var(--gradient-hero)" }}
        />
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-y-full left-0 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-primary/12 to-transparent"
            animate={{ x: ["-30%", "330%"] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
          />
        )}

        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Start on Free. Upgrade when it hurts.
            </h3>
            <p className="mt-3 max-w-md text-muted-foreground">
              25,000 units a month at no cost. Every plan uses the same endpoints — just more of
              them.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden bg-gradient-primary shadow-glow"
              >
                <Link href="/signup">
                  <span className="relative z-10 inline-flex items-center">
                    Create free account
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-border/70 bg-surface/40 backdrop-blur transition-colors hover:border-primary/50"
              >
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3" style={{ transformStyle: "preserve-3d" }}>
            {tiers.map((t, i) => (
              <motion.div
                key={t.name}
                style={{ translateZ: 30 + i * 18 }}
                animate={reduce ? undefined : { y: [0, -7, 0] }}
                transition={{
                  duration: 8 + i * 1.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.7,
                }}
                className="rounded-2xl border border-border/60 bg-background/50 p-4 backdrop-blur-xl transition-colors hover:border-primary/50"
              >
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {t.name}
                </div>
                <div className="mt-2 font-display text-2xl font-semibold tabular-nums">
                  {t.units}
                </div>
                <div className="text-[11px] text-muted-foreground">units / month</div>
                <div className="mt-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary-glow">
                  {t.note}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
