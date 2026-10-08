import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, EASE_IN_OUT, EASE_OUT, merge, slide } from "../primitives";

/** Files set: transfer, storage and documents. */
export const filesRecipes = {
  /** The arrow is drawn downward and drops into the tray. */
  download: () => ({
    shaft: merge(draw({ duration: 0.3, ease: EASE_OUT }), slide({ y: -3.5, duration: 0.5 })),
    head: merge(draw({ delay: 0.15, duration: 0.28, ease: EASE_OUT }), slide({ y: -3.5, duration: 0.5 })),
  }),

  /** The arrow is drawn upward and rises out of the tray. */
  upload: () => ({
    shaft: merge(draw({ duration: 0.3, ease: EASE_OUT }), slide({ y: 3.5, duration: 0.5 })),
    head: merge(draw({ delay: 0.15, duration: 0.28, ease: EASE_OUT }), slide({ y: 3.5, duration: 0.5 })),
  }),

  /** The cloud's outline flows around its puffs. */
  cloud: () => ({
    cloud: draw({ duration: 0.6, ease: EASE_IN_OUT }),
  }),

  /** Folder outline draws, then the pocket line closes it. */
  folder: () => ({
    folder: draw({ duration: 0.5 }),
    pocket: draw({ delay: 0.32, duration: 0.24, ease: EASE_OUT }),
  }),

  /** Page draws, the corner folds over, and lines are written. */
  file: () => ({
    page: draw({ duration: 0.45 }),
    corner: draw({ delay: 0.26, duration: 0.18, ease: EASE_OUT }),
    line1: draw({ delay: 0.38, duration: 0.2, ease: EASE_OUT }),
    line2: draw({ delay: 0.46, duration: 0.16, ease: EASE_OUT }),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
