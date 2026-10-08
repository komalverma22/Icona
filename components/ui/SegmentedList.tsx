"use client";

import { motion } from "framer-motion";
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./Button";

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  /** Trailing glyph (Figma: outline / fill swatch on the Style list). */
  trailing?: ReactNode;
}

interface SegmentedListProps<T extends string | number> {
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Figma filter list (Style / Size / Animation): a #fafafa tray holding 30px
 * rows; the selected row is a raised white pill with a check mark.
 * Implemented as an accessible radiogroup with roving arrow-key focus. The
 * raised pill glides between rows via a shared layoutId.
 */
export function SegmentedList<T extends string | number>({ label, options, value, onChange }: SegmentedListProps<T>) {
  const labelId = useId();
  const pillId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex w-full flex-col gap-2.5">
      <p id={labelId} className="text-[12px] leading-3 font-medium text-muted">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex w-full flex-col rounded-[10px] border border-line bg-card p-[2.8px] drop-shadow-[0px_0.5px_0px_rgba(255,255,255,0.8)]"
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
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className="group relative flex h-[30px] w-full cursor-pointer items-center rounded-[8px] px-[30px] text-left focus-visible:outline-offset-[-1px]"
            >
              {selected && (
                <motion.span
                  layoutId={pillId}
                  aria-hidden
                  className="absolute inset-0 rounded-[8px] surface-raised shadow-segment"
                  transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.8 }}
                />
              )}
              {selected && (
                <img src="/figma/check.svg" alt="" aria-hidden width={12} height={12} className="absolute top-[9px] left-[9px] size-3" />
              )}
              <span
                className={cx(
                  "relative text-[12px] leading-[14.4px] font-medium transition-colors duration-150",
                  selected ? "text-ink" : "text-muted group-hover:text-ink",
                )}
              >
                {option.label}
              </span>
              {option.trailing && <span className="absolute top-[9px] right-[11px] flex size-3">{option.trailing}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
