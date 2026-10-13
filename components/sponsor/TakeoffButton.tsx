"use client";

import { useAnimate, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { ButtonLink } from "../ui/Button";
import { PlaneGlyph } from "../site/PaperPlane";

/**
 * A link that opens in a new tab and, as it does, sends a paper plane off the
 * button. The plane is pure decoration: the link works the same without it.
 */
export function TakeoffButton({ href, children, variant = "accent", size, className }: { href: string; children: ReactNode; variant?: "accent" | "raised"; size?: "md" | "lg"; className?: string }) {
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();

  const fly = () => {
    if (reduce) return;
    animate(scope.current, { x: [0, 28, 120], y: [0, -6, -52], rotate: [0, -8, -24], opacity: [1, 1, 0], scale: [1, 1.1, 0.8] }, { duration: 0.9, ease: [0.4, 0, 0.2, 1] }).then(() =>
      animate(scope.current, { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }, { duration: 0 }),
    );
  };

  return (
    <ButtonLink variant={variant} size={size} href={href} target="_blank" rel="noreferrer" onClick={fly} className={className}>
      {children}
      <span ref={scope} aria-hidden className="inline-flex">
        <PlaneGlyph size={14} />
      </span>
    </ButtonLink>
  );
}
