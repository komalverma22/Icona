"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { iconVariantsByKey } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";
import { useLibrary } from "../library/LibraryProvider";
import type { MotionFilterValue } from "../library/filterIcons";
import { MotionIcon } from "../motion/MotionIcon";
import { MOTION_STYLES, type MotionStyleMeta } from "../motion/styles";
import type { MotionVariant } from "../motion/types";
import { cx } from "../ui/Button";
import { FilterSection } from "./FilterSection";

const ALL_ICON = iconVariantsByKey.get("sparkles-outline")!;

const OPTIONS: readonly ({ id: "all"; label: string; description: string } | MotionStyleMeta)[] = [
  { id: "all", label: "All", description: "Every icon plays its default animation" },
  ...MOTION_STYLES,
];

/** The chip's glyph previews its own style while hovered or focused. */
function ChipGlyph({ meta, active }: { meta: MotionStyleMeta; active: boolean }) {
  const variant = iconVariantsByKey.get(`${meta.icon}-${meta.id === "pixel" ? "fill" : "outline"}`);
  if (!variant) return null;
  const demo: MotionVariant = { id: "demo", label: meta.label, style: meta.id, effect: meta.demo.effect, pixel: meta.demo.pixel };
  return (
    <span className="relative block size-4 shrink-0">
      <MotionIcon variant={variant} motion={demo} active={active} size={16} clip={false} />
    </span>
  );
}

/**
 * Motion style selector: a 2-column grid of styles with live counts. Picking
 * a style narrows the grid to icons that offer it and makes every card
 * preview that style on hover. Each chip demos its style when hovered.
 */
export function MotionFilter() {
  const { filters, setFilter, motionCounts } = useLibrary();
  const labelId = useId();
  const [hovered, setHovered] = useState<MotionFilterValue | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (value: MotionFilterValue) => setFilter("motion", filters.motion === value && value !== "all" ? "all" : value);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 2, ArrowUp: -2 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const next = Math.min(OPTIONS.length - 1, Math.max(0, index + delta));
    setFilter("motion", OPTIONS[next].id);
    refs.current[next]?.focus();
  };

  const current = OPTIONS.find((o) => o.id === filters.motion);

  return (
    <FilterSection labelId={labelId} label="Motion" hint={filters.motion === "all" ? "Hover to preview" : current?.label}>
      <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-2 gap-1">
        {OPTIONS.map((option, i) => {
          const selected = filters.motion === option.id;
          const count = motionCounts[option.id] ?? 0;
          const isHot = hovered === option.id;
          return (
            <button
              key={option.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option.label}, ${count} icons. ${option.description}`}
              title={option.description}
              tabIndex={selected ? 0 : -1}
              disabled={count === 0 && !selected}
              onClick={() => select(option.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              onPointerEnter={() => setHovered(option.id)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(option.id)}
              onBlur={() => setHovered(null)}
              className={cx(
                "group relative flex h-8 min-w-0 cursor-pointer items-center gap-1.5 rounded-[9px] border pr-1.5 pl-2 text-left transition-[background-color,border-color,box-shadow,opacity] duration-150 focus-visible:outline-offset-[-1px] disabled:cursor-default disabled:opacity-40",
                selected ? "border-line surface-raised shadow-segment" : "border-transparent bg-card hover:border-line hover:bg-white",
              )}
            >
              <span className={cx("flex shrink-0 transition-colors", selected || isHot ? "text-ink" : "text-text")}>
                {option.id === "all" ? (
                  <span className="relative flex size-4 items-center justify-center">
                    <IconRenderer variant={ALL_ICON} size={16} state={isHot ? "active" : "rest"} />
                  </span>
                ) : (
                  <ChipGlyph meta={option} active={isHot} />
                )}
              </span>
              <span className={cx("min-w-0 flex-1 truncate text-[12px] leading-[14.4px] font-medium", selected ? "text-ink" : "text-muted group-hover:text-ink")}>
                {option.label}
              </span>
              <span aria-hidden className={cx("text-[10px] leading-3 font-medium tabular-nums", selected ? "text-ink/70" : "text-muted/70")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </FilterSection>
  );
}
