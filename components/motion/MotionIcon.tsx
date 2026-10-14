"use client";

import { animate, motion, useReducedMotion, useSpring, type AnimationPlaybackControls } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useRef, type PointerEvent } from "react";
import { ACTIVE, REST } from "../icons/animations/animationTypes";
import { directionVector } from "../icons/animations/primitives";
import { toSvgMarkup } from "../export/static";
import { IconRenderer } from "../icons/IconRenderer";
import type { IconVariant } from "../icons/types";
import { buildEffect } from "./effects";
import { ParticleField } from "./particles";
import { PixelPlayer } from "./PixelPlayer";
import { resolveTwin } from "./registry";
import type { EffectSpec, EffectTarget, EffectTrack, MotionVariant, ParticleCue } from "./types";

export interface MotionIconProps {
  variant: IconVariant;
  /** Variant to play; undefined plays the icon's signature path animation (if any). */
  motion?: MotionVariant;
  active: boolean;
  /** Bump to replay from the start while active. */
  playKey?: number;
  size: number;
  strokeWidth?: number;
  /** Clip icon movement to the stage (cards); particles always overflow. */
  clip?: boolean;
}

const SPRING = { stiffness: 260, damping: 22, mass: 0.6 };
const TRAIL_OPACITY = [0.34, 0.2, 0.12, 0.07];

type Targets = Record<Exclude<EffectTarget, "trail">, HTMLElement | null>;

/** First keyframe of every property a target animates = its rest pose. */
function restPose(spec: EffectSpec | null, target: EffectTarget) {
  const rest: Record<string, number | string> = {};
  for (const t of spec?.tracks ?? []) {
    if ((t.target ?? "icon") !== target) continue;
    for (const [prop, values] of Object.entries(t.values)) if (values?.length) rest[prop] = values[0];
  }
  return rest;
}

function run(el: HTMLElement, track: EffectTrack, delayExtra = 0, omitOpacity = false): AnimationPlaybackControls {
  const values = omitOpacity ? Object.fromEntries(Object.entries(track.values).filter(([k]) => k !== "opacity")) : track.values;
  const controls = animate(el, values as never, {
    duration: track.duration,
    delay: (track.delay ?? 0) + delayExtra,
    ease: track.ease as never,
    times: track.times,
    repeat: track.loop ? Infinity : 0,
    repeatDelay: track.repeatDelay,
  });
  // Full turns end visually at rest - snap them to 0 so leaving doesn't unwind the spin.
  if (!track.loop) {
    controls.then(() => {
      const snap: Record<string, number> = {};
      for (const prop of ["rotate", "rotateX", "rotateY"] as const) {
        const v = track.values[prop];
        const last = v?.[v.length - 1];
        if (typeof last === "number" && last !== 0 && last % 360 === 0) snap[prop] = 0;
      }
      if (Object.keys(snap).length) animate(el, snap, { duration: 0 });
    });
  }
  return controls;
}

/**
 * Renders one icon with a motion variant. Layers, outside → in:
 *   stage (pointer tracking, particle canvas host)
 *   └ clip box
 *     └ cursor layer (spring-driven tilt / magnetic / look)
 *       ├ trail copies, glitch copies, twin (morph target)
 *       └ icon layer (effect keyframes) → glow copy, icon / pixel player, shine
 * Everything temporary (timers, emitters, canvas, loops) is torn down when
 * the icon deactivates or unmounts.
 */
export const MotionIcon = memo(function MotionIcon({ variant, motion: mv, active, playKey = 0, size, strokeWidth, clip = true }: MotionIconProps) {
  const reduce = useReducedMotion();
  const playing = active && !reduce;
  const stageRef = useRef<HTMLDivElement>(null);
  const targets = useRef<Targets>({ icon: null, twin: null, glow: null, shine: null, glitchA: null, glitchB: null });
  const trailRefs = useRef<(HTMLElement | null)[]>([]);
  const fieldRef = useRef<ParticleField | null>(null);
  const specRef = useRef<EffectSpec | null>(null);

  const cx = useSpring(0, SPRING);
  const cy = useSpring(0, SPRING);
  const rx = useSpring(0, SPRING);
  const ry = useSpring(0, SPRING);
  const rz = useSpring(0, SPRING);

  const u = size / 24;
  const dir = directionVector(mv?.recipeOptions?.direction ?? variant.animationOptions?.direction);

  // The spec shape (which layers exist) only depends on the variant, so build a size-only preview for layout.
  const layout = useMemo(() => buildEffect(mv?.effect, { u, exitX: 100, exitY: 100, dir }), [mv?.effect, u, dir[0], dir[1]]);
  const layers = layout?.layers ?? {};
  const twin = layers.twin ? resolveTwin(variant, mv?.morphTo) : undefined;
  const pixelAlt = mv?.pixel && mv.morphTo ? resolveTwin(variant, mv.morphTo)?.pixel : undefined;
  const recipe = mv ? mv.recipe : variant.animation;

  const shineMask = useMemo(() => {
    if (!layers.shine) return undefined;
    const markup = toSvgMarkup(variant, size, { strokeWidth, color: "#000" });
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(markup)}")`;
  }, [layers.shine, variant, size, strokeWidth]);

  /* Effect lifecycle ------------------------------------------------------ */

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !playing || !mv?.effect) return;

    const rect = stage.getBoundingClientRect();
    const spec = buildEffect(mv.effect, { u, exitX: rect.width / 2 + size * 0.6, exitY: rect.height / 2 + size * 0.6, dir });
    if (!spec) return;
    specRef.current = spec;

    const controls: AnimationPlaybackControls[] = [];
    const timers: number[] = [];

    // Keyframe tracks.
    for (const track of spec.tracks) {
      const target = track.target ?? "icon";
      if (target === "trail") continue;
      const el = targets.current[target];
      if (el) controls.push(run(el, track));
      if (target === "icon" && spec.layers?.trail) {
        trailRefs.current.forEach((copy, i) => {
          if (!copy) return;
          controls.push(run(copy, track, (i + 1) * 0.05, true));
          const total = (track.delay ?? 0) + track.duration + (i + 1) * 0.05;
          controls.push(animate(copy, { opacity: [0, TRAIL_OPACITY[i] ?? 0.05, TRAIL_OPACITY[i] ?? 0.05, 0] }, { duration: total, times: [0, 0.08, 0.8, 1] }));
        });
      }
    }

    // Particles.
    const field = (fieldRef.current ??= new ParticleField(stage));
    const ink = getComputedStyle(stage).color;
    const origin = (gx: number, gy: number, follow?: boolean) => {
      const s = stage.getBoundingClientRect();
      let ox = s.width / 2 - size / 2 + gx * u;
      let oy = s.height / 2 - size / 2 + gy * u;
      const icon = targets.current.icon;
      if (follow && icon) {
        const r = icon.getBoundingClientRect();
        ox += r.left + r.width / 2 - (s.left + s.width / 2);
        oy += r.top + r.height / 2 - (s.top + s.height / 2);
      }
      return { x: ox, y: oy };
    };
    const fire = (cue: ParticleCue) =>
      field.burst(cue.preset, { ...origin(cue.x ?? 12, cue.y ?? 12, cue.follow), u, ink, angle: cue.angle, spread: cue.spread, count: cue.count });
    for (const cue of spec.particles ?? []) timers.push(window.setTimeout(() => fire(cue), cue.at * 1000));
    const emitterIds: number[] = [];
    for (const e of spec.emitters ?? []) {
      timers.push(
        window.setTimeout(() => {
          emitterIds.push(
            field.emit(
              e.preset,
              e.rate,
              (t) => {
                const [gx, gy] = e.path ? e.path(Math.min(1, t / (e.duration ?? 1))) : [e.x ?? 12, e.y ?? 12];
                return { ...origin(gx, gy, e.follow), u, ink, angle: e.angle, spread: e.spread };
              },
              e.duration,
            ),
          );
        }, e.at * 1000),
      );
    }

    return () => {
      controls.forEach((c) => c.stop());
      timers.forEach((t) => window.clearTimeout(t));
      emitterIds.forEach((id) => field.stop(id));
      field.release();
      // Settle every layer back to its rest pose.
      for (const name of Object.keys(targets.current) as (keyof Targets)[]) {
        const el = targets.current[name];
        const rest = restPose(spec, name);
        if (el && Object.keys(rest).length) animate(el, rest as never, { duration: 0.25, ease: [0.22, 1, 0.36, 1] });
      }
      trailRefs.current.forEach((copy) => {
        if (copy) animate(copy, { opacity: 0, ...restPose(spec, "icon") } as never, { duration: 0.15 });
      });
    };
  }, [playing, playKey, mv?.effect, size, u]);

  useEffect(() => () => fieldRef.current?.destroy(), []);

  /* Cursor ------------------------------------------------------------------ */

  const cursor = playing ? layout?.cursor : undefined;
  useEffect(() => {
    if (cursor) return;
    cx.set(0);
    cy.set(0);
    rx.set(0);
    ry.set(0);
    rz.set(0);
  }, [cursor, cx, cy, rx, ry, rz]);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!cursor) return;
      const r = e.currentTarget.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 2 - 1;
      const py = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (cursor === "tilt") {
        rx.set(-py * 22);
        ry.set(px * 26);
      } else if (cursor === "magnetic") {
        cx.set(px * r.width * 0.18);
        cy.set(py * r.height * 0.18);
      } else if (cursor === "repel") {
        const d = Math.max(0.15, Math.hypot(px, py));
        cx.set((-px / d) * size * 0.7 * (1 - Math.min(1, d) * 0.5));
        cy.set((-py / d) * size * 0.7 * (1 - Math.min(1, d) * 0.5));
        rz.set(-px * 12);
      } else if (cursor === "look") {
        const base = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
        rz.set((Math.atan2(py, px) * 180) / Math.PI - base);
      }
    },
    [cursor, cx, cy, rx, ry, rz, size, dir],
  );

  /* Render ------------------------------------------------------------------ */

  const glyph = (state: typeof ACTIVE | typeof REST, withRecipe: boolean) => (
    <IconRenderer
      key={withRecipe ? playKey : undefined}
      variant={variant}
      size={size}
      strokeWidth={strokeWidth}
      state={state}
      recipe={withRecipe ? recipe : null}
      recipeOptions={withRecipe ? mv?.recipeOptions : undefined}
    />
  );
  const still = glyph(REST, false);
  const pixelActive = playing && mv?.pixel && variant.pixel;
  const box = { width: size, height: size };
  const abs = "pointer-events-none absolute inset-0 flex items-center justify-center";

  return (
    <div ref={stageRef} className="absolute inset-0" onPointerMove={cursor ? onPointerMove : undefined}>
      <div className={`${clip ? "overflow-hidden" : ""} absolute inset-0 flex items-center justify-center rounded-[inherit]`} style={{ perspective: size * 8 }}>
        <motion.div className="relative" style={{ ...box, x: cx, y: cy, rotateX: rx, rotateY: ry, rotate: rz }}>
          {Array.from({ length: layers.trail ?? 0 }, (_, i) => (
            <div
              key={`trail-${i}`}
              ref={(el) => {
                trailRefs.current[i] = el;
              }}
              className={abs}
              style={{ opacity: 0, transformOrigin: layout?.origin }}
            >
              {still}
            </div>
          ))}
          {layers.glitch && (
            <>
              <div ref={(el) => void (targets.current.glitchA = el)} className={`${abs} mix-blend-multiply`} style={{ opacity: 0, color: "#22d3ee" }}>
                {still}
              </div>
              <div ref={(el) => void (targets.current.glitchB = el)} className={`${abs} mix-blend-multiply`} style={{ opacity: 0, color: "#ff3b6b" }}>
                {still}
              </div>
            </>
          )}

          <div ref={(el) => void (targets.current.icon = el)} className="relative" style={{ ...box, transformOrigin: layout?.origin }}>
            {layers.glow && (
              <div ref={(el) => void (targets.current.glow = el)} className={abs} style={{ opacity: 0, filter: `blur(${Math.max(2, size / 9)}px)` }}>
                {still}
              </div>
            )}
            <div className="relative" style={box}>
              {pixelActive ? (
                <PixelPlayer art={variant.pixel!} alt={pixelAlt} effect={mv.pixel!} playKey={playKey} size={size} />
              ) : (
                glyph(playing ? ACTIVE : REST, Boolean(recipe))
              )}
            </div>
            {layers.shine && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{ maskImage: shineMask, WebkitMaskImage: shineMask, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" }}
              >
                <div
                  ref={(el) => void (targets.current.shine = el)}
                  className="absolute inset-y-0 w-full"
                  style={{
                    transform: `translateX(${-size}px)`,
                    background: "linear-gradient(105deg, transparent 18%, rgba(255,255,255,0.7) 36%, #fff 50%, rgba(255,255,255,0.7) 64%, transparent 82%)",
                  }}
                />
              </div>
            )}
          </div>

          {twin && (
            <div ref={(el) => void (targets.current.twin = el)} className={abs} style={{ opacity: 0 }}>
              <IconRenderer variant={twin} size={size} strokeWidth={strokeWidth} recipe={null} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
});
