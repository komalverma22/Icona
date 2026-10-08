"use client";

import { useLibrary } from "../library/LibraryProvider";
import type { StyleFilterValue } from "../library/filterIcons";
import { SegmentedList, type SegmentOption } from "../ui/SegmentedList";

const OPTIONS: readonly SegmentOption<StyleFilterValue>[] = [
  { value: "all", label: "All" },
  { value: "outline", label: "Outline", trailing: <img src="/figma/style-outline.svg" alt="" aria-hidden width={12} height={12} /> },
  { value: "fill", label: "Fill", trailing: <img src="/figma/style-fill.svg" alt="" aria-hidden width={12} height={12} /> },
];

export function StyleFilter() {
  const { filters, setFilter } = useLibrary();
  return <SegmentedList label="Style" options={OPTIONS} value={filters.style} onChange={(v) => setFilter("style", v)} />;
}
