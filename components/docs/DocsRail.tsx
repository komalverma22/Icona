"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cx } from "../ui/Button";
import { PlaneGlyph } from "../site/PaperPlane";
import { DOC_SECTIONS } from "./sections";

/** A section counts as "reached" once its top passes this line below the sticky header. */
const ANCHOR = 132;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Where the reader is, as a number from 0 to (sections − 1): the integer part
 * is the current section, the fraction is how far through it they have read.
 */
function readPosition(): number {
  const tops = DOC_SECTIONS.map((s) => document.getElementById(s.id)?.getBoundingClientRect().top ?? Infinity);
  let index = 0;
  for (let i = 0; i < tops.length; i++) if (tops[i] <= ANCHOR + 1) index = i;
  const end = index + 1 < tops.length ? tops[index + 1] : document.documentElement.scrollHeight - window.scrollY - window.innerHeight + ANCHOR + 400;
  const span = Math.max(1, end - tops[index]);
  return index + clamp01((ANCHOR - tops[index]) / span);
}

/**
 * Reading progress as a flight: on wide screens a paper plane glides down a
 * dashed track beside the section list, on phones it crosses a thin bar under
 * the header. Both follow the scroll position exactly and park when you stop.
 */
export function DocsRail() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const ys = useRef<number[]>([]);
  const lastIndex = DOC_SECTIONS.length - 1;

  const position = useMotionValue(0);
  const smooth = useSpring(position, { stiffness: 260, damping: 32, mass: 0.6 });
  const eased = reduce ? position : smooth;
  const y = useMotionValue(0);
  const trailHeight = useMotionValue(0);
  const barPercent = useTransform(eased, (p) => `${(p / lastIndex) * 100}%`);

  // Piecewise-linear map from "section progress" to a pixel on the rail.
  const toY = useCallback(
    (p: number) => {
      const list = ys.current;
      if (!list.length) return 0;
      const i = Math.min(lastIndex - 1, Math.floor(p));
      return list[i] + (list[i + 1] - list[i]) * (p - i);
    },
    [lastIndex],
  );

  useLayoutEffect(() => {
    const measure = () => {
      ys.current = items.current.map((el) => (el ? el.offsetTop + el.offsetHeight / 2 : 0));
      y.set(toY(eased.get()));
      trailHeight.set(toY(eased.get()));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [eased, toY, y, trailHeight]);

  useEffect(() => {
    const unsubscribe = eased.on("change", (p) => {
      const v = toY(Math.min(lastIndex, Math.max(0, p)));
      y.set(v);
      trailHeight.set(v);
    });
    return unsubscribe;
  }, [eased, lastIndex, toY, y, trailHeight]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const p = readPosition();
      position.set(p);
      setActive(Math.min(lastIndex, Math.floor(p + 0.0001)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [lastIndex, position]);

  const groups = DOC_SECTIONS.reduce<{ name: string; items: { index: number; id: string; title: string }[] }[]>((acc, s, index) => {
    const last = acc[acc.length - 1];
    if (last?.name === s.group) last.items.push({ index, id: s.id, title: s.title });
    else acc.push({ name: s.group, items: [{ index, id: s.id, title: s.title }] });
    return acc;
  }, []);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <>
      {/* Phones and tablets: a thin flight bar under the header */}
      <div className="sticky top-16 z-30 -mx-4 border-b border-divider bg-white/95 px-4 backdrop-blur md:-mx-8 md:px-8 lg:hidden">
        <div className="flex h-11 items-center gap-3">
          <label className="relative flex min-w-0 flex-1 items-center">
            <span className="sr-only">Jump to section</span>
            <select
              value={DOC_SECTIONS[active].id}
              onChange={(e) => jump(e.target.value)}
              className="h-8 w-full cursor-pointer appearance-none rounded-[8px] bg-transparent pr-6 text-[12px] leading-4 font-medium text-ink outline-none focus-visible:outline-2 focus-visible:outline-accent"
            >
              {DOC_SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-1 text-muted">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </label>
          <span className="shrink-0 text-[11px] leading-3 text-muted tabular-nums">
            {active + 1} / {DOC_SECTIONS.length}
          </span>
        </div>
        <div aria-hidden className="relative -mx-2 h-0 md:-mx-6">
          <div className="absolute inset-x-0 -top-px h-px bg-line" />
          <motion.div className="absolute -top-px left-0 h-px bg-accent" style={{ width: barPercent }} />
          <motion.div className="absolute -top-[9px] text-ink" style={{ left: barPercent, x: "-50%" }}>
            <PlaneGlyph size={16} className="rounded-full bg-white" />
          </motion.div>
        </div>
      </div>

      {/* Desktop: the flight rail */}
      <nav aria-label="On this page" className="sticky top-[96px] hidden max-h-[calc(100vh-120px)] w-[212px] shrink-0 overflow-y-auto pr-2 pb-8 lg:block">
        <div className="relative">
          {/* track */}
          <span aria-hidden className="absolute top-3 bottom-3 left-[7px] w-px border-l border-dashed border-[rgba(28,31,33,0.22)]" />
          <motion.span aria-hidden className="absolute top-0 left-[7px] w-px origin-top bg-accent" style={{ height: trailHeight }} />
          <motion.span aria-hidden className="pointer-events-none absolute top-0 left-[7px] z-10 text-ink" style={{ y, x: "-50%" }}>
            <span className="-mt-[10px] flex size-5 rotate-90 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(28,31,33,0.1),0_2px_6px_rgba(10,10,11,0.12)]">
              <PlaneGlyph size={13} />
            </span>
          </motion.span>

          {groups.map((group) => (
            <div key={group.name} className="mb-5 last:mb-0">
              <p className="mb-1.5 pl-7 text-[10px] leading-3 font-medium tracking-[0.06em] text-muted uppercase">{group.name}</p>
              <ul>
                {group.items.map(({ index, id, title }) => {
                  const current = index === active;
                  const passed = index < active;
                  return (
                    <li key={id}>
                      <a
                        ref={(el) => {
                          items.current[index] = el;
                        }}
                        href={`#${id}`}
                        aria-current={current ? "location" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          jump(id);
                        }}
                        className="group flex h-8 items-center gap-3.5 rounded-[8px] pr-2 text-[13px] leading-4 font-medium"
                      >
                        <span aria-hidden className="relative flex w-[15px] shrink-0 justify-center">
                          <span className={cx("size-[7px] rounded-full border transition-colors duration-200", current || passed ? "border-accent bg-accent" : "border-[rgba(28,31,33,0.3)] bg-white group-hover:border-ink")} />
                        </span>
                        <span className={cx("truncate transition-colors duration-150", current ? "text-ink" : "text-muted group-hover:text-ink")}>{title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
