"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Counts up to `value` the first time it scrolls into view. */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!inView || reduce) return;
    setShown(0);
    const controls = animate(0, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return <span ref={ref}>{shown.toLocaleString("en-US")}</span>;
}
