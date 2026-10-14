"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLibrary } from "../library/LibraryProvider";
import { hasActiveFilters } from "../library/filterIcons";
import { getMotions, resolveMotion } from "../motion/registry";
import { Button } from "../ui/Button";
import { IconCard } from "./IconCard";

/** Cards mounted up front; more are added as the visitor scrolls, so a 600 icon library opens instantly. */
const PAGE_SIZE = 96;

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
  const { results, renderSize, filters, resetFilters, isStale, motionChoices, openStudio } = useLibrary();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const sentinel = useRef<HTMLDivElement>(null);
  const still = filters.animation === "static";

  // A new result set starts from the first page again.
  useEffect(() => setLimit(PAGE_SIZE), [results]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || limit >= results.length) return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && setLimit((n) => n + PAGE_SIZE), { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [limit, results.length]);

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
            : "Try a different name, category or tag - or clear the filters."}
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
    <>
      <div
        role="list"
        aria-label="Icons"
        aria-busy={isStale}
        onKeyDown={onGridKeyDown}
        className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(121px,1fr))] sm:gap-x-[22px] sm:gap-y-[13.6px]"
      >
        {results.slice(0, limit).map((variant) => (
          // An active card (and its particles) must paint above its neighbours.
          <div key={variant.key} role="listitem" className="relative has-[[data-active]]:z-10">
            <IconCard
              variant={variant}
              size={renderSize}
              strokeWidth={filters.strokeWidth}
              color={filters.color}
              motion={still ? undefined : resolveMotion(variant, filters.motion, motionChoices[variant.key])}
              motionCount={still ? 0 : getMotions(variant).length}
              still={still}
              onOpenStudio={openStudio}
            />
          </div>
        ))}
      </div>
      {limit < results.length && <div ref={sentinel} aria-hidden className="h-px" />}
    </>
  );
}
