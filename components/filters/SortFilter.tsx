"use client";

import { useId } from "react";
import { useLibrary } from "../library/LibraryProvider";
import type { SortValue } from "../library/filterIcons";
import { SegmentedControl, type SegmentOption } from "../ui/SegmentedControl";
import { FilterSection } from "./FilterSection";

export const SORT_OPTIONS: readonly SegmentOption<SortValue>[] = [
  { value: "featured", label: "Featured" },
  { value: "az", label: "A–Z", ariaLabel: "Name A to Z" },
  { value: "new", label: "New", ariaLabel: "Newest first" },
];

/** Sort order (also available in the results toolbar on larger screens). */
export function SortFilter() {
  const { filters, setFilter } = useLibrary();
  const labelId = useId();
  return (
    <FilterSection labelId={labelId} label="Sort">
      <SegmentedControl labelledBy={labelId} options={SORT_OPTIONS} value={filters.sort} onChange={(v) => setFilter("sort", v)} />
    </FilterSection>
  );
}
