"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState, type PointerEvent } from "react";

const WORD = "Icona";
const EASE = [0.22, 1, 0.36, 1] as const;
const SPOT = 560; // px width of the light that follows the pointer

/** One layer of the wordmark. Padding on the right, offset by a negative margin, stops the tight tracking clipping glyph edges. */
function Letters({ className, animate }: { className: string; animate?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="flex text-[clamp(120px,27vw,400px)] leading-[0.8] font-semibold tracking-[-0.07em]" aria-hidden>
      {WORD.split("").map((ch, i) =>
        animate ? (
          <motion.span
            key={i}
            className={className}
            initial={reduce ? false : { y: "48%", opacity: 0, filter: "blur(10px)" }}
            whileInView={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.95, delay: i * 0.08, ease: EASE }}
          >
            {ch}
          </motion.span>
        ) : (
          <span key={i} className={className}>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

const LETTER = "-mr-[0.08em] pr-[0.08em] pb-[0.06em] bg-clip-text text-transparent";

/**
 * The giant footer wordmark: letters blur-rise in on scroll, a soft light slowly
 * sweeps across, and the light follows the pointer while it is over the word.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const [x, setX] = useState<number | null>(null);

  const move = (e: PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setX(e.clientX - rect.left);
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={() => setX(null)}
      className="relative mx-auto flex w-fit max-w-full cursor-default justify-center overflow-hidden select-none"
      aria-hidden
    >
      {/* base ink: a pale gradient that fades towards the bottom edge */}
      <Letters animate className={`${LETTER} bg-[linear-gradient(180deg,rgba(28,31,33,0.1)_0%,rgba(28,31,33,0.03)_70%,rgba(28,31,33,0)_100%)]`} />

      {/* light: sweeps by itself, follows the pointer on hover */}
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 1 }}
        className={`footer-light pointer-events-none absolute inset-0 flex justify-center ${x === null ? "footer-light-idle" : ""}`}
        style={x === null ? undefined : { maskPosition: `${x - SPOT / 2}px 0`, WebkitMaskPosition: `${x - SPOT / 2}px 0` }}
      >
        <Letters className={`${LETTER} bg-[linear-gradient(180deg,rgba(28,31,33,0.26)_0%,rgba(28,31,33,0.07)_75%,rgba(28,31,33,0)_100%)]`} />
      </motion.span>
    </div>
  );
}
