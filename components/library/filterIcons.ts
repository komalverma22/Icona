import type { CategoryId, IconSize, IconStyle, IconVariant } from "../icons/types";

export type StyleFilterValue = "all" | IconStyle;
export type SizeFilterValue = "all" | IconSize;
export type AnimationFilterValue = "all" | "animated" | "static";
export type SetFilterValue =
  | { kind: "all" }
  | { kind: "saved" }
  | { kind: "category"; id: CategoryId; subcategory?: string };

export interface FilterState {
  query: string;
  style: StyleFilterValue;
  size: SizeFilterValue;
  animation: AnimationFilterValue;
  set: SetFilterValue;
}

export const DEFAULT_FILTERS: FilterState = {
  query: "",
  style: "all",
  size: "all",
  animation: "all",
  set: { kind: "all" },
};

/** Size rendered when the size filter is "All" (the Figma grid renders 24px icons). */
export const DEFAULT_RENDER_SIZE: IconSize = 24;

/** Relevance score for a search term against a variant (higher is better, 0 = no match). */
function score(variant: IconVariant, terms: string[]): number {
  const name = variant.name.toLowerCase();
  let total = 0;
  for (const term of terms) {
    if (!variant.searchText.includes(term)) return 0;
    if (name === term) total += 100;
    else if (name.startsWith(term)) total += 60;
    else if (name.split(" ").some((w) => w.startsWith(term))) total += 40;
    else if (name.includes(term)) total += 25;
    else if (variant.tags.some((t) => t.startsWith(term))) total += 15;
    else total += 5; // category / subcategory / style match
  }
  return total;
}

/**
 * Pure filtering + ranking. Size is a render option (every icon ships at all
 * sizes) but still filters out icons that don't declare the chosen size.
 */
export function filterIcons(
  variants: readonly IconVariant[],
  filters: FilterState,
  savedKeys: readonly string[],
): IconVariant[] {
  const terms = filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const saved = filters.set.kind === "saved" ? new Set(savedKeys) : null;
  const set = filters.set;

  const matches: { variant: IconVariant; score: number; index: number }[] = [];
  variants.forEach((variant, index) => {
    if (filters.style !== "all" && variant.style !== filters.style) return;
    if (filters.size !== "all" && !variant.sizes.includes(filters.size)) return;
    if (filters.animation === "animated" && !variant.animated) return;
    if (filters.animation === "static" && variant.animated) return;
    if (saved && !saved.has(variant.key)) return;
    if (set.kind === "category") {
      if (variant.category !== set.id) return;
      if (set.subcategory && variant.subcategory !== set.subcategory) return;
    }
    const s = terms.length ? score(variant, terms) : 1;
    if (s > 0) matches.push({ variant, score: s, index });
  });

  if (terms.length) matches.sort((a, b) => b.score - a.score || a.index - b.index);
  return matches.map((m) => m.variant);
}

export function hasActiveFilters(filters: FilterState) {
  return (
    filters.query.trim() !== "" ||
    filters.style !== "all" ||
    filters.size !== "all" ||
    filters.animation !== "all" ||
    filters.set.kind !== "all"
  );
}
