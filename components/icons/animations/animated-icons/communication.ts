import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, EASE_IN_OUT, EASE_OUT, keyframes, merge, pop, slide } from "../primitives";

/** Communication + social sets. */
export const communicationRecipes = {
  /**
   * The bell body swings from its crown while the clapper lags behind it -
   * two separate paths moving, not the whole icon rotating.
   */
  bell: () => ({
    body: keyframes("rotate", [0, 14, -10, 6, -3, 0], { duration: 0.65, ease: EASE_IN_OUT, origin: [0.5, 0] }),
    crown: keyframes("rotate", [0, 14, -10, 6, -3, 0], { duration: 0.65, ease: EASE_IN_OUT, origin: [0.5, 1] }),
    clapper: merge(
      draw({ duration: 0.25, ease: EASE_OUT }),
      keyframes("x", [0, -2.2, 1.8, -1, 0.4, 0], { delay: 0.06, duration: 0.65, ease: EASE_IN_OUT }),
    ),
  }),

  /** Envelope draws, then the flap folds down into place. */
  mail: () => ({
    envelope: draw({ duration: 0.45 }),
    flap: merge(draw({ delay: 0.25, duration: 0.3, from: "center" }), slide({ y: -1.5, delay: 0.25, duration: 0.4 })),
  }),

  /** Bubble draws, then the typing dots appear one by one. */
  message: () => ({
    bubble: draw({ duration: 0.45 }),
    d1: merge(pop({ delay: 0.34 }), slide({ y: 1.5, delay: 0.34, duration: 0.3 })),
    d2: merge(pop({ delay: 0.42 }), slide({ y: 1.5, delay: 0.42, duration: 0.3 })),
    d3: merge(pop({ delay: 0.5 }), slide({ y: 1.5, delay: 0.5, duration: 0.3 })),
  }),

  /** Source node draws, links travel outward, receiving nodes draw. */
  share: () => ({
    source: draw({ duration: 0.3 }),
    link1: draw({ delay: 0.18, duration: 0.22, ease: EASE_OUT }),
    link2: draw({ delay: 0.18, duration: 0.22, ease: EASE_OUT }),
    target1: draw({ delay: 0.34, duration: 0.3 }),
    target2: draw({ delay: 0.34, duration: 0.3 }),
  }),

  /** Octocat silhouette traces itself, then the tail waves in. */
  github: () => ({
    body: draw({ duration: 0.65, ease: EASE_IN_OUT }),
    tail: draw({ delay: 0.45, duration: 0.28, ease: EASE_OUT, from: "end" }),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
