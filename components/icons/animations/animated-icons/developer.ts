import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, EASE_IN_OUT, EASE_OUT, keyframes, merge, pop, slide, trace } from "../primitives";

/** Developer set: keys, terminals, code, scanning, UI controls. */
export const developerRecipes = {
  /** ⌘ is one continuous loop — a comet runs the whole knot, then it closes. */
  command: () => ({
    knot: trace({ duration: 0.85, segment: 0.18 }),
  }),

  /** Corner brackets draw in, then a scan line sweeps down and settles in the middle. */
  scan: () => ({
    tl: merge(draw({ duration: 0.3, ease: EASE_OUT }), slide({ x: -1.5, y: -1.5, duration: 0.4 })),
    tr: merge(draw({ delay: 0.05, duration: 0.3, ease: EASE_OUT }), slide({ x: 1.5, y: -1.5, delay: 0.05, duration: 0.4 })),
    br: merge(draw({ delay: 0.1, duration: 0.3, ease: EASE_OUT }), slide({ x: 1.5, y: 1.5, delay: 0.1, duration: 0.4 })),
    bl: merge(draw({ delay: 0.15, duration: 0.3, ease: EASE_OUT }), slide({ x: -1.5, y: 1.5, delay: 0.15, duration: 0.4 })),
    line: merge(draw({ delay: 0.2, duration: 0.2, from: "center" }), keyframes("y", [-5, 5, 0], { delay: 0.2, duration: 0.6 })),
  }),

  /** Finder squares draw in order, then the data modules pop in. */
  qrCode: () => ({
    f1: draw({ duration: 0.32 }),
    f2: draw({ delay: 0.08, duration: 0.32 }),
    f3: draw({ delay: 0.16, duration: 0.32 }),
    b1: pop({ delay: 0.3 }),
    b2: pop({ delay: 0.35 }),
    b3: pop({ delay: 0.4 }),
    b4: pop({ delay: 0.45 }),
    b5: pop({ delay: 0.5 }),
    b6: draw({ delay: 0.32, duration: 0.2, ease: EASE_OUT }),
    b7: draw({ delay: 0.38, duration: 0.2, ease: EASE_OUT }),
  }),

  /** The knob slides from off to on while the track draws around it. */
  toggle: () => ({
    track: draw({ duration: 0.45 }),
    knob: merge(draw({ delay: 0.1, duration: 0.3 }), slide({ x: -8, delay: 0.1, duration: 0.45, ease: EASE_IN_OUT })),
  }),

  /** Pointer glides in from the bottom-right while drawing, then "clicks" (presses toward its tip). */
  cursor: () => ({
    pointer: merge(
      draw({ duration: 0.4 }),
      slide({ x: 3, y: 3, duration: 0.45 }),
      keyframes("scale", [1, 1, 0.88, 1], { duration: 0.65, origin: [0, 0] }),
    ),
  }),

  /** Frame draws, keys pop row by row, space bar stretches from the centre. */
  keyboard: () => ({
    frame: draw({ duration: 0.42 }),
    k1: pop({ delay: 0.25 }),
    k2: pop({ delay: 0.3 }),
    k3: pop({ delay: 0.35 }),
    k4: pop({ delay: 0.4 }),
    space: draw({ delay: 0.42, duration: 0.24, from: "center", ease: EASE_OUT }),
  }),

  /** Window draws, the prompt is typed, the cursor blinks twice. */
  terminal: () => ({
    frame: draw({ duration: 0.42 }),
    prompt: draw({ delay: 0.22, duration: 0.2, ease: EASE_OUT }),
    caret: merge(draw({ delay: 0.38, duration: 0.14, ease: EASE_OUT }), {
      tracks: { opacity: { values: [1, 0, 1, 0, 1], delay: 0.52, duration: 0.6, ease: "linear" } },
    }),
  }),

  /** Brackets open outward, the slash is written between them. */
  code: () => ({
    left: merge(draw({ duration: 0.3, ease: EASE_OUT }), slide({ x: 2.5, duration: 0.45 })),
    right: merge(draw({ duration: 0.3, ease: EASE_OUT }), slide({ x: -2.5, duration: 0.45 })),
    slash: draw({ delay: 0.2, duration: 0.25, ease: EASE_OUT }),
  }),

  /** Trunk draws, commits appear, the branch splits off and joins its commit. */
  gitBranch: () => ({
    trunk: draw({ duration: 0.3 }),
    base: draw({ delay: 0.1, duration: 0.28 }),
    head: draw({ delay: 0.18, duration: 0.28 }),
    branch: draw({ delay: 0.3, duration: 0.32, from: "end" }),
    tip: draw({ delay: 0.5, duration: 0.25 }),
  }),

  /** Grip dots ripple top → bottom. */
  grip: () => ({
    a: pop({ delay: 0 }),
    b: pop({ delay: 0.05 }),
    c: pop({ delay: 0.1 }),
    d: pop({ delay: 0.15 }),
    e: pop({ delay: 0.2 }),
    f: pop({ delay: 0.25 }),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
