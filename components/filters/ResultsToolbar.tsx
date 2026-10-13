"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { categoryLabel, iconVariantsByKey, STYLE_LABEL } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";
import { useLibrary } from "../library/LibraryProvider";
import { DEFAULT_FILTERS, DEFAULT_STROKE_WIDTH, isModified, type FilterState } from "../library/filterIcons";
import { Button } from "../ui/Button";
import { SegmentedControl } from "../ui/SegmentedControl";
import { Sheet } from "../ui/Sheet";
import { FilterPanel } from "./FilterPanel";
import { SORT_OPTIONS } from "./SortFilter";
import { MOTION_STYLE_BY_ID } from "../motion/styles";

const FILTER_ICON = iconVariantsByKey.get("filter-outline")!;
const CLOSE_ICON = iconVariantsByKey.get("x-outline")!;

interface Chip {
  key: string;
  label: ReactNode;
  remove: () => void;
}

/** Describe every non-default filter as a removable chip. */
function buildChips(filters: FilterState, setFilter: ReturnType<typeof useLibrary>["setFilter"]): Chip[] {
  const chips: Chip[] = [];
  const q = filters.query.trim();
  if (q) chips.push({ key: "query", label: `“${q}”`, remove: () => setFilter("query", "") });
  if (filters.style !== "all")
    chips.push({ key: "style", label: STYLE_LABEL[filters.style], remove: () => setFilter("style", "all") });
  if (filters.animation !== "all")
    chips.push({
      key: "animation",
      label: filters.animation === "animated" ? "Animated" : "Static",
      remove: () => setFilter("animation", "all"),
    });
  if (filters.motion !== "all")
    chips.push({ key: "motion", label: `Motion: ${MOTION_STYLE_BY_ID.get(filters.motion)?.label}`, remove: () => setFilter("motion", "all") });
  const set = filters.set;
  if (set.kind !== "all") {
    const label =
      set.kind === "new" ? "New" : set.kind === "saved" ? "Saved" : [categoryLabel(set.id), set.subcategory].filter(Boolean).join(" / ");
    chips.push({ key: "set", label, remove: () => setFilter("set", DEFAULT_FILTERS.set) });
  }
  if (filters.size !== "all") chips.push({ key: "size", label: `${filters.size}px`, remove: () => setFilter("size", "all") });
  if (filters.strokeWidth !== DEFAULT_STROKE_WIDTH)
    chips.push({ key: "stroke", label: `Stroke ${filters.strokeWidth}`, remove: () => setFilter("strokeWidth", DEFAULT_STROKE_WIDTH) });
  if (filters.color)
    chips.push({
      key: "color",
      label: (
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-full shadow-[0_0_0_1px_rgba(28,31,33,0.1)]" style={{ backgroundColor: filters.color }} />
          {filters.color.toUpperCase()}
        </span>
      ),
      remove: () => setFilter("color", null),
    });
  return chips;
}

/**
 * Results bar above the grid: live result count, active-filter chips (each
 * removable), sort, and — below the lg breakpoint — the Filters sheet trigger.
 */
export function ResultsToolbar() {
  const [open, setOpen] = useState(false);
  const { results, filters, setFilter, resetFilters } = useLibrary();
  const chips = buildChips(filters, setFilter);
  const modified = isModified(filters);

  return (
    <div className="mb-4 flex flex-col gap-3 md:mb-5">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <p className="text-[12px] leading-[14.4px] font-medium text-muted" aria-live="polite">
          <span className="text-ink">{results.length}</span> {results.length === 1 ? "icon" : "icons"}
        </p>
        <div className="flex items-center gap-2">
          <SegmentedControl
            ariaLabel="Sort icons"
            options={SORT_OPTIONS}
            value={filters.sort}
            onChange={(v) => setFilter("sort", v)}
            className="hidden w-[220px] sm:grid"
          />
          <Button className="lg:hidden" onClick={() => setOpen(true)} aria-expanded={open} aria-haspopup="dialog">
            <IconRenderer variant={FILTER_ICON} size={14} />
            Filters
            {modified && <span aria-label="filters active" className="size-1.5 rounded-full bg-accent" />}
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {chips.length > 0 && (
          <motion.ul
            aria-label="Active filters"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="-m-1 flex flex-wrap items-center gap-1.5 overflow-hidden p-1"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {chips.map((chip) => (
                <motion.li
                  key={chip.key}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.16 }}
                  className="flex h-7 items-center gap-1 rounded-[8px] border border-line bg-card pr-1 pl-2.5 text-[12px] leading-[14.4px] font-medium text-ink"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={chip.remove}
                    aria-label={`Remove filter ${typeof chip.label === "string" ? chip.label : chip.key}`}
                    className="flex size-5 cursor-pointer items-center justify-center rounded-[6px] text-muted transition-colors hover:bg-[rgba(28,31,33,0.06)] hover:text-ink"
                  >
                    <IconRenderer variant={CLOSE_ICON} size={12} strokeWidth={2} />
                  </button>
                </motion.li>
              ))}
              {chips.length > 1 && (
                <motion.li key="clear" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-7 cursor-pointer rounded-[8px] px-2 text-[12px] font-medium text-muted transition-colors hover:text-ink"
                  >
                    Clear all
                  </button>
                </motion.li>
              )}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>

      <Sheet open={open} onClose={() => setOpen(false)} title="Filters">
        <FilterPanel inSheet />
      </Sheet>
    </div>
  );
}
