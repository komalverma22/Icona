import type { Easing } from "framer-motion";
import type { Track } from "../icons/animations/animationTypes";
import type { EffectTrack } from "../motion/types";

/**
 * Animation tracks in a form that can be sampled in plain code and written out
 * as CSS keyframes. Recipe tracks (Framer Motion path animations) and effect
 * tracks (whole-icon keyframes) both normalise to `NTrack`, replicating the
 * timing rules the live engine uses: delays are baked in as a held first
 * keyframe, a missing ease means `easeInOut`, and an ease array is per segment.
 */

export type Val = number | string;
export type Bezier = readonly [number, number, number, number];
/** "step" holds each keyframe until the next (frame-by-frame animation). */
export type Ease = "linear" | "step" | Bezier;

export interface NTrack {
  prop: string;
  values: Val[];
  /** 0–1 offsets of each value within `duration`. */
  times: number[];
  /** One easing per segment (`values.length - 1`). */
  eases: Ease[];
  /** Seconds, including any baked-in delay. */
  duration: number;
  loop: boolean;
  /** Loop direction: play forwards then backwards. */
  mirror: boolean;
  /** Value when idle. */
  rest: Val;
}

/* -------------------------------------------------------------------------- */
/* Easing                                                                      */
/* -------------------------------------------------------------------------- */

const NAMED: Record<string, Ease> = {
  linear: "linear",
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  // Framer's circ / back curves, as the closest cubic-bezier.
  circIn: [0.55, 0, 1, 0.45],
  circOut: [0, 0.55, 0.45, 1],
  circInOut: [0.85, 0, 0.15, 1],
  backIn: [0.31, 0.01, 0.66, -0.59],
  backOut: [0.33, 1.53, 0.69, 0.99],
  backInOut: [0.68, -0.6, 0.32, 1.6],
  anticipate: [0.31, 0.01, 0.66, -0.59],
};

const EASE_IN_OUT: Ease = NAMED.easeInOut;

export function resolveEase(ease: unknown): Ease {
  if (ease === undefined) return EASE_IN_OUT;
  if (typeof ease === "string") return NAMED[ease] ?? EASE_IN_OUT;
  if (Array.isArray(ease) && ease.length === 4 && ease.every((n) => typeof n === "number")) return ease as unknown as Bezier;
  return EASE_IN_OUT;
}

/** CSS `animation-timing-function` for an easing. */
export const easeToCss = (e: Ease) => (e === "linear" ? "linear" : e === "step" ? "step-end" : `cubic-bezier(${e.map((n) => round(n)).join(",")})`);

/** Evaluate an easing curve at x ∈ [0, 1]. */
export function easeAt(e: Ease, x: number): number {
  if (e === "step") return x >= 1 ? 1 : 0;
  if (e === "linear" || x <= 0 || x >= 1) return Math.min(1, Math.max(0, x));
  const [x1, y1, x2, y2] = e;
  const bez = (a: number, b: number, t: number) => 3 * a * (1 - t) * (1 - t) * t + 3 * b * (1 - t) * t * t + t * t * t;
  // Solve bezX(t) = x by bisection (monotonic for CSS curves).
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (bez(x1, x2, mid) < x) lo = mid;
    else hi = mid;
  }
  return bez(y1, y2, (lo + hi) / 2);
}

/** Per-segment easings from a framer `ease` (single easing, or one per segment). */
function segmentEases(ease: Easing | Easing[] | undefined, segments: number): Ease[] {
  const perSegment = Array.isArray(ease) && typeof ease[0] !== "number";
  return Array.from({ length: segments }, (_, i) => resolveEase(perSegment ? (ease as Easing[])[i] : ease));
}

/* -------------------------------------------------------------------------- */
/* Normalising                                                                 */
/* -------------------------------------------------------------------------- */

const evenTimes = (n: number) => Array.from({ length: n }, (_, i) => (n === 1 ? 1 : i / (n - 1)));

/** Bake a delay into the keyframes (hold the first value) and settle the segment easings. */
function bake(values: Val[], times: number[] | undefined, duration: number, delay: number, ease: Easing | Easing[] | undefined) {
  const relative = times && times.length === values.length ? times : evenTimes(values.length);
  if (delay <= 0) return { values, times: relative, eases: segmentEases(ease, values.length - 1), duration };
  const total = delay + duration;
  const start = delay / total;
  const eases = segmentEases(ease, values.length - 1);
  return {
    values: [values[0], ...values],
    times: [0, ...relative.map((t) => start + (t * duration) / total)],
    // The extra first segment only holds a value, so its easing is irrelevant.
    eases: ["linear" as Ease, ...eases],
    duration: total,
  };
}

/** A path-recipe track (`Track`), as the Framer Motion variant compiler treats it. */
export function fromRecipeTrack(prop: string, track: Track): NTrack {
  const rest = track.rest ?? track.values[track.values.length - 1];
  if (track.repeat !== undefined) {
    return {
      prop,
      values: track.values,
      times: track.times && track.times.length === track.values.length ? track.times : evenTimes(track.values.length),
      eases: segmentEases(track.ease, track.values.length - 1),
      duration: track.duration,
      loop: track.repeat === Infinity,
      mirror: track.repeatType === "reverse" || track.repeatType === "mirror",
      rest,
    };
  }
  const b = bake(track.values, track.times, track.duration, track.delay ?? 0, track.ease);
  return { prop, ...b, loop: false, mirror: false, rest };
}

/** The tracks of one effect layer: one `NTrack` per animated property. */
export function fromEffectTrack(track: EffectTrack): NTrack[] {
  return Object.entries(track.values).flatMap(([prop, values]) => {
    if (!values?.length) return [];
    const b = bake(values, track.times, track.duration, track.loop ? 0 : (track.delay ?? 0), track.ease);
    return [{ prop, ...b, loop: Boolean(track.loop), mirror: false, rest: values[0] }];
  });
}

/* -------------------------------------------------------------------------- */
/* Sampling                                                                    */
/* -------------------------------------------------------------------------- */

const NUMBER = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

/** Interpolate two values; strings with the same shape (e.g. `blur(0px)`) interpolate number by number. */
export function mix(a: Val, b: Val, p: number): Val {
  if (typeof a === "number" && typeof b === "number") return a + (b - a) * p;
  const sa = String(a);
  const sb = String(b);
  const na = sa.match(NUMBER);
  const nb = sb.match(NUMBER);
  if (na && nb && na.length === nb.length && sa.replace(NUMBER, "#") === sb.replace(NUMBER, "#")) {
    let i = 0;
    return sa.replace(NUMBER, () => {
      const n = Number(na[i]) + (Number(nb[i]) - Number(na[i])) * p;
      i += 1;
      return String(round(n));
    });
  }
  return p < 1 ? a : b;
}

/** Value of a track `time` seconds after the animation starts. */
export function sample(track: NTrack, time: number): Val {
  const { values, times, eases, duration } = track;
  let t = Math.max(0, time);
  if (track.loop && duration > 0) {
    if (track.mirror) {
      const m = t % (duration * 2);
      t = m > duration ? duration * 2 - m : m;
    } else t %= duration;
  }
  const x = duration > 0 ? Math.min(1, t / duration) : 1;
  if (x <= times[0]) return values[0];
  for (let i = 0; i < values.length - 1; i++) {
    if (x <= times[i + 1]) {
      const span = times[i + 1] - times[i];
      const k = span > 0 ? (x - times[i]) / span : 1;
      return mix(values[i], values[i + 1], easeAt(eases[i], k));
    }
  }
  return values[values.length - 1];
}

/** Does a one-shot track finish somewhere other than its idle value (an effect that "holds" until the pointer leaves)? */
export const holds = (track: NTrack) => !track.loop && String(track.values[track.values.length - 1]) !== String(track.rest);

/* -------------------------------------------------------------------------- */
/* Number formatting                                                           */
/* -------------------------------------------------------------------------- */

export function round(n: number, digits = 4) {
  const f = 10 ** digits;
  const r = Math.round(n * f) / f;
  return Object.is(r, -0) ? 0 : r;
}
