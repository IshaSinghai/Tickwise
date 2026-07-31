import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE, useSafeReducedMotion } from "./primitives";

/**
 * Cinematic hero opener: letterbox bars close in, a horizon light ignites and
 * sweeps across, the frame flashes, bars retract and the scene is revealed.
 * Plays once per browser session, never for reduced-motion users.
 */
export function CinematicIntro() {
  const reduce = useSafeReducedMotion();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem("tw-intro-played")) return;
    sessionStorage.setItem("tw-intro-played", "1");
    setPlaying(true);
    const t = window.setTimeout(() => setPlaying(false), 2600);
    return () => window.clearTimeout(t);
  }, []);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {playing ? (
        <motion.div
          key="intro"
          className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {/* black curtain that dissolves as the scene ignites */}
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 1, 0.72, 0] }}
            transition={{ duration: 2.4, times: [0, 0.28, 0.6, 1], ease: EASE }}
          />

          {/* horizon ignition */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[2px] w-[120vw] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary to-transparent [will-change:transform,opacity]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1, 1], opacity: [0, 1, 0.9, 0] }}
            transition={{ duration: 2.2, times: [0, 0.35, 0.6, 1], ease: EASE }}
            style={{ boxShadow: "0 0 60px 8px color-mix(in oklab, var(--primary) 55%, transparent)" }}
          />

          {/* volumetric bloom expanding from the horizon */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[70vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl [will-change:transform,opacity]"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 45%, transparent), transparent 70%)",
            }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.2, 1.15, 1.6], opacity: [0, 0.8, 0] }}
            transition={{ duration: 2.3, delay: 0.25, ease: EASE }}
          />

          {/* light sweep across the frame */}
          <motion.div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-foreground/12 to-transparent blur-2xl [will-change:transform]"
            initial={{ x: "-60vw" }}
            animate={{ x: "160vw" }}
            transition={{ duration: 1.6, delay: 0.5, ease: EASE }}
          />

          {/* letterbox bars retract */}
          <motion.div
            className="absolute inset-x-0 top-0 bg-background"
            initial={{ height: "50%" }}
            animate={{ height: ["50%", "12%", "0%"] }}
            transition={{ duration: 2.4, times: [0, 0.45, 1], ease: EASE }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-background"
            initial={{ height: "50%" }}
            animate={{ height: ["50%", "12%", "0%"] }}
            transition={{ duration: 2.4, times: [0, 0.45, 1], ease: EASE }}
          />

          {/* final exposure flash */}
          <motion.div
            className="absolute inset-0 bg-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.14, 0] }}
            transition={{ duration: 2.4, times: [0, 0.55, 0.62, 0.85], ease: "linear" }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
