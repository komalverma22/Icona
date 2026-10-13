import type { ReactNode } from "react";
import { BRAND } from "../site/Integrations";
import { AnimatedIcon } from "./AnimatedIcon";
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

/* 02 · Choose a motion ---------------------------------------------------- */

const MOTIONS = ["Classic Draw", "Swing", "Ring"];
const SWATCHES = ["#1c1f21", "#8a8d8f", "#ef4444", "#f97316", "#8b5cf6"];

/** A mini Animation Studio: live preview, a motion list that steps through, colour and speed controls. */
function MotionScene() {
  return (
    <div className={`${CARD} w-[288px] p-3`}>
      <div className="flex gap-3">
        <div className="flex size-[100px] shrink-0 items-center justify-center rounded-[12px] border border-line bg-card text-ink">
          <AnimatedIcon id="bell" size={40} auto />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[10px] leading-3 font-medium tracking-[0.06em] text-muted uppercase">Motion</span>
          <div className="relative mt-1.5 rounded-[9px] bg-field p-0.5">
            <span aria-hidden className="how-select absolute inset-x-0.5 top-0.5 h-7 rounded-[7px] border border-line bg-white shadow-segment" />
            {MOTIONS.map((m) => (
              <div key={m} className="relative flex h-7 items-center px-2 text-[11px] leading-4 font-medium text-ink">
                {m}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-divider pt-3">
        <div className="flex items-center gap-1.5">
          {SWATCHES.map((c, i) => (
            <span key={c} className={`size-3.5 rounded-full ${i === 0 ? "ring-2 ring-ink/20 ring-offset-1" : ""}`} style={{ background: c }} />
          ))}
        </div>
        <div className="flex flex-1 items-center gap-2">
          <span className="text-[10px] leading-3 text-muted">Speed</span>
          <div className="relative h-1 flex-1 rounded-full bg-divider">
            <span className="how-fill absolute inset-y-0 left-0 rounded-full bg-ink" />
            <span className="how-knob absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-ink bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* 03 · Drop it in --------------------------------------------------------- */

/** A terminal that runs the install, then the frameworks it lands in. */
function DropScene() {
  return (
    <div className="flex w-[300px] flex-col items-center gap-4">
      <div className="w-full overflow-hidden rounded-[14px] border border-black bg-[#1d1f23] shadow-[0_4px_7px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.12)]">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
          <span className="ml-2 text-[10px] leading-3 text-white/40">terminal</span>
        </div>
        <div className="space-y-1 p-3 font-mono text-[10.5px] leading-[18px] text-white/85">
          <div className="whitespace-nowrap">
            <span className="text-white/40">$ </span>
            <span className="how-cmd">npx shadcn@latest add …/r/bell.json</span>
          </div>
          <div className="how-out whitespace-nowrap text-white/60">✓ Created components/icona/bell.tsx</div>
          <div className="how-out-2 whitespace-nowrap">
            <span className="text-white/45">&lt;</span>BellIcon <span className="text-white/55">animate</span>
            <span className="text-white/45">=</span>&quot;hover&quot; <span className="text-white/45">/&gt;</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {BRAND.slice(0, 3).map((t, i) => (
          <div key={t.name} className={`flex size-11 items-center justify-center rounded-[12px] border border-line bg-white shadow-card-hover ${i === 1 ? "how-float-2" : "how-float"}`}>
            <svg viewBox="0 0 24 24" className="size-5" role="img" aria-label={t.name}>
              <path d={t.path} fill={t.color} />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

const STEPS: { n: string; title: string; body: string; scene: ReactNode }[] = [
  { n: "01", title: "Pick an icon", body: "Search the library, filter by style, size, color or animation, and open the one you like.", scene: <PickScene /> },
  { n: "02", title: "Choose a motion", body: "Preview its animations in the studio. Tune the color, size, stroke and speed until it feels right.", scene: <MotionScene /> },
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
