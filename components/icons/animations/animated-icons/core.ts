import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, EASE_OUT, fillIn, keyframes, merge, pop, slide, trace } from "../primitives";

/** Core set: status marks, math, and the "essentials" (home, user, heart, star…). */
export const coreRecipes = {
  /** Checkmark draws from its short leg to the tip of the long leg. */
  check: () => ({
    check: draw({ duration: 0.45, ease: EASE_OUT }),
  }),

  /** Circle closes first, then the check is written inside it. */
  checkCircle: () => ({
    circle: draw({ duration: 0.45 }),
    check: draw({ delay: 0.3, duration: 0.3, ease: EASE_OUT }),
  }),

  /** First diagonal, then the second one follows. */
  cross: () => ({
    a: draw({ duration: 0.28, ease: EASE_OUT }),
    b: draw({ delay: 0.16, duration: 0.28, ease: EASE_OUT }),
  }),

  /** Horizontal and vertical strokes grow from the centre independently. */
  plus: () => ({
    h: draw({ from: "center", duration: 0.32, ease: EASE_OUT }),
    v: draw({ from: "center", delay: 0.12, duration: 0.32, ease: EASE_OUT }),
  }),

  minus: () => ({
    h: draw({ from: "center", duration: 0.34, ease: EASE_OUT }),
  }),

  /** Circle draws, the stem is written top → bottom, the dot pops last. */
  info: () => ({
    circle: draw({ duration: 0.45 }),
    stem: draw({ delay: 0.3, duration: 0.22, ease: EASE_OUT }),
    dot: pop({ delay: 0.42 }),
  }),

  /** Triangle draws, the exclamation drops in, then the dot. */
  alert: () => ({
    triangle: draw({ duration: 0.5 }),
    bang: merge(draw({ delay: 0.32, duration: 0.2, ease: EASE_OUT }), slide({ y: -1.5, delay: 0.32, duration: 0.3 })),
    dot: pop({ delay: 0.48 }),
  }),

  /** Roof first, walls next, door last. */
  home: () => ({
    roof: draw({ duration: 0.32, from: "center", ease: EASE_OUT }),
    body: draw({ delay: 0.14, duration: 0.42 }),
    door: draw({ delay: 0.42, duration: 0.24, ease: EASE_OUT }),
  }),

  /** Head draws, shoulders follow. */
  user: () => ({
    head: draw({ duration: 0.36 }),
    body: draw({ delay: 0.2, duration: 0.36, from: "center" }),
  }),

  /**
   * Both halves of the heart draw outward from the bottom tip at once,
   * then the inner fill layer fades in (subtle tint for outline, solid for fill).
   */
  heart: ({ style }) => ({
    left: draw({ duration: 0.55 }),
    right: draw({ duration: 0.55 }),
    fill:
      style === "fill"
        ? merge(fillIn({ delay: 0.38, duration: 0.25 }), keyframes("scale", [1, 1.06, 1], { delay: 0.38, duration: 0.35, origin: [0.5, 0.5] }))
        : fillIn({ delay: 0.42, duration: 0.3, to: 0.14, rest: 0 }),
  }),

  /** A comet dash runs around the star, then the outline closes. */
  star: () => ({
    star: trace({ duration: 0.75 }),
  }),

  /** Ribbon draws while dropping slightly into place. */
  bookmark: () => ({
    body: merge(draw({ duration: 0.5 }), slide({ y: -1.5, duration: 0.5 })),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
