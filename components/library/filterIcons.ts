import type { CategoryId, IconSize, IconStyle, IconVariant } from "../icons/types";

export type StyleFilterValue = "all" | IconStyle;
export type SizeFilterValue = "all" | IconSize;
export type AnimationFilterValue = "all" | "animated" | "static";
export type StrokeWidthValue = 1 | 1.5 | 2;
export type SortValue = "featured" | "az" | "new";
export type SetFilterValue =
  | { kind: "all" }
  | { kind: "new" }
  | { kind: "saved" }
  | { kind: "category"; id: CategoryId; subcategory?: string };

export interface FilterState {
  query: string;
  style: StyleFilterValue;
  size: SizeFilterValue;
  animation: AnimationFilterValue;
  set: SetFilterValue;
  /** Render option: stroke width of outline icons (also applied to copied SVG). */
  strokeWidth: StrokeWidthValue;
  /** Render option: icon colour; null keeps `currentColor`. */
  color: string | null;
  sort: SortValue;
}

export const DEFAULT_STROKE_WIDTH: StrokeWidthValue = 1.5;

export const DEFAULT_FILTERS: FilterState = {
  query: "",
  style: "all",
  size: "all",
  animation: "all",
  set: { kind: "all" },
  strokeWidth: DEFAULT_STROKE_WIDTH,
  color: null,
  sort: "featured",
};

/** Size rendered when the size filter is "All" (the Figma grid renders 24px icons). */
export const DEFAULT_RENDER_SIZE: IconSize = 24;

/** Relevance score for search terms against a variant (higher is better, 0 = no match). */
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

const parseTerms = (query: string) => query.trim().toLowerCase().split(/\s+/).filter(Boolean);

/** Everything except the "set" dimension — shared by filtering and the per-set counts. */
function matchesFacets(variant: IconVariant, filters: FilterState): boolean {
  if (filters.style !== "all" && variant.style !== filters.style) return false;
  if (filters.size !== "all" && !variant.sizes.includes(filters.size)) return false;
  if (filters.animation === "animated" && !variant.animated) return false;
  if (filters.animation === "static" && variant.animated) return false;
  return true;
}

function matchesSet(variant: IconVariant, set: SetFilterValue, saved: ReadonlySet<string>): boolean {
  switch (set.kind) {
    case "all":
      return true;
    case "new":
      return variant.isNew;
    case "saved":
      return saved.has(variant.key);
    case "category":
      return variant.category === set.id && (!set.subcategory || variant.subcategory === set.subcategory);
  }
}

/** Pure filtering + ranking + sorting. */
export function filterIcons(
  variants: readonly IconVariant[],
  filters: FilterState,
  savedKeys: readonly string[],
): IconVariant[] {
  const terms = parseTerms(filters.query);
  const saved = new Set(savedKeys);

  const matches: { variant: IconVariant; score: number; index: number }[] = [];
  variants.forEach((variant, index) => {
    if (!matchesFacets(variant, filters) || !matchesSet(variant, filters.set, saved)) return;
    const s = terms.length ? score(variant, terms) : 1;
    if (s > 0) matches.push({ variant, score: s, index });
  });

  matches.sort((a, b) => {
    if (filters.sort === "az") {
      return a.variant.name.localeCompare(b.variant.name) || a.variant.style.localeCompare(b.variant.style) || a.index - b.index;
    }
    if (filters.sort === "new" && a.variant.isNew !== b.variant.isNew) return a.variant.isNew ? -1 : 1;
    // "featured": relevance when searching, otherwise library order.
    return b.score - a.score || a.index - b.index;
  });
  return matches.map((m) => m.variant);
}

export interface SetCounts {
  all: number;
  new: number;
  saved: number;
  categories: Partial<Record<CategoryId, number>>;
  subcategories: Record<string, number>;
}

/** How many icons each set would show with the current search / style / size / animation filters. */
export function countSets(variants: readonly IconVariant[], filters: FilterState, savedKeys: readonly string[]): SetCounts {
  const terms = parseTerms(filters.query);
  const saved = new Set(savedKeys);
  const counts: SetCounts = { all: 0, new: 0, saved: 0, categories: {}, subcategories: {} };
  for (const variant of variants) {
    if (!matchesFacets(variant, filters)) continue;
    if (terms.length && score(variant, terms) === 0) continue;
    counts.all++;
    if (variant.isNew) counts.new++;
    if (saved.has(variant.key)) counts.saved++;
    counts.categories[variant.category] = (counts.categories[variant.category] ?? 0) + 1;
    if (variant.subcategory) {
      const key = `${variant.category}/${variant.subcategory}`;
      counts.subcategories[key] = (counts.subcategories[key] ?? 0) + 1;
    }
  }
  return counts;
}

/** Filters that narrow the result set (render options like stroke / colour / sort are excluded). */
export function hasActiveFilters(filters: FilterState) {
  return (
    filters.query.trim() !== "" ||
    filters.style !== "all" ||
    filters.size !== "all" ||
    filters.animation !== "all" ||
    filters.set.kind !== "all"
  );
}

/** Anything differing from the defaults — drives the "Reset" button. */
export function isModified(filters: FilterState) {
  return (
    hasActiveFilters(filters) ||
    filters.strokeWidth !== DEFAULT_STROKE_WIDTH ||
    filters.color !== null ||
    filters.sort !== DEFAULT_FILTERS.sort
  );
}
