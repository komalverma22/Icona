import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, EASE_OUT, merge, pop, slide } from "../primitives";

/** Devices set: connectivity, power, audio. */
export const devicesRecipes = {
  /** Signal dot appears, then each arc radiates outward from its centre. */
  wifi: () => ({
    dot: pop({ duration: 0.25 }),
    a1: draw({ delay: 0.1, duration: 0.25, from: "center", ease: EASE_OUT }),
    a2: draw({ delay: 0.2, duration: 0.28, from: "center", ease: EASE_OUT }),
    a3: draw({ delay: 0.3, duration: 0.3, from: "center", ease: EASE_OUT }),
  }),

  /** Casing draws, then the cells charge up one after another. */
  battery: () => ({
    body: draw({ duration: 0.42 }),
    nub: draw({ delay: 0.2, duration: 0.15 }),
    c1: draw({ delay: 0.3, duration: 0.15, from: "end", ease: EASE_OUT }),
    c2: draw({ delay: 0.4, duration: 0.15, from: "end", ease: EASE_OUT }),
    c3: draw({ delay: 0.5, duration: 0.15, from: "end", ease: EASE_OUT }),
  }),

  /** Capsule draws, the stand cradles it, the stem drops in. */
  mic: () => ({
    capsule: draw({ duration: 0.4 }),
    stand: draw({ delay: 0.22, duration: 0.3, from: "center" }),
    stem: draw({ delay: 0.42, duration: 0.15, ease: EASE_OUT }),
  }),

  /** Headband arcs over, ear cups land on each side. */
  headphones: () => ({
    band: draw({ duration: 0.45, from: "center" }),
    left: merge(pop({ delay: 0.3 }), slide({ x: -1.5, delay: 0.3, duration: 0.3 })),
    right: merge(pop({ delay: 0.36 }), slide({ x: 1.5, delay: 0.36, duration: 0.3 })),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
