"use client";

import { motion } from "framer-motion";
import { useId, useRef, type KeyboardEvent } from "react";
import { useLibrary } from "../library/LibraryProvider";
import type { StyleFilterValue } from "../library/filterIcons";
import { cx } from "../ui/Button";
import { FilterSection } from "./FilterSection";

const OPTIONS: readonly { value: StyleFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "outline", label: "Outline" },
  { value: "fill", label: "Fill" },
];

/**
 * Style picker — the Figma vertical list (48:1679): tray of 30px rows, the
 * selected row is a raised white pill with a check on the left.
 */
export function StyleFilter() {
  const { filters, setFilter } = useLibrary();
  const labelId = useId();
  const pillId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + OPTIONS.length) % OPTIONS.length;
    setFilter("style", OPTIONS[next].value);
    refs.current[next]?.focus();
  };

  return (
    <FilterSection labelId={labelId} label="Style">
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex w-full flex-col rounded-[10px] border border-line bg-card p-[2.8px] drop-shadow-[0px_0.5px_0px_rgba(255,255,255,0.8)]"
      >
        {OPTIONS.map((option, i) => {
          const selected = filters.style === option.value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setFilter("style", option.value)}
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
            </button>
          );
        })}
      </div>
    </FilterSection>
  );
}
