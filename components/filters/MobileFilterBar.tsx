"use client";

import { useState } from "react";
import { iconVariantsByKey } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";
import { useLibrary } from "../library/LibraryProvider";
import { hasActiveFilters } from "../library/filterIcons";
import { Button } from "../ui/Button";
import { Sheet } from "../ui/Sheet";
import { FilterPanel } from "./FilterPanel";

const FILTER_ICON = iconVariantsByKey.get("filter-outline")!;

/**
 * Below the lg breakpoint the sidebar collapses: this bar shows the result
 * count and opens the filters in a sheet (bottom sheet on phones, drawer on tablets).
 */
export function MobileFilterBar() {
  const [open, setOpen] = useState(false);
  const { results, filters, resetFilters } = useLibrary();
  const active = hasActiveFilters({ ...filters, query: "" });

  return (
    <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
      <p className="text-[12px] leading-[14.4px] font-medium text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? "icon" : "icons"}
      </p>
      <div className="flex items-center gap-2">
        {active && (
          <button
            type="button"
            onClick={resetFilters}
            className="h-8 cursor-pointer rounded-[10px] px-2 text-[12px] font-medium text-muted transition-colors hover:text-ink"
          >
            Reset
          </button>
        )}
        <Button onClick={() => setOpen(true)} aria-expanded={open} aria-haspopup="dialog">
          <IconRenderer variant={FILTER_ICON} size={14} />
          Filters
          {active && <span aria-label="filters active" className="size-1.5 rounded-full bg-accent" />}
        </Button>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="Filters">
        <FilterPanel />
      </Sheet>
    </div>
  );
}
