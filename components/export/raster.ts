import { ParticleSim } from "../motion/particles";
import { assembleApng } from "./apng";
import { encodeGif } from "./gif";
import type { Trigger } from "./render";
import { svgMarkup } from "./render";
import type { ExportOptions } from "./options";
import type { IconVariant } from "../icons/types";
import type { Scene } from "./scene";

/**
 * Browser-side rasterising: static PNG, and frame capture for GIF / APNG.
 *
 * Frames are drawn from the exact SVG the "SVG" export produces - paused at a
 * moment in time with the browser's own animation engine - so a GIF can never
 * disagree with the SVG. Particles (canvas-drawn) are simulated at fixed time
 * steps and composited on top.
 */

/** Colour used when no colour is chosen: rasters can't inherit `currentColor`. */
export const INK = "#1c1f21";

export type RasterScale = 1 | 2 | 4 | 8;

async function loadSvg(markup: string): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // decode() has finished, so the bitmap no longer needs the URL.
    URL.revokeObjectURL(url);
  }
}

const toBlob = (canvas: HTMLCanvasElement, type = "image/png") =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("The browser could not encode the image."))), type));

function canvasOf(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  return [canvas, ctx];
}

/* -------------------------------------------------------------------------- */
/* Static PNG                                                                  */
/* -------------------------------------------------------------------------- */

/** PNG of the icon at rest (animated icons export their still pose), `scale`× the chosen size, transparent background. */
export async function renderPng(variant: IconVariant, options: ExportOptions, scale: RasterScale): Promise<Blob> {
  const still = { ...options, motionId: null, color: options.color ?? INK };
  const { markup, scene } = svgMarkup(variant, still);
  const img = await loadSvg(markup);
  const [canvas, ctx] = canvasOf(Math.round(scene.width * scale), Math.round(scene.height * scale));
  ctx.imageSmoothingEnabled = !variant.pixel;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return toBlob(canvas);
}

/* -------------------------------------------------------------------------- */
/* Animation frames                                                            */
/* -------------------------------------------------------------------------- */

export interface FrameSet {
  canvases: HTMLCanvasElement[];
  width: number;
  height: number;
  /** Delay between frames, ms. */
  delayMs: number;
  scene: Scene;
}

const MAX_FRAMES = 150;

/** Pixel size of the frames `renderFrames` produces (particles get breathing room around the icon). */
export function frameSize(scene: Scene, scale: number): { width: number; height: number } {
  const width = Math.round(scene.width * scale);
  const height = Math.round(scene.height * scale);
  const pad = scene.script ? Math.round(Math.max(width, height) * 0.6) : 0;
  return { width: width + pad * 2, height: height + pad * 2 };
}

/** Style that freezes every animation `t` seconds into the loop. */
function freeze(scene: Scene, t: number): string {
  const parts = [`.${scene.scope} *{animation-play-state:paused!important;animation-delay:${-t}s!important}`];
  for (const [cls, delay] of Object.entries(scene.delays)) parts.push(`.${scene.scope} .${cls}{animation-delay:${delay - t}s!important}`);
  return parts.join("");
}

export async function renderFrames(
  variant: IconVariant,
  options: ExportOptions,
  { scale, background, onProgress, signal }: { scale: RasterScale; background?: string | null; onProgress?: (done: number, total: number) => void; signal?: AbortSignal },
): Promise<FrameSet> {
  const withColor = { ...options, color: options.color ?? INK };
  const { markup, scene } = svgMarkup(variant, withColor, "loop" as Trigger);
  if (scene.info.tier !== "animated" || (!scene.css && !scene.script)) throw new Error("This icon has no animation to capture.");

  const seconds = scene.info.loopSeconds;
  const fps = Math.min(25, Math.max(8, Math.floor(MAX_FRAMES / seconds)));
  const total = Math.max(2, Math.round(seconds * fps));
  const dt = 1 / fps;

  const width = Math.round(scene.width * scale);
  const height = Math.round(scene.height * scale);
  const { width: outW, height: outH } = frameSize(scene, scale);
  const pad = (outW - width) / 2;

  // Particles: one warm-up pass first, so the loop starts with the previous pass's leftovers (seamless).
  const sim = scene.script ? new ParticleSim() : null;
  const [fieldCanvas, fieldCtx] = sim ? canvasOf(outW, outH) : [null, null];
  const u = (options.size * scale) / 24;
  const [vbX, vbY] = scene.viewBox.split(" ").map(Number);
  const speed = options.speed;
  const ink = withColor.color;

  const fire = (t: number) => {
    const script = scene.script;
    if (!sim || !script) return;
    const where = (gx: number, gy: number, follow?: boolean) => {
      const [fx, fy] = follow ? scene.followAt(t) : [0, 0];
      return { x: (gx + fx - vbX) * u, y: (gy + fy - vbY) * u };
    };
    const due = (at: number) => at / speed >= t - 1e-9 && at / speed < t + dt - 1e-9;
    for (const c of script.bursts) {
      if (due(c.at)) sim.burst(c.preset, { ...where(c.x ?? 12, c.y ?? 12, c.follow), u, ink, angle: c.angle, spread: c.spread, count: c.count });
    }
    for (const e of script.emitters) {
      if (!due(e.at)) continue;
      const duration = e.duration === undefined ? undefined : e.duration / speed;
      sim.emit(
        e.preset,
        e.rate * speed,
        (elapsed) => {
          let gx = e.x ?? 12;
          let gy = e.y ?? 12;
          if (e.path) {
            const p = Math.min(1, elapsed / (duration ?? 1)) * (e.path.length - 1);
            const i = Math.min(e.path.length - 2, Math.floor(p));
            const k = p - i;
            gx = e.path[i][0] + (e.path[i + 1][0] - e.path[i][0]) * k;
            gy = e.path[i][1] + (e.path[i + 1][1] - e.path[i][1]) * k;
          }
          // Follow cues track the icon at the moment they started.
          return { ...where(gx, gy, e.follow), u, ink, angle: e.angle, spread: e.spread };
        },
        duration,
      );
    }
  };
  const stepSim = (t: number) => {
    fire(t);
    sim?.advance(dt);
  };
  if (sim) for (let i = 0; i < total; i++) stepSim(i * dt);

  const canvases: HTMLCanvasElement[] = [];
  for (let i = 0; i < total; i++) {
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const t = i * dt;
    const img = await loadSvg(markup.replace("</style>", `${freeze(scene, t)}</style>`));
    const [canvas, ctx] = canvasOf(outW, outH);
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, outW, outH);
    }
    ctx.imageSmoothingEnabled = !scene.info.pixel;
    ctx.drawImage(img, pad, pad, width, height);
    if (sim && fieldCtx && fieldCanvas) {
      stepSim(t);
      sim.draw(fieldCtx, 1, pad);
      ctx.drawImage(fieldCanvas, 0, 0);
    }
    canvases.push(canvas);
    onProgress?.(i + 1, total);
  }
  return { canvases, width: outW, height: outH, delayMs: 1000 / fps, scene };
}

export async function renderGif(frames: FrameSet): Promise<Blob> {
  const rgba = frames.canvases.map((c) => ({ data: c.getContext("2d")!.getImageData(0, 0, frames.width, frames.height).data }));
  const bytes = encodeGif(rgba, frames.width, frames.height, frames.delayMs);
  return new Blob([bytes as BlobPart], { type: "image/gif" });
}

export async function renderApng(frames: FrameSet): Promise<Blob> {
  const pngs = await Promise.all(frames.canvases.map(async (c) => new Uint8Array(await (await toBlob(c)).arrayBuffer())));
  return new Blob([assembleApng(pngs, frames.delayMs) as BlobPart], { type: "image/png" });
}
