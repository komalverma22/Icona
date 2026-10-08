"use client";

import { useLibrary } from "../library/LibraryProvider";
import { SetRow } from "./SetRow";

/** "Saved" entry in the Sets list — shows only favourited icons, with a count badge. */
export function SavedFilter() {
  const { filters, setFilter, savedCount } = useLibrary();
  const selected = filters.set.kind === "saved";
  return (
    <SetRow
      label="Saved"
      selected={selected}
      badge={savedCount}
      onSelect={() => setFilter("set", selected ? { kind: "all" } : { kind: "saved" })}
    />
  );
}
