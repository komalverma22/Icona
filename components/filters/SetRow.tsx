"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ACTIVE, REST } from "../icons/animations/animationTypes";
import { IconRenderer } from "../icons/IconRenderer";
import type { IconVariant } from "../icons/types";
import { cx } from "../ui/Button";

interface SetRowProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  /** Leading glyph (drawn with the library's own icons; it animates while the row is hovered). */
  icon?: IconVariant;
  /** Present when the set has sub-groups - the trailing chevron becomes a toggle. */
  expandable?: { expanded: boolean; onToggle: () => void; controls: string };
  /** Number of matching icons, shown as a count badge. */
  count?: number;
  /** Sub-group row: no icon, sits under its parent's label. */
  indent?: boolean;
}

function Chevron() {
  return (
    <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 6L15.5 12L9.5 18" />
    </svg>
  );
}

/**
 * One row of the Sets menu: leading icon, label, count badge and a trailing
 * chevron. Rows sit on a soft hover pill; the selected row is a raised white
 * pill that glides between rows. Expandable rows rotate their chevron to open.
 */
export function SetRow({ label, selected, onSelect, icon, expandable, count, indent }: SetRowProps) {
  const [hovered, setHovered] = useState(false);
  const empty = count === 0 && !selected;

  return (
    <div className="relative w-full" onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      {selected && (
        <motion.span
          layoutId="set-selection"
          aria-hidden
          className="absolute inset-0 rounded-[10px] border border-line surface-raised shadow-segment"
          transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.8 }}
        />
      )}
      <button
        type="button"
        aria-pressed={selected}
        aria-label={count !== undefined ? `${label}, ${count} icons` : undefined}
        onClick={onSelect}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className={cx(
          "group relative flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] pr-9 text-left transition-colors duration-150 focus-visible:outline-offset-[-1px]",
          indent ? "h-[30px] pl-[34px]" : "h-[34px] pl-2.5",
          !selected && "hover:bg-[rgba(28,31,33,0.04)]",
        )}
      >
        {icon && !indent && (
          <span
            aria-hidden
            className={cx(
              "flex size-4 shrink-0 items-center justify-center transition-colors duration-150",
              selected ? "text-ink" : empty ? "text-muted/50" : "text-text group-hover:text-ink",
            )}
          >
            <IconRenderer variant={icon} size={16} state={hovered ? ACTIVE : REST} />
          </span>
        )}
        <span
          className={cx(
            "min-w-0 flex-1 truncate leading-[14.4px] font-medium transition-colors duration-150",
            indent ? "text-[12px]" : "text-[13px]",
            selected ? "text-ink" : empty ? "text-muted/60" : indent ? "text-muted group-hover:text-ink" : "text-text group-hover:text-ink",
          )}
        >
          {label}
        </span>
        {count !== undefined && (
          <span
            aria-hidden
            className={cx(
              "flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-[5px] px-[5px] text-[10px] leading-3 font-medium tabular-nums transition-colors duration-150",
              selected ? "bg-ink text-white" : empty ? "bg-badge/60 text-muted/60" : "bg-badge text-text",
            )}
          >
            {count}
          </span>
        )}
        {!expandable && !indent && (
          <span
            aria-hidden
            className={cx(
              "absolute top-1/2 right-[13px] -translate-y-1/2 transition-[color,transform] duration-150 group-hover:translate-x-0.5",
              selected ? "text-ink" : "text-muted/70 group-hover:text-ink",
            )}
          >
            <Chevron />
          </span>
        )}
      </button>
      {expandable && (
        <button
          type="button"
          aria-expanded={expandable.expanded}
          aria-controls={expandable.controls}
          aria-label={`${expandable.expanded ? "Collapse" : "Expand"} ${label}`}
          onClick={expandable.onToggle}
          className={cx(
            "absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[7px] transition-colors",
            selected || expandable.expanded ? "text-ink" : "text-muted/70 hover:text-ink",
            "hover:bg-[rgba(28,31,33,0.06)]",
          )}
        >
          <motion.span
            className="flex"
            animate={{ rotate: expandable.expanded ? 90 : 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Chevron />
          </motion.span>
        </button>
      )}
    </div>
  );
}
