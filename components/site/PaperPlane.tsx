"use client";

import { animate, motionValue, useMotionValueEvent, useReducedMotion, type MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

/** Stand-in motion value for the hook when no scroll progress is supplied. */
const IDLE = motionValue(0);

/** The paper plane glyph on a 24-unit grid, nose pointing right. */
export function PlaneGlyph({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12 3 4l5 8-5 8z" />
      <path d="M8 12h14" />
    </svg>
  );
}

interface FlightPathProps {
  /** SVG path the plane follows (start → end). */
  d: string;
  viewBox: string;
  /** Scroll-linked position, 0-1. Without it the plane loops on its own. */
  progress?: MotionValue<number>;
  /** Plane size in viewBox units. */
  planeSize?: number;
  /** Seconds per pass when looping on its own. */
  duration?: number;
  className?: string;
}

/**
 * A dashed flight path with a paper plane that follows it, drawing a solid
 * trail behind it. The plane is placed straight onto the SVG (no React state)
 * so it stays smooth while scrolling. Reduced motion parks it at the end.
 */
export function FlightPath({ d, viewBox, progress, planeSize = 30, duration = 5.5, className }: FlightPathProps) {
  const reduce = useReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);

  const place = (p: number) => {
    const path = pathRef.current;
    const plane = planeRef.current;
    const trail = trailRef.current;
    if (!path || !plane || !trail) return;
    try {
      const len = path.getTotalLength();
      const at = Math.min(1, Math.max(0, p)) * len;
      const a = path.getPointAtLength(at);
      const ahead = path.getPointAtLength(Math.min(len, at + 1));
      const behind = path.getPointAtLength(Math.max(0, at - 1));
      const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
      plane.setAttribute("transform", `translate(${a.x} ${a.y}) rotate(${angle}) scale(${planeSize / 24}) translate(-12 -12)`);
      trail.style.strokeDasharray = `${at} ${len}`;
    } catch {
      // Some browsers refuse to measure a path inside a hidden (display: none) SVG; it is measured once visible.
    }
  };

  useMotionValueEvent(progress ?? IDLE, "change", (v) => {
    if (progress) place(v);
  });

  useEffect(() => {
    if (progress) {
      place(progress.get());
      return;
    }
    if (reduce) {
      place(1);
      return;
    }
    const controls = animate(0, 1, { duration, ease: [0.45, 0, 0.25, 1], repeat: Infinity, repeatDelay: 1.1, onUpdate: place });
    return () => controls.stop();
  }, [progress, reduce, duration]); // eslint-disable-line react-hooks/exhaustive-deps -- `place` only reads refs and planeSize

  return (
    <svg aria-hidden viewBox={viewBox} fill="none" className={className} preserveAspectRatio="xMidYMid meet">
      <path ref={pathRef} d={d} stroke="var(--color-line)" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
      <path ref={trailRef} d={d} stroke="var(--color-accent)" strokeWidth="1.75" strokeLinecap="round" opacity="0.85" strokeDasharray="0 9999" />
      <g ref={planeRef} className="text-ink">
        <g fill="white" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12 3 4l5 8-5 8z" />
          <path d="M8 12h14" />
        </g>
      </g>
    </svg>
  );
}
