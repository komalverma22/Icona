import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, EASE_OUT, merge, slide } from "../primitives";

/** Media set: playback and capture. */
export const mediaRecipes = {
  /** Triangle draws while nudging forward, like pressing play. */
  play: () => ({
    triangle: merge(draw({ duration: 0.45 }), slide({ x: -1.5, duration: 0.5 })),
  }),

  /** Bars draw one after the other, top → bottom. */
  pause: () => ({
    left: draw({ duration: 0.34 }),
    right: draw({ delay: 0.1, duration: 0.34 }),
  }),

  /** Body draws, then the lens ring is drawn with a shutter-like twist. */
  camera: () => ({
    body: draw({ duration: 0.45 }),
    lens: merge(draw({ delay: 0.2, duration: 0.4 }), {
      origin: [0.5, 0.5],
      tracks: { rotate: { values: [-120, 0], delay: 0.2, duration: 0.45, ease: EASE_OUT } },
    }),
  }),

  /** Speaker draws, then sound waves emanate one after another. */
  volume: () => ({
    speaker: draw({ duration: 0.36 }),
    wave1: draw({ delay: 0.24, duration: 0.2, ease: EASE_OUT, from: "center" }),
    wave2: draw({ delay: 0.36, duration: 0.26, ease: EASE_OUT, from: "center" }),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
