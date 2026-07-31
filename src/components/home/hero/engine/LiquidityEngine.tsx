import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "motion/react";
import { usePointer, useSafeReducedMotion, EASE } from "../primitives";
import { EngineCore } from "./EngineCore";
import { MetricModule, type ModuleTone } from "./MetricModule";

type Def = {
  id: string;
  label: string;
  sublabel?: string;
  tone: ModuleTone;
  /** anchor point in the 0-100 scene space */
  p: { x: number; y: number };
  bend: number;
  seed: number;
  depth: number;
  floatDur: number;
  amplitude: number;
  tilt: number;
  entryFrom: { x: number; y: number; z: number };
  entryDelay: number;
  className: string;
  start: number;
  step: () => number;
  format: (v: number) => string;
};

const num = (v: number, d = 0) =>
  v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const DEFS: Def[] = [
  {
    id: "apr",
    label: "APR · ETH/USDC",
    sublabel: "0.05% tier",
    tone: "primary",
    p: { x: 21, y: 17 },
    bend: 9,
    seed: 1,
    depth: 1.15,
    floatDur: 7.4,
    amplitude: 11,
    tilt: 2.6,
    entryFrom: { x: -70, y: -40, z: -260 },
    entryDelay: 0,
    className: "w-[42%] max-w-[164px] sm:w-[23%] sm:min-w-[132px] sm:max-w-[196px]",
    start: 24.68,
    step: () => (Math.random() - 0.45) * 0.42,
    format: (v) => `${num(v, 2)}%`,
  },
  {
    id: "tvl",
    label: "TVL indexed",
    sublabel: "1,284 v4 pools",
    tone: "primary",
    p: { x: 79, y: 15 },
    bend: -10,
    seed: 2,
    depth: 0.85,
    floatDur: 9.1,
    amplitude: 8,
    tilt: -2.2,
    entryFrom: { x: 80, y: -46, z: -320 },
    entryDelay: 0.12,
    className: "w-[42%] max-w-[164px] sm:w-[23%] sm:min-w-[132px] sm:max-w-[196px]",
    start: 4.94,
    step: () => (Math.random() - 0.42) * 0.05,
    format: (v) => `$${num(v, 2)}B`,
  },
  {
    id: "pools",
    label: "Pools indexed",
    sublabel: "ethereum · avalanche",
    tone: "accent",
    p: { x: 17, y: 52 },
    bend: 8,
    seed: 3,
    depth: 1.3,
    floatDur: 8.3,
    amplitude: 13,
    tilt: 2.1,
    entryFrom: { x: -90, y: 20, z: -200 },
    entryDelay: 0.26,
    className: "w-[42%] max-w-[164px] sm:w-[23%] sm:min-w-[132px] sm:max-w-[196px]",
    start: 1284,
    step: () => Math.round(Math.random() * 3),
    format: (v) => num(Math.round(v)),
  },
  {
    id: "positions",
    label: "Live positions",
    sublabel: "streaming",
    tone: "success",
    p: { x: 82, y: 50 },
    bend: -7,
    seed: 4,
    depth: 1.25,
    floatDur: 6.8,
    amplitude: 10,
    tilt: -2.8,
    entryFrom: { x: 96, y: 14, z: -240 },
    entryDelay: 0.38,
    className: "w-[42%] max-w-[164px] sm:w-[23%] sm:min-w-[132px] sm:max-w-[196px]",
    start: 38687,
    step: () => Math.round((Math.random() - 0.4) * 42),
    format: (v) => num(Math.round(v)),
  },
  {
    id: "requests",
    label: "API requests / min",
    sublabel: "p50 142 ms",
    tone: "primary",
    p: { x: 27, y: 86 },
    bend: -12,
    seed: 5,
    depth: 0.95,
    floatDur: 10.4,
    amplitude: 9,
    tilt: 1.7,
    entryFrom: { x: -50, y: 90, z: -280 },
    entryDelay: 0.5,
    className: "w-[42%] max-w-[164px] sm:w-[23%] sm:min-w-[132px] sm:max-w-[196px]",
    start: 42318,
    step: () => Math.round((Math.random() - 0.35) * 260),
    format: (v) => num(Math.round(v)),
  },
  {
    id: "yield",
    label: "Yield · fee APR",
    sublabel: "24h rolling",
    tone: "success",
    p: { x: 72, y: 87 },
    bend: 13,
    seed: 6,
    depth: 1.05,
    floatDur: 11.2,
    amplitude: 7,
    tilt: -1.9,
    entryFrom: { x: 62, y: 96, z: -220 },
    entryDelay: 0.62,
    className: "w-[42%] max-w-[164px] sm:w-[23%] sm:min-w-[132px] sm:max-w-[196px]",
    start: 18.24,
    step: () => (Math.random() - 0.44) * 0.36,
    format: (v) => `${num(v, 2)}%`,
  },
];

const CORE = { x: 50, y: 50 };
const OUT_MS = 1150;
const BACK_MS = 950;

function pathFor(d: Def) {
  const mx = (CORE.x + d.p.x) / 2 + d.bend * 0.4;
  const my = (CORE.y + d.p.y) / 2 - d.bend;
  return `M ${CORE.x} ${CORE.y} Q ${mx} ${my} ${d.p.x} ${d.p.y}`;
}

type Flight = { key: number; idx: number; dir: "out" | "back" };

/**
 * Living DeFi Intelligence Engine — a liquidity core wired to six data
 * modules by animated connections that carry data packets both ways.
 */
export function LiquidityEngine() {
  const reduce = useSafeReducedMotion();
  const pointer = usePointer();

  const sceneX = useTransform(pointer.x, [-1, 1], [14, -14]);
  const sceneY = useTransform(pointer.y, [-1, 1], [10, -10]);
  const meshX = useTransform(pointer.x, [-1, 1], [-6, 6]);
  const meshY = useTransform(pointer.y, [-1, 1], [-4, 4]);
  const glowX = useTransform(pointer.x, [-1, 1], ["36%", "64%"]);
  const glowY = useTransform(pointer.y, [-1, 1], ["36%", "64%"]);

  const [values, setValues] = useState(() => DEFS.map((d) => d.start));
  const [pulses, setPulses] = useState(() => DEFS.map(() => 0));
  const [flights, setFlights] = useState<Flight[]>([]);
  const [corePulse, setCorePulse] = useState(0);
  const busy = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (reduce) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let key = 0;

    const emit = () => {
      if (!alive) return;
      const free = DEFS.map((_, i) => i).filter((i) => !busy.current.has(i));
      if (free.length && busy.current.size < 2) {
        const idx = free[Math.floor(Math.random() * free.length)];
        const k = ++key;
        busy.current.add(idx);
        setCorePulse((c) => c + 1);
        setFlights((f) => [...f, { key: k, idx, dir: "out" }]);

        timers.push(
          setTimeout(() => {
            if (!alive) return;
            setFlights((f) => f.filter((x) => x.key !== k).concat({ key: k + 1e6, idx, dir: "back" }));
            setValues((v) => v.map((val, i) => (i === idx ? val + DEFS[idx].step() : val)));
            setPulses((p) => p.map((val, i) => (i === idx ? val + 1 : val)));
          }, OUT_MS),
        );
        timers.push(
          setTimeout(() => {
            if (!alive) return;
            setFlights((f) => f.filter((x) => x.key !== k + 1e6));
            busy.current.delete(idx);
          }, OUT_MS + BACK_MS),
        );
      }
      timers.push(setTimeout(emit, 1200 + Math.random() * 1600));
    };

    timers.push(setTimeout(emit, 2200));
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  const active = new Set(flights.filter((f) => f.dir === "back").map((f) => f.idx));

  return (
    <div
      {...pointer.bind}
      className="relative mx-auto aspect-[4/5.6] w-full max-w-[980px] select-none sm:aspect-[4/3.2] lg:aspect-[4/3]"
      style={{ perspective: 1500 }}
    >
      {/* cursor-tracked lighting */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-20 rounded-[42%]"
        style={{
          background:
            "radial-gradient(36% 36% at var(--gx) var(--gy), color-mix(in oklab, var(--primary) 26%, transparent), transparent 70%)",
          // @ts-expect-error motion supports CSS custom properties
          "--gx": glowX,
          "--gy": glowY,
          filter: "blur(38px)",
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{ x: sceneX, y: sceneY, transformStyle: "preserve-3d", willChange: "transform" }}
      >
        <EngineCore reduce={reduce} pulse={corePulse} />

        {/* connection mesh */}
        <motion.svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ x: meshX, y: meshY, willChange: "transform" }}
        >
          <defs>
            <linearGradient id="lq-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary-glow)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {DEFS.map((d, i) => {
            const path = pathFor(d);
            const lit = active.has(i) || flights.some((f) => f.idx === i);
            return (
              <g key={d.id}>
                <motion.path
                  d={path}
                  fill="none"
                  stroke="url(#lq-line)"
                  strokeWidth="0.4"
                  vectorEffect="non-scaling-stroke"
                  initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: lit ? 1 : 0.7 }}
                  transition={{
                    pathLength: { duration: 1.1, delay: 0.55 + i * 0.09, ease: EASE },
                    opacity: { duration: 0.6 },
                  }}
                />
                {!reduce && (
                  <motion.path
                    d={path}
                    fill="none"
                    stroke="var(--primary-glow)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                    animate={{ opacity: lit ? 0.35 : 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ filter: "blur(2px)" }}
                  />
                )}
              </g>
            );
          })}

          {/* travelling data packets */}
          {flights.map((f) => {
            const path = pathFor(DEFS[f.idx]);
            const back = f.dir === "back";
            return (
              <g key={f.key}>
                <circle r={back ? 0.7 : 1} fill={back ? "var(--chart-5)" : "var(--primary-glow)"}>
                  <animateMotion
                    dur={`${(back ? BACK_MS : OUT_MS) / 1000}s`}
                    fill="freeze"
                    path={path}
                    keyPoints={back ? "1;0" : "0;1"}
                    keyTimes="0;1"
                    calcMode="linear"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0.2"
                    dur={`${(back ? BACK_MS : OUT_MS) / 1000}s`}
                    fill="freeze"
                  />
                </circle>
              </g>
            );
          })}
        </motion.svg>

        {/* data modules */}
        {DEFS.map((d, i) => (
          <MetricModule
            key={d.id}
            pointer={pointer}
            label={d.label}
            sublabel={d.sublabel}
            value={d.format(values[i])}
            pulseKey={pulses[i]}
            active={active.has(i)}
            tone={d.tone}
            seed={d.seed}
            depth={d.depth}
            floatDur={d.floatDur}
            amplitude={d.amplitude}
            tilt={d.tilt}
            entryFrom={d.entryFrom}
            entryDelay={d.entryDelay}
            className={d.className}
            style={{ left: `${d.p.x}%`, top: `${d.p.y}%` }}
            reduce={reduce}
          />
        ))}
      </motion.div>
    </div>
  );
}
