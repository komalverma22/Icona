import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { directionVector, draw, EASE_OUT, merge, slide } from "../primitives";

const TRAVEL = 3.5;

/** Navigation set: arrows, chevrons, external link. */
export const navigationRecipes = {
  /**
   * Arrow: the shaft draws first, the head follows, and both glide along the
   * arrow's direction so the motion reads as "moving that way".
   */
  arrow: ({ options }) => {
    const [dx, dy] = directionVector(options.direction);
    const travel = { x: -dx * TRAVEL, y: -dy * TRAVEL, duration: 0.5 };
    return {
      shaft: merge(draw({ duration: 0.32, ease: EASE_OUT }), slide(travel)),
      head: merge(draw({ delay: 0.18, duration: 0.28, ease: EASE_OUT }), slide(travel)),
    };
  },

  /** Chevron writes itself (end → tip → end) while nudging in its direction. */
  chevron: ({ options }) => {
    const [dx, dy] = directionVector(options.direction);
    return {
      chevron: merge(draw({ duration: 0.36, ease: EASE_OUT }), slide({ x: -dx * 3, y: -dy * 3, duration: 0.45 })),
    };
  },

  /** Box draws, then the arrow shoots out of it toward the top-right. */
  externalLink: () => {
    const travel = { x: -2.5, y: 2.5, duration: 0.45, delay: 0.15 };
    return {
      box: draw({ duration: 0.42 }),
      shaft: merge(draw({ delay: 0.15, duration: 0.26, ease: EASE_OUT }), slide(travel)),
      head: merge(draw({ delay: 0.27, duration: 0.24, ease: EASE_OUT }), slide(travel)),
    };
  },
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
