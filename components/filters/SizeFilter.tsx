"use client";

import { useId } from "react";
import { useLibrary } from "../library/LibraryProvider";
import type { SizeFilterValue } from "../library/filterIcons";
import { SegmentedControl, type SegmentOption } from "../ui/SegmentedControl";
import { FilterSection } from "./FilterSection";

const OPTIONS: readonly SegmentOption<SizeFilterValue>[] = [
  { value: "all", label: "All", ariaLabel: "All sizes (24px)" },
  { value: 24, label: "24", ariaLabel: "24 pixels" },
  { value: 32, label: "32", ariaLabel: "32 pixels" },
  { value: 48, label: "48", ariaLabel: "48 pixels" },
];

/** Changes the rendered size of the same SVG (and the size of copied markup). */
export function SizeFilter() {
  const { filters, setFilter, renderSize } = useLibrary();
  const labelId = useId();
  return (
    <FilterSection labelId={labelId} label="Size" hint={`${renderSize}px`}>
      <SegmentedControl labelledBy={labelId} options={OPTIONS} value={filters.size} onChange={(v) => setFilter("size", v)} />
    </FilterSection>
  );
}
