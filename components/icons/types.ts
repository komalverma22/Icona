import type { AnimationName, AnimationOptions } from "./animations/animationTypes";

/** Visual styles an icon can be published in. */
export type IconStyle = "outline" | "fill";

/** Pixel sizes every icon is designed to render at (24px grid, scaled). */
export type IconSize = 24 | 32 | 48;

export const ICON_SIZES: readonly IconSize[] = [24, 32, 48] as const;

/** Sets shown in the sidebar. */
export type CategoryId =
  | "core"
  | "ui"
  | "navigation"
  | "communication"
  | "media"
  | "files"
  | "commerce"
  | "social";

/**
 * How a node is painted.
 *  - "stroke"   : 1.5px outline (inherits from the <svg> root) — the default.
 *  - "fill"     : solid shape (fill + matching stroke so silhouettes match outline icons).
 *  - "fillOnly" : solid shape with no stroke (e.g. a heart's inner fill layer).
 */
export type NodePaint = "stroke" | "fill" | "fillOnly";

type Geometry =
  | { type: "path"; d: string }
  | { type: "circle"; cx: number; cy: number; r: number }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number };

/**
 * One drawable SVG element of an icon.
 * `id` is the semantic part name ("shaft", "head", "body"…) that animation
 * recipes target — outline and fill variants share ids so a single recipe
 * animates both.
 */
export type IconNode = Geometry & {
  id: string;
  paint?: NodePaint;
  /**
   * Knock-out detail for filled icons: rendered inside an SVG <mask> so it
   * cuts through the filled body (e.g. the check inside a filled circle).
   */
  knockout?: boolean;
  /** Exists only to support an animation (hidden at rest, excluded from copy). */
  animationOnly?: boolean;
  /** Extra static presentation attributes (camelCase React names). */
  attrs?: { strokeDasharray?: string; strokeDashoffset?: number; strokeOpacity?: number; transform?: string };
};

/** Authoring format for a single icon (all of its styles). */
export interface IconDefinition {
  id: string;
  name: string;
  category: CategoryId;
  subcategory?: string;
  tags: string[];
  sizes: readonly IconSize[];
  /** Name of the animation recipe; omit for static icons. */
  animation?: AnimationName;
  animationOptions?: AnimationOptions;
  outline?: IconNode[];
  fill?: IconNode[];
}

/** A renderable entry in the grid — one icon in one style. */
export interface IconVariant {
  /** Unique key, e.g. "heart-fill". Also the key used for favourites. */
  key: string;
  iconId: string;
  name: string;
  category: CategoryId;
  subcategory?: string;
  tags: string[];
  sizes: readonly IconSize[];
  style: IconStyle;
  animated: boolean;
  animation?: AnimationName;
  animationOptions?: AnimationOptions;
  nodes: IconNode[];
  /** Pre-computed lowercase search haystack. */
  searchText: string;
}
