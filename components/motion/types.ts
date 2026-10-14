import type { Easing } from "framer-motion";
import type { AnimationName, AnimationOptions } from "../icons/animations/animationTypes";
import type { ParticlePresetId } from "./particles";

export type { ParticlePresetId };

/**
 * Motion variants - the hover animations an icon can play.
 *
 * A variant combines up to three independent layers:
 *  - `recipe` : a node-level path recipe (the existing engine: parts of the icon move)
 *  - `effect` : a whole-icon effect (wrapper keyframes, 3D, cursor reaction,
 *               glitch / trail / morph / shine layers, particle cues)
 *  - `pixel`  : a frame-by-frame pixel-art animation (pixel icons only)
 */

export type MotionStyleId =
  | "signature"
  | "motion"
  | "shake"
  | "explosive"
  | "physics"
  | "morph"
  | "3d"
  | "elastic"
  | "particles"
  | "loop"
  | "light"
  | "cursor"
  | "pixel"
  | "experimental";

export interface MotionVariant {
  /** Unique within its icon, e.g. "drive-forward". */
  id: string;
  label: string;
  style: MotionStyleId;
  recipe?: AnimationName;
  recipeOptions?: AnimationOptions;
  effect?: EffectId;
  /** Icon key the "morph" layer transforms into (e.g. "moon-outline"); "twin" = the other style of this icon. */
  morphTo?: string;
  pixel?: PixelEffectId;
}

/* -------------------------------------------------------------------------- */
/* Whole-icon effects                                                          */
/* -------------------------------------------------------------------------- */

/** Animatable properties of an effect layer (HTML element transforms + paint). */
export type WrapperProp =
  | "x"
  | "y"
  | "rotate"
  | "scale"
  | "scaleX"
  | "scaleY"
  | "skewX"
  | "skewY"
  | "rotateX"
  | "rotateY"
  | "opacity"
  | "filter"
  | "clipPath";

/** Which element a track animates. */
export type EffectTarget = "icon" | "twin" | "trail" | "glitchA" | "glitchB" | "shine" | "glow";

export interface EffectTrack {
  target?: EffectTarget;
  values: Partial<Record<WrapperProp, (number | string)[]>>;
  duration: number;
  delay?: number;
  ease?: Easing | Easing[];
  times?: number[];
  /** Repeat for as long as the icon stays active. */
  loop?: boolean;
  repeatDelay?: number;
}

/** A one-shot burst at a moment of the effect. Coordinates are on the 24px icon grid. */
export interface ParticleCue {
  at: number;
  preset: ParticlePresetId;
  x?: number;
  y?: number;
  /** Direction in degrees (0 = right, -90 = up) and cone width, for directional presets. */
  angle?: number;
  spread?: number;
  count?: number;
  /** Emit relative to the icon's current (moved) position instead of its rest position. */
  follow?: boolean;
}

/** A continuous emitter that runs while the icon is active (or for `duration`). */
export interface EmitterCue extends Omit<ParticleCue, "count"> {
  /** Particles per second. */
  rate: number;
  /** Stop after this many seconds (default: while active). */
  duration?: number;
  /** Optional moving origin: x/y as a function of progress 0-1 over `duration`. */
  path?: (p: number) => [number, number];
}

export type CursorMode = "tilt" | "magnetic" | "repel" | "look";

export interface EffectSpec {
  tracks: EffectTrack[];
  /** CSS transform-origin of the icon layer. */
  origin?: string;
  particles?: ParticleCue[];
  emitters?: EmitterCue[];
  cursor?: CursorMode;
  /** Extra layers this effect needs. */
  layers?: { twin?: boolean; trail?: number; glitch?: boolean; shine?: boolean; glow?: boolean };
}

/** Values available when an effect is built (all lengths in CSS px). */
export interface EffectContext {
  /** px per icon-grid unit (size / 24). */
  u: number;
  /** Distance that moves the icon fully out of its stage, horizontally / vertically. */
  exitX: number;
  exitY: number;
  /** Direction vector from the icon's own options (arrows), default right. */
  dir: [number, number];
}

export type EffectFactory = (ctx: EffectContext) => EffectSpec;

export type EffectId = string;
export type PixelEffectId = string;
