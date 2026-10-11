import { getIconPlan } from "../icons/animations/iconAnimations";
import { directionVector } from "../icons/animations/primitives";
import { PIXEL_UNIT, pixelsToPath, SHADE_OPACITY } from "../icons/pixelArt";
import { maskIdFor, VIEWBOX } from "../icons/svgAttributes";
import type { IconNode, IconVariant } from "../icons/types";
import { buildEffect } from "../motion/effects";
import type { BurstCue, EmitCue, ParticleScript } from "../motion/particles";
import { PIXEL_EFFECTS, pixelContext, type PixelFrame } from "../motion/pixelEffects";
import { resolveTwin } from "../motion/registry";
import type { EffectSpec, EffectTarget, MotionVariant } from "../motion/types";
import { buildElementCss, describeTracks, scenePeriod, type SpeedMode } from "./css";
import { el, type El } from "./markup";
import { iconSlug } from "./naming";
import { motionOf, type ExportOptions } from "./options";
import { nodeEl, stillTree } from "./static";
import { fromEffectTrack, fromRecipeTrack, holds, round, sample, type NTrack, type Val } from "./tracks";

/**
 * Builds an exportable scene — an SVG element tree plus the CSS that animates
 * it — for one icon variant and one motion variant. A scene is everything
 * except the file / component wrapper, so the SVG file, the React component,
 * the HTML snippet and the GIF / APNG frame renderer all share it.
 */

/** Pause between passes when a one-shot animation repeats (matches the Animation Studio's loop). */
export const LOOP_PAUSE = 0.6;
/** Distance, in grid units, that moves the icon fully outside its 24-unit box. */
const EXIT = 26;
const TRAIL_OPACITY = [0.34, 0.2, 0.12, 0.07];
const GLITCH_INK = { glitchA: "#22d3ee", glitchB: "#ff3b6b" } as const;

export type Tier = "static" | "animated" | "interactive";

export interface MotionInfo {
  tier: Tier;
  motion?: MotionVariant;
  /** Seconds for one pass (0 for static). */
  duration: number;
  /** Keeps running for as long as the icon is active. */
  loops: boolean;
  /** The animation includes canvas particles (not representable in a plain SVG). */
  particles: boolean;
  /** Pixel-art frame animation. */
  pixel: boolean;
  /** Seconds for the exported loop to come back to its start (includes the pause, and the return trip for "hold" effects). */
  loopSeconds: number;
  /** Why this motion cannot be exported as an animation (tier "interactive"). */
  reason?: string;
  /** Things worth telling the user about how this export behaves. */
  notes: string[];
}

export interface Scene {
  info: MotionInfo;
  /** CSS scope class, e.g. `icona-heart-fill-jelly`. */
  scope: string;
  viewBox: string;
  /** Rendered size of the <svg> in px. */
  width: number;
  height: number;
  strokeWidth: number;
  body: El[];
  /** Full stylesheet; empty when nothing in the SVG itself animates. */
  css: string;
  /** Particle cues to run on top (React component and raster exports). */
  script?: ParticleScript;
  /** Start delays (seconds) of staggered layers, by class — frame capture has to preserve them. */
  delays: Record<string, number>;
  /** Where the icon layer has moved to `seconds` into a pass, in grid units (particles that "follow" the icon use it). */
  followAt: (seconds: number) => [number, number];
}

const idle = (motion?: MotionVariant, reason?: string): MotionInfo => ({
  tier: reason ? "interactive" : "static",
  motion,
  duration: 0,
  loopSeconds: 0,
  loops: false,
  particles: false,
  pixel: false,
  reason,
  notes: [],
});

const PARTICLE_NOTE = "Particles are drawn on a canvas, so a standalone SVG file leaves them out. The React component, GIF and APNG include them.";

/** Convert CSS px lengths in a value from on-screen px (at the export size) to SVG user units. */
const pxToUnits =
  (size: number) =>
  (_: string, value: Val): Val =>
    typeof value === "string" ? value.replace(/(-?\d*\.?\d+)px/g, (_m, n: string) => `${round(Number(n) * (24 / size))}px`) : value;

function particleScript(spec: EffectSpec | null): ParticleScript | undefined {
  if (!spec) return undefined;
  const bursts: BurstCue[] = (spec.particles ?? []).map((c) => ({ ...c }));
  const emitters: EmitCue[] = (spec.emitters ?? []).map(({ path, ...e }) => ({
    ...e,
    path: path ? Array.from({ length: 25 }, (_, i) => path(i / 24).map((n) => round(n, 3)) as [number, number]) : undefined,
  }));
  return bursts.length || emitters.length ? { bursts, emitters } : undefined;
}

/** One animated element: its class, tracks and static declarations (the rest pose is added from the tracks). */
interface Layer {
  cls: string;
  tracks: NTrack[];
  base?: string[];
  delay?: number;
}

const FX_BOX = ["transform-box:view-box"];

/** Does this motion react to the pointer (so it can only exist live, not in a file)? */
export const isInteractive = (motion: MotionVariant) =>
  Boolean(motion.effect && buildEffect(motion.effect, { u: 1, exitX: EXIT, exitY: EXIT, dir: [1, 0] })?.cursor);

export function buildScene(variant: IconVariant, options: ExportOptions, speed: SpeedMode): Scene {
  const motion = motionOf(variant, options);
  const slug = iconSlug(variant, motion);
  const scope = `icona-${slug}`;
  const common = { scope, strokeWidth: options.strokeWidth };
  const still = (info: MotionInfo): Scene => ({ ...common, info, viewBox: VIEWBOX, width: options.size, height: options.size, body: stillTree(variant), css: "", delays: {}, followAt: () => [0, 0] });

  if (!motion) return still(idle());

  const dir = directionVector(motion.recipeOptions?.direction ?? variant.animationOptions?.direction);
  const spec = buildEffect(motion.effect, { u: 1, exitX: EXIT, exitY: EXIT, dir });
  if (spec?.cursor) {
    return still(idle(motion, "This animation follows the pointer (tilt, magnetic, look-at), so it can't be captured in a file. Static exports are available."));
  }

  const layers: Layer[] = [];
  let viewBox = VIEWBOX;
  let width = options.size;
  let height = options.size;
  let content: El[];
  let pixelLoops = false;

  /* Content: pixel frames, path-animated nodes, or the still icon ----------- */

  const art = variant.pixel;
  const pixelFx = motion.pixel ? PIXEL_EFFECTS[motion.pixel] : undefined;
  const plan = !art && motion.recipe ? getIconPlan(variant, motion.recipe, motion.recipeOptions ?? variant.animationOptions) : {};

  if (art && pixelFx) {
    const alt = motion.morphTo ? resolveTwin(variant, motion.morphTo)?.pixel : undefined;
    const built = pixelFrames(variant, pixelFx, pixelContext(art, alt));
    content = built.content;
    layers.push(...built.layers);
    viewBox = built.viewBox;
    width = (options.size * built.box.w) / 24;
    height = (options.size * built.box.h) / 24;
    pixelLoops = Boolean(pixelFx.loop);
  } else if (Object.keys(plan).length) {
    let n = 0;
    content = mapNodes(variant, (node) => {
      const nodeMotion = plan[node.id];
      if (!nodeMotion) return node.animationOnly ? null : nodeEl(node);
      const tracks = Object.entries(nodeMotion.tracks).map(([prop, track]) => fromRecipeTrack(prop, track!));
      const cls = `n${++n}`;
      const { attrs, omit, usesTransform } = describeTracks(tracks);
      const [ox, oy] = nodeMotion.origin ?? [0.5, 0.5];
      layers.push({ cls, tracks, base: usesTransform ? ["transform-box:fill-box", `transform-origin:${round(ox * 100)}% ${round(oy * 100)}%`] : [] });
      return nodeEl(node, { class: cls, ...attrs }, new Set(omit));
    });
  } else {
    content = stillTree(variant);
  }

  /* Whole-icon effect layers ------------------------------------------------- */

  const byTarget = new Map<EffectTarget, NTrack[]>();
  for (const track of spec?.tracks ?? []) {
    const target = track.target ?? "icon";
    byTarget.set(target, [...(byTarget.get(target) ?? []), ...fromEffectTrack(track)]);
  }
  const iconTracks = byTarget.get("icon") ?? [];
  const origin = `transform-origin:${spec?.origin ?? "50% 50%"}`;

  const behind: El[] = [];
  const fx: El[] = [];
  const outer: El[] = [];

  for (let i = 0; i < (spec?.layers?.trail ?? 0); i++) {
    const delay = (i + 1) * 0.05;
    const total = Math.max(0, ...iconTracks.map((t) => t.duration)) + delay;
    const k = TRAIL_OPACITY[i] ?? 0.05;
    const cls = `tr${i + 1}`;
    layers.push({
      cls,
      delay,
      base: ["opacity:0", origin, ...FX_BOX],
      tracks: [
        ...iconTracks.filter((t) => t.prop !== "opacity"),
        { prop: "opacity", values: [0, k, k, 0], times: [0, 0.08, 0.8, 1], eases: ["linear", "linear", "linear"], duration: total, loop: false, mirror: false, rest: 0 },
      ],
    });
    behind.push(el("g", { class: cls }, stillTree(variant, cls)));
  }

  if (spec?.layers?.glitch) {
    for (const target of ["glitchA", "glitchB"] as const) {
      const cls = target === "glitchA" ? "ga" : "gb";
      layers.push({ cls, tracks: hidden(byTarget.get(target)), base: ["opacity:0", "mix-blend-mode:multiply", "transform-origin:50% 50%", ...FX_BOX] });
      behind.push(el("g", { class: cls }, stillTree(variant, cls, { ink: GLITCH_INK[target] })));
    }
  }

  if (spec?.layers?.glow) {
    const blur = Math.max(2, options.size / 9) * (24 / options.size);
    layers.push({ cls: "gl", tracks: hidden(byTarget.get("glow")), base: ["opacity:0", `filter:blur(${round(blur)}px)`] });
    fx.push(el("g", { class: "gl" }, stillTree(variant, "gl")));
  }

  fx.push(...content);

  if (spec?.layers?.shine) {
    layers.push({ cls: "sh", tracks: byTarget.get("shine") ?? [] });
    fx.push(
      el("defs", {}, [
        el("mask", { id: "shine-mask", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 24, height: 24 }, stillTree(variant, "sh", { ink: "#fff" })),
        el("linearGradient", { id: "shine-grad", gradientUnits: "userSpaceOnUse", x1: -2.2, y1: 8.2, x2: 26.2, y2: 15.8 }, [
          el("stop", { offset: "18%", stopColor: "#fff", stopOpacity: 0 }),
          el("stop", { offset: "36%", stopColor: "#fff", stopOpacity: 0.7 }),
          el("stop", { offset: "50%", stopColor: "#fff" }),
          el("stop", { offset: "64%", stopColor: "#fff", stopOpacity: 0.7 }),
          el("stop", { offset: "82%", stopColor: "#fff", stopOpacity: 0 }),
        ]),
      ]),
      el("g", { mask: "url(#shine-mask)" }, [el("rect", { class: "sh", x: 0, y: 0, width: 24, height: 24, fill: "url(#shine-grad)", stroke: "none" })]),
    );
  }

  if (iconTracks.length) layers.push({ cls: "fx", tracks: iconTracks, base: [origin, ...FX_BOX] });

  if (spec?.layers?.twin) {
    const twin = resolveTwin(variant, motion.morphTo);
    if (twin) {
      layers.push({ cls: "tw", tracks: hidden(byTarget.get("twin")), base: ["opacity:0", "transform-origin:50% 50%", ...FX_BOX] });
      outer.push(el("g", { class: "tw" }, stillTree(twin, "tw")));
    }
  }

  const body = [...behind, el("g", { class: "fx" }, fx), ...outer];
  const script = particleScript(spec);
  const xTrack = iconTracks.find((t) => t.prop === "x");
  const yTrack = iconTracks.find((t) => t.prop === "y");
  const followAt = (seconds: number): [number, number] => [xTrack ? Number(sample(xTrack, seconds * options.speed)) : 0, yTrack ? Number(sample(yTrack, seconds * options.speed)) : 0];

  /* Timing and stylesheet ---------------------------------------------------- */

  const tracks = layers.flatMap((l) => l.tracks);
  const loops = tracks.some((t) => t.loop);
  const oneShots = tracks.filter((t) => !t.loop);
  const notes: string[] = [];
  if (script) notes.push(PARTICLE_NOTE);

  const timing = {
    duration: Math.max(0, ...tracks.map((t) => t.duration)),
    loops: loops || pixelLoops,
  };

  if (!tracks.length) {
    // Nothing in the SVG itself animates (a particles-only effect).
    return {
      ...common,
      info: { tier: "animated", motion, loops: timing.loops, duration: 1, loopSeconds: 1 + LOOP_PAUSE, particles: Boolean(script), pixel: false, notes },
      viewBox,
      width,
      height,
      body,
      css: "",
      script,
      delays: {},
      followAt,
    };
  }

  const period = scenePeriod(tracks, LOOP_PAUSE);
  const repeatOneShots = !loops;
  const css = new CssWriter(scope);
  for (const layer of layers) {
    const built = buildElementCss(layer.tracks, { id: `${scope}-${layer.cls}`, period, speed, repeatOneShots, delay: layer.delay, mapValue: pxToUnits(options.size) });
    css.element(layer.cls, [...(layer.base ?? []), ...built.rest], built.keyframes, built.animations);
  }
  if (repeatOneShots) css.raw(`${css.s}[data-animate="loop"]{--icona-iter:infinite}`);
  css.raw(`@media (prefers-reduced-motion:reduce){${css.s} *{animation:none!important}}`);

  if (tracks.some((t) => t.prop === "d")) notes.push("Path morphing uses the CSS `d` property: Chromium and Firefox animate it, Safari keeps the static icon.");
  if (tracks.some((t) => t.prop === "rotateX" || t.prop === "rotateY")) notes.push("3D rotation uses CSS perspective transforms.");
  if (loops && oneShots.some((t) => t.prop !== "opacity")) notes.push("Mixes a looping and a one-shot movement; the one-shot restarts with each loop.");

  const longestLoop = Math.max(0, ...tracks.filter((t) => t.loop).map((t) => t.duration));
  const holding = oneShots.some(holds);
  const info: MotionInfo = {
    tier: "animated",
    motion,
    duration: Math.max(...oneShots.map((t) => t.duration), longestLoop),
    loopSeconds: (loops ? Math.max(longestLoop, ...(oneShots.length ? [period] : [])) : period * (holding ? 2 : 1)) / options.speed,
    loops: timing.loops,
    particles: Boolean(script),
    pixel: Boolean(art && pixelFx),
    notes,
  };
  const delays = Object.fromEntries(layers.filter((l) => l.delay).map((l) => [l.cls, l.delay!]));
  return { ...common, info, viewBox, width, height, body, css: css.toString(), script, delays, followAt };
}

/** A hidden layer idles at opacity 0 whatever its first keyframe says. */
const hidden = (tracks: NTrack[] = []): NTrack[] => tracks.map((t) => (t.prop === "opacity" ? { ...t, rest: 0 } : t));

/** Build the nodes of the still icon through `make` (which may skip a node), keeping knock-out masks intact. */
function mapNodes(variant: IconVariant, make: (node: IconNode) => El | null): El[] {
  const build = (nodes: IconNode[]) => nodes.flatMap((n) => make(n) ?? []);
  const knockouts = variant.nodes.filter((n) => n.knockout);
  const body = variant.nodes.filter((n) => !n.knockout);
  if (!knockouts.length) return build(body);
  const id = maskIdFor(variant);
  return [
    el("defs", {}, [el("mask", { id, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 24, height: 24 }, [el("rect", { width: 24, height: 24, fill: "#fff", stroke: "none" }), ...build(knockouts)])]),
    el("g", { mask: `url(#${id})` }, build(body)),
  ];
}

/* -------------------------------------------------------------------------- */
/* Pixel art                                                                   */
/* -------------------------------------------------------------------------- */

function framePaths(frame: PixelFrame): El[] {
  const groups = new Map<string, PixelFrame["pixels"]>();
  for (const p of frame.pixels) {
    const k = p.c ?? (p.t === 2 ? "shade" : "solid");
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  return [...groups].map(([k, pixels]) =>
    el("path", {
      d: pixelsToPath(pixels, PIXEL_UNIT),
      fill: k === "solid" || k === "shade" ? "currentColor" : k,
      fillOpacity: k === "shade" ? (frame.shade ?? SHADE_OPACITY) : undefined,
      stroke: "none",
    }),
  );
}

/** Frame-by-frame animation: each distinct frame is a group shown for its time slots with stepped (never tweened) opacity. */
function pixelFrames(variant: IconVariant, fx: (typeof PIXEL_EFFECTS)[string], ctx: ReturnType<typeof pixelContext>) {
  const rendered = Array.from({ length: fx.frames }, (_, f) => fx.render(f, ctx));
  const duration = fx.frames / fx.fps;
  const loop = Boolean(fx.loop);

  // Identical frames share one group.
  const groups = new Map<string, { frame: PixelFrame; slots: number[] }>();
  rendered.forEach((frame, f) => {
    const key = JSON.stringify([frame.pixels, frame.shade, frame.alpha]);
    const g = groups.get(key);
    if (g) g.slots.push(f);
    else groups.set(key, { frame, slots: [f] });
  });

  // Bounds of every pixel ever drawn, so flying pixels aren't clipped.
  let minX = 0;
  let minY = 0;
  let maxX = 24;
  let maxY = 24;
  for (const frame of rendered) {
    for (const p of frame.pixels) {
      minX = Math.min(minX, p.x * PIXEL_UNIT);
      minY = Math.min(minY, p.y * PIXEL_UNIT);
      maxX = Math.max(maxX, (p.x + 1) * PIXEL_UNIT);
      maxY = Math.max(maxY, (p.y + 1) * PIXEL_UNIT);
    }
  }
  const box = { x: Math.floor(minX), y: Math.floor(minY), w: 0, h: 0 };
  box.w = Math.ceil(maxX) - box.x;
  box.h = Math.ceil(maxY) - box.y;

  const stepped = (points: [number, number][], rest: number): NTrack => ({
    prop: "opacity",
    values: points.map((p) => p[1]),
    times: points.map((p) => p[0] / duration),
    eases: points.slice(1).map(() => "step" as const),
    duration,
    loop,
    mirror: false,
    rest,
  });

  const layers: Layer[] = [];
  const frames: El[] = [];
  let i = 0;
  for (const { frame, slots } of groups.values()) {
    const cls = `f${++i}`;
    const alpha = frame.alpha ?? 1;
    const points: [number, number][] = [];
    for (const f of slots) {
      const a = f / fx.fps;
      if (points.length && Math.abs(points[points.length - 1][0] - a) < 1e-9) points.pop();
      else if (!points.length && a > 0) points.push([0, 0]);
      points.push([a, alpha], [(f + 1) / fx.fps, 0]);
    }
    if (points[points.length - 1][0] < duration - 1e-9) points.push([duration, 0]);
    layers.push({ cls, base: ["opacity:0"], tracks: [stepped(points, 0)] });
    frames.push(el("g", { class: cls }, framePaths(frame)));
  }

  // The still icon shows while idle and hides while the frames play.
  layers.push({ cls: "st", tracks: [stepped(loop ? [[0, 0], [duration, 0]] : [[0, 0], [duration, 1]], 1)] });

  return {
    box,
    viewBox: `${box.x} ${box.y} ${box.w} ${box.h}`,
    layers,
    content: [el("g", { class: "st" }, stillTree(variant)), ...frames],
  };
}

/* -------------------------------------------------------------------------- */
/* Stylesheet assembly                                                         */
/* -------------------------------------------------------------------------- */

class CssWriter {
  readonly s: string;
  private rules: string[] = [];
  private frames: string[] = [];
  private triggers: string[] = [];

  constructor(scope: string) {
    this.s = `.${scope}`;
  }

  element(cls: string, declarations: string[], keyframes: string[], animations: string[]) {
    // Later declarations of the same property win (e.g. a layer's base vs. its rest pose).
    const byProperty = new Map(declarations.map((d) => [d.slice(0, d.indexOf(":")), d] as const));
    if (byProperty.size) this.rules.push(`${this.s} .${cls}{${[...byProperty.values()].join(";")}}`);
    this.frames.push(...keyframes);
    if (animations.length) {
      const sel = `${this.s}[data-animate="loop"] .${cls},${this.s}[data-animate="hover"]:is(:hover,:focus-visible) .${cls}`;
      this.triggers.push(`${sel}{animation:${animations.join(",")}}`);
    }
  }

  raw(rule: string) {
    this.triggers.push(rule);
  }

  toString() {
    return [...this.rules, ...this.frames, ...this.triggers].join("\n");
  }
}
