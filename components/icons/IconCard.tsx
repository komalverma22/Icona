"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import { ensureUser, loginHref } from "../auth/useUser";
import { MotionIcon } from "../motion/MotionIcon";
import type { MotionVariant } from "../motion/types";
import { toggleSaved, useIsSaved } from "../saved/savedIconsStore";
import { toSvgMarkup } from "../export/static";
import { cx } from "../ui/Button";
import { ACTIVE, REST } from "./animations/animationTypes";
import { EASE_OUT } from "./animations/primitives";
import { copyText } from "./clipboard";
import { iconVariantsByKey } from "./iconLibrary";
import { IconRenderer } from "./IconRenderer";
import type { IconVariant } from "./types";

// The card's own glyphs come from the library itself.
const BOOKMARK_OUTLINE = iconVariantsByKey.get("bookmark-outline")!;
const BOOKMARK_FILL = iconVariantsByKey.get("bookmark-fill")!;
const CHECK = iconVariantsByKey.get("check-outline")!;
const MOTION_GLYPH = iconVariantsByKey.get("sparkles-outline")!;

const COPIED_MS = 1600;
const reveal = { duration: 0.2, ease: EASE_OUT };

export interface IconCardProps {
  variant: IconVariant;
  /** Rendered (and copied) size in px. */
  size: number;
  /** Stroke width on the 24px grid (rendered and copied). */
  strokeWidth: number;
  /** Icon colour; null inherits the card's ink colour and copies as `currentColor`. */
  color: string | null;
  /** Motion variant played on hover (resolved from the Motion filter and the user's choice). */
  motion?: MotionVariant;
  /** Number of motion variants this icon offers. */
  motionCount: number;
  onOpenStudio: (variantKey: string) => void;
}

/**
 * A single icon tile.
 *  - Hover (mouse/pen), keyboard focus or a tap activates it: the SVG path
 *    animation plays, the Save button and "Copy as SVG" animate in.
 *  - Leaving resets the animation to rest; re-entering replays it from the start.
 *  - The card only passes `active` to MotionIcon — the chosen motion variant
 *    (path recipe, effect, particles or pixel frames) does the rest.
 *  - Clicking the card (mouse / pen), the Animations button or "A" opens the
 *    Animation Studio for this icon.
 */
export const IconCard = memo(function IconCard({ variant, size, strokeWidth, color, motion: mv, motionCount, onOpenStudio }: IconCardProps) {
  const saved = useIsSaved(variant.key);
  const reduceMotion = useReducedMotion();

  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const copiedTimer = useRef<number | undefined>(undefined);
  const savedTimer = useRef<number | undefined>(undefined);

  const active = hovered || keyboardFocus || touched;
  const pointerType = useRef<string>("mouse");

  useEffect(
    () => () => {
      window.clearTimeout(copiedTimer.current);
      window.clearTimeout(savedTimer.current);
    },
    [],
  );

  const onCopy = useCallback(async () => {
    const ok = await copyText(toSvgMarkup(variant, size, { strokeWidth, color }));
    if (!ok) return;
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  }, [variant, size, strokeWidth, color]);

  const router = useRouter();
  const onToggleSave = useCallback(async () => {
    // Saving needs an account — send signed-out visitors to log in and bring them back.
    if (!(await ensureUser())) {
      router.push(loginHref("save"));
      return;
    }
    const willSave = !saved;
    toggleSaved(variant.key);
    window.clearTimeout(savedTimer.current);
    setJustSaved(willSave);
    if (willSave) savedTimer.current = window.setTimeout(() => setJustSaved(false), 700);
  }, [saved, variant.key, router]);

  /* Interaction state ---------------------------------------------------- */

  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType !== "touch") setHovered(true);
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType !== "touch") setHovered(false);
  };
  const onPointerDown = (e: PointerEvent) => {
    pointerType.current = e.pointerType;
    if (e.pointerType === "touch") setTouched(true);
  };
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    // Taps only activate the card on touch; buttons handle their own clicks.
    if (pointerType.current === "touch" || (e.target as HTMLElement).closest("button")) return;
    onOpenStudio(variant.key);
  };
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    // Only keyboard focus counts — clicking Save must not pin the card open.
    if (e.target.matches(":focus-visible")) setKeyboardFocus(true);
  };
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setKeyboardFocus(false);
    setTouched(false);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === "c" || key === "enter") {
      e.preventDefault();
      void onCopy();
    } else if (key === "s") {
      e.preventDefault();
      onToggleSave();
    } else if (key === "a") {
      e.preventDefault();
      onOpenStudio(variant.key);
    }
  };

  const label = `${variant.name}, ${variant.style}, ${motionCount} animations`;
  const showSave = active || saved;
  // Large icons make room for the Copy button while the card is active.
  const lift = Math.max(0, (size - 24) / 4);

  return (
    <div
      data-icon-card=""
      tabIndex={0}
      role="group"
      aria-label={label}
      aria-keyshortcuts="Enter C S A"
      data-active={active ? "" : undefined}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onClick={onClick}
      className="group/card relative h-[102.84px] cursor-pointer w-full rounded-[10px] bg-card outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* Figma "Item paints" hairline */}
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-[0.2px] rounded-[10px] border transition-colors duration-200",
          saved ? "border-[rgba(43,154,243,0.55)]" : "border-line",
        )}
      />
      {/* Figma raised "Background" layer — the hover surface */}
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-px rounded-[10px] bg-white shadow-card-hover transition-opacity duration-200",
          active ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Icon */}
      <div
        className="absolute inset-0 rounded-[10px] text-ink transition-transform duration-200 ease-out"
        style={{ transform: active && lift ? `translateY(-${lift}px)` : undefined, color: color ?? undefined }}
      >
        <MotionIcon variant={variant} motion={mv} active={active} size={size} strokeWidth={strokeWidth} />
      </div>

      {/* Name tooltip */}
      <AnimatePresence>
        {active && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3, transition: { duration: 0.12 } }}
            transition={reveal}
            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-ink px-2 py-1 text-[11px] leading-[14px] font-medium text-white shadow-card-hover"
          >
            {variant.name}
            {mv && <span className="text-white/60"> · {mv.label}</span>}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Animation Studio — top left */}
      {motionCount > 0 && (
        <motion.button
          type="button"
          aria-label={`Open animations for ${variant.name} (${motionCount} variants)`}
          onClick={() => onOpenStudio(variant.key)}
          initial={false}
          animate={active ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: -2 }}
          transition={reveal}
          className={cx(
            "absolute top-1.5 left-1.5 z-10 flex h-6 cursor-pointer items-center gap-1 rounded-[7px] px-1.5",
            active ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <span aria-hidden className="absolute inset-0 rounded-[7px] surface-raised shadow-button" />
          <span aria-hidden className="relative text-text">
            <IconRenderer variant={MOTION_GLYPH} size={12} recipe={null} />
          </span>
          <span aria-hidden className="relative text-[10px] leading-3 font-medium text-ink tabular-nums">
            {motionCount}
          </span>
        </motion.button>
      )}

      {/* Save / bookmark — top right */}
      <motion.button
        type="button"
        aria-label={saved ? `Remove ${variant.name} from saved` : `Save ${variant.name}`}
        aria-pressed={saved}
        onClick={onToggleSave}
        initial={false}
        animate={showSave ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: -2 }}
        transition={reveal}
        className={cx(
          "absolute top-1.5 right-1.5 z-10 flex size-6 cursor-pointer items-center justify-center rounded-[7px]",
          showSave ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <span
          aria-hidden
          className={cx(
            "absolute inset-0 rounded-[7px] surface-raised shadow-button transition-opacity duration-200",
            active ? "opacity-100" : "opacity-0",
          )}
        />
        <span className={cx("relative transition-colors duration-200", saved ? "text-accent" : "text-text")}>
          <IconRenderer
            variant={saved ? BOOKMARK_FILL : BOOKMARK_OUTLINE}
            size={14}
            state={justSaved && !reduceMotion ? ACTIVE : REST}
          />
        </span>
      </motion.button>

      {/* Copy as SVG — bottom */}
      <motion.button
        type="button"
        onClick={onCopy}
        aria-label={`Copy ${variant.name} as SVG`}
        initial={false}
        animate={active || copied ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
        transition={reveal}
        className={cx(
          "absolute bottom-1.5 left-1/2 z-10 flex h-[22px] -translate-x-1/2 cursor-pointer items-center justify-center rounded-[7px] px-2",
          active || copied ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <span aria-hidden className="absolute inset-0 rounded-[7px] surface-raised shadow-button" />
        <span aria-live="polite" className="relative flex h-[14px] items-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={reveal}
                className="flex items-center gap-1 text-[11px] leading-[14px] font-medium whitespace-nowrap text-ink"
              >
                <span className="text-accent">
                  <IconRenderer variant={CHECK} size={12} initialState={REST} state={ACTIVE} />
                </span>
                Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={reveal}
                className="text-[11px] leading-[14px] font-medium whitespace-nowrap text-ink"
              >
                Copy as SVG
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>
    </div>
  );
});
