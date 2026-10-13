"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { iconVariantsByKey } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";
import { MotionIcon } from "../motion/MotionIcon";
import { getMotions } from "../motion/registry";
import { cx } from "../ui/Button";

const BELL = iconVariantsByKey.get("bell-outline")!;
const MOTIONS = getMotions(BELL).filter((m) => m.style !== "morph").slice(0, 4);

/**
 * A mini Animation Studio for the bell: the real motion variants from the
 * registry, stepped through one by one in the big preview and the motion grid.
 */
export function HowMotionScene() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [play, setPlay] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % MOTIONS.length);
      setPlay((p) => p + 1);
    }, 1900);
    return () => window.clearInterval(id);
  }, [reduce]);

  const current = MOTIONS[index];
  if (!current) return null;

  return (
    <div className="relative w-[288px] rounded-[16px] border border-line bg-white p-3 shadow-card-hover">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-7 items-center justify-center rounded-[8px] border border-line bg-card">
            <IconRenderer variant={BELL} size={14} recipe={null} />
          </span>
          <div>
            <p className="text-[12px] leading-4 font-medium text-ink">Bell</p>
            <p className="text-[10px] leading-3 text-muted">{getMotions(BELL).length} motions</p>
          </div>
        </div>
        <div className="flex rounded-[8px] border border-line bg-card p-0.5 text-[10px] leading-3 font-medium">
          <span className="rounded-[6px] border border-line bg-white px-1.5 py-1 text-ink shadow-segment">Outline</span>
          <span className="px-1.5 py-1 text-muted">Fill</span>
        </div>
      </div>

      <div className="relative mt-3 h-[96px] overflow-hidden rounded-[12px] border border-line bg-card text-ink">
        <div aria-hidden className="how-grid absolute inset-0 opacity-70" />
        <MotionIcon variant={BELL} motion={current} active playKey={play} size={40} />
        <span className="absolute bottom-2 left-2 rounded-full border border-line bg-white px-2 py-0.5 text-[10px] leading-3 font-medium text-ink">{current.label}</span>
        <span className="absolute right-2 bottom-2 rounded-full border border-line bg-white px-1.5 py-0.5 font-mono text-[10px] leading-3 text-muted">1×</span>
        {!reduce && <span key={play} aria-hidden className="how-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ink/70" />}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {MOTIONS.map((m, i) => {
          const on = i === index;
          return (
            <div key={m.id} className="flex min-w-0 flex-col gap-1">
              <span
                className={cx(
                  "relative block h-11 rounded-[10px] border text-ink transition-[border-color,background-color,box-shadow] duration-300",
                  on ? "border-ink bg-white shadow-card-hover" : "border-line bg-card",
                )}
              >
                <MotionIcon variant={BELL} motion={m} active={on} playKey={play} size={18} />
              </span>
              <span className={cx("truncate px-0.5 text-[9.5px] leading-3 font-medium transition-colors duration-300", on ? "text-ink" : "text-muted")}>{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
