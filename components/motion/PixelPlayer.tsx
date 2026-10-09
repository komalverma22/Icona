"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { PIXEL_UNIT, pixelsToPath, SHADE_OPACITY, type Pixel } from "../icons/pixelArt";
import type { PixelArt } from "../icons/types";
import { PIXEL_EFFECTS, pixelContext, type PixelFrame } from "./pixelEffects";

interface PixelPlayerProps {
  art: PixelArt;
  /** Morph target (pixel "morph" effect). */
  alt?: PixelArt;
  effect: string;
  /** Changing this restarts the animation from frame 0. */
  playKey: number;
  size: number;
  /** Called once a one-shot effect has shown its final frame. */
  onDone?: () => void;
}

/** Group a frame's pixels into one path per paint (solid, shade, each custom colour). */
function framePaths(frame: PixelFrame) {
  const groups = new Map<string, Pixel[]>();
  for (const p of frame.pixels) {
    const k = p.c ?? (p.t === 2 ? "shade" : "solid");
    const list = groups.get(k);
    if (list) list.push(p);
    else groups.set(k, [p]);
  }
  return [...groups].map(([k, pixels]) => ({
    key: k,
    d: pixelsToPath(pixels, PIXEL_UNIT),
    fill: k === "solid" || k === "shade" ? "currentColor" : k,
    opacity: k === "shade" ? (frame.shade ?? SHADE_OPACITY) : undefined,
  }));
}

/**
 * Frame-by-frame pixel-art player. Steps frames with a timer at the effect's
 * own fps (no tweening between frames — that is the point), renders each
 * frame as crisp SVG paths and draws outside the 24px box when pixels fly.
 */
export const PixelPlayer = memo(function PixelPlayer({ art, alt, effect, playKey, size, onDone }: PixelPlayerProps) {
  const fx = PIXEL_EFFECTS[effect];
  const ctx = useMemo(() => pixelContext(art, alt), [art, alt]);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!fx) return;
    setFrame(0);
    let f = 0;
    const id = window.setInterval(() => {
      f += 1;
      if (f >= fx.frames) {
        if (fx.loop) f = 0;
        else {
          window.clearInterval(id);
          onDone?.();
          return;
        }
      }
      setFrame(f);
    }, 1000 / fx.fps);
    return () => window.clearInterval(id);
  }, [fx, playKey, onDone]);

  const { paths, alpha } = useMemo(() => {
    if (!fx) return { paths: [], alpha: 1 };
    const rendered = fx.render(Math.min(frame, fx.frames - 1), ctx);
    return { paths: framePaths(rendered), alpha: rendered.alpha ?? 1 };
  }, [fx, frame, ctx]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      overflow="visible"
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
      style={{ opacity: alpha, overflow: "visible" }}
    >
      {paths.map((p) => (
        <path key={p.key} d={p.d} fill={p.fill} fillOpacity={p.opacity} />
      ))}
    </svg>
  );
});
