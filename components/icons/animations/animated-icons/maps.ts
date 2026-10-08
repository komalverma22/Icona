import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, EASE_IN_OUT, EASE_OUT, EASE_SPRINGY, keyframes, merge, pop, slide } from "../primitives";

/** Flag cloth keyframes — identical command structure so the `d` attribute morphs. */
const FLAG_REST = "M5 4C8.5 2.5 10.5 5.5 14 4C16.5 3 18 3.5 19 4V13C18 12.5 16.5 12 14 13C10.5 14.5 8.5 11.5 5 13";
const FLAG_WAVE = "M5 4C8 5.5 10.5 2.5 14 4C16.5 5 18 4.5 19 4V13C18 13.5 16.5 14 14 13C10.5 11.5 8 14.5 5 13";

/** Exported so the icon data uses exactly the rest shape of the morph. */
export const FLAG_PATH = FLAG_REST;

/** Maps & places set. */
export const mapsRecipes = {
  /** Pin drops onto the map while drawing, the centre dot lands last. */
  mapPin: () => ({
    pin: merge(draw({ duration: 0.45 }), slide({ y: -4, duration: 0.5, ease: EASE_SPRINGY })),
    dot: pop({ delay: 0.38 }),
  }),

  /** Bezel draws, the needle spins and settles on north. */
  compass: () => ({
    ring: draw({ duration: 0.45 }),
    needle: keyframes("rotate", [-160, 25, -10, 0], { duration: 0.75, ease: EASE_IN_OUT, origin: [0.5, 0.5] }),
  }),

  /** Ring, shank, stock, then the flukes sweep out from the centre. */
  anchor: () => ({
    ring: draw({ duration: 0.28 }),
    shank: draw({ delay: 0.15, duration: 0.3, ease: EASE_OUT }),
    stock: draw({ delay: 0.25, duration: 0.2, from: "center", ease: EASE_OUT }),
    arms: draw({ delay: 0.32, duration: 0.35, from: "center" }),
  }),

  /** Pole is planted, the cloth is drawn — then its path morphs into a wave. */
  flag: () => ({
    pole: draw({ duration: 0.25, ease: EASE_OUT }),
    cloth: merge(draw({ delay: 0.12, duration: 0.4 }), {
      tracks: { d: { values: [FLAG_REST, FLAG_WAVE, FLAG_REST], delay: 0.3, duration: 0.6, ease: EASE_IN_OUT } },
    }),
  }),

  /** Bullseye first, rings ripple outward. */
  target: () => ({
    dot: pop({ duration: 0.25 }),
    inner: draw({ delay: 0.12, duration: 0.3 }),
    outer: draw({ delay: 0.24, duration: 0.4 }),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
