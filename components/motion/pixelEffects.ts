import { parseSprite, type Pixel } from "../icons/pixelArt";
import type { PixelArt } from "../icons/types";

/**
 * Frame-by-frame pixel-art animations.
 *
 * Every frame is computed on the 12×12 sprite grid and snapped to whole
 * pixels - rotations and scales use nearest-neighbour sampling, so a sword
 * swing or a coin spin stays authentically pixelated instead of turning into
 * smoothed vector motion. Pixels may leave the 12×12 box (explosions, launches);
 * the player draws them outside the icon bounds.
 */

export interface PixelFrame {
  pixels: Pixel[];
  /** Opacity of shade ("+") pixels for this frame (glow effects). */
  shade?: number;
  /** Whole-frame opacity (flicker). */
  alpha?: number;
}

export interface PixelContext {
  sprite: Pixel[];
  /** Morph target sprite, when the variant has one. */
  alt?: Pixel[];
  /** Named extra frames from the icon's pixel art (e.g. "open", "walk"). */
  frames: Record<string, Pixel[]>;
  /** Stable per-pixel random numbers in [0, 1). */
  rnd: (i: number, salt?: number) => number;
}

export interface PixelEffect {
  fps: number;
  frames: number;
  loop?: boolean;
  render: (f: number, ctx: PixelContext) => PixelFrame;
}

const C = 5.5; // sprite centre
const FIRE = ["#ffd166", "#ff9f1c", "#ff6b4a"];
const GOLD = "#ffc93c";
const WHITE = "#ffffff";

/* -------------------------------------------------------------------------- */
/* Grid operations                                                             */
/* -------------------------------------------------------------------------- */

const key = (x: number, y: number) => `${x},${y}`;

/**
 * Nearest-neighbour transform about (cx, cy): every destination cell samples
 * the source cell it maps back to, so the result is always a clean pixel grid.
 */
export function transform(
  pixels: readonly Pixel[],
  { sx = 1, sy = 1, rot = 0, dx = 0, dy = 0, cx = C, cy = C }: { sx?: number; sy?: number; rot?: number; dx?: number; dy?: number; cx?: number; cy?: number },
): Pixel[] {
  if (sx === 1 && sy === 1 && rot === 0) return dx || dy ? pixels.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy })) : [...pixels];
  const lookup = new Map(pixels.map((p) => [key(p.x, p.y), p]));
  const a = (-rot * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const out: Pixel[] = [];
  for (let ty = -8; ty < 20; ty++) {
    for (let tx = -8; tx < 20; tx++) {
      const px = tx + 0.5 - dx - cx - 0.5;
      const py = ty + 0.5 - dy - cy - 0.5;
      const rx = px * cos - py * sin;
      const ry = px * sin + py * cos;
      if (Math.abs(sx) < 0.01 || Math.abs(sy) < 0.01) continue;
      const src = lookup.get(key(Math.floor(rx / sx + cx + 0.5), Math.floor(ry / sy + cy + 0.5)));
      if (src) out.push({ ...src, x: tx, y: ty });
    }
  }
  return out;
}

const shift = (pixels: readonly Pixel[], dx: number, dy: number) => pixels.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
const tint = (pixels: readonly Pixel[], c: string) => pixels.map((p) => ({ ...p, c }));
const ping = (f: number, n: number) => (f < n ? f / Math.max(1, n - 1) : 1 - (f - n) / Math.max(1, n - 1));
const bounds = (pixels: readonly Pixel[]) => {
  let minY = Infinity;
  let maxY = -Infinity;
  let minX = Infinity;
  let maxX = -Infinity;
  for (const p of pixels) {
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
  }
  return { minX, maxX, minY, maxY };
};

/** A 3×3 "plus" sparkle. */
const sparkle = (x: number, y: number, c?: string): Pixel[] =>
  [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ].map(([ox, oy]) => ({ x: x + ox, y: y + oy, t: 1, c }));

/** Pixels scattered outward from the centre with gravity; p = 0 assembled, 1 fully exploded. */
function scatter(pixels: readonly Pixel[], p: number, rnd: PixelContext["rnd"], power = 9, gravity = 4): Pixel[] {
  return pixels.map((px, i) => {
    let vx = px.x - C + (rnd(i) - 0.5) * 3;
    let vy = px.y - C + (rnd(i, 1) - 0.5) * 3;
    const len = Math.hypot(vx, vy) || 1;
    vx /= len;
    vy /= len;
    const dist = (power * (0.5 + rnd(i, 2))) * p;
    return { ...px, x: Math.round(px.x + vx * dist), y: Math.round(px.y + vy * dist + gravity * p * p) };
  });
}

/** Pair two sprites pixel-for-pixel and move each pixel along its pair (staggered). */
function morph(a: readonly Pixel[], b: readonly Pixel[], p: number, rnd: PixelContext["rnd"]): Pixel[] {
  const order = (list: readonly Pixel[]) => [...list].sort((m, n) => Math.atan2(m.y - C, m.x - C) - Math.atan2(n.y - C, n.x - C) || m.y - n.y);
  const A = order(a);
  const B = order(b);
  const n = Math.max(A.length, B.length);
  const out = new Map<string, Pixel>();
  for (let i = 0; i < n; i++) {
    const from = A[Math.floor((i * A.length) / n)];
    const to = B[Math.floor((i * B.length) / n)];
    const delay = rnd(i, 3) * 0.4;
    const k = Math.min(1, Math.max(0, (p - delay) / 0.6));
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const x = Math.round(from.x + (to.x - from.x) * e);
    const y = Math.round(from.y + (to.y - from.y) * e);
    out.set(key(x, y), { x, y, t: e < 0.5 ? from.t : to.t });
  }
  return [...out.values()];
}

/* -------------------------------------------------------------------------- */
/* Effects                                                                     */
/* -------------------------------------------------------------------------- */

export const PIXEL_EFFECTS: Record<string, PixelEffect> = {
  /** Breaks into pixels that fly apart, hang, then snap back together. */
  explode: {
    fps: 14,
    frames: 24,
    render: (f, { sprite, rnd }) => {
      const p = f < 10 ? f / 9 : f < 13 ? 1 : 1 - (f - 13) / 10;
      return { pixels: scatter(sprite, Math.max(0, p), rnd) };
    },
  },

  /** Appears one pixel at a time, scanline order, with a bright write-head. */
  reveal: {
    fps: 30,
    frames: 44,
    render: (f, { sprite }) => {
      const sorted = [...sprite].sort((a, b) => a.y - b.y || a.x - b.x);
      const shown = Math.ceil((sorted.length * Math.min(f, 40)) / 40);
      const pixels = sorted.slice(0, shown);
      const head = sorted[shown];
      if (head) pixels.push({ ...head, t: 1, c: "#5bdc67" });
      return { pixels };
    },
  },

  /** Disintegrates into drifting specks, then rebuilds from the dust. */
  dissolve: {
    fps: 14,
    frames: 26,
    render: (f, { sprite, rnd }) => {
      const gone = f < 12 ? f / 11 : f < 15 ? 1 : 1 - (f - 15) / 10;
      const pixels: Pixel[] = [];
      sprite.forEach((p, i) => {
        const r = rnd(i, 4);
        if (r > gone) pixels.push(p);
        else if (r > gone - 0.18) pixels.push({ ...p, t: 2, x: p.x + Math.round(rnd(i, 5) * 2 - 1), y: p.y - 1 - Math.round((gone - r) * 8) });
      });
      return { pixels };
    },
  },

  /** Rows tear sideways, RGB ghosts flicker, then the image locks back in. */
  glitch: {
    fps: 16,
    frames: 14,
    render: (f, { sprite, rnd }) => {
      if (f >= 12) return { pixels: sprite };
      const bandA = Math.floor(rnd(f, 6) * 12);
      const bandB = Math.floor(rnd(f, 7) * 12);
      const off = (y: number) => (Math.abs(y - bandA) < 2 ? (rnd(f, 8) > 0.5 ? 2 : -2) : Math.abs(y - bandB) < 1 ? (rnd(f, 9) > 0.5 ? 1 : -1) : 0);
      const torn = sprite.map((p) => ({ ...p, x: p.x + off(p.y) }));
      const pixels: Pixel[] = [];
      if (f % 3 !== 2) pixels.push(...tint(shift(sprite, -1, 0), "#22d3ee"), ...tint(shift(sprite, 1, 0), "#ff3b6b"));
      pixels.push(...(f % 5 === 3 ? torn.filter((_, i) => rnd(i, f) > 0.25) : torn));
      return { pixels, alpha: f === 6 ? 0.4 : 1 };
    },
  },

  /** Fills from the bottom up like a progress bar, loops. */
  loading: {
    fps: 10,
    frames: 18,
    loop: true,
    render: (f, { sprite }) => {
      const { minY, maxY } = bounds(sprite);
      const level = maxY - Math.min(f, maxY - minY + 1);
      return {
        pixels: sprite.map((p) => (p.y > level ? { ...p, t: 1 } : { ...p, t: 2 })),
        shade: 0.25,
      };
    },
  },

  /** Hops with frame-by-frame squash and stretch. */
  bounce: {
    fps: 12,
    frames: 12,
    loop: true,
    render: (f, { sprite }) => {
      const dy = [0, 1, 0, -2, -3, -4, -4, -3, -2, 0, 0, 0][f];
      const squash = f === 1 || f === 9 ? { sx: 1.25, sy: 0.8 } : f === 10 ? { sx: 1.1, sy: 0.9 } : f >= 3 && f <= 7 ? { sx: 0.9, sy: 1.1 } : {};
      return { pixels: transform(sprite, { ...squash, dy, cy: 11 }) };
    },
  },

  /** Collapses into a beam, vanishes, rematerialises to the side and steps home. */
  teleport: {
    fps: 14,
    frames: 26,
    render: (f, { sprite, rnd }) => {
      if (f < 5) return { pixels: transform(sprite, { sx: 1 - f * 0.22, sy: 1 + f * 0.12 }) };
      if (f < 8) return { pixels: tint(transform(sprite, { sx: 0.08, sy: 1.6, dy: -(f - 5) * 3 }), "#5bdc67") };
      if (f < 10) return { pixels: [] };
      if (f < 16) {
        const k = (f - 10) / 5;
        return { pixels: shift(sprite, 4, 0).filter((_, i) => rnd(i, 10) < k).concat(f < 14 ? sparkle(10, 1 + (f % 3), "#5bdc67") : []) };
      }
      return { pixels: shift(sprite, Math.max(0, 4 - Math.floor((f - 16) / 2)), 0) };
    },
  },

  /** 8-bit lub-dub: snaps between three sizes, shade glows on the beat. */
  heartbeat: {
    fps: 12,
    frames: 12,
    loop: true,
    render: (f, { sprite }) => {
      const s = [1, 1.25, 1.12, 1, 1.18, 1.06, 1, 1, 1, 1, 1, 1][f];
      return { pixels: transform(sprite, { sx: s, sy: s }), shade: s > 1.1 ? 0.75 : 0.4 };
    },
  },

  /** Classic coin spin: the face narrows to an edge and flips. */
  "coin-spin": {
    fps: 12,
    frames: 12,
    loop: true,
    render: (f, { sprite }) => {
      const sx = Math.cos((f / 12) * Math.PI * 2);
      if (Math.abs(sx) < 0.2) {
        const { minY, maxY } = bounds(sprite);
        const pixels: Pixel[] = [];
        for (let y = minY; y <= maxY; y++) pixels.push({ x: 5, y, t: 1 }, { x: 6, y, t: y === minY || y === maxY ? 1 : 2 });
        return { pixels };
      }
      return { pixels: transform(sprite, { sx: Math.sign(sx) * Math.max(0.3, Math.round(Math.abs(sx) * 4) / 4) }) };
    },
  },

  /** Coin collect: leaps up spinning, bursts into a sparkle, drops back in. */
  collect: {
    fps: 14,
    frames: 20,
    render: (f, { sprite }) => {
      if (f < 8) {
        const sx = Math.cos((f / 8) * Math.PI * 2);
        return { pixels: transform(sprite, { sx: Math.sign(sx || 1) * Math.max(0.25, Math.abs(sx)), dy: -[0, 2, 3, 4, 5, 5, 5, 5][f] }) };
      }
      if (f < 12) return { pixels: [...sparkle(5, 0, GOLD), ...sparkle(2, 2, GOLD), ...sparkle(9, 2, GOLD)].map((p) => ({ ...p, x: p.x + (f - 8) * (p.x > 5 ? 1 : -1) })) };
      return { pixels: shift(sprite, 0, -Math.max(0, 8 - (f - 12) * 2)) };
    },
  },

  /** Rocket launch: rumble, ignite, climb in pixel steps with flickering flames and smoke. */
  launch: {
    fps: 14,
    frames: 30,
    render: (f, { sprite, rnd }) => {
      const { maxY } = bounds(sprite);
      const flame = (dy: number, big: boolean): Pixel[] => {
        const out: Pixel[] = [];
        const rows = big ? 3 : 1;
        for (let r = 1; r <= rows; r++) {
          const half = r === 1 ? 1 : 0;
          for (let x = 5 - half; x <= 6 + half; x++) if (rnd(x + r * 7, f) > 0.25 || r === 1) out.push({ x, y: maxY + r + dy, t: 1, c: FIRE[Math.min(2, r - 1 + (f % 2))] });
        }
        return out;
      };
      if (f < 6) return { pixels: [...shift(sprite, f % 2 ? 1 : 0, 0), ...flame(0, false)] };
      if (f < 18) {
        const t = f - 6;
        const dy = -Math.round(0.11 * t * t);
        const smoke: Pixel[] = [];
        for (let i = 0; i < Math.min(t, 6); i++) {
          const side = i % 2 ? 1 : -1;
          smoke.push({ x: 5 + side * (2 + Math.floor(t / 2) + (i >> 1)), y: 11 - (i >> 2), t: 2, c: "#9a9ea3" });
        }
        return { pixels: [...shift(sprite, 0, dy), ...flame(dy, true), ...smoke] };
      }
      if (f < 21) return { pixels: [] };
      return { pixels: [...shift(sprite, 0, Math.max(0, 8 - (f - 21))), ...flame(Math.max(0, 8 - (f - 21)), false)] };
    },
  },

  /** Rocket trail: weaves side to side, leaving a cooling exhaust trail. */
  trail: {
    fps: 12,
    frames: 24,
    loop: true,
    render: (f, { sprite }) => {
      const pos = (k: number) => Math.round(3 * Math.sin((k / 24) * Math.PI * 2));
      const pixels: Pixel[] = [];
      for (let back = 4; back >= 1; back--) {
        const x = 5 + pos(f - back);
        pixels.push({ x, y: 10 + back, t: back > 2 ? 2 : 1, c: back > 2 ? "#9a9ea3" : FIRE[back - 1] }, { x: x + 1, y: 10 + back, t: 2, c: back > 2 ? "#9a9ea3" : FIRE[back] });
      }
      return { pixels: [...pixels, ...shift(sprite, pos(f), 0)] };
    },
  },

  /** Sword slash: wind-up, a fast swing with a pixel smear, recover. */
  slash: {
    fps: 16,
    frames: 12,
    render: (f, { sprite }) => {
      const rot = [0, -15, -35, -45, -45, 10, 60, 90, 80, 50, 20, 0][f];
      const pixels = transform(sprite, { rot, cx: 3, cy: 8 });
      if (f >= 5 && f <= 8) {
        for (let a = -40; a <= rot; a += 12) {
          const r = (a * Math.PI) / 180;
          const x = Math.round(3 + Math.cos(r - Math.PI / 4) * 8.5);
          const y = Math.round(8 + Math.sin(r - Math.PI / 4) * 8.5);
          pixels.push({ x, y, t: 2 });
        }
      }
      return { pixels };
    },
  },

  /** Spin attack: a full turn in eight crisp 45° steps. */
  "spin-attack": {
    fps: 12,
    frames: 9,
    render: (f, { sprite }) => ({ pixels: transform(sprite, { rot: f * 45 }) }),
  },

  /** A white glint sweeps diagonally across, ending in a sparkle. */
  glint: {
    fps: 18,
    frames: 22,
    render: (f, { sprite }) => {
      const band = f - 4;
      const pixels = sprite.map((p) => (p.x + p.y === band || p.x + p.y === band + 1 ? { ...p, t: 1 as const, c: WHITE } : p));
      if (f >= 16 && f <= 19) pixels.push(...sparkle(10, 1, f % 2 ? GOLD : undefined));
      return { pixels };
    },
  },

  /** Potion: bubbles rise through the liquid and pop out of the neck; the brew glows. */
  bubble: {
    fps: 10,
    frames: 16,
    loop: true,
    render: (f, { sprite }) => {
      const liquid = sprite.filter((p) => p.t === 2);
      const { minY, maxY, minX, maxX } = bounds(liquid.length ? liquid : sprite);
      const pixels: Pixel[] = [...sprite];
      [0, 5, 10].forEach((phase, b) => {
        const k = (f + phase) % 16;
        const x = Math.round(minX + 1 + ((maxX - minX - 2) * b) / 2);
        const y = maxY - Math.floor(k / 2);
        if (y >= minY) pixels.push({ x, y, t: 1, c: WHITE });
        else if (y > -3) pixels.push({ x: x + (k % 4 < 2 ? 0 : 1), y: y - 1, t: 2 });
      });
      return { pixels, shade: 0.35 + 0.35 * Math.abs(Math.sin((f / 16) * Math.PI * 2)) };
    },
  },

  /** Ghost: bobs in pixel steps, the hem ripples, and it flickers. */
  haunt: {
    fps: 10,
    frames: 16,
    loop: true,
    render: (f, { sprite }) => {
      const { maxY } = bounds(sprite);
      const dy = [0, 0, -1, -1, -1, -1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0][f];
      const pixels = sprite.map((p) => (p.y >= maxY - 1 ? { ...p, x: p.x + (f % 4 < 2 ? 0 : 1) } : p));
      return { pixels: shift(pixels, 0, dy), alpha: f === 6 || f === 7 ? 0.35 : 1 };
    },
  },

  /** Paces back and forth through its walk-cycle frames (flips when walking left). */
  walk: {
    fps: 10,
    frames: 24,
    loop: true,
    render: (f, { sprite, frames }) => {
      const cycle = [sprite, frames.stride ?? sprite, sprite, frames.strideB ?? frames.stride ?? sprite];
      const pose = cycle[Math.floor(f / 2) % 4];
      const dx = f < 6 ? Math.floor(f / 2) : f < 18 ? 3 - Math.floor((f - 6) / 2) : -3 + Math.floor((f - 18) / 2);
      const left = f >= 6 && f < 18;
      return { pixels: transform(pose, { sx: left ? -1 : 1, dx }) };
    },
  },

  /** Chest: rumbles, flips open and spills gold. Holds open while active. */
  open: {
    fps: 12,
    frames: 18,
    render: (f, { sprite, frames }) => {
      if (f < 4) return { pixels: shift(sprite, f % 2 ? 1 : -1, 0) };
      const pixels = [...(frames.open ?? sprite)];
      const coins: [number, number][] = [
        [-2, -1],
        [0, -2],
        [2, -1],
      ];
      coins.forEach(([vx, vy], i) => {
        const t = f - 4 - i;
        if (t < 0 || t > 9) return;
        const x = 5 + Math.round(vx * t * 0.5);
        const y = 2 + Math.round(vy * t + 0.35 * t * t);
        if (y < 3) pixels.push({ x, y, t: 1, c: GOLD });
      });
      if (f >= 12) pixels.push(...sparkle(9, 0, f % 2 ? GOLD : undefined));
      return { pixels };
    },
  },

  /** Bomb: the fuse burns down with sparks, then - boom - and it reassembles. */
  "fuse-boom": {
    fps: 14,
    frames: 30,
    render: (f, { sprite, rnd }) => {
      const { minY } = bounds(sprite);
      if (f < 10) {
        const burnt = Math.floor(f / 3);
        const pixels = sprite.filter((p) => p.y >= minY + burnt);
        const tip = pixels.filter((p) => p.y === minY + burnt)[0];
        if (tip) pixels.push({ x: tip.x + (f % 2), y: tip.y - 1, t: 1, c: FIRE[f % 3] }, { x: tip.x - 1 + (f % 3), y: tip.y - 2, t: 1, c: GOLD });
        return { pixels };
      }
      if (f < 20) {
        const p = (f - 10) / 9;
        const ring: Pixel[] = [];
        const r = Math.round(2 + p * 7);
        for (let a = 0; a < 16; a++) ring.push({ x: Math.round(C + Math.cos((a / 16) * Math.PI * 2) * r), y: Math.round(C + Math.sin((a / 16) * Math.PI * 2) * r), t: 1, c: p < 0.5 ? GOLD : FIRE[2] });
        return { pixels: [...ring, ...scatter(sprite, p, rnd, 10, 3).map((px, i) => (rnd(i, 11) > 0.6 ? { ...px, c: FIRE[i % 3] } : px))] };
      }
      return { pixels: scatter(sprite, 1 - (f - 20) / 9, rnd, 10, 3) };
    },
  },

  /** CRT power-on: a bright scanline opens vertically into the picture. */
  "power-on": {
    fps: 14,
    frames: 12,
    render: (f, { sprite }) => {
      if (f === 0) return { pixels: [] };
      if (f < 3) {
        const pixels: Pixel[] = [];
        for (let x = 1; x <= 10; x++) pixels.push({ x, y: 6, t: 1, c: f === 1 ? WHITE : undefined });
        return { pixels: f === 1 ? [{ x: 5, y: 6, t: 1 }, { x: 6, y: 6, t: 1 }] : pixels };
      }
      const open = f - 2;
      return { pixels: sprite.filter((p) => Math.abs(p.y - 6) <= open), alpha: f === 4 ? 0.6 : 1 };
    },
  },

  /** Rumble: rapid one-pixel shake. */
  rumble: {
    fps: 18,
    frames: 12,
    render: (f, { sprite }) => ({ pixels: shift(sprite, f >= 10 ? 0 : f % 2 ? 1 : -1, f % 4 === 1 ? -1 : 0) }),
  },

  /** Key turn: quarter turns in the lock, holds, with a click sparkle. */
  turn: {
    fps: 10,
    frames: 8,
    render: (f, { sprite }) => {
      const rot = [0, 0, 45, 90, 90, 90, 90, 90][f];
      const pixels = transform(sprite, { rot });
      if (f >= 4 && f <= 6) pixels.push(...sparkle(10, 2, GOLD));
      return { pixels };
    },
  },

  /** Hourglass flip: turns over in 45° steps and holds. */
  flip: {
    fps: 12,
    frames: 6,
    render: (f, { sprite }) => ({ pixels: transform(sprite, { rot: [0, 45, 90, 135, 170, 180][f] }) }),
  },

  /** Morph into the target sprite pixel by pixel, hold, then morph back. */
  morph: {
    fps: 16,
    frames: 34,
    render: (f, { sprite, alt, rnd }) => {
      const target = alt ?? sprite;
      const p = f < 13 ? f / 12 : f < 22 ? 1 : 1 - (f - 22) / 11;
      return { pixels: morph(sprite, target, Math.max(0, Math.min(1, p)), rnd) };
    },
  },

  /** Star twinkle: glowing shade and sparkles popping around the points. */
  twinkle: {
    fps: 8,
    frames: 12,
    loop: true,
    render: (f, { sprite }) => {
      const spots: [number, number][] = [
        [11, 0],
        [0, 2],
        [11, 10],
        [1, 10],
      ];
      const pixels = [...sprite];
      const [x, y] = spots[Math.floor(f / 3) % 4];
      if (f % 3 !== 2) pixels.push(...sparkle(x, y, f % 3 === 0 ? GOLD : undefined));
      return { pixels, shade: f % 2 ? 0.7 : 0.4 };
    },
  },

  /** Cursor click: presses in, a pixel ring ripples out from the tip. */
  click: {
    fps: 14,
    frames: 10,
    render: (f, { sprite }) => {
      const pressed = f >= 1 && f <= 3;
      const pixels = shift(sprite, pressed ? 1 : 0, pressed ? 1 : 0);
      if (f >= 2 && f <= 7) {
        const r = f - 1;
        for (let i = -r; i <= r; i++) {
          const j = r - Math.abs(i);
          pixels.push({ x: 2 + i, y: 1 + j, t: f > 5 ? 2 : 1 }, { x: 2 + i, y: 1 - j, t: f > 5 ? 2 : 1 });
        }
      }
      return { pixels };
    },
  },

  /** Lightning strike: drops in from the sky and flashes yellow. */
  strike: {
    fps: 14,
    frames: 12,
    render: (f, { sprite }) => {
      if (f < 2) return { pixels: shift(sprite, 0, -6 + f * 3) };
      const flash = f === 3 || f === 5 || f === 7;
      return { pixels: flash ? tint(sprite, GOLD) : sprite, alpha: f === 4 ? 0.3 : 1 };
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Context                                                                     */
/* -------------------------------------------------------------------------- */

/** Deterministic hash → [0, 1). Same sprite always explodes the same way. */
function hash(i: number, salt: number) {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salt + 7, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 13;
  return ((h >>> 0) % 10000) / 10000;
}

export function pixelContext(art: PixelArt, alt?: PixelArt): PixelContext {
  const frames: Record<string, Pixel[]> = {};
  for (const [name, grid] of Object.entries(art.frames ?? {})) frames[name] = parseSprite(grid);
  return {
    sprite: parseSprite(art.sprite),
    alt: alt ? parseSprite(alt.sprite) : undefined,
    frames,
    rnd: (i, salt = 0) => hash(i, salt),
  };
}

export const pixelEffectDuration = (effect: PixelEffect) => effect.frames / effect.fps;
