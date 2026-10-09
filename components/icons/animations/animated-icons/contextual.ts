import type { Easing } from "framer-motion";
import type { AnimationName, AnimationRecipe, NodeMotion } from "../animationTypes";
import { draw, EASE_IN_OUT, EASE_OUT, EASE_SPRINGY, keyframes, merge } from "../primitives";

/**
 * Context-aware path recipes used by motion variants (not only as an icon's
 * signature animation). Each one animates the icon's real parts — wheels,
 * flaps, lids, hands — so the motion explains what the icon means.
 * Nodes marked `animationOnly` in the icon data are hidden at rest
 * (`rest: 0` on opacity) and only appear while a recipe plays.
 */

/** Helper: show an animation-only node for a window of time. */
const showFor = (from: number, to: number, total: number, fade = 0.08): NodeMotion["tracks"] => {
  // Keyframe offsets must be strictly increasing.
  const start = Math.max(from, total * 0.01);
  return {
    opacity: {
      values: [0, 0, 1, 1, 0],
      times: [0, start / total, (start + fade) / total, (to - fade) / total, Math.min(to / total, 1)],
      duration: total,
      ease: "linear",
      rest: 0,
    },
  };
};

const DROP_EASE: Easing[] = [[0.5, 0, 0.9, 0.5], "linear", "linear", EASE_SPRINGY];

/** Mail flap shapes — identical command structure so `d` morphs. */
const FLAP_CLOSED = "M3.5 7L12 13L20.5 7";
const FLAP_OPEN = "M3.5 7L12 1.5L20.5 7";

export const contextualRecipes = {
  /**
   * Car: spokes spin (direction-aware), speed lines streak behind the body,
   * the body bobs on its suspension.
   */
  carWheels: ({ options }) => {
    const reverse = options.direction === "left";
    const spin = reverse ? -900 : 900;
    const wheel = (): NodeMotion => ({
      origin: [0.5, 0.5],
      tracks: {
        rotate: { values: [0, spin], duration: 1.2, ease: [0.5, 0, 0.3, 1] },
        ...showFor(0, 1.2, 1.2, 0.05),
      },
    });
    const streak = (i: number): NodeMotion => ({
      tracks: {
        pathLength: { values: [0, 1, 1], times: [0, 0.4, 1], delay: 0.15 + i * 0.07, duration: 0.5, ease: EASE_OUT, rest: 1 },
        x: { values: [0, reverse ? 2 : -2], delay: 0.15 + i * 0.07, duration: 0.5, ease: EASE_OUT, rest: 0 },
        ...showFor(0.15 + i * 0.07, 0.65 + i * 0.07, 1.2),
      },
    });
    const lines = reverse ? ["sr1", "sr2", "sr3"] : ["sl1", "sl2", "sl3"];
    return {
      spokeL: wheel(),
      spokeR: wheel(),
      body: keyframes("y", [0, -0.6, 0.2, -0.4, 0], { duration: 0.9, ease: EASE_IN_OUT }),
      [lines[0]]: streak(0),
      [lines[1]]: streak(1),
      [lines[2]]: streak(2),
    };
  },

  /** Rocket: the exhaust flame ignites and flickers for the whole flight. */
  rocketFlame: () => ({
    flame: {
      origin: [0.5, 0],
      tracks: {
        scaleY: { values: [0.2, 1.4, 0.9, 1.5, 1, 1.4, 0.8, 1.3, 0.2], duration: 1.6, ease: "easeInOut", rest: 0.2 },
        ...showFor(0.05, 1.55, 1.6),
      },
    },
    window: keyframes("scale", [1, 0.8, 1.1, 1], { duration: 0.5, delay: 0.1, origin: [0.5, 0.5] }),
  }),

  /** Mail: the flap opens, a letter slides up out of the envelope, then everything closes. */
  mailOpen: () => ({
    flap: { tracks: { d: { values: [FLAP_CLOSED, FLAP_OPEN, FLAP_OPEN, FLAP_CLOSED], times: [0, 0.25, 0.75, 1], duration: 1.6, ease: EASE_IN_OUT } } },
    letter: {
      tracks: {
        y: { values: [6, 6, -1.5, -1.5, 6], times: [0, 0.2, 0.45, 0.7, 0.9], duration: 1.6, ease: EASE_IN_OUT, rest: 6 },
        ...showFor(0.3, 1.45, 1.6),
      },
    },
    letterLine: {
      tracks: {
        y: { values: [6, 6, -1.5, -1.5, 6], times: [0, 0.2, 0.45, 0.7, 0.9], duration: 1.6, ease: EASE_IN_OUT, rest: 6 },
        ...showFor(0.4, 1.4, 1.6),
      },
    },
  }),

  /** Trash: lid flips open on its hinge, a crumpled scrap drops in, the lid snaps shut. */
  trashDrop: () => {
    const lid = { values: [0, -38, -38, 4, 0], times: [0, 0.22, 0.6, 0.75, 1], duration: 1.2, ease: EASE_IN_OUT };
    const lift = { values: [0, -1.5, -1.5, 0, 0], times: lid.times, duration: 1.2, ease: EASE_IN_OUT };
    return {
      lid: { origin: [0, 1], tracks: { rotate: lid, y: lift } },
      handle: { origin: [-1.1, 1], tracks: { rotate: lid, y: lift } },
      scrap: {
        origin: [0.5, 0.5],
        tracks: {
          y: { values: [-6, -6, 11], times: [0, 0.25, 0.62], duration: 1.2, ease: [0.5, 0, 0.9, 0.5], rest: -6 },
          rotate: { values: [0, 0, 220], times: [0, 0.25, 0.62], duration: 1.2, ease: "easeIn" },
          ...showFor(0.25, 0.72, 1.2, 0.04),
        },
      },
      body: keyframes("y", [0, 0, 0.8, -0.3, 0], { duration: 1.2, ease: EASE_OUT }),
      rib1: keyframes("y", [0, 0, 0.8, -0.3, 0], { duration: 1.2, ease: EASE_OUT }),
      rib2: keyframes("y", [0, 0, 0.8, -0.3, 0], { duration: 1.2, ease: EASE_OUT }),
    };
  },

  /** Download: the arrow plunges into the tray and is absorbed; the tray dips; a fresh arrow drops back in. */
  downloadDrop: () => {
    const fall = {
      y: { values: [0, 6, 6, -9, 0], times: [0, 0.32, 0.4, 0.55, 1], duration: 1.3, ease: DROP_EASE },
      opacity: { values: [1, 1, 0, 0, 1], times: [0, 0.3, 0.36, 0.55, 0.62], duration: 1.3, ease: "linear" as const },
    };
    return {
      shaft: { tracks: fall },
      head: { tracks: fall },
      tray: keyframes("y", [0, 0, 1.6, -0.5, 0.2, 0], { duration: 1.3, ease: EASE_OUT }),
    };
  },

  /** Clock: the hands race forward through the hours, overshoot and settle. */
  clockSpin: () => ({
    minute: keyframes("rotate", [0, 1080, 1070, 1080], { duration: 1.4, ease: [0.6, 0, 0.2, 1], origin: [0.5, 1] }),
    hour: keyframes("rotate", [0, 90, 88, 90], { duration: 1.4, ease: [0.6, 0, 0.2, 1], origin: [0, 0] }),
    face: keyframes("scale", [1, 1, 1.05, 1], { duration: 1.4, ease: EASE_OUT, origin: [0.5, 0.5] }),
  }),

  /** Menu → close: the outer bars cross into an ×, the middle bar collapses. Holds while active. */
  menuMorph: () => ({
    top: {
      origin: [0.5, 0.5],
      tracks: {
        y: { values: [0, 5.5], duration: 0.45, ease: EASE_SPRINGY, rest: 0 },
        rotate: { values: [0, 45], duration: 0.45, ease: EASE_SPRINGY, rest: 0 },
      },
    },
    middle: {
      origin: [0.5, 0.5],
      tracks: {
        scaleX: { values: [1, 0], duration: 0.25, ease: EASE_OUT, rest: 1 },
        opacity: { values: [1, 0], duration: 0.2, ease: EASE_OUT, rest: 1 },
      },
    },
    bottom: {
      origin: [0.5, 0.5],
      tracks: {
        y: { values: [0, -5.5], duration: 0.45, ease: EASE_SPRINGY, rest: 0 },
        rotate: { values: [0, -45], duration: 0.45, ease: EASE_SPRINGY, rest: 0 },
      },
    },
  }),

  /** Plus → close: both strokes turn 135° with a springy overshoot. Holds while active. */
  plusMorph: () => ({
    h: { origin: [0.5, 0.5], tracks: { rotate: { values: [0, 135], duration: 0.55, ease: EASE_SPRINGY, rest: 0 } } },
    v: { origin: [0.5, 0.5], tracks: { rotate: { values: [0, 135], duration: 0.55, ease: EASE_SPRINGY, rest: 0 } } },
  }),

  /** Eye: a double blink while the pupil glances left and right. */
  eyeBlink: () => {
    const blink = { values: [1, 0.08, 1, 1, 0.08, 1], times: [0, 0.1, 0.2, 0.7, 0.8, 0.9], duration: 1.4, ease: EASE_IN_OUT };
    return {
      lid: { origin: [0.5, 0.5], tracks: { scaleY: blink } },
      pupil: {
        origin: [0.5, 0.5],
        tracks: {
          scaleY: blink,
          x: { values: [0, 0, -3, -3, 3, 3, 0], times: [0, 0.22, 0.32, 0.45, 0.55, 0.65, 0.75], duration: 1.4, ease: EASE_IN_OUT },
        },
      },
    };
  },

  /** Party popper: the cone recoils and the streamers shoot out of the mouth. */
  partyStreamers: () => ({
    cone: keyframes("rotate", [0, 10, -4, 0], { duration: 0.5, ease: EASE_OUT, origin: [0, 1] }),
    s1: merge(draw({ delay: 0.08, duration: 0.35, ease: EASE_OUT }), keyframes("rotate", [0, -8, 0], { delay: 0.08, duration: 0.6, origin: [0, 1] })),
    s2: merge(draw({ delay: 0.12, duration: 0.35, ease: EASE_OUT }), keyframes("rotate", [0, 6, 0], { delay: 0.12, duration: 0.6, origin: [0, 1] })),
    s3: merge(draw({ delay: 0.16, duration: 0.35, ease: EASE_OUT }), keyframes("rotate", [0, -6, 0], { delay: 0.16, duration: 0.6, origin: [0, 1] })),
  }),
} satisfies Partial<Record<AnimationName, AnimationRecipe>>;
