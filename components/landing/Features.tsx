"use client";

import { useState } from "react";
import { AnimatedIcon } from "./AnimatedIcon";
import { Reveal } from "./Reveal";

const FEATURES = [
  { icon: "sparkles", title: "Hand-crafted motion", body: "Every icon ships with an animation drawn for that exact shape, not a generic spin or fade." },
  { icon: "play", title: "Pick a motion", body: "Preview several motion styles per icon in the Animation Studio, then loop, slow down or speed up." },
  { icon: "settings", title: "Make it yours", body: "Set color, size, stroke width and speed. What you see is exactly what you copy." },
  { icon: "download", title: "Copy, install or export", body: "React component, shadcn CLI, SVG, PNG, GIF or APNG. Use whichever fits your project." },
  { icon: "zap", title: "Light by design", body: "Typed, tree-shakeable and plain CSS animation. Only the icons you import reach your bundle." },
  { icon: "eye", title: "Accessible by default", body: "Icons follow currentColor and honour prefers-reduced-motion out of the box." },
] as const;

function Card({ icon, title, body }: (typeof FEATURES)[number]) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="h-full rounded-[16px] border border-line bg-card p-5 transition-[border-color,box-shadow,background-color] duration-200 hover:border-[rgba(28,31,33,0.2)] hover:bg-white hover:shadow-card-hover md:p-6"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <span className="flex size-11 items-center justify-center rounded-[12px] border border-line bg-white text-ink">
        <AnimatedIcon id={icon} size={24} active={hover} auto />
      </span>
      <h3 className="mt-5 text-[17px] leading-6 font-semibold tracking-[-0.01em] text-ink">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-[22px] text-muted">{body}</p>
    </div>
  );
}

export function Features() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f, i) => (
        <li key={f.title}>
          <Reveal delay={(i % 3) * 0.07} className="h-full">
            <Card {...f} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
