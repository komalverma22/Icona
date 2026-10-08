"use client";

import { AnimationFilter } from "./AnimationFilter";
import { CategoryFilter } from "./CategoryFilter";
import { SizeFilter } from "./SizeFilter";
import { StyleFilter } from "./StyleFilter";

/** Figma "Aside - left sidebar" content: Style, Size, Animation, then Sets. */
export function FilterPanel() {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col gap-4">
        <StyleFilter />
        <SizeFilter />
        <AnimationFilter />
      </div>
      <CategoryFilter />
    </div>
  );
}
