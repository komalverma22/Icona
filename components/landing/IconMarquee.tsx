"use client";

import { useState } from "react";
import { AnimatedIcon } from "./AnimatedIcon";

const ROW_A = ["bell", "heart", "star", "lock", "mail", "camera", "download", "cloud", "calendar", "sparkles", "play", "share"];
const ROW_B = ["search", "settings", "bookmark", "message", "eye", "cart", "clock", "zap", "home", "user", "upload", "tag"];

function Tile({ id }: { id: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="flex size-[72px] shrink-0 items-center justify-center rounded-[14px] border border-line bg-card text-text shadow-card-hover transition-colors hover:text-ink"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <AnimatedIcon id={id} size={30} active={hover} auto />
    </div>
  );
}

function Row({ ids, reverse }: { ids: string[]; reverse?: boolean }) {
  const track = `marquee-track flex shrink-0 gap-4 pr-4${reverse ? " marquee-reverse" : ""}`;
  return (
    <div className="marquee flex overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className={track}>
        {ids.map((id) => (
          <Tile key={id} id={id} />
        ))}
      </div>
      <div aria-hidden className={track}>
        {ids.map((id) => (
          <Tile key={id} id={id} />
        ))}
      </div>
    </div>
  );
}

/** Two slowly drifting rows of live, replaying icons. */
export function IconMarquee() {
  return (
    <div className="flex flex-col gap-2" aria-label="A sample of Icona's animated icons">
      <Row ids={ROW_A} />
      <Row ids={ROW_B} reverse />
    </div>
  );
}
