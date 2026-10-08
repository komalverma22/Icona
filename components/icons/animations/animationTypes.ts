import type { Easing, MotionStyle, Variants } from "framer-motion";
import type { IconNode, IconStyle } from "../types";

/**
 * Every animation recipe the library knows about.
 * Adding an icon-specific animation = add its name here, write the recipe in
 * `animated-icons/`, and register it in `iconAnimations.ts`.
 */
export type AnimationName =
  | "draw"
  | "check"
  | "checkCircle"
  | "cross"
  | "plus"
  | "minus"
  | "arrow"
  | "chevron"
  | "externalLink"
  | "search"
  | "home"
  | "user"
  | "settings"
  | "heart"
  | "star"
  | "bell"
  | "bookmark"
  | "download"
  | "upload"
  | "menu"
  | "mail"
  | "lock"
  | "calendar"
  | "camera"
  | "trash"
  | "edit"
  | "cloud"
  | "github"
  | "play"
  | "pause"
  | "info"
  | "alert"
  | "copy"
  | "share"
  | "eye"
  | "eyeOff"
  | "filter"
  | "more"
  | "folder"
  | "file"
  | "clock"
  | "loader"
  | "cart"
  | "message"
  | "volume";

export type Direction = "up" | "down" | "left" | "right" | "upRight";

/** Per-icon parameters passed to a recipe (e.g. an arrow's direction). */
export interface AnimationOptions {
  direction?: Direction;
}

/** Properties a node may animate. Path props are Framer Motion's normalised SVG path values. */
export type AnimatedProp =
  | "pathLength"
  | "pathOffset"
  | "pathSpacing"
  | "strokeDasharray"
  | "strokeDashoffset"
  | "opacity"
  | "fillOpacity"
  | "x"
  | "y"
  | "rotate"
  | "scale";

export type AnimatableValue = number | string;

/**
 * One animated property. `values` are the keyframes played when the icon
 * becomes active (hover / focus); the node settles back to `rest` (defaults to
 * the final keyframe) when it becomes inactive.
 */
export interface Track {
  values: AnimatableValue[];
  duration: number;
  /** Seconds before this track starts. The first keyframe is held during the delay. */
  delay?: number;
  ease?: Easing | Easing[];
  /** Keyframe offsets (0–1) relative to this track's own duration. */
  times?: number[];
  repeat?: number;
  repeatType?: "loop" | "reverse" | "mirror";
  rest?: AnimatableValue;
}

/** Animation description for one node of an icon. */
export interface NodeMotion {
  tracks: Partial<Record<AnimatedProp, Track>>;
  /** Transform origin inside the node's own bounding box, as fractions (x, y). */
  origin?: readonly [number, number];
}

/** A recipe's output: node id → motion. Nodes without an entry stay static. */
export type AnimationPlan = Record<string, NodeMotion>;

export interface RecipeContext {
  nodes: readonly IconNode[];
  style: IconStyle;
  options: AnimationOptions;
}

export type AnimationRecipe = (ctx: RecipeContext) => AnimationPlan;

/** Compiled Framer Motion data for one node — cached per icon variant. */
export interface CompiledNodeMotion {
  variants: Variants;
  style?: MotionStyle;
}

export type CompiledAnimation = Readonly<Record<string, CompiledNodeMotion>>;

/** Variant labels shared by every animated icon. */
export const REST = "rest";
export const ACTIVE = "active";
export type IconAnimationState = typeof REST | typeof ACTIVE;
