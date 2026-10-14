"use client";

import { useState } from "react";
import { AnimatedIcon } from "../landing/AnimatedIcon";

/** "Where your seat goes" card. Hovering it plays its library icon. */
export function UseCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="h-full rounded-[16px] border border-line bg-card p-5 transition-[border-color,box-shadow,background-color] duration-200 hover:border-[rgba(28,31,33,0.2)] hover:bg-white hover:shadow-card-hover md:p-6"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <span className="flex size-11 items-center justify-center rounded-[12px] border border-line bg-white text-ink">
        <AnimatedIcon id={icon} size={22} active={hover} auto />
      </span>
      <h3 className="mt-5 text-[17px] leading-6 font-semibold tracking-[-0.01em] text-ink">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-[22px] text-muted">{body}</p>
    </div>
  );
}
