"use client";

import { createContext, useCallback, useContext, useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { iconVariants } from "../icons/iconLibrary";
import type { IconVariant } from "../icons/types";
import { useSavedIcons } from "../saved/savedIconsStore";
import {
  DEFAULT_FILTERS,
  DEFAULT_RENDER_SIZE,
  filterIcons,
  type FilterState,
} from "./filterIcons";

interface LibraryContextValue {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  results: IconVariant[];
  renderSize: number;
  savedCount: number;
  /** True while a deferred search is still catching up with the input. */
  isStale: boolean;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

/** Owns filter state and derives the visible icon list for the whole page. */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const savedKeys = useSavedIcons();

  // Keep typing responsive: filtering runs against a deferred copy of the state.
  const deferred = useDeferredValue(filters);

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const results = useMemo(() => filterIcons(iconVariants, deferred, savedKeys), [deferred, savedKeys]);

  const value = useMemo<LibraryContextValue>(
    () => ({
      filters,
      setFilter,
      resetFilters,
      results,
      renderSize: filters.size === "all" ? DEFAULT_RENDER_SIZE : filters.size,
      savedCount: savedKeys.length,
      isStale: deferred !== filters,
    }),
    [filters, setFilter, resetFilters, results, savedKeys.length, deferred],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
