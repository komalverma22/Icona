import type { IconVariant } from "../icons/types";
import type { MotionVariant } from "../motion/types";

const words = (value: string) => value.split(/[^a-zA-Z0-9]+/).filter(Boolean);

export const pascalCase = (value: string) => words(value).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
export const kebabCase = (value: string) => words(value).join("-").toLowerCase();

/**
 * Names are built from the icon and, for animated exports, the motion, so two
 * motions of the same icon never collide in a project:
 *   heart-fill            → HeartFillIcon        heart-fill.tsx
 *   heart-fill + Jelly    → HeartFillJellyIcon   heart-fill-jelly.tsx
 * Outline is the default style and stays unmarked.
 */
export function iconSlug(variant: IconVariant, motion?: MotionVariant): string {
  return kebabCase([variant.iconId, variant.style === "fill" ? "fill" : "", motion?.id ?? ""].join("-"));
}

export function componentName(variant: IconVariant, motion?: MotionVariant): string {
  const name = pascalCase(iconSlug(variant, motion));
  return `${/^[0-9]/.test(name) ? "Icon" : ""}${name}Icon`;
}

/** Registry / CLI item name. */
export const registryName = iconSlug;
