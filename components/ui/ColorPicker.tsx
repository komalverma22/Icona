"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cx } from "./Button";
import { normalizeHex } from "./colorUtils";

/* -------------------------------------------------------------------------- */
/* Colour maths                                                                */
/* -------------------------------------------------------------------------- */

/** h: 0–360, s/v: 0–1. */
interface Hsv {
  h: number;
  s: number;
  v: number;
}

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    const c = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}

function hexToHsv(hex: string): Hsv | null {
  const m = normalizeHex(hex);
  if (!m) return null;
  const r = parseInt(m.slice(1, 3), 16) / 255;
  const g = parseInt(m.slice(3, 5), 16) / 255;
  const b = parseInt(m.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

export { normalizeHex };

/* -------------------------------------------------------------------------- */
/* Drag helper                                                                 */
/* -------------------------------------------------------------------------- */

/** Pointer-capture drag that reports the pointer position as fractions of the element. */
function useDrag(onMove: (x: number, y: number) => void) {
  const handle = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onMove(clamp((e.clientX - rect.left) / rect.width), clamp((e.clientY - rect.top) / rect.height));
  };
  return {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.focus();
      handle(e);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) handle(e);
    },
  };
}

/** Arrow-key step (Shift = 10×). Returns [dx, dy] or null. */
function arrowDelta(e: KeyboardEvent, step: number): [number, number] | null {
  const s = e.shiftKey ? step * 10 : step;
  switch (e.key) {
    case "ArrowLeft":
      return [-s, 0];
    case "ArrowRight":
      return [s, 0];
    case "ArrowUp":
      return [0, -s];
    case "ArrowDown":
      return [0, s];
  }
  return null;
}

const THUMB =
  "pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(28,31,33,0.18),0_1px_3px_rgba(10,10,11,0.25)]";

const HUE_GRADIENT = "linear-gradient(90deg,#f00 0%,#ff0 16.67%,#0f0 33.33%,#0ff 50%,#00f 66.67%,#f0f 83.33%,#f00 100%)";
export const RAINBOW_CONIC = "conic-gradient(from 180deg,#ff4d4d,#ffb84d,#f5e84d,#5bdc67,#4dd8ff,#4d6bff,#b04dff,#ff4d9e,#ff4d4d)";

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

interface EyeDropperCtor {
  new (): { open: () => Promise<{ sRGBHex: string }> };
}

interface ColorPickerProps {
  /** Current colour (hex) — the picker shows it when it is a custom pick. */
  value: string | null;
  /** True when the current colour came from this picker (draws the selected state). */
  active: boolean;
  onChange: (hex: string) => void;
  /** Colour shown on first open when nothing custom has been picked yet. */
  initial?: string;
}

/**
 * Compact custom colour picker: a swatch trigger that opens a popover with a
 * saturation/brightness pad, hue slider, hex field and (where the browser
 * supports it) an eyedropper. Changes apply live.
 */
export function ColorPicker({ value, active, onChange, initial = "#ff6b4a" }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(initial)!);
  const [draft, setDraft] = useState(initial.toUpperCase());
  const [canPick, setCanPick] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();
  const hex = hsvToHex(hsv);

  useEffect(() => setCanPick("EyeDropper" in window), []);

  // Sync from outside (e.g. a colour restored from a chip) when it differs from what we show.
  useEffect(() => {
    if (!active || !value || normalizeHex(value) === hex) return;
    const next = hexToHsv(value);
    if (next) {
      setHsv(next);
      setDraft(value.toUpperCase());
    }
  }, [value, active]); // eslint-disable-line react-hooks/exhaustive-deps -- `hex` is derived from local state

  const commit = useCallback(
    (next: Hsv) => {
      setHsv(next);
      const out = hsvToHex(next);
      setDraft(out.toUpperCase());
      onChange(out);
    },
    [onChange],
  );

  // Close on outside pointer / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    // Capture phase so Escape closes only the picker, not an enclosing sheet.
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const toggle = () => {
    // Opening applies the picker's colour straight away so the grid previews it.
    if (!open && !active) onChange(hex);
    setOpen((o) => !o);
  };

  const padDrag = useDrag((x, y) => commit({ ...hsv, s: x, v: 1 - y }));
  const hueDrag = useDrag((x) => commit({ ...hsv, h: x * 360 }));

  const onPadKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = arrowDelta(e, 0.01);
    if (!d) return;
    e.preventDefault();
    commit({ ...hsv, s: clamp(hsv.s + d[0]), v: clamp(hsv.v - d[1]) });
  };
  const onHueKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = arrowDelta(e, 1);
    if (!d) return;
    e.preventDefault();
    commit({ ...hsv, h: clamp(hsv.h + d[0] - d[1], 0, 360) });
  };

  const applyDraft = (text: string) => {
    const next = normalizeHex(text);
    const parsed = next && hexToHsv(next);
    if (parsed) commit(parsed);
    else setDraft(hex.toUpperCase());
  };

  const pickFromScreen = async () => {
    try {
      const Ctor = (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper;
      const { sRGBHex } = await new Ctor().open();
      const parsed = hexToHsv(sRGBHex);
      if (parsed) commit(parsed);
    } catch {
      /* cancelled */
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <div className="rounded-[10px] border border-line bg-card p-[2.8px] drop-shadow-[0px_0.5px_0px_rgba(255,255,255,0.8)]">
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          aria-pressed={active}
          aria-label={active && value ? `Custom colour ${value.toUpperCase()}, open picker` : "Pick a custom colour"}
          className={cx(
            "group relative flex size-[26px] cursor-pointer items-center justify-center rounded-[8px] transition-shadow focus-visible:outline-offset-[-1px]",
            active ? "surface-raised shadow-segment" : "hover:bg-[rgba(28,31,33,0.04)]",
          )}
        >
          <span
            aria-hidden
            className="size-3.5 rounded-full shadow-[0_0_0_1px_rgba(28,31,33,0.1)] transition-transform duration-150 group-hover:scale-110"
            style={{ background: active && value ? value : RAINBOW_CONIC }}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={popoverId}
            role="dialog"
            aria-label="Custom colour"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full right-0 z-30 mt-2 flex w-[224px] origin-top-right flex-col gap-3 rounded-[12px] border border-line bg-white p-3 shadow-card-hover"
          >
            {/* Saturation / brightness */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Saturation and brightness"
              aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
              aria-valuenow={Math.round(hsv.s * 100)}
              onKeyDown={onPadKey}
              {...padDrag}
              className="relative h-[120px] w-full cursor-crosshair touch-none rounded-[8px] shadow-[inset_0_0_0_1px_rgba(28,31,33,0.08)] focus-visible:outline-offset-1"
              style={{
                background: `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(${hsv.h} 100% 50%))`,
              }}
            >
              <span className={THUMB} style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: hex }} />
            </div>

            {/* Hue */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Hue"
              aria-valuemin={0}
              aria-valuemax={360}
              aria-valuenow={Math.round(hsv.h)}
              onKeyDown={onHueKey}
              {...hueDrag}
              className="relative h-3 w-full cursor-pointer touch-none rounded-full shadow-[inset_0_0_0_1px_rgba(28,31,33,0.08)] focus-visible:outline-offset-1"
              style={{ background: HUE_GRADIENT }}
            >
              <span className={THUMB} style={{ left: `${(hsv.h / 360) * 100}%`, top: "50%", backgroundColor: `hsl(${hsv.h} 100% 50%)` }} />
            </div>

            {/* Hex + eyedropper */}
            <div className="flex items-center gap-1.5">
              <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-line bg-field px-2 shadow-field focus-within:border-accent">
                <span aria-hidden className="size-3.5 shrink-0 rounded-[4px] shadow-[0_0_0_1px_rgba(28,31,33,0.1)]" style={{ backgroundColor: hex }} />
                <span className="sr-only">Hex colour</span>
                <input
                  value={draft}
                  onChange={(e) => {
                    const text = e.target.value.toUpperCase();
                    setDraft(text);
                    // Apply as soon as a full 6-digit hex is typed; shorthand applies on Enter / blur.
                    if (/^#?[0-9A-F]{6}$/.test(text)) applyDraft(text);
                  }}
                  onBlur={(e) => applyDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyDraft(e.currentTarget.value);
                  }}
                  maxLength={7}
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full min-w-0 bg-transparent text-[12px] tracking-[0.02em] text-ink uppercase tabular-nums outline-none focus-visible:outline-none"
                />
              </label>
              {canPick && (
                <button
                  type="button"
                  onClick={pickFromScreen}
                  aria-label="Pick a colour from the screen"
                  title="Pick from screen"
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-line bg-card text-muted transition-colors hover:text-ink"
                >
                  <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11.5 7L17 12.5" />
                    <path d="M13.2 8.7L16.2 5.7A1.5 1.5 0 0 1 18.3 7.8L15.3 10.8" />
                    <path d="M12.8 9.2L6.2 15.8C5.8 16.2 5.6 16.8 5.6 17.3V18.4H6.7C7.2 18.4 7.8 18.2 8.2 17.8L14.8 11.2" />
                    <path d="M5.6 18.4L4 20" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
