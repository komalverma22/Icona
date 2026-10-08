import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, EASE_OUT, merge, keyframes } from "../primitives";

/** Security set. */
export const securityRecipes = {
  /** Ridges are traced from the core outward, like a sensor reading a finger. */
  fingerprint: () => ({
    r1: draw({ duration: 0.3, ease: EASE_OUT }),
    r2: draw({ delay: 0.08, duration: 0.34 }),
    r3: draw({ delay: 0.16, duration: 0.34 }),
    r4: draw({ delay: 0.24, duration: 0.38 }),
    r5: draw({ delay: 0.32, duration: 0.38 }),
    r6: draw({ delay: 0.4, duration: 0.32, from: "center" }),
  }),

  /** Bow draws, the blade slides out of it, teeth are cut, then a quarter turn. */
  key: () => ({
    bow: merge(draw({ duration: 0.36 }), keyframes("rotate", [0, 0, -25, 0], { duration: 0.75, origin: [0.5, 0.5] })),
    blade: draw({ delay: 0.2, duration: 0.3, ease: EASE_OUT }),
    tooth1: draw({ delay: 0.4, duration: 0.14, ease: EASE_OUT }),
    tooth2: draw({ delay: 0.48, duration: 0.14, ease: EASE_OUT }),
  }),

  /** Shield outline closes from the top, the check is stamped inside. */
  shieldCheck: () => ({
    shield: draw({ duration: 0.5, from: "center" }),
    check: draw({ delay: 0.36, duration: 0.28, ease: EASE_OUT }),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
