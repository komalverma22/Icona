"use client";

import { iconVariantsByKey } from "../icons/iconLibrary";
import { useLibrary } from "../library/LibraryProvider";
import { SetRow } from "./SetRow";

const SAVED_ICON = iconVariantsByKey.get("bookmark-outline");

/** "Saved" entry in the Sets list — shows only favourited icons, with a count badge. */
export function SavedFilter() {
  const { filters, setFilter, savedCount } = useLibrary();
  const selected = filters.set.kind === "saved";
  return (
    <SetRow
      label="Saved"
      icon={SAVED_ICON}
      selected={selected}
      count={savedCount}
      onSelect={() => setFilter("set", selected ? { kind: "all" } : { kind: "saved" })}
    />
  );
}
