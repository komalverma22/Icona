import type { Metadata } from "next";
import { AnimatedIcon } from "@/components/landing/AnimatedIcon";
import { Reveal } from "@/components/landing/Reveal";
import { GITHUB_URL, SPONSOR_URL } from "@/components/site/config";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CopyLinkButton } from "@/components/sponsor/CopyLinkButton";
import { TakeoffButton } from "@/components/sponsor/TakeoffButton";
import { TIERS } from "@/components/sponsor/tiers";
import { cx } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sponsor - Icona",
  description: "Icona is free to use. Sponsoring pays for the time it takes to draw, animate and maintain the icons.",
};

const Check = () => (
  <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="mt-[5px] shrink-0 text-ink">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

const Plus = () => (
  <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

const tierStyle: Record<string, { label: string; ring: string; shadow: string; icon: string }> = {
  gold: {
    label: "bg-[linear-gradient(180deg,#ffe89a_0%,#f5bd27_100%)] text-[#49340a] border-[#d49b16]",
    ring: "ring-[#f0bd2d]/35",
    shadow: "shadow-[0_3px_9px_rgba(184,122,8,0.28),inset_0_1px_0_rgba(255,255,255,0.75)]",
    icon: "star",
  },
  silver: {
    label: "bg-[linear-gradient(180deg,#f7fafc_0%,#d7dee4_100%)] text-[#35404a] border-[#bac5cf]",
    ring: "ring-[#9ba8b3]/35",
    shadow: "shadow-[0_3px_9px_rgba(80,94,108,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]",
    icon: "sparkles",
  },
  bronze: {
    label: "bg-[linear-gradient(180deg,#ffc18b_0%,#d97829_100%)] text-[#542807] border-[#c8671d]",
    ring: "ring-[#d97829]/25",
    shadow: "shadow-[0_3px_9px_rgba(168,78,21,0.25),inset_0_1px_0_rgba(255,255,255,0.65)]",
    icon: "heart",
  },
};

function LogoSlot({ index, tierId }: { index: number; tierId: string }) {
  const icons = ["image", "layers", "bookmark"];
  return (
    <a
      href={SPONSOR_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={`Sponsor ${tierId}, logo slot ${index + 1}`}
      className="group/slot relative flex min-h-[118px] items-center justify-center overflow-hidden border border-dashed border-[rgba(28,31,33,0.14)] bg-white transition-[border-color,background-color] duration-200 hover:border-[rgba(28,31,33,0.34)] hover:bg-card sm:min-h-[138px]"
      style={{
        clipPath:
          "polygon(10% 0, 90% 0, 90% 6%, 100% 18%, 100% 82%, 90% 94%, 90% 100%, 10% 100%, 10% 94%, 0 82%, 0 18%, 10% 6%)",
      }}
    >
      <span className="absolute inset-3 rounded-[8px] bg-[linear-gradient(135deg,rgba(43,154,243,0.06),transparent_42%,rgba(28,31,33,0.03))] opacity-0 transition-opacity duration-200 group-hover/slot:opacity-100" />
      <span className="relative flex size-11 items-center justify-center rounded-[14px] border border-[rgba(28,31,33,0.18)] bg-white text-muted transition-colors group-hover/slot:text-ink">
        <Plus />
      </span>
      <span className="absolute bottom-3 left-3 flex size-7 items-center justify-center rounded-[8px] border border-line bg-card text-ink opacity-0 transition-opacity duration-200 group-hover/slot:opacity-100">
        <AnimatedIcon id={icons[index % icons.length]} size={15} active auto />
      </span>
    </a>
  );
}

export default function SponsorPage() {
  return (
    <>
      <SiteHeader cta="login" bordered={false} />
      <main className="overflow-x-clip bg-white">
        <section aria-labelledby="sponsor-title" className="mx-auto grid max-w-[1440px] items-start gap-10 px-4 py-10 md:px-8 lg:grid-cols-[0.86fr_1.4fr] lg:gap-16 lg:py-14 xl:px-[82px]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal>
              <div className="mx-auto w-full max-w-[520px] lg:mx-0">
                <span className="inline-flex h-8 items-center gap-2 rounded-full border border-line bg-card px-3 text-[12px] leading-4 font-medium text-muted">
                  <AnimatedIcon id="heart" size={15} active auto />
                  Sponsor Icona
                </span>
                <h1 id="sponsor-title" className="mt-5 text-[34px] leading-[1.08] font-medium tracking-[-0.03em] text-ink sm:text-[44px]">
                  Fund the tiny details behind every icon
                </h1>
                <p className="mt-4 text-[15px] leading-6 text-muted">
                  Your support helps keep Icona free while new icons, motion states, export tools and polish keep shipping.
                </p>

                <div className="mt-7 overflow-hidden rounded-[14px] border border-line bg-white">
                  <div className="flex items-center justify-between border-b border-line bg-card px-4 py-3">
                    <p className="text-[11px] leading-4 font-medium tracking-[0.08em] text-muted uppercase">Where your support goes</p>
                    <AnimatedIcon id="star" size={16} active auto />
                  </div>
                  <ul className="grid grid-cols-2 gap-px bg-line">
                    {[
                      ["sparkles", "Fresh icons"],
                      ["layers", "New sets"],
                      ["download", "Exports"],
                      ["palette", "Color tools"],
                      ["code", "Code ready"],
                      ["heart", "Free access"],
                    ].map(([icon, label], n) => (
                      <li key={label} className="flex items-center gap-3 bg-white px-4 py-3">
                        <span className="flex size-8 items-center justify-center rounded-[8px] border border-line bg-card text-ink">
                          <AnimatedIcon id={icon} size={16} active={n === 0} auto />
                        </span>
                        <span className="text-[13px] leading-5 font-medium text-ink">{label}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-3 border-t border-line px-4 py-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[#1d1f23] text-white">
                      <AnimatedIcon id="image" size={16} active auto />
                    </span>
                    <p className="text-[12px] leading-4 text-muted">Your logo on the landing page, icons page and README.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="flex flex-col gap-6">
            {TIERS.map((tier, i) => (
              <Reveal key={tier.id} delay={i * 0.08}>
                <article
                  aria-labelledby={`tier-${tier.id}`}
                  className={cx(
                    "overflow-hidden rounded-[12px] border bg-white shadow-[0_1px_0_rgba(28,31,33,0.04)] transition-[border-color,box-shadow] duration-200 hover:shadow-card-hover",
                    tier.featured ? "border-[rgba(28,31,33,0.18)]" : "border-line",
                  )}
                >
                  <div className="flex items-center justify-between border-b border-line px-3 py-2 sm:px-4">
                    <span
                      className={cx(
                        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] leading-4 font-medium ring-4",
                        tierStyle[tier.id]?.label,
                        tierStyle[tier.id]?.ring,
                        tierStyle[tier.id]?.shadow,
                      )}
                    >
                      <AnimatedIcon id={tierStyle[tier.id]?.icon ?? "star"} size={15} active auto />
                      <span id={`tier-${tier.id}`}>{tier.name}</span>
                    </span>
                    <p className="text-[13px] leading-5 font-medium text-muted">
                      <span className="text-ink">${tier.price}</span>
                      <span className="text-muted"> / mo</span>
                    </p>
                  </div>

                  <div className="m-1.5 rounded-[10px] border border-[rgba(28,31,33,0.06)] bg-card/70 p-3 sm:m-2 sm:p-5">
                    <div className="mb-3 flex items-center justify-center gap-2 text-[12px] leading-4 text-muted">
                      <span className="h-px flex-1 bg-line" />
                      <span className="inline-flex items-center gap-1.5">
                        Sponsor an icon shelf
                        <AnimatedIcon id="image" size={13} active auto />
                      </span>
                      <span className="h-px flex-1 bg-line" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                    {Array.from({ length: tier.slots }, (_, n) => (
                      <LogoSlot key={n} index={n} tierId={tier.name} />
                    ))}
                    </div>
                  </div>

                  <ul className="flex flex-wrap gap-x-3 gap-y-1.5 px-4 pt-1 pb-4 sm:px-5">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-[14px] leading-5 text-ink">
                        <Check />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-[13px] leading-5 text-muted">{tier.tagline}</p>
                    <TakeoffButton href={SPONSOR_URL} variant={tier.featured ? "accent" : "raised"} className="h-10 w-full sm:w-auto">
                      Choose {tier.name}
                    </TakeoffButton>
                  </div>
                </article>
              </Reveal>
            ))}

            <div className="flex flex-col items-center justify-between gap-3 rounded-[12px] border border-line bg-white px-4 py-4 text-center sm:flex-row sm:text-left">
              <p className="text-[14px] leading-5 text-muted">Can&apos;t sponsor right now? A star on GitHub or a shared link helps Icona reach more designers.</p>
              <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[14px] leading-5 font-medium text-ink underline decoration-[rgba(28,31,33,0.25)] underline-offset-[3px] transition-colors hover:decoration-ink"
                >
                  Star on GitHub
                </a>
                <CopyLinkButton />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
