"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLibrary } from "../library/LibraryProvider";
import { isModified } from "../library/filterIcons";
import { cx } from "../ui/Button";
import { AnimationFilter } from "./AnimationFilter";
import { CategoryFilter } from "./CategoryFilter";
import { ColorFilter } from "./ColorFilter";
import { MotionFilter } from "./MotionFilter";
import { SizeFilter } from "./SizeFilter";
import { SortFilter } from "./SortFilter";
import { StrokeFilter } from "./StrokeFilter";
import { StyleFilter } from "./StyleFilter";

/**
 * Filter sidebar. Two groups:
 *  - Filter : Style, Animation, Motion style (narrow the results)
 *  - Customize : Size, Stroke, Color (change how icons render and copy)
 * followed by the Sets list. `inSheet` adds Sort, which lives in the results
 * toolbar on larger screens.
 */
export function FilterPanel({ inSheet = false }: { inSheet?: boolean }) {
  const { filters, resetFilters } = useLibrary();
  const modified = isModified(filters);

  return (
    <div className="flex w-full flex-col">
      {/* In the sheet the title lives in the sheet header, so this row only exists for "Reset all". */}
      <div className={cx("flex h-6 items-center justify-between", inSheet ? (modified ? "mb-4" : "hidden") : "mb-5")}>
        {!inSheet && <h2 className="text-[13px] leading-4 font-medium text-ink">Filters</h2>}
        <AnimatePresence>
          {modified && (
            <motion.button
              type="button"
              onClick={resetFilters}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              transition={{ duration: 0.18 }}
              className="ml-auto h-6 cursor-pointer rounded-[6px] px-2 text-[12px] leading-[14.4px] font-medium text-muted transition-colors hover:bg-[rgba(28,31,33,0.04)] hover:text-ink"
            >
              Reset all
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex w-full flex-col gap-6">
        <StyleFilter />
        <AnimationFilter />
        <MotionFilter />
        {inSheet && <SortFilter />}
      </div>

      <div className="mt-7 flex w-full flex-col gap-6 border-t border-divider pt-7">
        <SizeFilter />
        <StrokeFilter />
        <ColorFilter />
      </div>

      <div className="mt-7 border-t border-divider">
        <CategoryFilter />
      </div>
    </div>
  );
}
