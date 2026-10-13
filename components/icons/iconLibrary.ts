import { iconDefinitions as baseDefinitions } from "./iconData";
import { colorNodes } from "./colorStyle";
import { discoverIconDefinitions } from "./iconDataDiscover";
import { foodIconDefinitions } from "./iconDataFood";
import { pixelIconDefinitions, tracedArt } from "./iconDataPixel";
import { playgroundIconDefinitions } from "./iconDataPlayground";
import { underratedIconDefinitions } from "./iconDataUnderrated";
import type { CategoryId, IconDefinition, IconStyle, IconVariant } from "./types";

const iconDefinitions: readonly IconDefinition[] = [
  ...baseDefinitions,
  ...underratedIconDefinitions,
  ...discoverIconDefinitions,
  ...playgroundIconDefinitions,
  ...pixelIconDefinitions,
  ...foodIconDefinitions,
];

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  /** Sub-groups shown when the set is expanded in the sidebar (derived from data). */
  subcategories: string[];
  /** Glyph shown next to the set in the sidebar. */
  icon?: IconVariant;
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
  data: "Data Viz",
  accessibility: "Accessibility",
  creative: "Creative",
  pixel: "Pixel Art",
  devices: "Devices",
  security: "Security",
  nature: "Nature",
  maps: "Maps",
  food: "Food & Kitchen",
};

/** Sidebar order. */
const CATEGORY_ORDER: CategoryId[] = [
  "core",
  "ui",
  "navigation",
  "developer",
  "data",
  "accessibility",
  "creative",
  "pixel",
  "devices",
  "security",
  "communication",
  "media",
  "files",
  "nature",
  "food",
  "maps",
  "commerce",
  "social",
];

/** Library icon (outline) that represents each set in the sidebar. */
const CATEGORY_ICONS: Record<CategoryId, string> = {
  core: "star",
  ui: "toggle",
  navigation: "compass",
  communication: "message",
  media: "play",
  files: "folder",
  commerce: "cart",
  social: "share",
  developer: "code",
  data: "gauge",
  accessibility: "accessibility",
  creative: "magic-wand",
  pixel: "pixel-gamepad",
  devices: "keyboard",
  security: "shield-check",
  nature: "leaf",
  maps: "map-pin",
  food: "apple",
};

export const STYLES: readonly IconStyle[] = ["outline", "fill", "color"];

/**
 * Flatten authoring definitions into grid entries: one entry per icon × style.
 * Runs once at module load — search haystacks are pre-computed here.
 */
export const iconVariants: readonly IconVariant[] = iconDefinitions.flatMap((def) =>
  STYLES.flatMap((style): IconVariant[] => {
    const nodes = style === "color" ? colorNodes(def) : def[style];
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
        animated: Boolean(def.animation || def.pixel),
        animation: def.animation,
        animationOptions: def.animationOptions,
        nodes,
        pixel: def.pixel && (style === "fill" ? def.pixel : tracedArt(def.pixel)),
        searchText,
      },
    ];
  }),
);

/** Number of distinct icons (each may ship in several styles). */
export const iconCount = iconDefinitions.length;

export const iconVariantsByKey: ReadonlyMap<string, IconVariant> = new Map(iconVariants.map((v) => [v.key, v]));

/** Display names for each style. */
export const STYLE_LABEL: Record<IconStyle, string> = { outline: "Outline", fill: "Fill", color: "Color" };

/** The styles an icon ships in, in display order. */
export const stylesOf = (iconId: string): IconStyle[] => STYLES.filter((style) => iconVariantsByKey.has(`${iconId}-${style}`));

export const categories: readonly CategoryMeta[] = CATEGORY_ORDER.map((id) => {
  const subcategories: string[] = [];
  for (const def of iconDefinitions) {
    if (def.category === id && def.subcategory && !subcategories.includes(def.subcategory)) {
      subcategories.push(def.subcategory);
    }
  }
  return { id, label: CATEGORY_LABELS[id], subcategories, icon: iconVariantsByKey.get(`${CATEGORY_ICONS[id]}-outline`) };
});

export const categoryLabel = (id: CategoryId) => CATEGORY_LABELS[id];
