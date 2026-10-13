"use client";

import { useEffect, useState } from "react";
import { iconVariantsByKey } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";

/**
 * A library icon that plays its own animation. It plays while `active` is true
 * and, with `auto`, replays itself every few seconds so a page of icons feels alive.
 */
export function AnimatedIcon({ id, size = 28, active = false, auto = false }: { id: string; size?: number; active?: boolean; auto?: boolean }) {
  const variant = iconVariantsByKey.get(`${id}-outline`);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let start: number | undefined;
    let stop: number | undefined;
    const schedule = () => {
      start = window.setTimeout(() => {
        setPulse(true);
        stop = window.setTimeout(() => {
          setPulse(false);
          schedule();
        }, 1600);
      }, 2200 + Math.random() * 4200);
    };
    schedule();
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, [auto]);

  if (!variant) return null;
  return <IconRenderer variant={variant} size={size} state={active || pulse ? "active" : "rest"} />;
}
