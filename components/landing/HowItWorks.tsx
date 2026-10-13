import type { ReactNode } from "react";
import { BRAND } from "../site/Integrations";
import { AnimatedIcon } from "./AnimatedIcon";
import { HowMotionScene } from "./HowMotionScene";
import { Reveal } from "./Reveal";

const CARD = "relative rounded-[16px] border border-line bg-white shadow-card-hover";

/* 01 · Pick an icon ------------------------------------------------------- */

const GRID = ["heart", "bell", "star", "lock", "mail", "camera", "cloud", "search"];

function Cursor() {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" className="how-cursor pointer-events-none absolute -right-2.5 -bottom-3.5 z-10 drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
      <path d="M5 3.5L18.5 12L12.2 13.4L9.4 19.5L5 3.5Z" fill="#1c1f21" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** A mini icons page: the query types itself, the grid filters, the cursor picks "bell". */
function PickScene() {
  return (
    <div className={`${CARD} w-[272px] p-3`}>
      <div className="flex h-9 items-center gap-2 rounded-[10px] bg-field px-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/search.svg" alt="" aria-hidden width={14} height={14} className="size-3.5 opacity-60" />
        <span className="font-mono text-[12px] leading-4 text-ink">
          <span className="how-type">bell</span>
        </span>
        <span aria-hidden className="how-caret -ml-1.5 h-3.5 w-px bg-ink" />
        <span className="ml-auto rounded-[5px] bg-kbd px-1.5 font-mono text-[10px] leading-4 text-muted">⌘K</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {GRID.map((id) =>
          id === "bell" ? (
            <div key={id} className="how-pick relative flex aspect-square items-center justify-center rounded-[10px] border bg-white text-ink">
              <AnimatedIcon id={id} size={20} auto />
              <Cursor />
            </div>
          ) : (
            <div key={id} className="how-dim flex aspect-square items-center justify-center rounded-[10px] border border-line bg-card text-text">
              <AnimatedIcon id={id} size={18} />
            </div>
          ),
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] leading-3 text-muted">
        <span>Outline · 24px</span>
        <span>1 match</span>
      </div>
    </div>
  );
}

/* 03 · Drop it in --------------------------------------------------------- */

/** A mini install panel: the cursor copies the CLI command and the component file lands in the project. */
function DropScene() {
  return (
    <div className={`${CARD} w-[288px] p-3`}>
      <div className="flex items-center justify-between">
        <div className="flex rounded-[8px] border border-line bg-card p-0.5 text-[10px] leading-3 font-medium">
          <span className="rounded-[6px] border border-line bg-white px-2 py-1 text-ink shadow-segment">CLI</span>
          <span className="px-2 py-1 text-muted">Manual</span>
        </div>
        <span className="text-[10px] leading-3 text-muted">bell.tsx</span>
      </div>

      <p className="mt-3 text-[10px] leading-3 font-medium tracking-[0.06em] text-muted uppercase">Run in your project</p>
      <div className="mt-1.5 flex h-10 items-center gap-2 rounded-[10px] border border-line bg-card pr-1.5 pl-3">
        <span className="min-w-0 flex-1 truncate font-mono text-[10.5px] leading-4 text-ink">
          <span className="text-muted">$ </span>npx shadcn add …/r/bell.json
        </span>
        <span className="how-press relative flex h-7 w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[7px] border border-black bg-[#1d1f23] text-[10.5px] leading-3 font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <span className="how-label-a absolute">Copy</span>
          <span className="how-label-b absolute">Copied</span>
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" className="how-cur3 pointer-events-none absolute -right-1 -bottom-3 z-10 drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]">
            <path d="M5 3.5L18.5 12L12.2 13.4L9.4 19.5L5 3.5Z" fill="#1c1f21" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div className="how-toast mt-2.5 flex items-center gap-2 rounded-[10px] border border-line bg-white px-2.5 py-2 shadow-segment">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ink text-white">
          <svg aria-hidden width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <span className="min-w-0 truncate text-[10.5px] leading-4 text-text">
          Added <span className="font-mono text-ink">components/icona/bell.tsx</span>
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-divider pt-3">
        <span className="text-[10px] leading-3 text-muted">Works in</span>
        <div className="flex items-center gap-1.5">
          {BRAND.slice(0, 3).map((t, i) => (
            <span key={t.name} className={`flex size-7 items-center justify-center rounded-[8px] border border-line bg-white ${i === 1 ? "how-float-2" : "how-float"}`}>
              <svg viewBox="0 0 24 24" className="size-3.5" role="img" aria-label={t.name}>
                <path d={t.path} fill={t.color} />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const STEPS: { n: string; title: string; body: string; scene: ReactNode }[] = [
  { n: "01", title: "Pick an icon", body: "Search the library, filter by style, size, color or animation, and open the one you like.", scene: <PickScene /> },
  { n: "02", title: "Choose a motion", body: "Preview its animations in the studio. Tune the color, size, stroke and speed until it feels right.", scene: <HowMotionScene /> },
  { n: "03", title: "Drop it in", body: "Run one install command or copy the code. It lands as a React component that works in your stack.", scene: <DropScene /> },
];

/** Three animated scenes; a swipeable row on small screens, a three-column grid from lg up. */
export function HowItWorks() {
  return (
    <ol className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 md:-mx-8 md:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
      {STEPS.map((s, i) => (
        <li key={s.n} className="w-[min(86vw,400px)] shrink-0 snap-center lg:w-auto">
          <Reveal delay={i * 0.12} className="h-full">
            <div className="relative flex h-[260px] items-center justify-center overflow-hidden">
              <div aria-hidden className="how-grid absolute inset-0" />
              <div aria-hidden className="relative">{s.scene}</div>
            </div>
            <div className="mt-6 px-1">
              <span className="font-mono text-[13px] leading-5 text-text">{s.n}</span>
              <h3 className="mt-4 text-[20px] leading-7 font-semibold tracking-[-0.015em] text-ink">{s.title}</h3>
              <p className="mt-2 max-w-[400px] text-[15px] leading-6 text-muted">{s.body}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
