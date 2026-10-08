"use client";

import { useId } from "react";
import { useLibrary } from "../library/LibraryProvider";
import { SegmentedControl, type SegmentOption } from "../ui/SegmentedControl";
import { FilterSection } from "./FilterSection";

type ColorOption = "ink" | "green";

/** Two clearly distinct colours from the Figma palette. Ink is the default (copies as `currentColor`). */
const GREEN = "#5bdc67";

const dot = (hex: string) => (
  <span aria-hidden className="size-2.5 rounded-full shadow-[0_0_0_1px_rgba(28,31,33,0.1)]" style={{ backgroundColor: hex }} />
);

const OPTIONS: readonly SegmentOption<ColorOption>[] = [
  { value: "ink", label: "Ink", icon: dot("#1c1f21"), ariaLabel: "Ink (default)" },
  { value: "green", label: "Green", icon: dot(GREEN) },
];

/** Icon colour — previewed in the grid and baked into copied SVG (Green) or left as currentColor (Ink). */
export function ColorFilter() {
  const { filters, setFilter } = useLibrary();
  const labelId = useId();
  const value: ColorOption = filters.color === GREEN ? "green" : "ink";

  return (
    <FilterSection labelId={labelId} label="Color" hint={value === "green" ? GREEN.toUpperCase() : "Default"}>
      <SegmentedControl
        labelledBy={labelId}
        options={OPTIONS}
        value={value}
        onChange={(v) => setFilter("color", v === "green" ? GREEN : null)}
      />
    </FilterSection>
  );
}
