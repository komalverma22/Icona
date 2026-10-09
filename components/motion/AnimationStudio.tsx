"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { categoryLabel, iconVariantsByKey } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";
import type { IconVariant } from "../icons/types";
import { useLibrary } from "../library/LibraryProvider";
import { cx } from "../ui/Button";
import { MotionIcon } from "./MotionIcon";
import { getMotions, motionTiming, resolveMotion } from "./registry";
import { MOTION_STYLE_BY_ID, MOTION_STYLES } from "./styles";
import type { MotionVariant } from "./types";

const BACK = iconVariantsByKey.get("arrow-left-outline")!;
const CLOSE = iconVariantsByKey.get("x-outline")!;
const REPLAY = iconVariantsByKey.get("refresh-outline")!;
const UNDO = iconVariantsByKey.get("undo-outline")!;

const ICON_BUTTON =
  "flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border border-line bg-white px-2.5 text-[12px] leading-[14.4px] font-medium text-ink shadow-button transition-[background-color,color,opacity] hover:bg-card disabled:cursor-default disabled:opacity-40";

/** Stop / play glyphs drawn inline so they swap instantly. */
const PlayGlyph = ({ playing }: { playing: boolean }) => (
  <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    {playing ? <rect x="6" y="6" width="12" height="12" rx="2" /> : <path d="M8 5.5V18.5A1 1 0 0 0 9.5 19.4L19.5 12.9A1 1 0 0 0 19.5 11.1L9.5 4.6A1 1 0 0 0 8 5.5Z" />}
  </svg>
);

/** A stage that plays one variant; `playKey` replays it. */
function Stage({
  variant,
  motion: mv,
  playing,
  playKey,
  size,
  className,
}: {
  variant: IconVariant;
  motion: MotionVariant;
  playing: boolean;
  playKey: number;
  size: number;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={cx("relative overflow-visible rounded-[12px] border border-line bg-card text-ink", className)}
      onPointerEnter={(e) => e.pointerType !== "touch" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType !== "touch" && setHovered(false)}
    >
      <MotionIcon variant={variant} motion={mv} active={playing || hovered} playKey={playKey} size={size} />
    </div>
  );
}

/**
 * Animation Studio for one icon: a large preview stage, play / replay / loop /
 * reset controls, the icon's motion variants grouped by style (selecting one
 * also sets what the grid card plays on hover), and a compare grid that plays
 * every variant side by side.
 */
export function AnimationStudio({ variantKey, inSheet = false }: { variantKey: string; inSheet?: boolean }) {
  const { motionChoices, setMotionChoice, closeStudio, openStudio, filters, setFilter } = useLibrary();
  const reduce = useReducedMotion();
  const variant = iconVariantsByKey.get(variantKey);
  const motions = useMemo(() => (variant ? getMotions(variant) : []), [variant]);
  const chosenId = motionChoices[variantKey];
  const current = (variant && resolveMotion(variant, filters.motion, chosenId)) ?? motions[0];

  const [playing, setPlaying] = useState(true);
  const [playKey, setPlayKey] = useState(0);
  const [loop, setLoop] = useState(false);
  const [compareKey, setCompareKey] = useState(0);
  const [comparing, setComparing] = useState(false);
  const titleId = useId();
  const listRef = useRef<(HTMLButtonElement | null)[]>([]);
  const backRef = useRef<HTMLButtonElement>(null);

  const timing = variant && current ? motionTiming(variant, current) : { duration: 1, loops: false };

  // Replay whenever the icon or the variant changes.
  useEffect(() => {
    setPlaying(true);
    setPlayKey((k) => k + 1);
  }, [variantKey, current?.id]);

  // One-shots stop after a pass (or re-trigger when looping); looping styles keep playing until stopped.
  useEffect(() => {
    if (!playing || timing.loops) return;
    const t = window.setTimeout(() => {
      if (loop) setPlayKey((k) => k + 1);
      else setPlaying(false);
    }, (timing.duration + (loop ? 0.6 : 0.2)) * 1000);
    return () => window.clearTimeout(t);
  }, [playing, playKey, loop, timing.duration, timing.loops]);

  // Compare: play everything once together.
  useEffect(() => {
    if (!comparing) return;
    const longest = Math.max(...motions.map((m) => (variant ? motionTiming(variant, m).duration : 1)));
    const t = window.setTimeout(() => setComparing(false), Math.min(longest, 3) * 1000 + 300);
    return () => window.clearTimeout(t);
  }, [comparing, compareKey, motions, variant]);

  useEffect(() => {
    if (!inSheet) backRef.current?.focus();
  }, [inSheet, variantKey]);

  // Escape returns to the filters on desktop (the sheet handles it on mobile).
  useEffect(() => {
    if (inSheet) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) closeStudio();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [inSheet, closeStudio]);

  const replay = useCallback(() => {
    setPlaying(true);
    setPlayKey((k) => k + 1);
  }, []);

  const choose = (m: MotionVariant) => {
    setMotionChoice(variantKey, m.id === motions[0]?.id && filters.motion === "all" ? null : m.id);
    if (m.id === current?.id) replay();
  };

  const reset = () => {
    setMotionChoice(variantKey, null);
    setLoop(false);
    setPlaying(false);
    setPlayKey((k) => k + 1);
  };

  const onListKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + motions.length) % motions.length;
    choose(motions[next]);
    listRef.current[next]?.focus();
  };

  if (!variant || !current) return null;

  const twinKey = `${variant.iconId}-${variant.style === "outline" ? "fill" : "outline"}`;
  const hasTwin = iconVariantsByKey.has(twinKey);
  const grouped = MOTION_STYLES.map((s) => ({ style: s, items: motions.filter((m) => m.style === s.id) })).filter((g) => g.items.length);
  const isPixel = Boolean(variant.pixel);
  const stageSize = isPixel ? 48 : 56;

  return (
    <section aria-labelledby={titleId} className="flex w-full flex-col">
      {/* Header */}
      {!inSheet && (
        <div className="mb-4 flex h-6 items-center justify-between">
          <button
            ref={backRef}
            type="button"
            onClick={closeStudio}
            className="-ml-1.5 flex h-6 cursor-pointer items-center gap-1 rounded-[6px] px-1.5 text-[12px] leading-[14.4px] font-medium text-muted transition-colors hover:bg-[rgba(28,31,33,0.04)] hover:text-ink"
          >
            <IconRenderer variant={BACK} size={12} recipe={null} />
            Filters
          </button>
          <button
            type="button"
            onClick={closeStudio}
            aria-label="Close animation studio"
            className="flex size-6 cursor-pointer items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-[rgba(28,31,33,0.04)] hover:text-ink"
          >
            <IconRenderer variant={CLOSE} size={12} recipe={null} />
          </button>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id={titleId} className="truncate text-[15px] leading-5 font-medium text-ink">
            {variant.name}
          </h2>
          <p className="mt-0.5 text-[12px] leading-4 text-muted">
            {categoryLabel(variant.category)} · {motions.length} animations
          </p>
        </div>
        {hasTwin && (
          <div role="radiogroup" aria-label="Icon style" className="flex shrink-0 rounded-[9px] border border-line bg-card p-0.5">
            {(["outline", "fill"] as const).map((style) => {
              const selected = variant.style === style;
              return (
                <button
                  key={style}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => !selected && openStudio(`${variant.iconId}-${style}`)}
                  className={cx(
                    "h-6 cursor-pointer rounded-[7px] px-2 text-[11px] leading-3 font-medium capitalize transition-colors",
                    selected ? "surface-raised text-ink shadow-segment" : "text-muted hover:text-ink",
                  )}
                >
                  {style}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stage */}
      <Stage variant={variant} motion={current} playing={playing} playKey={playKey} size={stageSize} className="mt-4 h-[172px]" />
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] leading-[14px] text-muted">
        <span className="min-w-0 truncate">
          <span className="font-medium text-ink">{current.label}</span> · {MOTION_STYLE_BY_ID.get(current.style)?.label}
          {timing.loops ? " · loops" : ""}
        </span>
        <span className="shrink-0">Hover to preview</span>
      </div>
      {reduce && (
        <p role="note" className="mt-2 rounded-[8px] bg-card px-2.5 py-2 text-[11px] leading-4 text-muted">
          Your system asks for reduced motion, so previews are paused.
        </p>
      )}

      {/* Controls */}
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        <button type="button" onClick={() => (playing ? setPlaying(false) : replay())} className={ICON_BUTTON} aria-pressed={playing}>
          <PlayGlyph playing={playing} />
          {playing ? "Stop" : "Play"}
        </button>
        <button type="button" onClick={replay} className={ICON_BUTTON} aria-label="Replay animation">
          <IconRenderer variant={REPLAY} size={12} recipe={null} />
        </button>
        <button
          type="button"
          onClick={() => {
            setLoop((l) => !l);
            replay();
          }}
          aria-pressed={loop}
          disabled={timing.loops}
          className={cx(ICON_BUTTON, loop && "border-accent bg-[rgba(91,220,103,0.1)] hover:bg-[rgba(91,220,103,0.16)]")}
        >
          Loop
        </button>
        <button type="button" onClick={reset} className={ICON_BUTTON} aria-label="Reset to the default animation">
          <IconRenderer variant={UNDO} size={12} recipe={null} />
        </button>
      </div>

      {/* Variants */}
      {/* <h3 className="mt-6 mb-2 text-[12px] leading-3 font-medium text-muted">Variants</h3>
      <div role="radiogroup" aria-label={`${variant.name} animations`} className="flex flex-col gap-3">
        {grouped.map(({ style, items }) => (
          <div key={style.id} className="flex flex-col gap-0.5">
            <span className="px-1 text-[10px] leading-3 font-medium tracking-[0.04em] text-muted/80 uppercase">{style.label}</span>
            {items.map((m) => {
              const index = motions.indexOf(m);
              const selected = m.id === current.id;
              return (
                <button
                  key={m.id}
                  ref={(el) => {
                    listRef.current[index] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => choose(m)}
                  onKeyDown={(e) => onListKey(e, index)}
                  className={cx(
                    "relative flex h-8 w-full cursor-pointer items-center justify-between rounded-[9px] px-2.5 text-left text-[12px] leading-[14.4px] font-medium transition-colors focus-visible:outline-offset-[-1px]",
                    selected ? "text-ink" : "text-muted hover:bg-[rgba(28,31,33,0.04)] hover:text-ink",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId={`studio-variant-${variantKey}`}
                      aria-hidden
                      className="absolute inset-0 rounded-[9px] border border-line surface-raised shadow-segment"
                      transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.8 }}
                    />
                  )}
                  <span className="relative truncate">{m.label}</span>
                  {chosenId === m.id && <span className="relative text-[10px] text-accent">On card</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div> */}

      {/* Compare */}
      <div className="mt-6 mb-2 flex items-center justify-between">
        <h3 className="text-[12px] leading-3 font-medium text-muted">Compare</h3>
        <button
          type="button"
          onClick={() => {
            setComparing(true);
            setCompareKey((k) => k + 1);
          }}
          className="flex h-6 cursor-pointer items-center gap-1 rounded-[6px] px-1.5 text-[12px] leading-[14.4px] font-medium text-muted transition-colors hover:bg-[rgba(28,31,33,0.04)] hover:text-ink"
        >
          <PlayGlyph playing={false} />
          Play all
        </button>
      </div>
      <ul className="grid grid-cols-3 gap-1.5">
        {motions.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => choose(m)}
              aria-label={`Use ${m.label}`}
              className={cx(
                "group flex w-full cursor-pointer flex-col items-stretch gap-1 rounded-[12px] p-0 text-left focus-visible:outline-offset-1",
              )}
            >
              <Stage
                variant={variant}
                motion={m}
                playing={comparing}
                playKey={compareKey}
                size={isPixel ? 24 : 22}
                className={cx("h-[64px] transition-colors", m.id === current.id ? "border-accent" : "group-hover:border-[rgba(28,31,33,0.2)]")}
              />
              <span className={cx("truncate px-0.5 text-[10px] leading-3 font-medium", m.id === current.id ? "text-ink" : "text-muted")}>{m.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Pixel collection link */}
      <AnimatePresence>
        {filters.set.kind !== "category" || filters.set.id !== "pixel" ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setFilter("set", { kind: "category", id: "pixel" });
              closeStudio();
            }}
            className="mt-6 flex h-10 w-full cursor-pointer items-center justify-between rounded-[10px] border border-line bg-card px-3 text-[12px] leading-[14.4px] font-medium text-ink transition-colors hover:bg-white"
          >
            <span className="flex items-center gap-2">
              <IconRenderer variant={iconVariantsByKey.get("pixel-gamepad-fill")!} size={16} recipe={null} />
              {isPixel ? "More pixel art" : "Explore the pixel art collection"}
            </span>
            <span aria-hidden className="text-muted">→</span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
