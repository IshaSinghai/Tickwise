import { motion, useTransform } from "motion/react";
import backdrop from "@/assets/hero-backdrop.png.asset.json";
import { usePointer, useSafeReducedMotion, EASE, rnd } from "./primitives";

/**
 * Full-bleed cinematic backdrop: a slow breathing photographic plate,
 * pointer parallax, a sweeping light pass and a settling atmospheric haze.
 */
export function HeroBackdrop() {
  const reduce = useSafeReducedMotion();
  const pointer = usePointer();

  const px = useTransform(pointer.x, [-1, 1], [26, -26]);
  const py = useTransform(pointer.y, [-1, 1], [16, -16]);

  const sparks = Array.from({ length: 26 }, (_, i) => ({
    left: rnd(i, 11) * 100,
    top: 20 + rnd(i, 23) * 70,
    size: 1 + rnd(i, 31) * 2.2,
    dur: 10 + rnd(i, 41) * 16,
    delay: rnd(i, 53) * 10,
    drift: -30 - rnd(i, 67) * 70,
  }));

  return (
    <div {...pointer.bind} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* photographic plate */}
      <motion.div
        className="absolute -inset-[6%]"
        style={{ x: reduce ? 0 : px, y: reduce ? 0 : py, willChange: "transform" }}
        initial={reduce ? false : { opacity: 0, scale: 1.12, filter: "blur(24px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 2.2, ease: EASE }}
      >
        <div
          className={`absolute inset-0 bg-cover bg-center ${reduce ? "" : "animate-hero-breathe"}`}
          style={{ backgroundImage: `url(${backdrop.url})` }}
        />
      </motion.div>

      {/* chromatic wash so the plate reads as our palette, not a stock photo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 60% at 50% 72%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)",
          mixBlendMode: "screen",
        }}
      />

      {/* sweeping light pass */}
      {!reduce && (
        <div
          className="absolute inset-y-0 -left-1/3 w-1/3 animate-hero-sweep"
          style={{
            background:
              "linear-gradient(100deg, transparent, color-mix(in oklab, var(--primary-glow) 26%, transparent), transparent)",
            filter: "blur(40px)",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* floating embers */}
      {sparks.map((s, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-primary-glow/70 ${reduce ? "opacity-20" : "tw-mote"}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            // @ts-expect-error custom property
            "--drift": `${s.drift}px`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* legibility + seam into the page */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--background)_2%,color-mix(in_oklab,var(--background)_72%,transparent)_38%,transparent_78%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(to_top,var(--background),transparent)]" />
      <div className="absolute inset-x-0 top-0 h-[22%] bg-[linear-gradient(to_bottom,var(--background),transparent)]" />
    </div>
  );
}
