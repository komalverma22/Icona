"use client";

import { motion } from "framer-motion";
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./Button";

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  /** Optional glyph shown before the label. */
  icon?: ReactNode;
  /** Accessible name when it differs from the visible label. */
  ariaLabel?: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: readonly SegmentOption<T>[];
  /** null = no option selected (e.g. a value chosen outside the control). */
  value: T | null;
  onChange: (value: T) => void;
  /** id of the element labelling this group. */
  labelledBy?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Horizontal segmented control built from the Figma filter list styles:
 * #fafafa tray, hairline border, raised white pill for the selected option.
 * The pill glides between options (shared layoutId). Accessible radiogroup
 * with roving tabindex and arrow-key selection.
 */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  labelledBy,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const pillId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      className={cx(
        "grid w-full auto-cols-fr grid-flow-col rounded-[10px] border border-line bg-card p-[2.8px] drop-shadow-[0px_0.5px_0px_rgba(255,255,255,0.8)]",
        className,
      )}
    >
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.ariaLabel}
            tabIndex={selected || (i === 0 && !options.some((o) => o.value === value)) ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="group relative flex h-[26px] min-w-0 cursor-pointer items-center justify-center rounded-[8px] px-1.5 focus-visible:outline-offset-[-1px]"
          >
            {selected && (
              <motion.span
                layoutId={pillId}
                aria-hidden
                className="absolute inset-0 rounded-[8px] surface-raised shadow-segment"
                transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.8 }}
              />
            )}
            <span
              className={cx(
                "relative flex items-center gap-1 truncate text-[12px] leading-[14.4px] font-medium transition-colors duration-150",
                selected ? "text-ink" : "text-muted group-hover:text-ink",
              )}
            >
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
