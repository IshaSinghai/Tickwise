import { useEffect, useState } from "react";
import { useMotionValue, useSpring, useReducedMotion, type MotionValue } from "motion/react";

/** Deterministic pseudo-random so SSR and client agree. */
export function rnd(i: number, salt = 1) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 1e4) / 1e4;
}

export const EASE = [0.16, 1, 0.3, 1] as const;

/** True only after hydration — avoids SSR/client class mismatches. */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

/** Reduced motion that is stable during SSR (always false until hydrated). */
export function useSafeReducedMotion() {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  return hydrated ? !!reduce : false;
}

export type Pointer = {
  /** -1 .. 1 */
  x: MotionValue<number>;
  y: MotionValue<number>;
  bind: {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
  };
};

/** Normalized pointer position within an element, spring-smoothed. */
export function usePointer(): Pointer {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.6 });
  return {
    x,
    y,
    bind: {
      onMouseMove: (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rawX.set(((e.clientX - r.left) / r.width) * 2 - 1);
        rawY.set(((e.clientY - r.top) / r.height) * 2 - 1);
      },
      onMouseLeave: () => {
        rawX.set(0);
        rawY.set(0);
      },
    },
  };
}
