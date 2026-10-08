import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, merge, slide } from "../primitives";

/** Commerce set. */
export const commerceRecipes = {
  /** Basket draws while rolling in; wheels are drawn as it arrives. */
  cart: () => ({
    basket: merge(draw({ duration: 0.5 }), slide({ x: -2, duration: 0.55 })),
    wheel1: merge(draw({ delay: 0.3, duration: 0.25 }), slide({ x: -2, duration: 0.55 })),
    wheel2: merge(draw({ delay: 0.36, duration: 0.25 }), slide({ x: -2, duration: 0.55 })),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
