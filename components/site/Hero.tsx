import { ButtonLink } from "../ui/Button";
import { HeroBadge } from "./HeroBadge";
import { Integrations } from "./Integrations";

/** Landing hero: label, headline and calls to action on the left, integrations along its bottom, hub illustration on the right. */
export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1440px] items-center gap-6 px-4 pt-[50px] pb-8 md:px-8 lg:min-h-[calc(100svh-64px)] lg:items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-6 lg:pb-8 xl:px-[82px]">
      <div className="flex flex-col items-start lg:h-full lg:justify-between">
        <div>
          <HeroBadge>Open Source Icon Library</HeroBadge>
          <h1 className="mt-4 text-[40px] leading-[1.05] font-medium tracking-[-0.03em] text-ink sm:text-[52px] lg:text-[60px] xl:text-[68px]">
            Animated Icons
            <br />
            That Feel Alive
          </h1>
          <p className="mt-5 text-[15px] leading-6 text-muted sm:text-[16px] sm:leading-7 xl:text-[17px]">
            Icona is a library of hand-crafted animated icon components.
            <br className="hidden sm:block" />
            Pick one, choose a motion, and drop it into your interface.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink variant="accent" size="lg" href="/icons" className="group/cta">
              Browse Icons
              <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover/cta:translate-x-0.5">
                <path d="M4 12h16M14 6l6 6-6 6" />
              </svg>
            </ButtonLink>
            <ButtonLink size="lg" href="/docs">
              Read the Docs
            </ButtonLink>
          </div>
        </div>
        <Integrations className="mt-10 lg:mt-0" />
      </div>

      <div className="mx-auto w-full max-w-[640px] lg:max-w-none lg:self-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/icona-illustration-hub.svg"
          alt="Animated icon tiles connected to a central tile"
          width={720}
          height={507}
          className="h-auto w-full select-none [mask-image:radial-gradient(ellipse_62%_60%_at_50%_50%,#000_55%,transparent_100%)] lg:scale-[1.08]"
          draggable={false}
        />
      </div>
    </section>
  );
}
