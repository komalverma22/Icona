"use client";

import { useId } from "react";
import { useLibrary } from "../library/LibraryProvider";
import { ColorPicker, normalizeHex } from "../ui/ColorPicker";
import { SegmentedControl, type SegmentOption } from "../ui/SegmentedControl";
import { FilterSection } from "./FilterSection";

type Preset = "ink" | "green" | "blue";

/**
 * Three presets: Ink (neutral; copies as `currentColor` so icons inherit text
 * colour), the brand sky blue, and a deeper blue that reads well on light and dark.
 * Anything else comes from the custom picker.
 */
const PRESETS: Record<Preset, { label: string; hex: string; value: string | null }> = {
  ink: { label: "Ink", hex: "#1c1f21", value: null },
  green: { label: "Sky", hex: "#2b9af3", value: "#2b9af3" },
  blue: { label: "Blue", hex: "#3d7bfa", value: "#3d7bfa" },
};

const dot = (hex: string) => (
  <span aria-hidden className="size-2.5 rounded-full shadow-[0_0_0_1px_rgba(28,31,33,0.1)]" style={{ backgroundColor: hex }} />
);

const OPTIONS: readonly SegmentOption<Preset>[] = (Object.keys(PRESETS) as Preset[]).map((key) => ({
  value: key,
  label: PRESETS[key].label,
  icon: dot(PRESETS[key].hex),
  ariaLabel: key === "ink" ? "Ink (inherits currentColor)" : undefined,
}));

function presetFor(color: string | null): Preset | null {
  if (color === null) return "ink";
  const hex = normalizeHex(color);
  return (Object.keys(PRESETS) as Preset[]).find((key) => PRESETS[key].value === hex) ?? null;
}

/** Icon colour — previewed in the grid and baked into copied SVG (Ink stays `currentColor`). */
export function ColorFilter() {
  const { filters, setFilter } = useLibrary();
  const labelId = useId();
  const preset = presetFor(filters.color);
  const custom = preset === null;

  return (
    <FilterSection labelId={labelId} label="Color" hint={filters.color ? filters.color.toUpperCase() : "currentColor"}>
      <div className="flex w-full items-center gap-1.5">
        <SegmentedControl
          labelledBy={labelId}
          options={OPTIONS}
          value={preset}
          onChange={(v) => setFilter("color", PRESETS[v].value)}
          className="min-w-0 flex-1"
        />
        <ColorPicker value={filters.color} active={custom} onChange={(hex) => setFilter("color", hex)} />
      </div>
    </FilterSection>
  );
}
