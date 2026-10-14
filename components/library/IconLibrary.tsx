"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import { FilterPanel } from "../filters/FilterPanel";
import { ResultsToolbar } from "../filters/ResultsToolbar";
import { IconGrid } from "../icons/IconGrid";
import { Navbar } from "../layout/Navbar";
import { iconVariantsByKey } from "../icons/iconLibrary";
import { AnimationStudio } from "../motion/AnimationStudio";
import { ScrollArea } from "../ui/ScrollArea";
import { Sheet } from "../ui/Sheet";
import { LibraryProvider, useLibrary } from "./LibraryProvider";

/** True from the lg breakpoint up (where the sidebar is visible). */
function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

const swap = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};

/** Right-hand sidebar: the filters, or the Animation Studio when an icon is opened. */
function Sidebar() {
  const { studioKey } = useLibrary();
  return (
    <AnimatePresence mode="wait" initial={false}>
      {studioKey ? (
        <motion.div key="studio" {...swap}>
          <AnimationStudio variantKey={studioKey} />
        </motion.div>
      ) : (
        <motion.div key="filters" {...swap}>
          <FilterPanel />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Below lg there is no sidebar - the studio opens in a sheet. */
function StudioSheet() {
  const { studioKey, closeStudio } = useLibrary();
  const desktop = useIsDesktop();
  const name = studioKey ? iconVariantsByKey.get(studioKey)?.name : undefined;
  return (
    <Sheet open={Boolean(studioKey) && !desktop} onClose={closeStudio} title={name ? `${name} animations` : "Animations"}>
      {studioKey && <AnimationStudio variantKey={studioKey} inSheet />}
    </Sheet>
  );
}

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
            <ResultsToolbar />
            <IconGrid />
          </main>
          {/* 256px aside: 8px + 240px panel + 11px gap + 3px overlay scrollbar */}
          <aside aria-label="Filters and animation studio" className="sticky top-[100px] hidden w-64 shrink-0 lg:block">
            <ScrollArea viewportClassName="max-h-[calc(100vh-116px)] pr-[14px] pb-6 pl-2">
              <Sidebar />
            </ScrollArea>
          </aside>
        </div>
        <StudioSheet />
      </LibraryProvider>
    </MotionConfig>
  );
}
