"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./Button";

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
}

const HIDE_AFTER_MS = 900;
const MIN_THUMB = 28;

/**
 * Scroll container with a slim overlay scrollbar (3px) that only appears while
 * the user is scrolling, then fades out. The native scrollbar is hidden, so
 * wheel, touch, keyboard and focus scrolling all keep working natively.
 */
export function ScrollArea({ children, className, viewportClassName }: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const [thumb, setThumb] = useState({ height: 0, top: 0 });
  const [visible, setVisible] = useState(false);

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { clientHeight, scrollHeight, scrollTop } = el;
    if (scrollHeight <= clientHeight + 1) {
      setThumb({ height: 0, top: 0 });
      return;
    }
    const height = Math.max(MIN_THUMB, (clientHeight / scrollHeight) * clientHeight);
    const top = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - height);
    setThumb({ height, top });
  }, []);

  const onScroll = useCallback(() => {
    measure();
    setVisible(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setVisible(false), HIDE_AFTER_MS);
  }, [measure]);

  useEffect(() => {
    measure();
    // Content changes size when sets expand / collapse; the viewport when the window resizes.
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => {
      ro.disconnect();
      window.clearTimeout(hideTimer.current);
    };
  }, [measure]);

  return (
    <div className={cx("relative", className)}>
      <div
        ref={viewportRef}
        onScroll={onScroll}
        className={cx(
          "overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          viewportClassName,
        )}
      >
        <div ref={contentRef}>{children}</div>
      </div>
      {thumb.height > 0 && (
        <div aria-hidden className="pointer-events-none absolute top-0 right-0 bottom-0 w-[3px]">
          <div
            className={cx(
              "absolute right-0 w-[3px] rounded-full bg-[rgba(28,31,33,0.22)] transition-opacity duration-300",
              visible ? "opacity-100" : "opacity-0",
            )}
            style={{ height: thumb.height, transform: `translateY(${thumb.top}px)` }}
          />
        </div>
      )}
    </div>
  );
}
