"use client";

import { useScroll } from "framer-motion";
import { useRef } from "react";
import { FlightPath } from "../site/PaperPlane";

/** A flight path whose plane advances as you scroll the section past, so the page itself feels like the journey. */
export function ScrollFlight({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "end 38%"] });
  return (
    <div ref={ref} className={className}>
      <FlightPath d="M0 70 C 160 70, 220 8, 400 22 S 640 96, 800 52 S 1000 -4, 1200 34" viewBox="-24 -8 1248 120" progress={scrollYProgress} planeSize={30} className="h-auto w-full" />
    </div>
  );
}
