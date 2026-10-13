import { cx } from "../ui/Button";
import { PlaneGlyph } from "../site/PaperPlane";
import { SPONSOR_URL } from "../site/config";
import { TakeoffButton } from "./TakeoffButton";
import type { Tier } from "./tiers";

/** Deterministic bar widths so the barcode is identical on server and client. */
function bars(seed: number) {
  let s = seed * 9301 + 49297;
  return Array.from({ length: 34 }, () => {
    s = (s * 9301 + 49297) % 233280;
    return 1 + Math.floor((s / 233280) * 3);
  });
}

const Check = () => (
  <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="mt-[5px] shrink-0 text-accent">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

/**
 * A sponsorship tier drawn as a boarding pass: notched perforation, a stub
 * with a barcode, and a plane that nudges forward on hover. It is a plain
 * article, so it reads as a normal heading + list for assistive tech.
 */
export function BoardingPass({ tier, index }: { tier: Tier; index: number }) {
  return (
    <article
      aria-labelledby={`tier-${tier.id}`}
      className={cx(
        "group/pass relative flex flex-col overflow-hidden rounded-[18px] border bg-white transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(10,10,11,0.22)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        tier.featured ? "border-accent-ring/60 shadow-[0_0_0_1px_rgba(4,159,94,0.25)]" : "border-line",
      )}
    >
      {tier.featured && <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-accent-light" />}

      <div className="flex flex-col gap-4 p-6 pb-7">
        <div className="flex items-center justify-between text-[10px] leading-3 font-medium tracking-[0.08em] text-muted uppercase">
          <span>Icona · Boarding pass</span>
          <PlaneGlyph size={16} className="text-ink transition-transform duration-300 group-hover/pass:translate-x-1 group-hover/pass:-translate-y-0.5 group-hover/pass:-rotate-12 motion-reduce:transition-none" />
        </div>
        <div>
          <h3 id={`tier-${tier.id}`} className="text-[28px] leading-8 font-medium text-ink">
            {tier.name}
          </h3>
          <p className="mt-1 text-[13px] leading-5 text-muted">{tier.tagline}</p>
        </div>
        <p className="flex items-baseline gap-1.5">
          <span className="text-[40px] leading-[44px] font-medium tracking-[-0.02em] text-ink">${tier.price}</span>
          <span className="text-[13px] leading-5 text-muted">per month</span>
        </p>
        {tier.featured ? (
          <span className="h-[18px] w-fit rounded-[5px] bg-[rgba(4,159,94,0.12)] px-1.5 text-[10px] leading-[18px] font-medium text-accent-ink">Recommended</span>
        ) : (
          <span aria-hidden className="h-[18px]" />
        )}
      </div>

      {/* perforation */}
      <div aria-hidden className="relative h-0">
        <span className="absolute inset-x-5 top-0 border-t-[1.5px] border-dashed border-[rgba(28,31,33,0.16)]" />
        <span className="absolute top-0 -left-[11px] size-[22px] -translate-y-1/2 rounded-full border border-line bg-white" />
        <span className="absolute top-0 -right-[11px] size-[22px] -translate-y-1/2 rounded-full border border-line bg-white" />
      </div>

      <div className="flex flex-1 flex-col gap-5 bg-card p-6 pt-7">
        <ul className="flex flex-1 flex-col gap-2.5">
          {tier.perks.map((perk) => (
            <li key={perk} className="flex gap-2.5 text-[13px] leading-5 text-text">
              <Check />
              {perk}
            </li>
          ))}
        </ul>

        <TakeoffButton href={SPONSOR_URL} variant={tier.featured ? "accent" : "raised"} className="h-10 w-full">
          Board as {tier.name}
        </TakeoffButton>

        <div aria-hidden className="flex items-end justify-between gap-4 border-t border-dashed border-[rgba(28,31,33,0.14)] pt-4">
          <dl className="flex gap-5 text-[10px] leading-3 font-medium tracking-[0.06em] text-muted uppercase">
            <div>
              <dt>Seat</dt>
              <dd className="mt-1 text-[15px] leading-4 tracking-normal text-ink">{tier.seat}</dd>
            </div>
            <div>
              <dt>Class</dt>
              <dd className="mt-1 text-[15px] leading-4 tracking-normal text-ink">{String(index + 1).padStart(2, "0")}</dd>
            </div>
          </dl>
          <div className="flex h-8 items-stretch gap-[2px] opacity-80">
            {bars(index + 3).map((w, i) => (
              <span key={i} className="bg-ink" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
