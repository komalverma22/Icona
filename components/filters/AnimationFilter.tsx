"use client";

import { useId } from "react";
import { useLibrary } from "../library/LibraryProvider";
import type { AnimationFilterValue } from "../library/filterIcons";
import { SegmentedControl, type SegmentOption } from "../ui/SegmentedControl";
import { FilterSection } from "./FilterSection";

const OPTIONS: readonly SegmentOption<AnimationFilterValue>[] = [
  { value: "all", label: "All" },
  { value: "animated", label: "Animated" },
  { value: "static", label: "Static" },
];

/** "Animated" shows only icons that have an SVG path animation recipe. */
export function AnimationFilter() {
  const { filters, setFilter } = useLibrary();
  const labelId = useId();
  return (
    <FilterSection labelId={labelId} label="Animation">
      <SegmentedControl
        labelledBy={labelId}
        options={OPTIONS}
        value={filters.animation}
        onChange={(v) => setFilter("animation", v)}
      />
    </FilterSection>
  );
}
