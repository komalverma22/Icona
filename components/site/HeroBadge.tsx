"use client";

import { useState } from "react";
import { iconVariantsByKey } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";

/** Pill label with a library icon. Hovering plays the icon's own "Classic Draw" animation. */
export function HeroBadge({ children, icon = "sparkles" }: { children: string; icon?: string }) {
  const [hovered, setHovered] = useState(false);
  const variant = iconVariantsByKey.get(`${icon}-outline`);
  return (
    <span
      className="inline-flex h-8 cursor-default items-center gap-1.5 rounded-full border border-[rgba(28,31,33,0.22)] bg-card pr-3.5 pl-2.5 text-[13px] leading-4 font-medium text-muted transition-colors hover:text-ink"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {variant && <IconRenderer variant={variant} size={16} state={hovered ? "active" : "rest"} />}
      {children}
    </span>
  );
}
