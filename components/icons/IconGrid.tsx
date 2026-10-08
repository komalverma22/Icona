"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { KeyboardEvent } from "react";
import { useLibrary } from "../library/LibraryProvider";
import { hasActiveFilters } from "../library/filterIcons";
import { Button } from "../ui/Button";
import { EASE_OUT } from "./animations/primitives";
import { IconCard } from "./IconCard";

/** Above this many results, skip layout animations to keep large grids cheap. */
const LAYOUT_ANIMATION_LIMIT = 150;

const ARROWS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]);

/** Roving arrow-key navigation between cards (columns derived from the live layout). */
function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
  if (!ARROWS.has(e.key)) return;
  const target = e.target as HTMLElement;
  if (!target.matches("[data-icon-card]")) return;
  const cards = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-icon-card]"));
  const index = cards.indexOf(target);
  if (index < 0) return;

  const top = Math.round(cards[0].getBoundingClientRect().top);
  const firstRowEnd = cards.findIndex((c) => Math.round(c.getBoundingClientRect().top) !== top);
  const columns = firstRowEnd === -1 ? cards.length : firstRowEnd;
  const next = {
    ArrowLeft: index - 1,
    ArrowRight: index + 1,
    ArrowUp: index - columns,
    ArrowDown: index + columns,
    Home: 0,
    End: cards.length - 1,
  }[e.key]!;

  if (next >= 0 && next < cards.length) {
    e.preventDefault();
    cards[next].focus();
  }
}

export function IconGrid() {
  const { results, renderSize, filters, resetFilters, isStale } = useLibrary();
  const animateLayout = results.length <= LAYOUT_ANIMATION_LIMIT;

  if (results.length === 0) {
    const query = filters.query.trim();
    const savedView = filters.set.kind === "saved" && !query;
    return (
      <div role="status" className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[10px] border border-line bg-card px-6 text-center">
        <p className="text-[14px] leading-5 font-medium text-ink">
          {savedView ? "No saved icons yet" : query ? `No icons found for “${query}”` : "No icons match these filters"}
        </p>
        <p className="max-w-[280px] text-[12px] leading-[18px] text-muted">
          {savedView
            ? "Hover an icon and press the bookmark to save it. Saved icons stay here after a refresh."
            : "Try a different name, category or tag — or clear the filters."}
        </p>
        {hasActiveFilters(filters) && (
          <Button onClick={resetFilters} className="mt-1">
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label="Icons"
      aria-busy={isStale}
      onKeyDown={onGridKeyDown}
      className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(121px,1fr))] sm:gap-x-[22px] sm:gap-y-[13.6px]"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {results.map((variant) => (
          <motion.div
            role="listitem"
            key={variant.key}
            layout={animateLayout ? "position" : false}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            <IconCard variant={variant} size={renderSize} strokeWidth={filters.strokeWidth} color={filters.color} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
