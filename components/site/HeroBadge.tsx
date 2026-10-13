"use client";

import { useState } from "react";
import { iconVariantsByKey } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";

const SPARKLES = iconVariantsByKey.get("sparkles-outline")!;

/** Pill above the headline. Hovering plays the sparkle icon's own "Classic Draw" animation. */
export function HeroBadge({ children }: { children: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      className="inline-flex h-8 cursor-default items-center gap-1.5 rounded-full border border-[rgba(28,31,33,0.22)] bg-card pr-3.5 pl-2.5 text-[13px] leading-4 font-medium text-muted transition-colors hover:text-ink"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <IconRenderer variant={SPARKLES} size={16} state={hovered ? "active" : "rest"} />
      {children}
    </span>
  );
}
