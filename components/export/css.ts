import type { Attrs } from "./markup";
import { easeToCss, holds, round, sample, type Ease, type NTrack, type Val } from "./tracks";

/**
 * Turns the tracks of one element into CSS: `@keyframes` blocks, the
 * `animation` shorthand entries that run them, and the idle ("rest") style.
 *
 *  - A lone transform / dash / opacity… track maps to keyframes directly, with
 *    its per-segment easing written into the keyframes.
 *  - Several transform tracks (x + rotate + scale…) share one CSS `transform`,
 *    so they are sampled onto a common timeline and baked into dense keyframes.
 *  - Everything is stretched to one shared period so one-shot animations that
 *    repeat stay in sync, with a short pause between passes.
 */

export interface SpeedMode {
  /** "bake" writes plain durations; "var" divides by `--icona-speed` so components can change it at runtime. */
  mode: "bake" | "var";
  value: number;
}

export interface CssOptions {
  /** Name prefix for `@keyframes`. */
  id: string;
  /** Shared period (seconds) that one-shot tracks are stretched to; ≥ their longest duration. */
  period: number;
  speed: SpeedMode;
  /** Mixed loop + one-shot scenes play one-shots once; pure one-shot scenes repeat. */
  repeatOneShots: boolean;
  /** Seconds before the animations start (staggered copies such as trails). */
  delay?: number;
  /** Maps a raw value (e.g. a filter with px lengths) to the exported unit space. */
  mapValue?: (prop: string, value: Val) => Val;
}

export interface CssBuild {
  keyframes: string[];
  /** `animation` shorthand entries, one per keyframes block. */
  animations: string[];
  /** Declarations for the idle element (the rest pose). */
  rest: string[];
  usesTransform: boolean;
}

const TRANSFORM_ORDER = ["x", "y", "scale", "scaleX", "scaleY", "rotate", "rotateX", "rotateY", "skewX", "skewY"] as const;
const TRANSFORM_PROPS = new Set<string>(TRANSFORM_ORDER);
const DASH_PROPS = new Set(["pathLength", "pathOffset", "pathSpacing"]);
/** Matches the live engine, which sets `perspective: size × 8` on the stage (8 × the 24-unit grid). */
const PERSPECTIVE = 192;

const IDENTITY: Record<string, number> = { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, rotate: 0, rotateX: 0, rotateY: 0, skewX: 0, skewY: 0 };

const SINGLE: Record<string, { css: string; format: (v: Val) => string }> = {
  opacity: { css: "opacity", format: (v) => String(round(Number(v))) },
  fillOpacity: { css: "fill-opacity", format: (v) => String(round(Number(v))) },
  strokeDasharray: { css: "stroke-dasharray", format: (v) => (typeof v === "number" ? String(round(v)) : v) },
  strokeDashoffset: { css: "stroke-dashoffset", format: (v) => `${round(Number(v))}px` },
  filter: { css: "filter", format: String },
  clipPath: { css: "clip-path", format: String },
  d: { css: "d", format: (v) => `path("${v}")` },
};

function transformFn(prop: string, v: number): string {
  const n = round(v);
  switch (prop) {
    case "x":
      return `translateX(${n}px)`;
    case "y":
      return `translateY(${n}px)`;
    case "scale":
    case "scaleX":
    case "scaleY":
      return `${prop}(${n})`;
    default:
      return `${prop}(${n}deg)`;
  }
}

function transformString(props: readonly string[], valueOf: (prop: string) => number): string {
  const fns = TRANSFORM_ORDER.filter((p) => props.includes(p)).map((p) => transformFn(p, valueOf(p)));
  if (props.includes("rotateX") || props.includes("rotateY")) fns.unshift(`perspective(${PERSPECTIVE}px)`);
  return fns.join(" ");
}

const isIdentity = (props: readonly string[], valueOf: (p: string) => number) => props.every((p) => Math.abs(valueOf(p) - IDENTITY[p]) < 1e-6);

interface Frame {
  /** Seconds from the start of the track's own timeline. */
  at: number;
  value: string;
  ease?: Ease;
}

/** `@keyframes` with percent offsets. Frames are expressed in seconds of a period. */
function keyframesBlock(name: string, declaration: string[], frames: Frame[], period: number): string {
  const lines = frames.map((f, i) => {
    const pct = round((f.at / period) * 100, 3);
    const ease = f.ease && i < frames.length - 1 ? `animation-timing-function:${easeToCss(f.ease)};` : "";
    return `  ${pct}%{${declaration.map((d) => `${d}:${f.value}`).join(";")};${ease}}`;
  });
  return `@keyframes ${name}{\n${lines.join("\n")}\n}`;
}

/** Make sure a frame list starts at 0, ends at `period`, and has strictly increasing times. */
function pad(frames: Frame[], period: number): Frame[] {
  const out = [...frames];
  if (out[0].at > 0) out.unshift({ at: 0, value: out[0].value, ease: "linear" });
  const last = out[out.length - 1];
  if (last.at < period - 1e-6) out.push({ at: period, value: last.value });
  return out;
}

const duration = (seconds: number, speed: SpeedMode) =>
  speed.mode === "bake" ? `${round(seconds / speed.value, 3)}s` : `calc(${round(seconds, 3)}s / var(--icona-speed, 1))`;

interface Group {
  kind: "transform" | "dash" | "single";
  props: string[];
  tracks: NTrack[];
}

function groupTracks(tracks: NTrack[]): Group[] {
  const groups: Group[] = [];
  const transform = tracks.filter((t) => TRANSFORM_PROPS.has(t.prop));
  const dash = tracks.filter((t) => DASH_PROPS.has(t.prop));
  if (transform.length) groups.push({ kind: "transform", props: transform.map((t) => t.prop), tracks: transform });
  if (dash.length) groups.push({ kind: "dash", props: dash.map((t) => t.prop), tracks: dash });
  for (const t of tracks) if (SINGLE[t.prop]) groups.push({ kind: "single", props: [t.prop], tracks: [t] });
  return groups;
}

/** Sample a group of tracks onto a common timeline, with `step` seconds between samples at most. */
function bakeFrames(tracks: NTrack[], span: number, evaluate: (time: number) => string, step = 1 / 40): Frame[] {
  const marks = new Set<number>([0, span]);
  for (const t of tracks) {
    const reps = t.loop ? Math.ceil(span / t.duration) : 1;
    for (let r = 0; r < reps; r++) for (const k of t.times) marks.add(round(r * t.duration + k * t.duration, 5));
  }
  const sorted = [...marks].filter((m) => m >= 0 && m <= span + 1e-9).sort((a, b) => a - b);
  const times: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    times.push(sorted[i]);
    const next = sorted[i + 1];
    if (next === undefined) continue;
    const parts = Math.max(1, Math.ceil((next - sorted[i]) / step));
    for (let p = 1; p < parts; p++) times.push(sorted[i] + ((next - sorted[i]) * p) / parts);
  }
  return times.map((at) => ({ at, value: evaluate(at), ease: "linear" as Ease }));
}

const gcd = (a: number, b: number): number => (b < 1e-3 ? a : gcd(b, a % b));
/** Common period of several looping durations (capped so a pathological mix cannot explode). */
function commonPeriod(durations: number[]): number {
  const ms = durations.map((d) => Math.round(d * 1000));
  const lcm = ms.reduce((acc, m) => (acc * m) / gcd(acc, m));
  return Math.min(lcm / 1000, 12) || Math.max(...durations);
}

/** What an element needs in its static markup so that `buildElementCss`'s animations can drive it. */
export function describeTracks(tracks: NTrack[]): { attrs: Attrs; omit: string[]; usesTransform: boolean } {
  const attrs: Attrs = {};
  const omit: string[] = [];
  let usesTransform = false;
  for (const t of tracks) {
    if (TRANSFORM_PROPS.has(t.prop)) usesTransform = true;
    else if (DASH_PROPS.has(t.prop)) attrs.pathLength = 1;
    else if (t.prop === "d") {
      attrs.d = String(t.rest);
      omit.push("d");
    } else if (t.prop === "strokeDasharray" || t.prop === "strokeDashoffset") omit.push(t.prop);
  }
  return { attrs, omit, usesTransform };
}

export function buildElementCss(tracks: NTrack[], o: CssOptions): CssBuild {
  const build: CssBuild = { keyframes: [], animations: [], rest: [], usesTransform: false };
  const map = o.mapValue ?? ((_: string, v: Val) => v);

  groupTracks(tracks).forEach((group, index) => {
    const name = `${o.id}-${index + 1}`;
    const loops = group.tracks.some((t) => t.loop);
    // Looping groups keep their own period; one-shot groups share the scene period.
    const period = loops ? commonPeriod(group.tracks.filter((t) => t.loop).map((t) => t.duration)) : o.period;
    const mirror = loops && group.tracks.every((t) => !t.loop || t.mirror);

    let declaration: string[];
    let frames: Frame[];

    if (group.kind === "transform") {
      build.usesTransform = true;
      declaration = ["transform"];
      const byProp = new Map(group.tracks.map((t) => [t.prop, t]));
      const valueAt = (prop: string, time: number) => Number(sample(byProp.get(prop)!, time));
      if (group.tracks.length === 1) {
        const t = group.tracks[0];
        frames = t.values.map((v, i) => ({ at: t.times[i] * t.duration, value: transformString(group.props, () => Number(v)), ease: t.eases[i] }));
      } else {
        const span = loops ? period : Math.max(...group.tracks.map((t) => t.duration));
        frames = bakeFrames(group.tracks, span, (time) => transformString(group.props, (p) => valueAt(p, time)));
      }
      const restOf = (p: string) => Number(byProp.get(p)!.rest);
      if (!isIdentity(group.props, restOf)) build.rest.push(`transform:${transformString(group.props, restOf)}`);
    } else if (group.kind === "dash") {
      // pathLength / pathOffset / pathSpacing drive one dash pattern; the element is normalised to length 1.
      declaration = ["stroke-dasharray"];
      const byProp = new Map(group.tracks.map((t) => [t.prop, t]));
      const at = (prop: string, time: number, fallback: number) => (byProp.has(prop) ? Number(sample(byProp.get(prop)!, time)) : fallback);
      // The offset rides along inside the same keyframe value so both properties share one timeline.
      const pattern = (length: number, spacing: number, offset: number) => `${round(length)} ${round(spacing)};stroke-dashoffset:${round(-offset)}`;
      if (group.tracks.length === 1 && group.tracks[0].prop === "pathLength") {
        const t = group.tracks[0];
        frames = t.values.map((v, i) => ({ at: t.times[i] * t.duration, value: pattern(Number(v), 1, 0), ease: t.eases[i] }));
      } else {
        const span = loops ? period : Math.max(...group.tracks.map((t) => t.duration));
        frames = bakeFrames(group.tracks, span, (time) => pattern(at("pathLength", time, 1), at("pathSpacing", time, 1), at("pathOffset", time, 0)));
      }
    } else {
      const t = group.tracks[0];
      const single = SINGLE[t.prop];
      declaration = [single.css];
      frames = t.values.map((v, i) => ({ at: t.times[i] * t.duration, value: single.format(map(t.prop, v)), ease: t.eases[i] }));
      if (t.prop === "opacity" || t.prop === "fillOpacity") {
        if (Number(t.rest) !== 1) build.rest.push(`${single.css}:${single.format(t.rest)}`);
      } else if (t.prop === "strokeDasharray" || t.prop === "strokeDashoffset") {
        build.rest.push(`${single.css}:${single.format(t.rest)}`);
      }
    }

    build.keyframes.push(keyframesBlock(name, declaration, pad(frames, period), period));
    // A group that finishes away from its idle value stays there while active, and plays back on a loop.
    const hold = !loops && group.tracks.some(holds);
    const dir = mirror || hold ? " alternate" : "";
    const iter = loops ? "infinite" : o.repeatOneShots ? "var(--icona-iter,1)" : "1";
    const fill = hold ? " forwards" : "";
    const delay = o.delay ? ` ${duration(o.delay, o.speed)}` : "";
    build.animations.push(`${name} ${duration(period, o.speed)} linear${delay} ${iter}${dir}${fill}`);
  });

  return build;
}

/** The period one-shot tracks share: their longest duration plus a pause (when they repeat). */
export function scenePeriod(tracks: NTrack[], pause: number): number {
  const oneShot = tracks.filter((t) => !t.loop);
  const longest = Math.max(0, ...oneShot.map((t) => t.duration));
  return oneShot.length ? longest + pause : 0;
}
