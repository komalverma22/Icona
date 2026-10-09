import type { Transition, Variants } from "framer-motion";
import type { IconVariant } from "../types";
import {
  ACTIVE,
  REST,
  type AnimatableValue,
  type AnimationName,
  type AnimationOptions,
  type AnimationPlan,
  type AnimationRecipe,
  type CompiledAnimation,
  type CompiledNodeMotion,
  type NodeMotion,
  type Track,
} from "./animationTypes";
import { commerceRecipes } from "./animated-icons/commerce";
import { contextualRecipes } from "./animated-icons/contextual";
import { developerRecipes } from "./animated-icons/developer";
import { devicesRecipes } from "./animated-icons/devices";
import { mapsRecipes } from "./animated-icons/maps";
import { natureRecipes } from "./animated-icons/nature";
import { securityRecipes } from "./animated-icons/security";
import { communicationRecipes } from "./animated-icons/communication";
import { coreRecipes } from "./animated-icons/core";
import { filesRecipes } from "./animated-icons/files";
import { mediaRecipes } from "./animated-icons/media";
import { navigationRecipes } from "./animated-icons/navigation";
import { uiRecipes } from "./animated-icons/ui";
import { draw, EASE_OUT, fillIn } from "./primitives";

/**
 * Generic fallback: draws every node in authoring order with a short stagger.
 * Any new icon can use `animation: "draw"` and animate correctly with zero
 * extra code.
 */
const drawRecipe: AnimationRecipe = ({ nodes }) => {
  const plan: AnimationPlan = {};
  nodes
    .filter((n) => !n.animationOnly)
    .forEach((node, i) => {
      plan[node.id] = draw({ delay: i * 0.12, duration: 0.4 });
    });
  return plan;
};

/** The recipe registry. `satisfies` guarantees every AnimationName has a recipe. */
export const iconAnimations = {
  draw: drawRecipe,
  ...coreRecipes,
  ...navigationRecipes,
  ...uiRecipes,
  ...mediaRecipes,
  ...filesRecipes,
  ...communicationRecipes,
  ...commerceRecipes,
  ...developerRecipes,
  ...devicesRecipes,
  ...securityRecipes,
  ...natureRecipes,
  ...mapsRecipes,
  ...contextualRecipes,
} satisfies Record<AnimationName, AnimationRecipe>;

/* -------------------------------------------------------------------------- */
/* Compilation: AnimationPlan → Framer Motion variants                         */
/* -------------------------------------------------------------------------- */

/** How quickly an interrupted / finished animation settles back to the static icon. */
const REST_TRANSITION: Transition = { duration: 0.22, ease: EASE_OUT };

/**
 * Filled bodies: once their outline has been drawn, fade the fill in.
 * Applied automatically so fill variants need no extra recipe code.
 */
function withAutoFill(variant: IconVariant, plan: AnimationPlan): AnimationPlan {
  const next: AnimationPlan = { ...plan };
  for (const node of variant.nodes) {
    if (node.paint !== "fill" || node.knockout) continue;
    const motion = next[node.id];
    const stroke = motion?.tracks.pathLength;
    if (!motion || !stroke || motion.tracks.fillOpacity) continue;
    const delay = (stroke.delay ?? 0) + stroke.duration * 0.7;
    next[node.id] = { ...motion, tracks: { ...motion.tracks, ...fillIn({ delay, duration: 0.25 }).tracks } };
  }
  return next;
}

/**
 * Bake a track's delay into its keyframes. Holding the first keyframe for the
 * delay (instead of using `transition.delay`) means every part of the icon
 * resets to its start state the instant the animation begins — so staggered
 * parts never flash fully-drawn before they start drawing.
 */
function compileTrack(track: Track): { keyframes: AnimatableValue[]; transition: Transition } {
  const { values, duration, delay = 0, ease, times, repeat, repeatType } = track;

  // Looping tracks use a native delay so the hold isn't repeated every cycle.
  if (repeat !== undefined) {
    return { keyframes: values, transition: { duration, delay, ease, times, repeat, repeatType } };
  }

  const relative = times ?? values.map((_, i) => (values.length === 1 ? 1 : i / (values.length - 1)));
  if (delay <= 0) {
    return { keyframes: values, transition: { duration, ease, times: relative } };
  }

  const total = delay + duration;
  const start = delay / total;
  const absolute = [0, ...relative.map((t) => start + (t * duration) / total)];
  const easing = Array.isArray(ease) && typeof ease[0] !== "number" ? ["linear", ...(ease as unknown[])] : ease;
  return {
    keyframes: [values[0], ...values],
    transition: { duration: total, times: absolute, ease: easing as Transition["ease"] },
  };
}

function compileNode(motion: NodeMotion): CompiledNodeMotion {
  const rest: Record<string, AnimatableValue> = {};
  const active: Record<string, AnimatableValue[]> = {};
  const transition: Record<string, Transition> = {};

  for (const [prop, track] of Object.entries(motion.tracks) as [string, Track][]) {
    rest[prop] = track.rest ?? track.values[track.values.length - 1];
    const compiled = compileTrack(track);
    active[prop] = compiled.keyframes;
    transition[prop] = compiled.transition;
  }

  const variants: Variants = {
    [REST]: { ...rest, transition: REST_TRANSITION },
    [ACTIVE]: { ...active, transition },
  };

  const style = motion.origin ? { originX: motion.origin[0], originY: motion.origin[1] } : undefined;
  return { variants, style };
}

const cache = new Map<string, CompiledAnimation>();
const EMPTY: CompiledAnimation = Object.freeze({});

/**
 * Compiled, cached animation for an icon variant. Variants are built once per
 * icon and shared by every render, so cards never recreate animation objects.
 */
export function getIconAnimation(
  variant: IconVariant,
  name: AnimationName | null | undefined = variant.animation,
  options: AnimationOptions = variant.animationOptions ?? {},
): CompiledAnimation {
  if (!name) return EMPTY;
  const cacheKey = `${variant.key}:${name}:${options.direction ?? ""}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const recipe: AnimationRecipe = iconAnimations[name];
  const plan = withAutoFill(variant, recipe({ nodes: variant.nodes, style: variant.style, options }));

  const compiled: Record<string, CompiledNodeMotion> = {};
  for (const [id, motion] of Object.entries(plan)) compiled[id] = compileNode(motion);

  const frozen = Object.freeze(compiled);
  cache.set(cacheKey, frozen);
  return frozen;
}
