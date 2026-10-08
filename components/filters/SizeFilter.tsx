"use client";

import { useLibrary } from "../library/LibraryProvider";
import type { SizeFilterValue } from "../library/filterIcons";
import { SegmentedList, type SegmentOption } from "../ui/SegmentedList";

const OPTIONS: readonly SegmentOption<SizeFilterValue>[] = [
  { value: "all", label: "All" },
  { value: 24, label: "24px" },
  { value: 32, label: "32px" },
  { value: 48, label: "48px" },
];

/** Changes the rendered size of the same SVG (and the size of copied markup). */
export function SizeFilter() {
  const { filters, setFilter } = useLibrary();
  return <SegmentedList label="Size" options={OPTIONS} value={filters.size} onChange={(v) => setFilter("size", v)} />;
}
