"use client";

import { motion } from "framer-motion";
import { cx } from "../ui/Button";

interface SetRowProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  /** Present when the set has sub-groups (Figma: caret "arrow button to open dropdown"). */
  expandable?: { expanded: boolean; onToggle: () => void; controls: string };
  /** Figma count badge (#ededed pill) — used for New / Saved. */
  badge?: number;
  /** Live number of matching icons, shown muted on the right. */
  count?: number;
  indent?: boolean;
}

/**
 * One row of the Figma "Sets" list (48:1729). Unselected rows are plain muted
 * text; the selected row is the green raised pill with white text.
 */
export function SetRow({ label, selected, onSelect, expandable, badge, count, indent }: SetRowProps) {
  const empty = count === 0 && !selected;
  return (
    <div className="relative w-full">
      {selected && (
        <motion.span
          layoutId="set-selection"
          aria-hidden
          className="absolute inset-0 rounded-[10px] border border-accent surface-accent shadow-set-active"
          transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.8 }}
        />
      )}
      <button
        type="button"
        aria-pressed={selected}
        aria-label={(count ?? badge) !== undefined ? `${label}, ${count ?? badge} icons` : undefined}
        onClick={onSelect}
        className={cx(
          "group relative flex h-8 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] pr-2 text-left focus-visible:outline-offset-[-1px]",
          indent ? "pl-11" : "pl-8",
          !selected && "hover:bg-[rgba(28,31,33,0.04)]",
        )}
      >
        <span
          className={cx(
            "truncate text-[12px] leading-[14.4px] font-medium transition-colors duration-150",
            selected ? "text-white" : empty ? "text-muted/60" : "text-muted group-hover:text-ink",
          )}
        >
          {label}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {badge !== undefined && badge > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-[4px] bg-badge px-[5px] text-[8px] leading-3 font-medium text-black">
              {badge}
            </span>
          )}
          {count !== undefined && badge === undefined && (
            <span
              aria-hidden
              className={cx(
                "text-[11px] leading-3 font-medium tabular-nums transition-colors",
                selected ? "text-white/80" : "text-muted/70 group-hover:text-muted",
              )}
            >
              {count}
            </span>
          )}
        </span>
      </button>
      {expandable && (
        <button
          type="button"
          aria-expanded={expandable.expanded}
          aria-controls={expandable.controls}
          aria-label={`${expandable.expanded ? "Collapse" : "Expand"} ${label}`}
          onClick={expandable.onToggle}
          className={cx(
            "absolute top-1.5 left-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full transition-colors",
            selected ? "hover:bg-[rgba(255,255,255,0.18)]" : "hover:bg-[rgba(28,31,33,0.06)]",
          )}
        >
          <motion.img
            src={selected ? "/figma/caret-active.svg" : "/figma/caret.svg"}
            alt=""
            aria-hidden
            width={12}
            height={12}
            className="size-3"
            animate={{ rotate: expandable.expanded ? 90 : 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </button>
      )}
    </div>
  );
}
