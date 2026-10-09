"use client";

import { createContext, useCallback, useContext, useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { iconVariants } from "../icons/iconLibrary";
import type { IconVariant } from "../icons/types";
import { useSavedIcons } from "../saved/savedIconsStore";
import {
  countMotionStyles,
  countSets,
  DEFAULT_FILTERS,
  DEFAULT_RENDER_SIZE,
  filterIcons,
  type FilterState,
  type MotionFilterValue,
  type SetCounts,
} from "./filterIcons";

interface LibraryContextValue {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  results: IconVariant[];
  /** Live count of icons per set for the current search + facets. */
  setCounts: SetCounts;
  renderSize: number;
  savedCount: number;
  /** True while a deferred search is still catching up with the input. */
  isStale: boolean;
  /** Icons offering each motion style, for the Motion selector. */
  motionCounts: Partial<Record<MotionFilterValue, number>>;
  /** Variant chosen per icon (variant key → motion id), set from the Animation Studio. */
  motionChoices: Readonly<Record<string, string>>;
  setMotionChoice: (variantKey: string, motionId: string | null) => void;
  /** Icon variant key open in the Animation Studio. */
  studioKey: string | null;
  openStudio: (variantKey: string) => void;
  closeStudio: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

/** Owns filter state and derives the visible icon list for the whole page. */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const savedKeys = useSavedIcons();
  const [motionChoices, setMotionChoices] = useState<Readonly<Record<string, string>>>({});
  const [studioKey, setStudioKey] = useState<string | null>(null);

  // Keep typing responsive: filtering runs against a deferred copy of the state.
  const deferred = useDeferredValue(filters);

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const setMotionChoice = useCallback((variantKey: string, motionId: string | null) => {
    setMotionChoices((prev) => {
      if ((prev[variantKey] ?? null) === motionId) return prev;
      const next = { ...prev };
      if (motionId) next[variantKey] = motionId;
      else delete next[variantKey];
      return next;
    });
  }, []);
  const openStudio = useCallback((variantKey: string) => setStudioKey(variantKey), []);
  const closeStudio = useCallback(() => setStudioKey(null), []);

  const results = useMemo(() => filterIcons(iconVariants, deferred, savedKeys), [deferred, savedKeys]);
  const setCounts = useMemo(() => countSets(iconVariants, deferred, savedKeys), [deferred, savedKeys]);
  const motionCounts = useMemo(() => countMotionStyles(iconVariants, deferred, savedKeys), [deferred, savedKeys]);

  const value = useMemo<LibraryContextValue>(
    () => ({
      filters,
      setFilter,
      resetFilters,
      results,
      setCounts,
      renderSize: filters.size === "all" ? DEFAULT_RENDER_SIZE : filters.size,
      savedCount: savedKeys.length,
      isStale: deferred !== filters,
      motionCounts,
      motionChoices,
      setMotionChoice,
      studioKey,
      openStudio,
      closeStudio,
    }),
    [filters, setFilter, resetFilters, results, setCounts, savedKeys.length, deferred, motionCounts, motionChoices, setMotionChoice, studioKey, openStudio, closeStudio],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
