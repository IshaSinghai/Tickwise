import { useReducedMotion } from "motion/react";
import { seeded } from "./motion-primitives";

const r = (n: number) => Math.round(n * 100) / 100;

/**
 * Living environment behind the whole page: volumetric light, depth fog,
 * a very slowly drifting grid, network lines and tiny stars.
 * Pure CSS transforms — no canvas, no per-frame JS.
 */
export function AmbientBackground() {
  const reduce = useReducedMotion();
  const stars = Array.from({ length: 46 }, (_, i) => ({
    left: r(seeded(i, 1) * 100),
    top: r(seeded(i, 2) * 100),
    size: r(1 + seeded(i, 3) * 1.6),
    delay: r(seeded(i, 4) * 12),
    dur: r(7 + seeded(i, 5) * 11),
  }));

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base wash */}
      <div className="absolute inset-0 bg-background" />

      {/* volumetric lights */}
      <div className={`ambient-orb absolute -top-[28vh] left-1/2 h-[85vh] w-[95vw] -translate-x-1/2 rounded-full ${reduce ? "" : "animate-drift-a"}`} />
      <div className={`ambient-orb-2 absolute top-[40vh] -left-[20vw] h-[60vh] w-[60vw] rounded-full ${reduce ? "" : "animate-drift-b"}`} />
      <div className={`ambient-orb-3 absolute top-[95vh] -right-[15vw] h-[55vh] w-[55vw] rounded-full ${reduce ? "" : "animate-drift-c"}`} />

      {/* slow grid with depth mask */}
      <div className={`absolute inset-0 grid-lines opacity-[0.55] mask-fade ${reduce ? "" : "animate-grid-pan"}`} />

      {/* network lines */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.35]" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ambient-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary-glow)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 7 }, (_, i) => {
          const y = 8 + i * 13.5;
          return (
            <line
              key={i}
              x1="-5%"
              y1={`${y}%`}
              x2="105%"
              y2={`${r(y + (seeded(i, 9) * 18 - 9))}%`}
              stroke="url(#ambient-line)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* ambient stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-foreground/50 ${reduce ? "opacity-20" : "animate-twinkle"}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}

      {/* depth fog */}
      <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-fog" />
    </div>
  );
}
