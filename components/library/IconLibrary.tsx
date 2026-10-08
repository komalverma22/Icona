"use client";

import { MotionConfig } from "framer-motion";
import { FilterPanel } from "../filters/FilterPanel";
import { MobileFilterBar } from "../filters/MobileFilterBar";
import { IconGrid } from "../icons/IconGrid";
import { Navbar } from "../layout/Navbar";
import { LibraryProvider } from "./LibraryProvider";

/**
 * The icon library page: top bar, grid, and the right-hand filter sidebar
 * (Figma "Desktop - 1", 48:1045). Grid 979px + 41px gap + 256px aside at 1440.
 */
export function IconLibrary() {
  return (
    <MotionConfig reducedMotion="user">
      <LibraryProvider>
        <Navbar />
        <div className="mx-auto flex max-w-[1440px] items-start gap-[41px] px-4 pt-6 pb-16 md:px-8 md:pt-9 xl:px-[82px]">
          <main className="min-w-0 flex-1">
            <h1 className="sr-only">Icon library</h1>
            <MobileFilterBar />
            <IconGrid />
          </main>
          <aside
            aria-label="Filters"
            className="sticky top-[100px] hidden max-h-[calc(100vh-116px)] w-64 shrink-0 overflow-y-auto pb-4 pl-4 lg:block"
          >
            <FilterPanel />
          </aside>
        </div>
      </LibraryProvider>
    </MotionConfig>
  );
}
