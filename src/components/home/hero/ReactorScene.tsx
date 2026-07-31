"use client";

import { motion, useTransform } from "motion/react";
import { rnd, usePointer, useSafeReducedMotion, EASE, type Pointer } from "./primitives";

/**
 * Tickwise Reactor — a cinematic holographic environment, not a dashboard.
 *
 * Layer order (back → front):
 *   atmosphere → perspective floor → volumetric lights → energy field →
 *   orbital lattice → data streams → reactor core → foreground bloom → cursor light
 *
 * Everything is generated in code (SVG + CSS), every system runs on its own clock.
 */

const r2 = (n: number) => Math.round(n * 100) / 100;

const V = 1000; // svg viewBox square

/* ── narrative topology: liquidity → index → positions → yield → api → devs ── */
const NODES = {
  liqA: { x: 70, y: 210, label: "LIQUIDITY" },
  liqB: { x: 40, y: 470, label: "SWAPS" },
  liqC: { x: 110, y: 720, label: "POOLS" },
  index: { x: 300, y: 470, label: "INDEXER" },
  core: { x: 520, y: 470, label: "" },
  yieldN: { x: 745, y: 250, label: "YIELD" },
  api: { x: 790, y: 500, label: "API" },
  pos: { x: 720, y: 740, label: "POSITIONS" },
  devA: { x: 950, y: 330, label: "" },
  devB: { x: 965, y: 610, label: "" },
} as const;

type P = { x: number; y: number };

function curve(a: P, b: P, bend: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * bend;
  const ny = (dx / len) * bend;
  return `M ${a.x} ${a.y} Q ${(mx + nx).toFixed(1)} ${(my + ny).toFixed(1)} ${b.x} ${b.y}`;
}

const STREAMS: { d: string; dur: number; delay: number; w: number; hue: string; packets: number }[] = [
  { a: NODES.liqA, b: NODES.index, bend: 60 },
  { a: NODES.liqB, b: NODES.index, bend: -26 },
  { a: NODES.liqC, b: NODES.index, bend: -70 },
  { a: NODES.index, b: NODES.core, bend: 40 },
  { a: NODES.index, b: NODES.core, bend: -46 },
  { a: NODES.core, b: NODES.yieldN, bend: -64 },
  { a: NODES.core, b: NODES.api, bend: 22 },
  { a: NODES.core, b: NODES.pos, bend: 70 },
  { a: NODES.yieldN, b: NODES.api, bend: 34 },
  { a: NODES.pos, b: NODES.api, bend: -34 },
  { a: NODES.api, b: NODES.devA, bend: -40 },
  { a: NODES.api, b: NODES.devB, bend: 40 },
].map((s, i) => ({
  d: curve(s.a, s.b, s.bend),
  dur: 3.6 + rnd(i, 5) * 5.2,
  delay: rnd(i, 9) * 4.5,
  w: 1 + rnd(i, 13) * 1.4,
  hue: rnd(i, 17) > 0.72 ? "var(--success)" : "var(--primary-glow)",
  packets: 1 + Math.round(rnd(i, 21) * 2),
}));

/* ── one flowing energy stream with travelling light packets ── */
function Stream({ s, i, reduce }: { s: (typeof STREAMS)[number]; i: number; reduce: boolean }) {
  return (
    <g>
      <motion.path
        d={s.d}
        fill="none"
        stroke="url(#tw-stream)"
        strokeWidth={s.w}
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.75 }}
        transition={{ duration: 1.6, delay: 0.9 + i * 0.07, ease: EASE }}
      />
      {!reduce && (
        <path
          d={s.d}
          fill="none"
          stroke={s.hue}
          strokeWidth={s.w * 0.8}
          strokeLinecap="round"
          className="tw-flow"
          style={{
            strokeDasharray: "6 46",
            animationDuration: `${s.dur * 1.6}s`,
            animationDelay: `${s.delay}s`,
            opacity: 0.7,
          }}
        />
      )}
      {!reduce &&
        Array.from({ length: s.packets }, (_, k) => (
          <circle key={k} r={1.6 + rnd(i * 7 + k, 3) * 2.2} fill={s.hue} filter="url(#tw-soft)">
            <animateMotion
              dur={`${s.dur + k * 1.7}s`}
              begin={`${s.delay + k * 0.9}s`}
              repeatCount="indefinite"
              path={s.d}
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="spline"
              keySplines="0.45 0 0.55 1"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.12;0.82;1"
              dur={`${s.dur + k * 1.7}s`}
              begin={`${s.delay + k * 0.9}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
    </g>
  );
}

/* ── a network junction: no card, just a breathing light well ── */
function Junction({ p, label, i, reduce }: { p: P & { label?: string }; label?: string; i: number; reduce: boolean }) {
  return (
    <motion.g
      initial={reduce ? false : { opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ transformOrigin: `${p.x}px ${p.y}px` }}
      transition={{ duration: 1.1, delay: 1.1 + i * 0.12, ease: EASE }}
    >
      <circle cx={p.x} cy={p.y} r={26} fill="url(#tw-node)" opacity={0.55} />
      <circle cx={p.x} cy={p.y} r={7} fill="none" stroke="var(--primary-glow)" strokeWidth={1.2} opacity={0.9} />
      <circle cx={p.x} cy={p.y} r={2.4} fill="var(--primary-glow)" filter="url(#tw-soft)" />
      {!reduce && (
        <circle cx={p.x} cy={p.y} r={7} fill="none" stroke="var(--primary-glow)" strokeWidth={0.8}>
          <animate attributeName="r" values="7;28;7" dur={`${4 + rnd(i, 31) * 4}s`} begin={`${rnd(i, 37) * 3}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0;0.7" dur={`${4 + rnd(i, 31) * 4}s`} begin={`${rnd(i, 37) * 3}s`} repeatCount="indefinite" />
        </circle>
      )}
      {label && (
        <text
          x={p.x}
          y={p.y + 44}
          textAnchor="middle"
          className="fill-muted-foreground font-mono"
          style={{ fontSize: 15, letterSpacing: 3, opacity: 0.75 }}
        >
          {label}
        </text>
      )}
    </motion.g>
  );
}

/* ── the reactor: nested arcs, lattice and a molten heart ── */
function Reactor({ reduce }: { reduce: boolean }) {
  const c = NODES.core;
  const arcs = [
    { r: 210, dash: "2 26", w: 1, dur: 96, dir: 1, o: 0.4 },
    { r: 168, dash: "70 34", w: 1.4, dur: 64, dir: -1, o: 0.55 },
    { r: 126, dash: "10 14", w: 1, dur: 42, dir: 1, o: 0.5 },
    { r: 92, dash: "150 260", w: 2.4, dur: 28, dir: -1, o: 0.85 },
  ];
  return (
    <motion.g
      initial={reduce ? false : { opacity: 0, scale: 0.72 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ transformOrigin: `${c.x}px ${c.y}px` }}
      transition={{ duration: 1.6, delay: 0.55, ease: EASE }}
    >
      {arcs.map((a, i) => (
        <g key={i} style={{ transformOrigin: `${c.x}px ${c.y}px` }}>
          <circle
            cx={c.x}
            cy={c.y}
            r={a.r}
            fill="none"
            stroke={i === 3 ? "var(--primary-glow)" : "var(--primary)"}
            strokeWidth={a.w}
            strokeDasharray={a.dash}
            opacity={a.o}
            className={reduce ? undefined : "tw-spin"}
            style={{
              transformOrigin: `${c.x}px ${c.y}px`,
              animationDuration: `${a.dur}s`,
              animationDirection: a.dir > 0 ? "normal" : "reverse",
            }}
          />
        </g>
      ))}

      {/* energy spokes */}
      {Array.from({ length: 24 }, (_, i) => {
        const ang = (i / 24) * Math.PI * 2;
        const r0 = 100 + rnd(i, 41) * 20;
        const r1 = r0 + 24 + rnd(i, 43) * 70;
        return (
          <line
            key={i}
            x1={r2(c.x + Math.cos(ang) * r0)}
            y1={r2(c.y + Math.sin(ang) * r0)}
            x2={r2(c.x + Math.cos(ang) * r1)}
            y2={r2(c.y + Math.sin(ang) * r1)}
            stroke="var(--primary-glow)"
            strokeWidth={0.8}
            opacity={0.18 + rnd(i, 47) * 0.25}
          >
            {!reduce && (
              <animate
                attributeName="opacity"
                values={`0.05;${(0.3 + rnd(i, 53) * 0.5).toFixed(2)};0.05`}
                dur={`${3 + rnd(i, 59) * 6}s`}
                begin={`${rnd(i, 61) * 5}s`}
                repeatCount="indefinite"
              />
            )}
          </line>
        );
      })}

      {/* molten heart */}
      <circle cx={c.x} cy={c.y} r={78} fill="url(#tw-core)" filter="url(#tw-bloom)">
        {!reduce && <animate attributeName="r" values="72;84;72" dur="7.3s" repeatCount="indefinite" />}
      </circle>
      <circle cx={c.x} cy={c.y} r={40} fill="url(#tw-core-hot)">
        {!reduce && <animate attributeName="opacity" values="0.85;1;0.85" dur="4.1s" repeatCount="indefinite" />}
      </circle>

      {/* containment ellipses (3d feel) */}
      {[0, 60, 120].map((rot, i) => (
        <ellipse
          key={rot}
          cx={c.x}
          cy={c.y}
          rx={150}
          ry={46}
          fill="none"
          stroke="var(--primary-glow)"
          strokeWidth={0.9}
          opacity={0.3}
          transform={`rotate(${rot} ${c.x} ${c.y})`}
          className={reduce ? undefined : "tw-spin"}
          style={{
            transformOrigin: `${c.x}px ${c.y}px`,
            animationDuration: `${38 + i * 17}s`,
            animationDirection: i % 2 ? "reverse" : "normal",
          }}
        />
      ))}
    </motion.g>
  );
}

/** Depth-parallaxed wrapper. */
function Depth({ pointer, depth, children }: { pointer: Pointer; depth: number; children: React.ReactNode }) {
  const x = useTransform(pointer.x, [-1, 1], [depth * 26, -depth * 26]);
  const y = useTransform(pointer.y, [-1, 1], [depth * 18, -depth * 18]);
  return (
    <motion.div className="absolute inset-0" style={{ x, y, willChange: "transform" }}>
      {children}
    </motion.div>
  );
}

export function ReactorScene() {
  const reduce = useSafeReducedMotion();
  const pointer = usePointer();

  const gx = useTransform(pointer.x, [-1, 1], ["36%", "64%"]);
  const gy = useTransform(pointer.y, [-1, 1], ["36%", "64%"]);

  const motes = Array.from({ length: 40 }, (_, i) => ({
    left: rnd(i, 71) * 100,
    top: rnd(i, 73) * 100,
    size: 1 + rnd(i, 79) * 2.4,
    dur: 9 + rnd(i, 83) * 18,
    delay: rnd(i, 89) * 12,
    drift: -20 - rnd(i, 97) * 60,
  }));

  return (
    <div
      {...pointer.bind}
      aria-hidden
      className="relative h-full w-full select-none overflow-visible"
      style={{ perspective: 1600 }}
    >
      {/* 1 — atmosphere */}
      <motion.div
        className="absolute -inset-[22%] rounded-full"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
        style={{
          background:
            "radial-gradient(50% 50% at 52% 48%, color-mix(in oklab, var(--primary) 26%, transparent), transparent 72%)",
          filter: "blur(50px)",
        }}
      />

      {/* 2 — perspective floor under the reactor */}
      <div className="absolute inset-x-[-18%] bottom-[-8%] h-[58%] [perspective:700px] [perspective-origin:50%_0%]">
        <div
          className={`absolute inset-0 origin-top grid-lines opacity-[0.5] mask-fade-floor [transform:rotateX(74deg)_scale(2.1)] ${reduce ? "" : "animate-grid-run"}`}
        />
      </div>

      {/* 3 — volumetric lights, each on its own clock */}
      <Depth pointer={pointer} depth={0.35}>
        <motion.div
          className={`absolute left-[6%] top-[4%] h-[52%] w-[52%] rounded-full ${reduce ? "" : "animate-drift-b"}`}
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--primary-glow) 34%, transparent), transparent 70%)",
            filter: "blur(70px)",
            mixBlendMode: "screen",
          }}
        />
        <motion.div
          className={`absolute right-[2%] bottom-[2%] h-[56%] w-[56%] rounded-full ${reduce ? "" : "animate-drift-c"}`}
          style={{
            background: "radial-gradient(circle, color-mix(in oklab, var(--success) 22%, transparent), transparent 70%)",
            filter: "blur(84px)",
            mixBlendMode: "screen",
          }}
        />
      </Depth>

      {/* 4 — the machine itself */}
      <Depth pointer={pointer} depth={1}>
        <svg viewBox={`0 0 ${V} 820`} className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="tw-stream" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.05" />
              <stop offset="45%" stopColor="var(--primary-glow)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.12" />
            </linearGradient>
            <radialGradient id="tw-node">
              <stop offset="0%" stopColor="var(--primary-glow)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="tw-core">
              <stop offset="0%" stopColor="var(--primary-glow)" stopOpacity="0.85" />
              <stop offset="55%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="tw-core-hot">
              <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.9" />
              <stop offset="40%" stopColor="var(--primary-glow)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </radialGradient>
            <filter id="tw-soft" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="2.4" />
            </filter>
            <filter id="tw-bloom" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>

          {STREAMS.map((s, i) => (
            <Stream key={i} s={s} i={i} reduce={reduce} />
          ))}

          <Reactor reduce={reduce} />

          {Object.values(NODES)
            .filter((n) => n !== NODES.core)
            .map((n, i) => (
              <Junction key={i} p={n} label={"label" in n ? n.label : undefined} i={i} reduce={reduce} />
            ))}
        </svg>
      </Depth>

      {/* 5 — drifting motes in front */}
      <Depth pointer={pointer} depth={1.6}>
        {motes.map((m, i) => (
          <span
            key={i}
            className={`absolute rounded-full bg-primary-glow/70 ${reduce ? "opacity-25" : "tw-mote"}`}
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: m.size,
              height: m.size,
              // @ts-expect-error custom property
              "--drift": `${m.drift}px`,
              animationDuration: `${m.dur}s`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}
      </Depth>

      {/* 6 — cursor light */}
      <motion.div
        className="pointer-events-none absolute -inset-[10%]"
        style={{
          background:
            "radial-gradient(26% 26% at var(--gx) var(--gy), color-mix(in oklab, var(--primary-glow) 22%, transparent), transparent 70%)",
          // @ts-expect-error motion custom properties
          "--gx": gx,
          "--gy": gy,
          filter: "blur(36px)",
          mixBlendMode: "screen",
        }}
      />

      {/* 7 — foreground fog so the scene sits in air, not on a page */}
      <div
        className="pointer-events-none absolute inset-x-[-10%] bottom-[-10%] h-[40%]"
        style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
      />
    </div>
  );
}
