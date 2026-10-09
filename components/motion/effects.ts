import type { Easing } from "framer-motion";
import type { EffectContext, EffectFactory, EffectSpec, EffectTrack } from "./types";

/**
 * Whole-icon effect library. Every effect is a factory so distances scale with
 * the rendered icon (`u` = px per grid unit) and exits clear the stage.
 * Rules of thumb used throughout:
 *  - one track per property per layer (Framer cancels overlapping animations);
 *  - effects end at rest, except "hold" effects that stay transformed while the
 *    icon is active and settle back on leave;
 *  - teleports (exit → re-enter) hide the jump behind an opacity track.
 */

const OUT: Easing = [0.22, 1, 0.36, 1];
const IN_OUT: Easing = [0.65, 0, 0.35, 1];
const IN: Easing = [0.55, 0, 1, 0.45];
/** Ballistic: rising out of a bounce (decelerating). */
const RISE: Easing = [0, 0.55, 0.45, 1];
const SPRING: Easing = [0.34, 1.56, 0.64, 1];
const ACCEL: Easing = [0.6, 0, 0.9, 0.3];
const BRAKE: Easing = [0.15, 0.85, 0.3, 1];

const blur = (px: number) => `blur(${px}px)`;
const bright = (k: number) => `brightness(${k})`;
const inset = (t: number, r: number, b: number, l: number) => `inset(${t}% ${r}% ${b}% ${l}%)`;
const circle = (r: number) => `circle(${r}% at 50% 50%)`;

const scaleAll = (values: number[], k: number) => values.map((v) => v * k);

/** Sample a parametric path into x / y / rotate keyframes. `ease` warps time so linear segments still feel eased. */
function sampled(
  n: number,
  at: (t: number) => [number, number],
  { rotate = false, baseAngle = 0, ease = (t: number) => t }: { rotate?: boolean; baseAngle?: number; ease?: (t: number) => number } = {},
) {
  const x: number[] = [];
  const y: number[] = [];
  const r: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = ease(i / n);
    const [px, py] = at(t);
    x.push(px);
    y.push(py);
    if (rotate) {
      const [ax, ay] = at(Math.max(0, t - 0.01));
      const [bx, by] = at(Math.min(1, t + 0.01));
      r.push((Math.atan2(by - ay, bx - ax) * 180) / Math.PI - baseAngle);
    }
  }
  return { x, y, r };
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Hide a teleport jump: invisible between `from` and `to` (fractions of `duration`). */
const hiddenBetween = (from: number, to: number, duration: number): EffectTrack => ({
  values: { opacity: [1, 1, 0, 0, 1] },
  times: [0, from - 0.005, from, to, to + 0.005],
  duration,
  ease: "linear",
});

const glow = (values: number[], times: number[] | undefined, duration: number, loop = false): EffectTrack => ({
  target: "glow",
  values: { opacity: values },
  times,
  duration,
  ease: IN_OUT,
  loop,
});

export const EFFECTS: Record<string, EffectFactory> = {
  /* ------------------------------------------------------------- Motion */

  "drive-forward": ({ u, exitX }) => ({
    origin: "50% 100%",
    tracks: [
      {
        values: { x: [0, -1.5 * u, exitX, -exitX, 0] },
        times: [0, 0.16, 0.48, 0.52, 1],
        duration: 1.5,
        ease: [IN_OUT, ACCEL, "linear", BRAKE],
      },
      { values: { skewX: [0, 0, 9, 9, -7, 0] }, times: [0, 0.16, 0.3, 0.6, 0.85, 1], duration: 1.5, ease: IN_OUT },
      hiddenBetween(0.47, 0.53, 1.5),
    ],
    particles: [{ at: 0.24, preset: "dust", x: 3, y: 19, angle: 180, spread: 40, count: 7 }],
  }),

  reverse: ({ u, exitX }) => ({
    origin: "50% 100%",
    tracks: [
      {
        values: { x: [0, 1.5 * u, -exitX, exitX, 0] },
        times: [0, 0.16, 0.48, 0.52, 1],
        duration: 1.6,
        ease: [IN_OUT, ACCEL, "linear", BRAKE],
      },
      { values: { skewX: [0, 0, -7, -7, 5, 0] }, times: [0, 0.16, 0.3, 0.6, 0.85, 1], duration: 1.6, ease: IN_OUT },
      hiddenBetween(0.47, 0.53, 1.6),
    ],
    particles: [{ at: 0.26, preset: "dust", x: 21, y: 19, angle: 0, spread: 40, count: 7 }],
  }),

  drift: ({ u }) => ({
    origin: "50% 80%",
    tracks: [
      {
        values: {
          x: scaleAll([0, 3, 5, 2, 0], u),
          y: scaleAll([0, -1, 0.6, 0.4, 0], u),
          rotate: [0, -18, 13, -4, 0],
          skewX: [0, 9, -6, 1, 0],
        },
        duration: 1.4,
        ease: IN_OUT,
      },
    ],
    particles: [
      { at: 0.3, preset: "dust", x: 4, y: 19, angle: 200, spread: 50, count: 7 },
      { at: 0.65, preset: "dust", x: 19, y: 19, angle: -20, spread: 50, count: 6 },
    ],
  }),

  burnout: ({ u }) => ({
    tracks: [{ values: { x: scaleAll([0, -0.5, 0.45, -0.35, 0], u), rotate: [0, -1, 1, -0.6, 0] }, duration: 0.2, ease: "linear", loop: true }],
    emitters: [{ at: 0.05, preset: "smoke", rate: 12, x: 4, y: 18, angle: 180, spread: 50 }],
  }),

  "crash-bounce": ({ u }) => ({
    origin: "100% 70%",
    tracks: [
      {
        values: { x: scaleAll([0, -1.5, 7, 4.5, 5.5, 0], u), scaleX: [1, 1, 1, 0.76, 1.06, 1], rotate: [0, 0, 0, -8, 3, 0] },
        times: [0, 0.12, 0.34, 0.48, 0.6, 1],
        duration: 1.4,
        ease: [IN_OUT, [0.7, 0, 1, 0.5], OUT, IN_OUT, [0.4, 0, 0.2, 1]],
      },
    ],
    particles: [
      { at: 0.48, preset: "stars", x: 23, y: 10, angle: 200, spread: 160, count: 7 },
      { at: 0.48, preset: "shockwave", x: 22, y: 12 },
    ],
  }),

  dash: ({ u, dir }) => ({
    tracks: [
      {
        values: {
          x: scaleAll([0, -1.5 * dir[0], 6 * dir[0], 0], u),
          y: scaleAll([0, -1.5 * dir[1], 6 * dir[1], 0], u),
          skewX: [0, 6 * dir[0], -10 * dir[0], 0],
        },
        times: [0, 0.25, 0.55, 1],
        duration: 0.8,
        ease: [IN_OUT, [0.7, 0, 0.3, 1], SPRING],
      },
    ],
    particles: [{ at: 0.25, preset: "streaks", x: 12 - dir[0] * 9, y: 12 - dir[1] * 9, angle: (Math.atan2(-dir[1], -dir[0]) * 180) / Math.PI, count: 4 }],
  }),

  "fly-through": ({ u, dir, exitX, exitY }) => ({
    tracks: [
      {
        values: {
          x: [0, -1.5 * u * dir[0], exitX * dir[0], -exitX * dir[0], 0],
          y: [0, -1.5 * u * dir[1], exitY * dir[1], -exitY * dir[1], 0],
        },
        times: [0, 0.18, 0.48, 0.52, 1],
        duration: 1.2,
        ease: [IN_OUT, ACCEL, "linear", BRAKE],
      },
      hiddenBetween(0.47, 0.53, 1.2),
    ],
    particles: [{ at: 0.3, preset: "streaks", x: 12 - dir[0] * 9, y: 12 - dir[1] * 9, angle: (Math.atan2(-dir[1], -dir[0]) * 180) / Math.PI }],
  }),

  /** Leaves along a dipping curve to the top-right, glides back in from the bottom-left. */
  "fly-curve": ({ u, exitX, exitY }) => {
    const out = sampled(10, (t) => [2 * (1 - t) * t * 8 * u + t * t * exitX, 2 * (1 - t) * t * 9 * u + t * t * -exitY], {
      rotate: true,
      baseAngle: -45,
      ease: (t) => t * t,
    });
    const back = sampled(8, (t) => [(1 - t) * (1 - t) * -exitX + 2 * (1 - t) * t * -7 * u, (1 - t) * (1 - t) * exitY * 0.6 + 2 * (1 - t) * t * 2 * u], {
      rotate: true,
      baseAngle: -45,
      ease: (t) => 1 - (1 - t) * (1 - t),
    });
    const n1 = out.x.length;
    const n2 = back.x.length;
    const times = [...out.x.map((_, i) => (i / (n1 - 1)) * 0.5), ...back.x.map((_, i) => 0.52 + (i / (n2 - 1)) * 0.48)];
    const clampRot = (r: number[]) => r.map((v) => Math.max(-70, Math.min(70, ((v + 540) % 360) - 180)));
    return {
      tracks: [
        { values: { x: [...out.x, ...back.x], y: [...out.y, ...back.y], rotate: [...clampRot(out.r), ...clampRot(back.r).map((v, i, a) => (i === a.length - 1 ? 0 : v))] }, times, duration: 1.9, ease: "linear" },
        hiddenBetween(0.5, 0.52, 1.9),
      ],
      emitters: [{ at: 0.15, preset: "streaks", rate: 10, duration: 0.6, x: 12, y: 12, angle: 200, follow: true }],
    };
  },

  "loop-the-loop": ({ u }) => {
    const R = 6 * u;
    const path = sampled(16, (t) => [R * Math.sin(t * Math.PI * 2), -R * (1 - Math.cos(t * Math.PI * 2))], { ease: easeInOut });
    return {
      tracks: [
        {
          values: { x: path.x, y: path.y, rotate: path.x.map((_, i) => -360 * easeInOut(i / (path.x.length - 1))) },
          duration: 1.5,
          ease: "linear",
        },
      ],
      emitters: [{ at: 0.1, preset: "streaks", rate: 14, duration: 1.2, x: 12, y: 12, follow: true }],
    };
  },

  launch: ({ u, exitY }) => ({
    tracks: [
      { values: { x: scaleAll([0, -0.4, 0.4, -0.4, 0.4, -0.3, 0], u) }, duration: 0.45, ease: "linear" },
      {
        values: { y: [0, 0, 0.6 * u, -exitY, -exitY, 0], scaleY: [1, 1, 0.88, 1.14, 1, 1] },
        times: [0, 0.24, 0.32, 0.62, 0.64, 0.66],
        duration: 1.9,
        ease: ["linear", OUT, ACCEL, "linear", "linear"],
      },
      { values: { opacity: [1, 1, 0, 0, 1], scale: [1, 1, 1, 0.4, 1] }, times: [0, 0.6, 0.62, 0.7, 0.88], duration: 1.9, ease: ["linear", "linear", "linear", SPRING] },
    ],
    particles: [{ at: 0.5, preset: "smoke", x: 12, y: 21, angle: 90, spread: 160, count: 12 }],
    emitters: [{ at: 0.35, preset: "flame", rate: 70, duration: 0.85, x: 12, y: 21, angle: 90, spread: 25, follow: true }],
  }),

  hover: ({ u }) => ({
    tracks: [{ values: { y: scaleAll([0, -1.6, 0], u), rotate: [0, -2, 0] }, duration: 1.1, ease: IN_OUT, loop: true }],
    emitters: [{ at: 0, preset: "flame", rate: 30, x: 12, y: 21, angle: 90, spread: 20, follow: true }],
  }),

  "float-away": ({ u, exitY }) => ({
    tracks: [
      {
        values: { y: [0, 1 * u, -exitY, -exitY, 0], x: scaleAll([0, 0, 3, 3, 0], u), rotate: [0, 0, 8, 0, 0] },
        times: [0, 0.12, 0.6, 0.62, 1],
        duration: 2.4,
        ease: [OUT, [0.4, 0, 0.8, 0.6], "linear", SPRING],
      },
      { values: { opacity: [1, 1, 0, 0, 1], scale: [1, 1, 1, 0.3, 1] }, times: [0, 0.58, 0.6, 0.64, 0.9], duration: 2.4, ease: ["linear", "linear", "linear", SPRING] },
    ],
  }),

  /** Bug scurry: zig-zags across the card, turning to face where it's heading. */
  zigzag: ({ u }) => ({
    tracks: [
      {
        values: { x: scaleAll([0, 3, -2.5, 4, -1, 0], u), y: scaleAll([0, -2.5, -3, 1, 2.2, 0], u), rotate: [0, 45, -60, 50, -35, 0] },
        duration: 1.6,
        ease: IN_OUT,
      },
    ],
  }),

  "orbit-path": ({ u }) => {
    const R = 3 * u;
    const path = sampled(12, (t) => [R * Math.sin(t * Math.PI * 2), R * (Math.cos(t * Math.PI * 2) - 1) * 0.6], { ease: easeInOut });
    return { tracks: [{ values: { x: path.x, y: path.y }, duration: 1.4, ease: "linear" }] };
  },

  scribble: ({ u }) => ({
    origin: "10% 90%",
    tracks: [
      {
        values: { x: scaleAll([0, -2, 1, -1, 2, -0.5, 0], u), y: scaleAll([0, 1, -1, 1.2, -0.8, 0.5, 0], u), rotate: [0, -6, 4, -5, 5, -2, 0] },
        duration: 1.1,
        ease: IN_OUT,
      },
    ],
    particles: [{ at: 0.2, preset: "dust-drift", x: 5, y: 19, count: 6 }],
  }),

  nudge: ({ u, dir }) => ({
    tracks: [{ values: { x: [0, 2.2 * u * dir[0], 0], y: [0, 2.2 * u * dir[1], 0] }, duration: 0.9, ease: IN_OUT, loop: true }],
  }),

  rewind: () => ({
    tracks: [{ values: { rotate: [0, 30, -360] }, times: [0, 0.25, 1], duration: 1.0, ease: [OUT, [0.5, 0, 0.2, 1]] }],
    layers: { trail: 3 },
  }),

  "wind-up": () => ({
    tracks: [{ values: { rotate: [0, -40, 400, 352, 360] }, times: [0, 0.28, 0.72, 0.86, 1], duration: 1.4, ease: [OUT, [0.5, 0, 0.3, 1], IN_OUT, OUT] }],
  }),

  /* -------------------------------------------------------------- Shake */

  shake: ({ u }) => ({ tracks: [{ values: { x: scaleAll([0, -2, 2, -1.6, 1.6, -0.8, 0.8, 0], u) }, duration: 0.55, ease: IN_OUT }] }),

  wobble: () => ({ tracks: [{ values: { rotate: [0, -14, 11, -7, 4, -2, 0] }, duration: 0.75, ease: IN_OUT }] }),

  vibrate: ({ u }) => ({
    tracks: [{ values: { x: scaleAll([0, -0.5, 0.5, -0.5, 0.5, 0], u), y: scaleAll([0, 0.3, -0.3, 0.3, -0.3, 0], u), rotate: [0, -2, 2, -2, 2, 0] }, duration: 0.22, ease: "linear", loop: true }],
  }),

  jiggle: () => ({ tracks: [{ values: { rotate: [0, -9, 9, -7, 6, -3, 0], scale: [1, 1.08, 1.08, 1.06, 1.04, 1.02, 1] }, duration: 0.65, ease: IN_OUT }] }),

  swing: () => ({ origin: "50% 6%", tracks: [{ values: { rotate: [0, 22, -17, 11, -6, 3, 0] }, duration: 1.15, ease: IN_OUT }] }),

  headshake: () => ({ tracks: [{ values: { rotateY: [0, -32, 24, -14, 7, 0] }, duration: 0.85, ease: IN_OUT }] }),

  nod: () => ({ origin: "50% 15%", tracks: [{ values: { rotateX: [0, 34, -10, 16, 0] }, duration: 0.85, ease: IN_OUT }] }),

  rattle: ({ u }) => ({
    tracks: [{ values: { rotate: [0, -6, 6, -6, 6, -4, 4, -2, 0], y: scaleAll([0, -0.6, 0, -0.6, 0, -0.4, 0, 0, 0], u) }, duration: 0.6, ease: "linear" }],
  }),

  tremble: ({ u }) => ({
    tracks: [{ values: { x: scaleAll([0, -0.3, 0.3, -0.2, 0.2, 0], u), rotate: [0, -1.5, 1.5, -1, 1, 0] }, duration: 0.32, ease: "linear", loop: true }],
  }),

  /* ---------------------------------------------------------- Explosive */

  "confetti-burst": () => ({
    tracks: [{ values: { scale: [1, 0.82, 1.16, 0.97, 1] }, times: [0, 0.18, 0.4, 0.65, 1], duration: 0.7, ease: OUT }],
    particles: [{ at: 0.12, preset: "confetti", x: 12, y: 8, angle: -90, spread: 140, count: 30 }],
  }),

  /** Party popper: recoil, then confetti sprays out of the popper's mouth. */
  "confetti-tip": () => ({
    origin: "15% 85%",
    tracks: [{ values: { rotate: [0, -6, 8, -2, 0], scale: [1, 0.9, 1.1, 1, 1] }, duration: 0.7, ease: OUT }],
    particles: [
      { at: 0.12, preset: "confetti", x: 17, y: 7, angle: -50, spread: 70, count: 34 },
      { at: 0.16, preset: "stars", x: 17, y: 7, angle: -50, spread: 90, count: 5 },
    ],
  }),

  "star-scatter": () => ({
    tracks: [{ values: { scale: [1, 1.22, 1] }, duration: 0.5, ease: OUT }],
    particles: [{ at: 0.08, preset: "stars", x: 12, y: 12, count: 11 }],
  }),

  shatter: () => ({
    tracks: [{ values: { scale: [1, 1.12, 0.3, 0.3, 0.9, 1], opacity: [1, 1, 0, 0, 1, 1] }, times: [0, 0.14, 0.24, 0.62, 0.82, 1], duration: 1.4, ease: [OUT, IN, "linear", SPRING, OUT] }],
    particles: [
      { at: 0.3, preset: "shards", x: 12, y: 12, count: 22 },
      { at: 0.3, preset: "shockwave", x: 12, y: 12 },
    ],
  }),

  firework: ({ u }) => ({
    tracks: [{ values: { y: [0, 0.8 * u, 0], scale: [1, 0.92, 1] }, duration: 0.5, ease: OUT }],
    particles: [
      { at: 0.15, preset: "firework", x: 12, y: -2, count: 18 },
      { at: 0.55, preset: "firework", x: 4, y: 3, count: 12 },
      { at: 0.75, preset: "sparkle", x: 12, y: 4, count: 5 },
    ],
  }),

  /** Balloon: inflates, pops, then regrows. */
  pop: () => ({
    tracks: [
      {
        values: { scale: [1, 1.2, 1.32, 0, 0, 0.6, 1.05, 1], opacity: [1, 1, 1, 0, 0, 1, 1, 1] },
        times: [0, 0.2, 0.3, 0.32, 0.6, 0.7, 0.85, 1],
        duration: 1.6,
        ease: [OUT, IN_OUT, "linear", "linear", OUT, SPRING, OUT],
      },
    ],
    particles: [
      { at: 0.5, preset: "shards", x: 12, y: 10, count: 16 },
      { at: 0.5, preset: "confetti", x: 12, y: 10, count: 14, spread: 360 },
      { at: 0.5, preset: "shockwave", x: 12, y: 10 },
    ],
  }),

  supernova: () => ({
    tracks: [
      { values: { scale: [1, 0.78, 1.3, 1], filter: [bright(1), bright(1), bright(1.6), bright(1)] }, times: [0, 0.3, 0.42, 1], duration: 1.1, ease: [IN, OUT, OUT] },
      glow([0, 0, 1, 0], [0, 0.3, 0.42, 1], 1.1),
    ],
    layers: { glow: true },
    particles: [
      { at: 0.46, preset: "shockwave", x: 12, y: 12 },
      { at: 0.46, preset: "stars", x: 12, y: 12, count: 12 },
    ],
  }),

  bullseye: ({ u }) => ({
    tracks: [{ values: { scale: [1, 0.86, 1.08, 1], x: scaleAll([0, 0.6, -0.4, 0], u) }, duration: 0.6, ease: OUT }],
    particles: [
      { at: 0.03, preset: "shockwave", x: 12, y: 12 },
      { at: 0.05, preset: "stars", x: 12, y: 12, count: 8 },
    ],
  }),

  /* ------------------------------------------------------------ Physics */

  "drop-bounce": ({ u }) => ({
    origin: "50% 100%",
    tracks: [
      {
        values: {
          y: scaleAll([0, -14, 0, -4, 0, -1.2, 0], u),
          scaleY: [1, 1.06, 0.8, 1.03, 0.93, 1, 1],
          scaleX: [1, 0.95, 1.15, 0.98, 1.06, 1, 1],
        },
        times: [0, 0.2, 0.46, 0.62, 0.76, 0.88, 1],
        duration: 1.2,
        ease: [RISE, IN, RISE, IN, RISE, IN],
      },
    ],
    particles: [
      { at: 0.55, preset: "dust", x: 9, y: 21, angle: 180, spread: 30, count: 4 },
      { at: 0.55, preset: "dust", x: 15, y: 21, angle: 0, spread: 30, count: 4 },
    ],
  }),

  /** Lightning: vanishes, then strikes down from above with an electric impact. */
  strike: ({ u, exitY }) => ({
    origin: "50% 100%",
    tracks: [
      { values: { y: [0, 0, -exitY, 0, -0.8 * u, 0], scaleY: [1, 1, 1.3, 0.8, 1.05, 1] }, times: [0, 0.12, 0.13, 0.36, 0.46, 0.58], duration: 1.1, ease: ["linear", "linear", [0.8, 0, 1, 0.6], RISE, IN] },
      { values: { opacity: [1, 0, 0, 1] }, times: [0, 0.1, 0.13, 0.15], duration: 1.1, ease: "linear" },
      glow([0, 0, 1, 0], [0, 0.34, 0.38, 1], 1.1),
    ],
    layers: { glow: true },
    particles: [
      { at: 0.4, preset: "electric", x: 12, y: 18, count: 4 },
      { at: 0.4, preset: "shockwave", x: 12, y: 20 },
    ],
  }),

  "fall-recover": ({ u, exitY }) => ({
    origin: "50% 100%",
    tracks: [
      {
        values: { y: [0, -1 * u, exitY, -exitY, 0, -1.5 * u, 0], rotate: [0, -8, 40, 0, 0, 0, 0] },
        times: [0, 0.14, 0.44, 0.47, 0.72, 0.84, 1],
        duration: 1.6,
        ease: [RISE, IN, "linear", IN, RISE, IN],
      },
      hiddenBetween(0.44, 0.47, 1.6),
    ],
  }),

  pendulum: () => ({ origin: "50% -60%", tracks: [{ values: { rotate: [0, 28, -24, 17, -11, 6, -2, 0] }, duration: 1.9, ease: IN_OUT }] }),

  "spring-hang": ({ u }) => ({
    origin: "50% 0%",
    tracks: [{ values: { y: scaleAll([0, 5, -2, 2.5, -1, 0.8, 0], u), scaleY: [1, 1.15, 0.94, 1.06, 0.98, 1.02, 1] }, duration: 1.3, ease: IN_OUT }],
  }),

  "tip-over": () => ({
    origin: "85% 100%",
    tracks: [{ values: { rotate: [0, -7, 92, 80, 90, 90, 0] }, times: [0, 0.12, 0.38, 0.46, 0.54, 0.75, 1], duration: 1.8, ease: [OUT, IN, RISE, IN, "linear", SPRING] }],
    particles: [{ at: 0.7, preset: "dust", x: 22, y: 21, angle: 0, spread: 60, count: 6 }],
  }),

  /** Thrown up spinning, lands with a squash. */
  toss: ({ u }) => ({
    origin: "50% 100%",
    tracks: [
      {
        values: { y: scaleAll([0, 1, -12, 0, -2, 0], u), rotate: [0, 0, 200, 360, 360, 360], scaleY: [1, 0.85, 1.05, 0.82, 1.02, 1] },
        times: [0, 0.1, 0.42, 0.72, 0.85, 1],
        duration: 1.3,
        ease: [OUT, RISE, IN, RISE, IN],
      },
    ],
    particles: [{ at: 0.94, preset: "dust", x: 12, y: 21, angle: 180, spread: 200, count: 6 }],
  }),

  "gravity-drop": ({ u, exitY }) => ({
    origin: "50% 100%",
    tracks: [
      { values: { y: [0, exitY, -exitY, 0, -2 * u, 0], scaleY: [1, 1.1, 1.1, 0.82, 1.03, 1] }, times: [0, 0.3, 0.32, 0.6, 0.75, 0.9], duration: 1.5, ease: [IN, "linear", IN, RISE, IN] },
      hiddenBetween(0.3, 0.32, 1.5),
    ],
  }),

  /** Flips 180° (hourglass) and holds until the pointer leaves. */
  "flip-over": () => ({ tracks: [{ values: { rotate: [0, 200, 180] }, times: [0, 0.7, 1], duration: 0.9, ease: [IN_OUT, OUT] }] }),

  "sink-bob": ({ u }) => ({
    tracks: [
      { values: { y: scaleAll([0, 3, 1.6, 2.4, 2], u) }, duration: 1.4, ease: IN_OUT },
      { values: { rotate: [0, -5, 0, 5, 0] }, duration: 2.2, ease: IN_OUT, loop: true },
    ],
    emitters: [{ at: 0.3, preset: "bubbles", rate: 4, x: 12, y: 10 }],
  }),

  "leaf-fall": ({ u }) => ({
    tracks: [{ values: { x: scaleAll([0, 3, -3, 3, 0], u), y: scaleAll([0, 2, 4, 5, 0], u), rotate: [0, 25, -25, 18, 0] }, duration: 2.2, ease: IN_OUT }],
    particles: [{ at: 0.1, preset: "leaves", x: 12, y: 6, count: 4 }],
  }),

  /* -------------------------------------------------------------- Morph */

  /** Gooey dissolve into the twin icon (another icon or this icon's other style). Holds while active. */
  "gooey-morph": () => ({
    tracks: [
      { values: { scale: [1, 0.5], opacity: [1, 0], filter: [blur(0), blur(4)], rotate: [0, -40] }, duration: 0.55, ease: OUT },
      { target: "twin", values: { scale: [0.5, 1], opacity: [0, 1], filter: [blur(4), blur(0)], rotate: [40, 0] }, duration: 0.6, delay: 0.08, ease: SPRING },
    ],
    layers: { twin: true },
  }),

  /** Card-flips into the twin icon. Holds while active. */
  "flip-morph": () => ({
    tracks: [
      { values: { rotateY: [0, 90], opacity: [1, 0] }, times: [0, 1], duration: 0.3, ease: IN },
      { target: "twin", values: { rotateY: [-90, -90, 0], opacity: [0, 1, 1] }, times: [0, 0.5, 1], duration: 0.6, ease: [IN, OUT] },
    ],
    layers: { twin: true },
  }),

  iris: () => ({ tracks: [{ values: { clipPath: [circle(75), circle(0), circle(75)] }, times: [0, 0.02, 1], duration: 0.8, ease: ["linear", OUT] }] }),

  wipe: () => ({ tracks: [{ values: { clipPath: [inset(0, 0, 0, 0), inset(0, 100, 0, 0), inset(0, 0, 0, 0)] }, times: [0, 0.02, 1], duration: 0.9, ease: ["linear", IN_OUT] }] }),

  melt: () => ({
    origin: "50% 100%",
    tracks: [
      {
        values: { scaleY: [1, 0.5, 0.5, 1.12, 0.96, 1], scaleX: [1, 1.35, 1.35, 0.9, 1.03, 1], skewX: [0, 6, -4, 2, 0, 0], filter: [blur(0), blur(0.8), blur(0.8), blur(0), blur(0), blur(0)] },
        times: [0, 0.35, 0.55, 0.72, 0.86, 1],
        duration: 1.8,
        ease: IN_OUT,
      },
    ],
  }),

  /* ----------------------------------------------------------------- 3D */

  "flip-y": () => ({ tracks: [{ values: { rotateY: [0, 360] }, duration: 0.95, ease: [0.6, 0, 0.2, 1] }] }),
  "flip-x": () => ({ tracks: [{ values: { rotateX: [0, 360] }, duration: 0.95, ease: [0.6, 0, 0.2, 1] }] }),
  "coin-spin": () => ({ tracks: [{ values: { rotateY: [0, 360] }, duration: 1.2, ease: "linear", loop: true }] }),
  turntable: () => ({ tracks: [{ values: { rotateY: [0, 360] }, duration: 3.2, ease: "linear", loop: true }] }),
  "card-swing": () => ({ origin: "50% 0%", tracks: [{ values: { rotateX: [0, -62, 36, -18, 8, 0] }, duration: 1.4, ease: IN_OUT }] }),
  "door-open": () => ({ origin: "0% 50%", tracks: [{ values: { rotateY: [0, -68] }, duration: 0.65, ease: OUT }] }),
  "pop-out": ({ u }) => ({
    tracks: [
      {
        values: {
          scale: [1, 1.22],
          y: [0, -2 * u],
          filter: ["drop-shadow(0px 0px 0px rgba(10,10,11,0))", "drop-shadow(0px 6px 5px rgba(10,10,11,0.22))"],
        },
        duration: 0.5,
        ease: SPRING,
      },
    ],
  }),
  "tilt-3d": () => ({ tracks: [{ values: { scale: [1, 1.12] }, duration: 0.4, ease: OUT }], cursor: "tilt" }),

  /* ------------------------------------------------------------ Elastic */

  jelly: () => ({ tracks: [{ values: { scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1], scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1] }, duration: 0.9, ease: IN_OUT }] }),

  "squash-stretch": ({ u }) => ({
    origin: "50% 100%",
    tracks: [
      {
        values: { y: scaleAll([0, 0, -8, 0, 0], u), scaleY: [1, 0.7, 1.18, 0.82, 1], scaleX: [1, 1.25, 0.88, 1.15, 1] },
        times: [0, 0.18, 0.5, 0.78, 1],
        duration: 1.0,
        ease: [OUT, RISE, IN, SPRING],
      },
    ],
  }),

  "rubber-band": () => ({ tracks: [{ values: { scaleX: [1, 1.35, 0.8, 1.15, 0.95, 1], scaleY: [1, 0.75, 1.2, 0.9, 1.03, 1] }, duration: 0.85, ease: IN_OUT }] }),

  boing: () => ({ tracks: [{ values: { scale: [1, 0.7, 1.25, 0.92, 1.05, 1] }, duration: 0.8, ease: IN_OUT }] }),

  "wobble-skew": () => ({ tracks: [{ values: { skewX: [0, -14, 10, -6, 3, 0], skewY: [0, 4, -3, 2, 0, 0] }, duration: 0.85, ease: IN_OUT }] }),

  liquid: () => ({ tracks: [{ values: { skewX: [0, 6, -6, 0], scaleY: [1, 0.95, 1.04, 1] }, duration: 1.6, ease: IN_OUT, loop: true }] }),

  "stretch-reach": () => ({
    origin: "50% 100%",
    tracks: [{ values: { scaleY: [1, 0.5, 1.25, 0.92, 1.04, 1], scaleX: [1, 1.2, 0.9, 1.03, 1, 1] }, duration: 1.1, ease: IN_OUT }],
    particles: [{ at: 0.35, preset: "sparkle", x: 12, y: 4, count: 3 }],
  }),

  pinch: () => ({ tracks: [{ values: { scale: [1, 0.62, 0.62, 1.14, 1] }, times: [0, 0.3, 0.5, 0.8, 1], duration: 0.9, ease: [OUT, "linear", SPRING, OUT] }] }),

  click: () => ({
    tracks: [{ values: { scale: [1, 0.8, 1.06, 1] }, times: [0, 0.25, 0.6, 1], duration: 0.45, ease: OUT }],
    particles: [{ at: 0.1, preset: "ripple", x: 8, y: 8 }],
  }),

  thump: () => ({ tracks: [{ values: { scale: [1, 1.14, 1] }, times: [0, 0.15, 1], duration: 0.5, ease: OUT, loop: true }] }),

  /* ---------------------------------------------------------- Particles */

  sparkle: () => ({
    tracks: [{ values: { scale: [1, 1.06, 1] }, duration: 0.6, ease: OUT }],
    particles: [{ at: 0, preset: "sparkle", x: 12, y: 12, count: 8 }],
  }),

  orbit: ({ u }) => ({
    tracks: [{ values: { y: scaleAll([0, -0.8, 0], u) }, duration: 1.6, ease: IN_OUT, loop: true }],
    particles: [{ at: 0, preset: "orbit", x: 12, y: 12, count: 3 }],
  }),

  bubbles: ({ u }) => ({
    tracks: [{ values: { y: scaleAll([0, -0.6, 0], u) }, duration: 1.4, ease: IN_OUT, loop: true }],
    emitters: [{ at: 0, preset: "bubbles", rate: 6, x: 12, y: 8 }],
  }),

  attract: () => ({
    tracks: [{ values: { scale: [1, 1.05, 1] }, duration: 0.6, ease: IN_OUT, loop: true }],
    emitters: [{ at: 0, preset: "attract", rate: 16, x: 12, y: 12 }],
  }),

  steam: () => ({ tracks: [], emitters: [{ at: 0, preset: "steam", rate: 7, x: 12, y: 5 }] }),

  rain: ({ u }) => ({
    tracks: [{ values: { y: scaleAll([0, -0.6, 0], u) }, duration: 1.8, ease: IN_OUT, loop: true }],
    emitters: [{ at: 0, preset: "rain", rate: 22, x: 12, y: 18 }],
  }),

  "umbrella-rain": () => ({
    tracks: [{ values: { rotate: [0, -4, 0, 4, 0] }, duration: 1.8, ease: IN_OUT, loop: true }],
    emitters: [{ at: 0, preset: "rain", rate: 24, x: 12, y: -4 }],
  }),

  hearts: () => ({
    tracks: [{ values: { scale: [1, 1.1, 1] }, duration: 0.8, ease: IN_OUT, loop: true }],
    emitters: [{ at: 0, preset: "hearts", rate: 4, x: 12, y: 6 }],
  }),

  notes: () => ({
    tracks: [{ values: { scale: [1, 1.1, 1] }, times: [0, 0.15, 1], duration: 0.55, ease: OUT, loop: true }],
    emitters: [{ at: 0, preset: "notes", rate: 2.6, x: 15, y: 6 }],
  }),

  zzz: ({ u }) => ({
    tracks: [{ values: { y: scaleAll([0, -1, 0], u), rotate: [0, -4, 0] }, duration: 2.2, ease: IN_OUT, loop: true }],
    emitters: [{ at: 0, preset: "zzz", rate: 1.4, x: 17, y: 6 }],
  }),

  embers: () => ({
    origin: "50% 100%",
    tracks: [{ values: { scaleY: [1, 1.07, 0.97, 1.05, 1], skewX: [0, 2, -2, 1, 0] }, duration: 0.7, ease: IN_OUT, loop: true }],
    emitters: [{ at: 0, preset: "embers", rate: 12, x: 12, y: 8 }],
  }),

  electric: () => ({
    tracks: [{ values: { opacity: [1, 0.55, 1, 0.8, 1] }, duration: 0.35, ease: "linear", loop: true }, glow([0.3, 1, 0.3], undefined, 0.35, true)],
    layers: { glow: true },
    emitters: [{ at: 0, preset: "electric", rate: 7, x: 12, y: 12 }],
  }),

  leaves: () => ({
    origin: "50% 100%",
    tracks: [{ values: { rotate: [0, -8, 6, -3, 0] }, duration: 1.2, ease: IN_OUT }],
    particles: [{ at: 0.05, preset: "leaves", x: 12, y: 6, count: 6 }],
  }),

  coins: () => ({
    tracks: [{ values: { rotate: [0, -8, 8, -5, 0], scale: [1, 1.08, 1.08, 1.03, 1] }, duration: 0.6, ease: IN_OUT }],
    particles: [{ at: 0.1, preset: "coins", x: 12, y: 8, angle: -90, spread: 70, count: 7 }],
  }),

  ripple: () => ({
    tracks: [{ values: { scale: [1, 1.06, 1] }, duration: 0.6, ease: IN_OUT, loop: true }],
    emitters: [{ at: 0, preset: "ripple", rate: 1.7, x: 12, y: 12 }],
  }),

  splash: ({ u }) => ({
    origin: "50% 100%",
    tracks: [{ values: { y: scaleAll([0, -8, 0, 0], u), scaleY: [1, 1.1, 0.72, 1], scaleX: [1, 0.92, 1.25, 1] }, times: [0, 0.35, 0.6, 1], duration: 1.0, ease: [RISE, IN, SPRING] }],
    particles: [{ at: 0.6, preset: "splash", x: 12, y: 21, count: 12 }],
  }),

  /** Magic wand: a flick of the wrist leaves a trail of sparkles along the tip's arc. */
  "wand-cast": () => {
    const pivot: [number, number] = [5, 19];
    const tip: [number, number] = [17, 7];
    const angles = [0, -28, 22, 0];
    const at = (p: number): [number, number] => {
      const seg = Math.min(angles.length - 2, Math.floor(p * (angles.length - 1)));
      const k = p * (angles.length - 1) - seg;
      const a = ((angles[seg] + (angles[seg + 1] - angles[seg]) * k) * Math.PI) / 180;
      const dx = tip[0] - pivot[0];
      const dy = tip[1] - pivot[1];
      return [pivot[0] + dx * Math.cos(a) - dy * Math.sin(a), pivot[1] + dx * Math.sin(a) + dy * Math.cos(a)];
    };
    return {
      origin: "20% 80%",
      tracks: [{ values: { rotate: angles }, duration: 1.0, ease: IN_OUT }],
      emitters: [{ at: 0, preset: "sparkle", rate: 26, duration: 1.0, path: at }],
      particles: [{ at: 0.95, preset: "stars", x: 17, y: 7, count: 7 }],
    };
  },

  disintegrate: () => ({
    tracks: [{ values: { clipPath: [inset(0, 0, 0, 0), inset(0, 0, 0, 100), inset(0, 0, 0, 100), inset(0, 0, 0, 0)] }, times: [0, 0.45, 0.6, 1], duration: 2.0, ease: [IN_OUT, "linear", OUT] }],
    emitters: [{ at: 0, preset: "dust-drift", rate: 70, duration: 0.9, path: (p) => [3 + 18 * p, 12] }],
  }),

  /** 8-bit celebration: square pixel confetti snapped to the icon's pixel grid. */
  "pixel-burst": () => ({
    tracks: [],
    particles: [{ at: 0.2, preset: "pixel-confetti", x: 12, y: 4, angle: -90, spread: 120, count: 26 }],
  }),

  /* --------------------------------------------------------------- Loop */

  float: ({ u }) => ({
    tracks: [
      { values: { y: scaleAll([0, -2, 0], u) }, duration: 2, ease: IN_OUT, loop: true },
      { values: { rotate: [0, -3, 0, 3, 0] }, duration: 3, ease: IN_OUT, loop: true },
    ],
  }),
  pulse: () => ({ tracks: [{ values: { scale: [1, 1.12, 1] }, duration: 1.1, ease: IN_OUT, loop: true }] }),
  spin: () => ({ tracks: [{ values: { rotate: [0, 360] }, duration: 1.4, ease: "linear", loop: true }] }),
  "slow-spin": () => ({ tracks: [{ values: { rotate: [0, 360] }, duration: 6, ease: "linear", loop: true }] }),
  breathe: () => ({ tracks: [{ values: { scale: [1, 1.06, 1], opacity: [1, 0.72, 1] }, duration: 2.6, ease: IN_OUT, loop: true }] }),
  heartbeat: () => ({
    tracks: [{ values: { scale: [1, 1.2, 1, 1.13, 1, 1] }, times: [0, 0.12, 0.24, 0.36, 0.55, 1], duration: 1.1, ease: OUT, loop: true }],
  }),
  sway: () => ({ origin: "50% 100%", tracks: [{ values: { rotate: [0, -7, 0, 7, 0] }, duration: 2.2, ease: IN_OUT, loop: true }] }),
  bob: ({ u }) => ({ tracks: [{ values: { y: scaleAll([0, -1.2, 0], u), rotate: [-3, 3, -3] }, duration: 1.8, ease: IN_OUT, loop: true }] }),
  metronome: () => ({ origin: "50% 100%", tracks: [{ values: { rotate: [0, -14, 0, 14, 0] }, duration: 1.2, ease: IN_OUT, loop: true }] }),

  /* -------------------------------------------------------------- Light */

  "neon-flicker": () => ({
    tracks: [
      { values: { opacity: [1, 0.15, 1, 0.3, 1, 0.6, 1] }, times: [0, 0.08, 0.16, 0.3, 0.38, 0.6, 1], duration: 1.0, ease: "linear" },
      glow([0, 0, 0.9, 0.1, 0.9, 0.5, 0.9], [0, 0.08, 0.16, 0.3, 0.38, 0.6, 1], 1.0),
    ],
    layers: { glow: true },
  }),
  "glow-pulse": () => ({ tracks: [glow([0.1, 0.95, 0.1], undefined, 1.6, true)], layers: { glow: true } }),
  flash: () => ({
    tracks: [
      { values: { filter: [bright(1), bright(2.2), bright(1), bright(1.8), bright(1)], opacity: [1, 0.6, 1, 0.7, 1] }, duration: 0.8, ease: "linear" },
      glow([0, 1, 0.2, 1, 0], undefined, 0.8),
    ],
    layers: { glow: true },
    particles: [
      { at: 0.05, preset: "electric", x: 12, y: 12, count: 4 },
      { at: 0.35, preset: "electric", x: 12, y: 12, count: 3 },
    ],
  }),
  "camera-flash": () => ({
    tracks: [{ values: { scale: [1, 0.9, 1.05, 1] }, duration: 0.6, ease: OUT }, glow([0, 1, 0], [0, 0.2, 1], 0.7)],
    layers: { glow: true },
    particles: [
      { at: 0.12, preset: "sparkle", x: 12, y: 12, count: 6 },
      { at: 0.1, preset: "shockwave", x: 12, y: 12 },
    ],
  }),
  shine: ({ u }) => ({
    tracks: [
      { target: "shine", values: { x: [-30 * u, 30 * u] }, duration: 1.1, ease: IN_OUT },
      { values: { scale: [1, 1.04, 1] }, duration: 0.9, ease: IN_OUT },
    ],
    layers: { shine: true },
  }),
  blink: () => ({ tracks: [{ values: { opacity: [1, 0, 0, 1, 1] }, times: [0, 0.05, 0.45, 0.5, 1], duration: 1.1, ease: "linear", loop: true }] }),

  /* ------------------------------------------------------------- Cursor */

  magnetic: () => ({ tracks: [{ values: { scale: [1, 1.08] }, duration: 0.3, ease: OUT }], cursor: "magnetic" }),
  repel: () => ({ tracks: [], cursor: "repel" }),
  "look-at": () => ({ tracks: [], cursor: "look" }),

  /* ------------------------------------------------------- Experimental */

  glitch: ({ u }) => {
    const times = [0, 0.1, 0.2, 0.3, 0.45, 0.55, 0.7, 1];
    return {
      tracks: [
        {
          values: {
            x: scaleAll([0, -1, 1.5, -0.5, 0, 0.8, 0, 0], u),
            clipPath: [inset(0, 0, 0, 0), inset(20, 0, 45, 0), inset(55, 0, 10, 0), inset(0, 0, 0, 0), inset(35, 0, 30, 0), inset(0, 0, 0, 0), inset(0, 0, 0, 0), inset(0, 0, 0, 0)],
          },
          times,
          duration: 0.8,
          ease: "linear",
        },
        { target: "glitchA", values: { opacity: [0, 0.85, 0.85, 0, 0.85, 0.6, 0, 0], x: scaleAll([0, -1.5, 1, 0, -1, 0.5, 0, 0], u) }, times, duration: 0.8, ease: "linear" },
        { target: "glitchB", values: { opacity: [0, 0.85, 0.6, 0, 0.85, 0.85, 0, 0], x: scaleAll([0, 1.5, -1, 0, 1.2, -0.6, 0, 0], u) }, times, duration: 0.8, ease: "linear" },
      ],
      layers: { glitch: true },
    };
  },

  afterimage: ({ u }) => ({ tracks: [{ values: { x: scaleAll([0, 6, -6, 0], u) }, duration: 0.9, ease: IN_OUT }], layers: { trail: 4 } }),

  peekaboo: ({ u, exitY }) => ({
    tracks: [
      {
        values: { y: [0, -1 * u, exitY, exitY, 7 * u, 7 * u, 0], rotate: [0, 0, 0, 0, -10, 10, 0] },
        times: [0, 0.1, 0.3, 0.45, 0.6, 0.75, 1],
        duration: 2.1,
        ease: [RISE, IN, "linear", OUT, IN_OUT, SPRING],
      },
    ],
  }),

  "black-hole": () => ({
    tracks: [{ values: { rotate: [0, 720, 720, 720], scale: [1, 0, 0, 1] }, times: [0, 0.45, 0.65, 1], duration: 1.6, ease: [IN, "linear", SPRING] }],
    emitters: [{ at: 0, preset: "attract", rate: 30, duration: 0.7, x: 12, y: 12 }],
    particles: [{ at: 1.05, preset: "shockwave", x: 12, y: 12 }],
  }),

  teleport: ({ u }) => ({
    tracks: [
      {
        values: { x: scaleAll([0, 0, 5, 5, 0], u), scaleX: [1, 0.04, 0.04, 1, 1], scaleY: [1, 1.5, 1.5, 1, 1] },
        times: [0, 0.3, 0.31, 0.5, 1],
        duration: 1.4,
        ease: [IN, "linear", OUT, SPRING],
      },
      { values: { opacity: [1, 1, 0, 0, 1] }, times: [0, 0.28, 0.3, 0.33, 0.48], duration: 1.4, ease: "linear" },
    ],
    particles: [
      { at: 0.38, preset: "sparkle", x: 12, y: 12, count: 5 },
      { at: 0.5, preset: "sparkle", x: 17, y: 12, count: 5 },
    ],
  }),
};

/** Overall length of one pass (seconds) and whether the effect keeps looping. */
export function effectTiming(spec: EffectSpec): { duration: number; loops: boolean } {
  let duration = 0;
  let loops = false;
  for (const t of spec.tracks) {
    duration = Math.max(duration, (t.delay ?? 0) + t.duration);
    if (t.loop) loops = true;
  }
  for (const c of spec.particles ?? []) duration = Math.max(duration, c.at + 0.9);
  for (const e of spec.emitters ?? []) {
    if (e.duration === undefined) loops = true;
    else duration = Math.max(duration, e.at + e.duration + 0.6);
  }
  if (spec.cursor) loops = true;
  return { duration, loops };
}

export function buildEffect(id: string | undefined, ctx: EffectContext): EffectSpec | null {
  const factory = id ? EFFECTS[id] : undefined;
  return factory ? factory(ctx) : null;
}
