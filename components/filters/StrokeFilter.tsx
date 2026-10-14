"use client";

import { useId } from "react";
import { useLibrary } from "../library/LibraryProvider";
import type { StrokeWidthValue } from "../library/filterIcons";
import { SegmentedControl, type SegmentOption } from "../ui/SegmentedControl";
import { FilterSection } from "./FilterSection";

/** A tiny stroke sample drawn at the option's real weight. */
const sample = (w: StrokeWidthValue) => (
  <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w * 1.6} strokeLinecap="round">
    <path d="M4 16C8 6 16 18 20 8" />
  </svg>
);

const OPTIONS: readonly SegmentOption<StrokeWidthValue>[] = [
  { value: 1, label: "1", icon: sample(1), ariaLabel: "Stroke 1 pixel" },
  { value: 1.5, label: "1.5", icon: sample(1.5), ariaLabel: "Stroke 1.5 pixels" },
  { value: 2, label: "2", icon: sample(2), ariaLabel: "Stroke 2 pixels" },
];

/** Stroke weight of every icon - applied live to the grid and to copied SVG. */
export function StrokeFilter() {
  const { filters, setFilter } = useLibrary();
  const labelId = useId();
  return (
    <FilterSection labelId={labelId} label="Stroke" hint={`${filters.strokeWidth}px`}>
      <SegmentedControl
        labelledBy={labelId}
        options={OPTIONS}
        value={filters.strokeWidth}
        onChange={(v) => setFilter("strokeWidth", v)}
      />
    </FilterSection>
  );
}
