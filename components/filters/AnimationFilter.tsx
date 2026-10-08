"use client";

import { useLibrary } from "../library/LibraryProvider";
import type { AnimationFilterValue } from "../library/filterIcons";
import { SegmentedList, type SegmentOption } from "../ui/SegmentedList";

const OPTIONS: readonly SegmentOption<AnimationFilterValue>[] = [
  { value: "all", label: "All" },
  { value: "animated", label: "Animated" },
  { value: "static", label: "Static" },
];

/** "Animated" shows only icons that have an SVG path animation recipe. */
export function AnimationFilter() {
  const { filters, setFilter } = useLibrary();
  return (
    <SegmentedList label="Animation" options={OPTIONS} value={filters.animation} onChange={(v) => setFilter("animation", v)} />
  );
}
