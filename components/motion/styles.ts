import type { MotionStyleId } from "./types";

export interface MotionStyleMeta {
  id: MotionStyleId;
  label: string;
  /** One line shown in the selector tooltip / studio. */
  description: string;
  /** Library icon that represents the style (outline key). */
  icon: string;
  /** Variant of that icon played when the chip is hovered. */
  demo: { effect?: string; recipe?: string; pixel?: string };
}

/** Selector order. */
export const MOTION_STYLES: readonly MotionStyleMeta[] = [
  { id: "signature", label: "Classic", description: "Each icon's original path-drawn animation", icon: "edit", demo: { effect: "boing" } },
  { id: "motion", label: "Motion", description: "Drive, fly, launch and follow curved paths", icon: "car", demo: { effect: "dash" } },
  { id: "shake", label: "Shake", description: "Shake, wobble, swing and vibrate", icon: "bell", demo: { effect: "swing" } },
  { id: "explosive", label: "Explosive", description: "Confetti, bursts and shattering particles", icon: "party-popper", demo: { effect: "confetti-burst" } },
  { id: "physics", label: "Physics", description: "Drop, bounce, tip over and swing under gravity", icon: "map-pin", demo: { effect: "drop-bounce" } },
  { id: "morph", label: "Morph", description: "Shapes transform into other shapes", icon: "sun", demo: { effect: "gooey-morph" } },
  { id: "3d", label: "3D", description: "Flip, tilt and turn in perspective", icon: "layers", demo: { effect: "flip-y" } },
  { id: "elastic", label: "Elastic", description: "Squash, stretch and wobble like rubber", icon: "droplet", demo: { effect: "jelly" } },
  { id: "particles", label: "Particles", description: "Sparkles, orbits, bubbles and trails", icon: "sparkles", demo: { effect: "sparkle" } },
  { id: "loop", label: "Loop", description: "Float, pulse and spin continuously", icon: "loader", demo: { effect: "spin" } },
  { id: "light", label: "Light", description: "Glow, flicker, flash and shine", icon: "zap", demo: { effect: "neon-flicker" } },
  { id: "cursor", label: "Cursor", description: "Tilt, follow or flee from the pointer", icon: "cursor", demo: { effect: "magnetic" } },
  { id: "pixel", label: "Pixel Art", description: "Frame-by-frame 8-bit animations", icon: "pixel-heart", demo: { pixel: "heartbeat" } },
  { id: "experimental", label: "Lab", description: "Glitches, afterimages and portals", icon: "ghost", demo: { effect: "glitch" } },
];

export const MOTION_STYLE_BY_ID = new Map(MOTION_STYLES.map((s) => [s.id, s]));
