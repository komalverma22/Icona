import { iconVariantsByKey } from "../icons/iconLibrary";
import type { IconVariant } from "../icons/types";
import { catalogFor } from "./catalog";
import { buildEffect, effectTiming } from "./effects";
import { PIXEL_EFFECTS, pixelEffectDuration } from "./pixelEffects";
import type { MotionStyleId, MotionVariant } from "./types";

/**
 * Resolves the motion variants available for an icon variant:
 *   1. the curated, meaning-specific variants from the catalogue (the first is
 *      what a card plays by default)
 *   2. "Classic Draw" — the icon's original path animation (vector icons)
 *   3. "Fill Morph" — morph into the icon's other style, when it has one and
 *      no other morph was curated
 * Results are cached per icon variant so cards get stable object identities.
 */

const cache = new Map<string, readonly MotionVariant[]>();

/** The icon a morph transforms into: "twin" = this icon's other style, otherwise an icon id in the same style. */
export function resolveTwin(v: IconVariant, morphTo?: string): IconVariant | undefined {
  if (!morphTo) return undefined;
  if (morphTo === "twin") return iconVariantsByKey.get(`${v.iconId}-${v.style === "outline" ? "fill" : "outline"}`);
  return iconVariantsByKey.get(`${morphTo}-${v.style}`) ?? iconVariantsByKey.get(`${morphTo}-outline`);
}

export function getMotions(v: IconVariant): readonly MotionVariant[] {
  const hit = cache.get(v.key);
  if (hit) return hit;

  const list: MotionVariant[] = [];
  for (const m of catalogFor(v.iconId)) {
    if (m.morphTo && !resolveTwin(v, m.morphTo)) continue;
    if (m.pixel && (!v.pixel || !PIXEL_EFFECTS[m.pixel])) continue;
    list.push(m);
  }
  if (v.animation && !v.pixel) list.push({ id: "signature", label: "Classic Draw", style: "signature", recipe: v.animation });
  if (!v.pixel && resolveTwin(v, "twin") && !list.some((m) => m.style === "morph")) {
    list.push({ id: "style-morph", label: v.style === "outline" ? "Fill Morph" : "Outline Morph", style: "morph", effect: "gooey-morph", morphTo: "twin" });
  }

  const frozen = Object.freeze(list);
  cache.set(v.key, frozen);
  return frozen;
}

export function motionStyles(v: IconVariant): ReadonlySet<MotionStyleId> {
  return new Set(getMotions(v).map((m) => m.style));
}

/**
 * The variant a card plays: the user's explicit choice for this icon, else
 * the first variant of the selected motion style, else the first variant.
 */
export function resolveMotion(v: IconVariant, style: MotionStyleId | "all", choice?: string): MotionVariant | undefined {
  const list = getMotions(v);
  if (choice) {
    const chosen = list.find((m) => m.id === choice);
    if (chosen) return chosen;
  }
  if (style !== "all") {
    const styled = list.find((m) => m.style === style);
    if (styled) return styled;
  }
  return list[0];
}

/** Approximate length of one play-through (seconds) and whether it keeps looping while active. */
export function motionTiming(v: IconVariant, m: MotionVariant): { duration: number; loops: boolean } {
  let duration = m.recipe ? 1.4 : 0;
  let loops = false;
  const spec = buildEffect(m.effect, { u: 1, exitX: 60, exitY: 60, dir: [1, 0] });
  if (spec) {
    const t = effectTiming(spec);
    duration = Math.max(duration, t.duration);
    loops ||= t.loops;
  }
  const pixel = m.pixel ? PIXEL_EFFECTS[m.pixel] : undefined;
  if (pixel && v.pixel) {
    duration = Math.max(duration, pixelEffectDuration(pixel));
    loops ||= Boolean(pixel.loop);
  }
  return { duration: Math.max(duration, 0.4), loops };
}
