import { iconDefinitions as baseDefinitions } from "./iconData";
import { underratedIconDefinitions } from "./iconDataUnderrated";
import type { CategoryId, IconDefinition, IconStyle, IconVariant } from "./types";

const iconDefinitions: readonly IconDefinition[] = [...baseDefinitions, ...underratedIconDefinitions];

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  /** Sub-groups shown when the set is expanded in the sidebar (derived from data). */
  subcategories: string[];
}

const CATEGORY_LABELS: Record<CategoryId, string> = {
  core: "Core",
  ui: "UI",
  navigation: "Navigation",
  communication: "Communication",
  media: "Media",
  files: "Files",
  commerce: "Commerce",
  social: "Social",
  developer: "Developer",
  devices: "Devices",
  security: "Security",
  nature: "Nature",
  maps: "Maps",
};

/** Sidebar order. */
const CATEGORY_ORDER: CategoryId[] = [
  "core",
  "ui",
  "navigation",
  "developer",
  "devices",
  "security",
  "communication",
  "media",
  "files",
  "nature",
  "maps",
  "commerce",
  "social",
];

const STYLES: IconStyle[] = ["outline", "fill"];

/**
 * Flatten authoring definitions into grid entries: one entry per icon × style.
 * Runs once at module load — search haystacks are pre-computed here.
 */
export const iconVariants: readonly IconVariant[] = iconDefinitions.flatMap((def) =>
  STYLES.flatMap((style): IconVariant[] => {
    const nodes = def[style];
    if (!nodes) return [];
    const searchText = [def.name, def.id, CATEGORY_LABELS[def.category], def.subcategory ?? "", style, def.isNew ? "new" : "", ...def.tags]
      .join(" ")
      .toLowerCase();
    return [
      {
        key: `${def.id}-${style}`,
        iconId: def.id,
        name: def.name,
        category: def.category,
        subcategory: def.subcategory,
        tags: def.tags,
        sizes: def.sizes,
        style,
        isNew: Boolean(def.isNew),
        animated: Boolean(def.animation),
        animation: def.animation,
        animationOptions: def.animationOptions,
        nodes,
        searchText,
      },
    ];
  }),
);

export const iconVariantsByKey: ReadonlyMap<string, IconVariant> = new Map(iconVariants.map((v) => [v.key, v]));

export const categories: readonly CategoryMeta[] = CATEGORY_ORDER.map((id) => {
  const subcategories: string[] = [];
  for (const def of iconDefinitions) {
    if (def.category === id && def.subcategory && !subcategories.includes(def.subcategory)) {
      subcategories.push(def.subcategory);
    }
  }
  return { id, label: CATEGORY_LABELS[id], subcategories };
});

export const categoryLabel = (id: CategoryId) => CATEGORY_LABELS[id];
