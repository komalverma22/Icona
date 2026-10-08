import type { Easing } from "framer-motion";
import type { AnimatedProp, Direction, NodeMotion, Track } from "./animationTypes";

/**
 * Motion building blocks. Recipes compose these instead of hand-writing
 * keyframes, which keeps every icon's timing language consistent.
 */

export const EASE_OUT: Easing = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: Easing = [0.65, 0, 0.35, 1];
export const EASE_SPRINGY: Easing = [0.34, 1.56, 0.64, 1];

interface Timing {
  delay?: number;
  duration?: number;
  ease?: Easing | Easing[];
}

/** Opacity switch that hides the round-cap "dot" a 0-length stroke would leave during a delay. */
const reveal = (delay = 0): Track => ({ values: [0, 1], delay, duration: 0.01 });

/**
 * Draw a stroke along its path using Framer Motion's normalised `pathLength`.
 *  - from "start"  : pen moves from the path's first point to its last.
 *  - from "end"    : pen moves backwards (pathOffset 1 → 0).
 *  - from "center" : grows outwards from the middle of the path (pathOffset 0.5 → 0).
 */
export function draw({
  delay = 0,
  duration = 0.4,
  ease = EASE_IN_OUT,
  from = "start",
}: Timing & { from?: "start" | "end" | "center" } = {}): NodeMotion {
  const tracks: NodeMotion["tracks"] = {
    pathLength: { values: [0, 1], delay, duration, ease },
    opacity: reveal(delay),
  };
  if (from === "end") tracks.pathOffset = { values: [1, 0], delay, duration, ease };
  if (from === "center") tracks.pathOffset = { values: [0.5, 0], delay, duration, ease };
  return { tracks };
}

/**
 * A short "comet" dash (pathLength + pathOffset) travels around the shape,
 * then the stroke expands to close the whole outline.
 */
export function trace({ delay = 0, duration = 0.75, segment = 0.22 }: Timing & { segment?: number } = {}): NodeMotion {
  const times = [0, 0.62, 1];
  return {
    tracks: {
      pathLength: { values: [segment, segment, 1], times, delay, duration, ease: EASE_IN_OUT },
      pathOffset: { values: [0, 1 - segment, 0], times, delay, duration, ease: EASE_IN_OUT },
      opacity: reveal(delay),
    },
  };
}

/** Fade a solid fill in (or to a partial opacity) — used after an outline has been drawn. */
export function fillIn({ delay = 0, duration = 0.25, to = 1, rest }: Timing & { to?: number; rest?: number } = {}): NodeMotion {
  return { tracks: { fillOpacity: { values: [0, to], delay, duration, ease: EASE_OUT, rest } } };
}

/** Small elements (dots) pop in from their own centre. */
export function pop({ delay = 0, duration = 0.28 }: Timing = {}): NodeMotion {
  return {
    origin: [0.5, 0.5],
    tracks: {
      opacity: { values: [0, 1], delay, duration: duration * 0.5, ease: EASE_OUT },
      scale: { values: [0, 1], delay, duration, ease: EASE_SPRINGY },
    },
  };
}

/** Translate a node from an offset back into place. */
export function slide({
  x = 0,
  y = 0,
  delay = 0,
  duration = 0.45,
  ease = EASE_OUT,
}: Timing & { x?: number; y?: number }): NodeMotion {
  const tracks: NodeMotion["tracks"] = {};
  if (x) tracks.x = { values: [x, 0], delay, duration, ease };
  if (y) tracks.y = { values: [y, 0], delay, duration, ease };
  return { tracks };
}

/** Arbitrary keyframes for one property (e.g. a bell's swing). */
export function keyframes(
  prop: AnimatedProp,
  values: number[],
  { delay = 0, duration = 0.6, ease = EASE_IN_OUT, origin }: Timing & { origin?: readonly [number, number] } = {},
): NodeMotion {
  return { origin, tracks: { [prop]: { values, delay, duration, ease } } };
}

/** Merge several motions targeting the same node (later tracks win per property). */
export function merge(...motions: NodeMotion[]): NodeMotion {
  return motions.reduce<NodeMotion>(
    (acc, m) => ({ origin: m.origin ?? acc.origin, tracks: { ...acc.tracks, ...m.tracks } }),
    { tracks: {} },
  );
}

/** Unit vector for a direction, in SVG coordinates (y grows downward). */
export function directionVector(direction: Direction = "right"): [number, number] {
  switch (direction) {
    case "up":
      return [0, -1];
    case "down":
      return [0, 1];
    case "left":
      return [-1, 0];
    case "upRight":
      return [Math.SQRT1_2, -Math.SQRT1_2];
    default:
      return [1, 0];
  }
}
