import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, EASE_OUT, merge, slide } from "../primitives";

/** Commerce set. */
export const commerceRecipes = {
  /** Basket draws while rolling in; wheels are drawn as it arrives. */
  cart: () => ({
    basket: merge(draw({ duration: 0.5 }), slide({ x: -2, duration: 0.55 })),
    wheel1: merge(draw({ delay: 0.3, duration: 0.25 }), slide({ x: -2, duration: 0.55 })),
    wheel2: merge(draw({ delay: 0.36, duration: 0.25 }), slide({ x: -2, duration: 0.55 })),
  }),

  /** Box draws, the lid drops on, the ribbon and bow are tied. */
  gift: () => ({
    box: draw({ duration: 0.4 }),
    lid: merge(draw({ delay: 0.12, duration: 0.35 }), slide({ y: -3, delay: 0.12, duration: 0.45 })),
    ribbon: draw({ delay: 0.3, duration: 0.25, ease: EASE_OUT }),
    bowLeft: draw({ delay: 0.42, duration: 0.25, ease: EASE_OUT }),
    bowRight: draw({ delay: 0.42, duration: 0.25, ease: EASE_OUT }),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
