"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { toMarkup } from "../export/markup";
import type { ExportOptions } from "../export/options";
import { bakedSpeed, svgTree } from "../export/render";
import { buildScene } from "../export/scene";
import type { IconVariant } from "../icons/types";
import { ParticleField, playParticleScript } from "../motion/particles";
import { cx } from "../ui/Button";

const STAGE_SIZE = 160;
const MAX_EDGE = 240;

export type PlayMode = "loop" | "once";
export type Tone = "light" | "dark";

/**
 * The live preview: it plays the *exported* SVG (same scene, same CSS) so what
 * you watch is what the SVG, the React component and the GIF will contain.
 * Particles run on top with the same script the React component uses.
 */
export function PreviewStage({
  variant,
  options,
  mode,
  playKey,
  tone,
  onHover,
}: {
  variant: IconVariant;
  options: ExportOptions;
  mode: PlayMode;
  /** Bump to restart the animation. */
  playKey: number;
  tone: Tone;
  /** Called when the pointer enters — "once" mode replays. */
  onHover: () => void;
}) {
  const reduce = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);

  const { scene, markup } = useMemo(() => {
    const at = (size: number) => buildScene(variant, { ...options, size }, bakedSpeed(options.speed));
    let built = at(STAGE_SIZE);
    const edge = Math.max(built.width, built.height);
    if (edge > MAX_EDGE) built = at((STAGE_SIZE * MAX_EDGE) / edge);
    // The preview takes its colour from the stage, so currentColor is kept unless the user picked one.
    const tree = svgTree(built, { color: options.color }, "loop", mode === "once" ? { style: "--icona-iter:1" } : {});
    return { scene: built, markup: toMarkup(tree) };
  }, [variant, options, mode]);

  // Particles (the part of an animation that can't live inside the SVG).
  const script = scene.script;
  const loopSeconds = scene.info.loopSeconds;
  const ink = options.color ?? (tone === "dark" ? "#ffffff" : "#1c1f21");
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !script || reduce) return;
    const field = new ParticleField(host);
    const follow = () => host.querySelector(".fx");
    let stop = () => {};
    const play = () => {
      stop();
      stop = playParticleScript(field, host, script, { size: (scene.width * 24) / Number(scene.viewBox.split(" ")[2]), ink, speed: options.speed, follow: follow() });
    };
    play();
    const timer = mode === "loop" ? window.setInterval(play, Math.max(0.5, loopSeconds) * 1000) : undefined;
    return () => {
      window.clearInterval(timer);
      stop();
      field.destroy();
    };
  }, [script, scene, mode, playKey, ink, options.speed, loopSeconds, reduce]);

  return (
    <div
      className={cx(
        "relative flex h-[300px] items-center justify-center overflow-hidden rounded-[14px] border border-line transition-colors",
        tone === "dark" ? "bg-ink text-white" : "bg-checker text-ink",
      )}
      onPointerEnter={(e) => e.pointerType !== "touch" && onHover()}
    >
      <div
        ref={hostRef}
        key={playKey}
        role="img"
        aria-label={`${variant.name} ${variant.style}${options.motionId ? `, ${scene.info.motion?.label ?? ""} animation` : ""}`}
        className="relative"
        style={{ width: scene.width, height: scene.height, color: options.color ?? undefined }}
        // The markup is generated from the library's own icon data — never from user input.
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </div>
  );
}
