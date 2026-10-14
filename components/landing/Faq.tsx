"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId, useState, type ReactNode } from "react";
import { cx } from "../ui/Button";

export type FaqItem = { q: string; a: ReactNode };

const ITEMS: FaqItem[] = [
  {
    q: "What is Icona?",
    a: "Icona is a library of hand-crafted icons that move. Every icon comes as a static outline, a color version or an animated component, so you can browse the set, preview a motion and drop the result into your interface.",
  },
  {
    q: "How do I add an icon to my project?",
    a: (
      <>
        Open any icon, pick a motion and press <span className="font-medium text-ink">Get code, export &amp; install</span>. You can run one shadcn CLI command to add the component as a file you own, or copy the code by hand from the Manual tab.
      </>
    ),
  },
  {
    q: "Can I change an icon’s color, size and stroke?",
    a: "Yes. Every icon takes size, color and strokeWidth props, and animated icons also accept speed and an animate mode of hover, loop or none. Color defaults to currentColor, so an icon follows the text around it unless you say otherwise.",
  },
  {
    q: "Which formats can I export?",
    a: "React components, plain SVG, PNG, GIF and APNG. The values you set in the customize panel, such as color, size and motion, are baked into whatever you copy or download.",
  },
  {
    q: "Is Icona free to use, and does it work with my stack?",
    a: "Icona is MIT licensed and free to use. The components need React 18 or newer, ship with TypeScript types and work in Next.js and with Tailwind. Animations are plain CSS and honor prefers-reduced-motion.",
  },
];

function Plus({ open }: { open: boolean }) {
  return (
    <span aria-hidden className={cx("flex size-6 shrink-0 items-center justify-center text-text transition-transform duration-300 ease-out", open && "rotate-45")}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
  );
}

/** Single-open accordion: the first question starts open, and the plus turns into a cross. */
export function Faq({ items = ITEMS }: { items?: readonly FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const uid = useId();

  return (
    <div className="rounded-[14px] border border-line bg-white px-5 py-2 shadow-card-hover sm:px-8 sm:py-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${uid}-panel-${i}`;
        const buttonId = `${uid}-button-${i}`;
        return (
          <div key={item.q} className={cx(i > 0 && "border-t border-divider")}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left sm:py-6"
              >
                <span className={cx("text-[17px] leading-6 tracking-[-0.01em] transition-colors sm:text-[19px]", isOpen ? "text-ink" : "text-text")}>{item.q}</span>
                <Plus open={isOpen} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[640px] pr-10 pb-6 text-[15px] leading-[26px] text-muted">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
