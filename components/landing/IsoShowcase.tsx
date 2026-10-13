"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { cx } from "../ui/Button";
import { AnimatedIcon } from "./AnimatedIcon";

/**
 * Isometric board of tiles. A few tiles carry a library icon floating above
 * them on a dashed stem; the "selected" (dark) tile moves from icon to icon
 * and plays that icon's animation, like picking icons in the library.
 */

const STEP = 88; // plane distance between tile origins
const SIZE = 66; // tile edge on the plane
const DEPTH = 10; // slab thickness in screen px
const R = 13; // tile corner radius on the plane
const LIFT = 58; // how far an icon floats above its tile

/** Tiles on the plane grid; `icon` tiles get a floating glyph. */
const TILES: { i: number; j: number; icon?: string }[] = [
  { i: 0, j: 0 },
  { i: 1, j: 0, icon: "hourglass" },
  { i: 2, j: 0 },
  { i: 3, j: 0, icon: "lightbulb" },
  { i: 0, j: 1, icon: "fingerprint" },
  { i: 1, j: 1 },
  { i: 2, j: 1 },
  { i: 3, j: 1, icon: "anchor" },
  { i: 4, j: 1 },
  { i: 1, j: 2 },
  { i: 2, j: 2, icon: "flame" },
  { i: 3, j: 2 },
];

const COS = 0.866;
const SIN = 0.5;
const iso = (x: number, y: number) => [(x - y) * COS, (x + y) * SIN] as const;

// Screen bounds of the board (plus room above for floating icons).
const corners = TILES.flatMap(({ i, j }) => {
  const x = i * STEP;
  const y = j * STEP;
  return [iso(x, y), iso(x + SIZE, y), iso(x, y + SIZE), iso(x + SIZE, y + SIZE)];
});
const PAD = 24;
const MIN_X = Math.min(...corners.map((c) => c[0])) - PAD;
const MAX_X = Math.max(...corners.map((c) => c[0])) + PAD;
const MIN_Y = Math.min(...corners.map((c) => c[1])) - LIFT - 20;
const MAX_Y = Math.max(...corners.map((c) => c[1])) + DEPTH + PAD;
const W = MAX_X - MIN_X;
const H = MAX_Y - MIN_Y;

const MATRIX = (dy = 0) => `matrix(${COS} ${SIN} ${-COS} ${SIN} ${-MIN_X} ${-MIN_Y + dy})`;
// Paint back-to-front so nearer slabs overlap farther ones.
const ORDER = TILES.map((t, index) => ({ ...t, index })).sort((a, b) => a.i + a.j - (b.i + b.j) || a.i - b.i);
const ICON_TILES = TILES.map((t, index) => ({ ...t, index })).filter((t) => t.icon);

/** Screen points where a rounded tile's outline is furthest left and right (the slab's vertical edges). */
function sides(i: number, j: number) {
  const x = i * STEP;
  const y = j * STEP;
  const k = R * Math.SQRT1_2;
  const [lx, ly] = iso(x + R - k, y + SIZE - R + k);
  const [rx, ry] = iso(x + SIZE - R + k, y + R - k);
  return [
    { x: lx - MIN_X, y: ly - MIN_Y },
    { x: rx - MIN_X, y: ry - MIN_Y },
  ] as const;
}

function centre(i: number, j: number) {
  const [x, y] = iso(i * STEP + SIZE / 2, j * STEP + SIZE / 2);
  return { x: x - MIN_X, y: y - MIN_Y };
}

/** Dashed guide lines along both plane axes, through the tile rows and columns. */
function Guides() {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let k = -1; k <= 4; k++) {
    const c = k * STEP + SIZE / 2;
    lines.push({ x1: -STEP * 1.5, y1: c, x2: STEP * 6, y2: c });
    if (k >= 0) lines.push({ x1: c, y1: -STEP * 1.5, x2: c, y2: STEP * 4.5 });
  }
  return (
    <g transform={MATRIX()}>
      {lines.map((l, n) => (
        <line key={n} {...l} stroke="rgba(28,31,33,0.16)" strokeWidth={1} strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  );
}

export function IsoShowcase() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % ICON_TILES.length), 2400);
    return () => window.clearInterval(id);
  }, [reduce, paused]);

  const selected = ICON_TILES[active]?.index;

  return (
    <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <linearGradient id="iso-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#f3f4f6" />
          </linearGradient>
          <linearGradient id="iso-top-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a3d42" />
            <stop offset="1" stopColor="#1d1f23" />
          </linearGradient>
          <linearGradient id="iso-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#eef0f3" />
            <stop offset="0.5" stopColor="#e6e9ed" />
            <stop offset="1" stopColor="#dcdfe4" />
          </linearGradient>
          <linearGradient id="iso-side-dark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#24272c" />
            <stop offset="1" stopColor="#0e0f11" />
          </linearGradient>
          <filter id="iso-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <radialGradient id="iso-fade" cx="0.5" cy="0.55" r="0.62">
            <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </radialGradient>
        </defs>

        <Guides />

        {/* soft contact shadows, under every slab */}
        <g filter="url(#iso-blur)" opacity={0.5}>
          {ORDER.map(({ index, i, j }) => (
            <rect key={index} x={i * STEP + 4} y={j * STEP + 4} width={SIZE - 8} height={SIZE - 8} rx={R} transform={MATRIX(DEPTH + 10)} fill="rgba(20,22,26,0.16)" />
          ))}
        </g>

        {ORDER.map(({ index, ...t }) => {
          const on = index === selected;
          const x = t.i * STEP;
          const y = t.j * STEP;
          const [l, r] = sides(t.i, t.j);
          const edge = on ? "#0f1012" : "rgba(28,31,33,0.16)";
          return (
            <g key={index} style={{ transform: on ? "translateY(-7px)" : "none", transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
              {/* slab: bottom face, the band between the side extremes, then the top face */}
              <rect x={x} y={y} width={SIZE} height={SIZE} rx={R} transform={MATRIX(DEPTH)} fill={on ? "#121417" : "#e2e5e9"} stroke={edge} strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <polygon points={`${l.x},${l.y} ${r.x},${r.y} ${r.x},${r.y + DEPTH} ${l.x},${l.y + DEPTH}`} fill={on ? "url(#iso-side-dark)" : "url(#iso-side)"} />
              <path d={`M${l.x} ${l.y}V${l.y + DEPTH}M${r.x} ${r.y}V${r.y + DEPTH}`} stroke={edge} strokeWidth={1} />
              <rect x={x} y={y} width={SIZE} height={SIZE} rx={R} transform={MATRIX()} fill={on ? "url(#iso-top-dark)" : "url(#iso-top)"} stroke={edge} strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <rect x={x + 7} y={y + 7} width={SIZE - 14} height={SIZE - 14} rx={R - 4} transform={MATRIX()} fill="none" stroke={on ? "rgba(255,255,255,0.14)" : "rgba(28,31,33,0.07)"} strokeWidth={1} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}

        {/* stems from each floating icon down to its tile */}
        {ICON_TILES.map((t) => {
          const c = centre(t.i, t.j);
          const on = t.index === selected;
          return (
            <g key={t.index} style={{ transform: on ? "translateY(-7px)" : "none", transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
              <line x1={c.x} y1={c.y - LIFT + 14} x2={c.x} y2={c.y} stroke={on ? "#1c1f21" : "rgba(28,31,33,0.35)"} strokeWidth={1} strokeDasharray="3 4" />
              <circle cx={c.x} cy={c.y} r={2.5} fill={on ? "#fff" : "rgba(28,31,33,0.45)"} />
            </g>
          );
        })}

        <rect width={W} height={H} fill="url(#iso-fade)" />
      </svg>

      {/* floating icons (HTML so they use the real animated library icons) */}
      {ICON_TILES.map((t, n) => {
        const c = centre(t.i, t.j);
        const on = t.index === selected;
        return (
          <button
            key={t.index}
            type="button"
            aria-label={`Play the ${t.icon} animation`}
            onPointerEnter={() => {
              setPaused(true);
              setActive(n);
            }}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => {
              setPaused(true);
              setActive(n);
            }}
            onBlur={() => setPaused(false)}
            className={cx(
              "absolute flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border transition-[color,background-color,border-color,box-shadow] duration-500 ease-out",
              on
                ? "border-black bg-[#1d1f23] text-white shadow-[0_6px_14px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.15)]"
                : "border-line bg-white text-text shadow-card-hover hover:border-[rgba(28,31,33,0.25)] hover:text-ink",
              n % 2 ? "how-float-2" : "how-float",
            )}
            style={{ left: `${(c.x / W) * 100}%`, top: `${((c.y - LIFT + (on ? -7 : 0)) / H) * 100}%`, transitionProperty: "top, color, background-color, border-color, box-shadow" }}
          >
            <AnimatedIcon id={t.icon!} size={22} active={on} />
          </button>
        );
      })}
    </div>
  );
}
