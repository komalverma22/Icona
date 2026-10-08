import type { AnimationName, AnimationRecipe } from "../animationTypes";
import { draw, EASE_IN_OUT, EASE_OUT, keyframes, merge, pop, slide } from "../primitives";

/** Circumference of the loader ring (r = 8.5) — dash values are in user units. */
const LOADER_C = 2 * Math.PI * 8.5;
/** Dash pattern where `f` of the ring is visible, e.g. 0.7 → "37.38 16.02" (matches iconData). */
const dash = (f: number) => `${(LOADER_C * f).toFixed(2)} ${(LOADER_C * (1 - f)).toFixed(2)}`;

/** UI set: controls, actions, time. */
export const uiRecipes = {
  /** Lens ring draws starting at the handle joint, the handle follows. */
  search: () => ({
    ring: draw({ duration: 0.42 }),
    handle: draw({ delay: 0.32, duration: 0.2, ease: EASE_OUT }),
  }),

  /** Slider rails draw from the left, then each knob is drawn on its rail. */
  settings: () => ({
    rail1a: draw({ duration: 0.18, ease: EASE_OUT }),
    rail1b: draw({ delay: 0.1, duration: 0.3, ease: EASE_OUT }),
    knob1: merge(draw({ delay: 0.12, duration: 0.34 }), slide({ x: 3, delay: 0.12, duration: 0.45 })),
    rail2a: draw({ delay: 0.08, duration: 0.3, ease: EASE_OUT }),
    rail2b: draw({ delay: 0.24, duration: 0.18, ease: EASE_OUT }),
    knob2: merge(draw({ delay: 0.2, duration: 0.34 }), slide({ x: -3, delay: 0.2, duration: 0.45 })),
  }),

  /** Three bars draw left → right with a subtle stagger. */
  menu: () => ({
    top: draw({ duration: 0.3, ease: EASE_OUT }),
    middle: draw({ delay: 0.07, duration: 0.3, ease: EASE_OUT }),
    bottom: draw({ delay: 0.14, duration: 0.3, ease: EASE_OUT }),
  }),

  /** The funnel outline pours from the rim down to the spout. */
  filter: () => ({
    funnel: draw({ duration: 0.55, from: "center" }),
  }),

  /** Dots ripple upward one after another. */
  more: () => ({
    a: keyframes("y", [0, -2.5, 0], { duration: 0.36, ease: EASE_IN_OUT }),
    b: keyframes("y", [0, -2.5, 0], { delay: 0.08, duration: 0.36, ease: EASE_IN_OUT }),
    c: keyframes("y", [0, -2.5, 0], { delay: 0.16, duration: 0.36, ease: EASE_IN_OUT }),
  }),

  /**
   * Spinner: a classic dasharray / dashoffset loop on the arc while hovered.
   * The dash both travels (offset) and breathes (array length).
   */
  loader: () => ({
    arc: {
      tracks: {
        strokeDashoffset: { values: [0, -LOADER_C], duration: 0.9, ease: "linear", repeat: Infinity, rest: 0 },
        strokeDasharray: {
          values: [dash(0.7), dash(0.2), dash(0.7)],
          duration: 1.8,
          ease: EASE_IN_OUT,
          repeat: Infinity,
          rest: dash(0.7),
        },
      },
    },
  }),

  /** Lids draw, then the pupil is drawn and glances left/right. */
  eye: () => ({
    lid: draw({ duration: 0.5 }),
    pupil: merge(draw({ delay: 0.25, duration: 0.3 }), keyframes("x", [0, 1.5, -1.5, 0], { delay: 0.5, duration: 0.5 })),
  }),

  /** Eye draws, then the slash strikes through it. */
  eyeOff: () => ({
    lid: draw({ duration: 0.45 }),
    pupil: draw({ delay: 0.2, duration: 0.28 }),
    slash: draw({ delay: 0.35, duration: 0.26, ease: EASE_OUT }),
  }),

  /** Back sheet draws, front sheet is "pasted" on top of it. */
  copy: () => ({
    back: draw({ duration: 0.36 }),
    front: merge(draw({ delay: 0.14, duration: 0.4 }), slide({ x: -2.5, y: -2.5, delay: 0.14, duration: 0.45 })),
  }),

  /** Pencil draws, its nib line snaps in, and it writes a line underneath. */
  edit: () => ({
    pencil: draw({ duration: 0.45 }),
    nib: draw({ delay: 0.32, duration: 0.15, ease: EASE_OUT }),
    line: draw({ delay: 0.42, duration: 0.3, ease: EASE_OUT }),
  }),

  /**
   * Lid lifts and settles, the can draws, the ribs follow.
   * Lid and handle hinge around the same point (the lid's left end, 4,6.5):
   * the handle's bbox spans x 9.5–14.5, so that point is at -110% / 100% of it.
   */
  trash: () => {
    const lift = { delay: 0, duration: 0.55, ease: EASE_IN_OUT };
    return {
      lid: merge(keyframes("y", [0, -2.5, 0], lift), keyframes("rotate", [0, -10, 0], { ...lift, origin: [0, 1] })),
      handle: merge(keyframes("y", [0, -2.5, 0], lift), keyframes("rotate", [0, -10, 0], { ...lift, origin: [-1.1, 1] })),
      body: draw({ delay: 0.1, duration: 0.42 }),
      rib1: draw({ delay: 0.32, duration: 0.2, ease: EASE_OUT }),
      rib2: draw({ delay: 0.4, duration: 0.2, ease: EASE_OUT }),
    };
  },

  /** Body draws, the shackle drops into the body and locks. */
  lock: () => ({
    body: draw({ duration: 0.4 }),
    shackle: merge(
      draw({ delay: 0.1, duration: 0.32 }),
      { tracks: { y: { values: [-2.5, -2.5, 0], times: [0, 0.6, 1], delay: 0.1, duration: 0.5, ease: EASE_OUT } } },
    ),
    keyhole: draw({ delay: 0.48, duration: 0.15, ease: EASE_OUT }),
  }),

  /** Face draws while the minute hand sweeps a full turn; the hour hand follows. */
  clock: () => ({
    face: draw({ duration: 0.5 }),
    minute: keyframes("rotate", [0, 360], { duration: 0.6, ease: EASE_IN_OUT, origin: [0.5, 1] }),
    hour: draw({ delay: 0.3, duration: 0.22, ease: EASE_OUT }),
  }),

  /** Frame draws, rings drop in, header rule and dates appear. */
  calendar: () => ({
    frame: draw({ duration: 0.45 }),
    ring1: merge(draw({ delay: 0.12, duration: 0.2 }), slide({ y: -2, delay: 0.12, duration: 0.35 })),
    ring2: merge(draw({ delay: 0.18, duration: 0.2 }), slide({ y: -2, delay: 0.18, duration: 0.35 })),
    rule: draw({ delay: 0.2, duration: 0.25, ease: EASE_OUT }),
    d1: pop({ delay: 0.36 }),
    d2: pop({ delay: 0.42 }),
    d3: pop({ delay: 0.48 }),
    d4: pop({ delay: 0.54 }),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
