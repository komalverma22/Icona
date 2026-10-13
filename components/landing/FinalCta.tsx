import { ButtonLink } from "../ui/Button";
import { AnimatedIcon } from "./AnimatedIcon";
import { Reveal } from "./Reveal";

const FLOATERS = [
  { id: "bell", className: "left-[6%] top-[18%] hidden sm:flex" },
  { id: "star", className: "right-[7%] top-[16%] hidden sm:flex" },
  { id: "heart", className: "left-[12%] bottom-[16%] hidden md:flex" },
  { id: "sparkles", className: "right-[12%] bottom-[18%] hidden md:flex" },
];

/** Closing call to action on a dark panel, with a few icons that keep replaying. */
export function FinalCta() {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-[24px] bg-[#1d1f23] px-6 py-14 text-center sm:px-10 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,255,255,0.10),transparent_70%)]" />
        {FLOATERS.map((f) => (
          <span key={f.id} aria-hidden className={`absolute size-14 items-center justify-center rounded-[14px] border border-white/15 bg-white/5 text-white/80 ${f.className}`}>
            <AnimatedIcon id={f.id} size={26} auto />
          </span>
        ))}
        <div className="relative mx-auto max-w-[560px]">
          <h2 className="text-[32px] leading-[1.08] font-medium tracking-[-0.03em] text-white sm:text-[44px]">Give your interface some life</h2>
          <p className="mt-4 text-[15px] leading-6 text-white/60 sm:text-[17px] sm:leading-7">Browse the library, pick a motion and ship it in minutes.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink size="lg" href="/icons">
              Browse Icons
            </ButtonLink>
            <ButtonLink variant="accent" size="lg" href="/docs">
              Read the Docs
            </ButtonLink>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
