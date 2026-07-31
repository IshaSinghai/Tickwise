import { motion, useTransform } from "motion/react";
import { rnd, usePointer, useSafeReducedMotion, type Pointer } from "./primitives";

/** A single flowing aurora ribbon (blurred, slowly morphing). */
function Ribbon({
  d,
  color,
  opacity,
  duration,
  delay,
  reduce,
  alt,
}: {
  d: string;
  alt: string;
  color: string;
  opacity: number;
  duration: number;
  delay: number;
  reduce: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={30}
      strokeLinecap="round"
      opacity={opacity}
    >
      {!reduce && (
        <animate
          attributeName="d"
          values={`${d};${alt};${d}`}
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.5;1"
          keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
        />
      )}
    </path>
  );
}


/** Wireframe monolith — isometric depth object drifting in the field. */
function Monolith({
  pointer,
  className,
  depth,
  w,
  h,
  delay,
  duration,
  reduce,
}: {
  pointer: Pointer;
  className: string;
  depth: number;
  w: number;
  h: number;
  delay: number;
  duration: number;
  reduce: boolean;
}) {
  const px = useTransform(pointer.x, [-1, 1], [depth * 16, -depth * 16]);
  const py = useTransform(pointer.y, [-1, 1], [depth * 12, -depth * 12]);

  return (
    <motion.div
      aria-hidden
      className={`absolute ${className}`}
      style={{ x: px, y: py, width: w, height: h, willChange: "transform" }}
    >
      <motion.div
        className="h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={reduce ? undefined : { y: [0, -16, 0], rotate: [0, 1.4, 0] }}
        transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="h-full w-full rounded-[10px] border border-primary/25 bg-gradient-to-b from-primary/[0.07] to-transparent backdrop-blur-[1px]"
          style={{ transform: "rotateX(56deg) rotateZ(45deg)" }}
        >
          <div className="absolute inset-x-3 top-3 h-px bg-primary-glow/40" />
          <div className="absolute inset-y-3 left-3 w-px bg-primary-glow/25" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Full-bleed cinematic hero field: flowing aurora ribbons, wireframe
 * monoliths and a drifting particle haze, all pointer-parallaxed.
 */
export function AuroraField() {
  const reduce = useSafeReducedMotion();
  const pointer = usePointer();

  const fieldX = useTransform(pointer.x, [-1, 1], [24, -24]);
  const fieldY = useTransform(pointer.y, [-1, 1], [16, -16]);

  const motes = Array.from({ length: 26 }, (_, i) => ({
    left: rnd(i, 31) * 100,
    top: rnd(i, 32) * 100,
    size: 1 + rnd(i, 33) * 2.2,
    dur: 9 + rnd(i, 34) * 12,
    delay: rnd(i, 35) * 10,
  }));

  return (
    <div {...pointer.bind} aria-hidden className="pointer-events-auto absolute inset-0 overflow-hidden">
      <motion.div className="absolute -inset-24" style={{ x: fieldX, y: fieldY }}>
        <svg
          viewBox="0 0 1200 700"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          style={{ filter: "blur(38px)" }}
        >
          <defs>
            <linearGradient id="aurora-1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
              <stop offset="45%" stopColor="var(--primary-glow)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="aurora-2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--chart-5)" stopOpacity="0" />
              <stop offset="55%" stopColor="var(--chart-5)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="aurora-3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--success)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--success)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--primary-glow)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <Ribbon
            d="M -80 250 C 220 130, 520 380, 780 210 S 1180 180, 1320 250"
            alt="M -80 300 C 240 200, 500 240, 800 300 S 1160 240, 1320 190"
            color="url(#aurora-1)"
            opacity={0.42}
            duration={22}
            delay={0}
            reduce={reduce}
          />
          <Ribbon
            d="M -80 420 C 260 330, 560 540, 860 400 S 1180 380, 1320 430"
            alt="M -80 380 C 300 470, 540 350, 880 470 S 1200 430, 1320 370"
            color="url(#aurora-2)"
            opacity={0.3}
            duration={28}
            delay={1.2}
            reduce={reduce}
          />
          <Ribbon
            d="M -80 560 C 300 470, 620 660, 900 540 S 1220 520, 1320 570"
            alt="M -80 520 C 280 610, 600 480, 940 600 S 1220 560, 1320 520"
            color="url(#aurora-3)"
            opacity={0.22}
            duration={34}
            delay={2.4}
            reduce={reduce}
          />
        </svg>
      </motion.div>

      {/* wireframe monoliths */}
      <div className="absolute inset-0 [perspective:1200px]">
        <Monolith pointer={pointer} className="left-[6%] top-[18%] hidden lg:block" depth={0.7} w={130} h={130} delay={0} duration={13} reduce={reduce} />
        <Monolith pointer={pointer} className="left-[27%] bottom-[6%] hidden xl:block" depth={1.1} w={92} h={92} delay={1.6} duration={11} reduce={reduce} />
        <Monolith pointer={pointer} className="right-[8%] top-[10%] hidden lg:block" depth={0.9} w={110} h={110} delay={2.4} duration={15} reduce={reduce} />
        <Monolith pointer={pointer} className="right-[30%] bottom-[10%] hidden xl:block" depth={1.35} w={74} h={74} delay={3.1} duration={9.5} reduce={reduce} />
      </div>

      {/* drifting motes */}
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-primary-glow/70"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            boxShadow: "0 0 8px 1px color-mix(in oklab, var(--primary-glow) 50%, transparent)",
            willChange: "transform, opacity",
          }}
          animate={reduce ? { opacity: 0.25 } : { y: [0, -34, 0], opacity: [0, 0.85, 0] }}
          transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="pointer-events-none absolute inset-0 bg-vignette" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
