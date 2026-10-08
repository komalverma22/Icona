import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, EASE_IN_OUT, EASE_OUT, keyframes, merge, pop, slide } from "../primitives";

const RAYS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"] as const;

/** Nature & energy set. */
export const natureRecipes = {
  /** Core draws, rays shoot outward one after another around the dial. */
  sun: () => ({
    core: draw({ duration: 0.4 }),
    ...Object.fromEntries(RAYS.map((id, i) => [id, draw({ delay: 0.18 + i * 0.045, duration: 0.18, ease: EASE_OUT })])),
  }),

  /** Crescent draws while rocking gently into place. */
  moon: () => ({
    moon: merge(draw({ duration: 0.55 }), keyframes("rotate", [-20, 6, 0], { duration: 0.65, origin: [0.5, 0.5] })),
  }),

  /** Leaf outline grows, then the midrib is drawn from the stem. */
  leaf: () => ({
    leaf: draw({ duration: 0.5 }),
    vein: draw({ delay: 0.35, duration: 0.25, ease: EASE_OUT }),
  }),

  /** Drop falls in while its outline is drawn, then the highlight glints. */
  droplet: () => ({
    drop: merge(draw({ duration: 0.45 }), slide({ y: -3, duration: 0.5 })),
    shine: draw({ delay: 0.4, duration: 0.2, ease: EASE_OUT }),
  }),

  /** Flame is drawn upward from its base and flickers. */
  flame: () => ({
    flame: merge(
      draw({ duration: 0.5 }),
      keyframes("scale", [1, 1.06, 0.97, 1.03, 1], { delay: 0.3, duration: 0.5, origin: [0.5, 1] }),
    ),
  }),

  /** Main star bursts open, the small one twinkles after it. */
  sparkles: () => ({
    star: merge(draw({ duration: 0.45 }), keyframes("rotate", [-45, 0], { duration: 0.5, ease: EASE_OUT, origin: [0.5, 0.5] })),
    plusH: draw({ delay: 0.3, duration: 0.2, from: "center", ease: EASE_OUT }),
    plusV: draw({ delay: 0.36, duration: 0.2, from: "center", ease: EASE_OUT }),
  }),

  /** The bolt strikes: a fast trace from top to bottom. */
  zap: () => ({
    bolt: draw({ duration: 0.35, ease: EASE_IN_OUT }),
  }),

  /** Bulb draws, base screws in, the filament lights up. */
  lightbulb: () => ({
    bulb: draw({ duration: 0.45 }),
    base1: draw({ delay: 0.28, duration: 0.15, from: "center" }),
    base2: draw({ delay: 0.36, duration: 0.15, from: "center" }),
    filament: merge(draw({ delay: 0.4, duration: 0.22, ease: EASE_OUT }), pop({ delay: 0.4, duration: 0.3 })),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;

