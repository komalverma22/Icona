import type { Metadata } from "next";
import { FlightPath } from "@/components/site/PaperPlane";
import { GITHUB_URL, SPONSOR_URL } from "@/components/site/config";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BoardingPass } from "@/components/sponsor/BoardingPass";
import { CopyLinkButton } from "@/components/sponsor/CopyLinkButton";
import { ScrollFlight } from "@/components/sponsor/ScrollFlight";
import { TakeoffButton } from "@/components/sponsor/TakeoffButton";
import { TIERS } from "@/components/sponsor/tiers";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sponsor — Icona",
  description: "Icona is free to use. Sponsoring pays for the time it takes to draw, animate and maintain the icons.",
};

const Glyph = ({ children }: { children: React.ReactNode }) => (
  <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const USES = [
  {
    title: "Draw new icons",
    body: "Every icon is drawn on a shared grid so a new one looks like it was always part of the set.",
    glyph: (
      <Glyph>
        <path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z" />
        <path d="M14 7l3 3" />
      </Glyph>
    ),
  },
  {
    title: "Bring them to life",
    body: "Animations are built, tuned and tested so they play smoothly and stop for people who ask for less motion.",
    glyph: (
      <Glyph>
        <circle cx="12" cy="12" r="8" />
        <path d="m10 8.5 5 3.5-5 3.5z" />
      </Glyph>
    ),
  },
  {
    title: "Keep it free and sharp",
    body: "Exports, the install registry and the docs need constant care to keep working in every browser and tool.",
    glyph: (
      <Glyph>
        <path d="M12 3l2.4 5.2 5.6.7-4.1 3.9 1 5.6-4.9-2.7L7.1 18.4l1-5.6L4 8.9l5.6-.7z" />
      </Glyph>
    ),
  },
] as const;

const FAQ = [
  { q: "Do I need to sponsor to use Icona?", a: "No. Browsing, copying, downloading and installing icons is free. Sponsoring is how people who find it useful help keep it that way." },
  { q: "Where does the money go?", a: "Into time: drawing new icons and sets, building and testing animations, and maintaining the export and install tools." },
  { q: "What happens when I sponsor?", a: "The buttons on this page open the sponsorship page, where you pick the amount and finish there. Your name then joins the manifest." },
  { q: "Can I help without money?", a: "Yes. Starring the project and sharing it with someone who needs icons helps just as much." },
] as const;

export default function SponsorPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero ------------------------------------------------------------------ */}
        <section aria-labelledby="sponsor-title" className="relative overflow-hidden border-b border-divider">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_85%_20%,rgba(4,159,94,0.08),transparent_70%)]" />
          <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] xl:px-[82px]">
            <div className="max-w-[600px]">
              <p className="text-[12px] leading-4 font-medium text-accent-ink">Sponsor Icona</p>
              <h1 id="sponsor-title" className="mt-3 text-[40px] leading-[46px] font-medium tracking-[-0.01em] text-ink md:text-[56px] md:leading-[62px]">
                Keep the icons <span className="whitespace-nowrap">flying free.</span>
              </h1>
              <p className="mt-4 text-[16px] leading-7 text-text">
                Icona is free to use, and it takes real time to draw, animate and maintain. If it saves you hours, a small monthly seat on board keeps new icons coming.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <TakeoffButton href={SPONSOR_URL} size="lg">
                  Become a sponsor
                </TakeoffButton>
                <ButtonLink href="#tiers" size="lg">
                  See the seats
                </ButtonLink>
              </div>
            </div>
            <FlightPath d="M10 190 C 90 190, 110 60, 220 70 S 330 200, 420 120 S 480 20, 510 30" viewBox="0 0 520 220" className="mx-auto h-auto w-full max-w-[520px]" planeSize={34} duration={6.5} />
          </div>
        </section>

        {/* Where it goes --------------------------------------------------------- */}
        <section aria-labelledby="uses-title" className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 xl:px-[82px]">
          <h2 id="uses-title" className="text-[24px] leading-8 font-medium text-ink">
            Where your seat goes
          </h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {USES.map((u) => (
              <li key={u.title} className="rounded-[14px] border border-line bg-card p-5">
                <span className="flex size-10 items-center justify-center rounded-[10px] border border-line bg-white text-ink shadow-button">{u.glyph}</span>
                <h3 className="mt-4 text-[15px] leading-6 font-medium text-ink">{u.title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-muted">{u.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Tiers ----------------------------------------------------------------- */}
        <section id="tiers" aria-labelledby="tiers-title" className="scroll-mt-20 border-y border-divider bg-[linear-gradient(180deg,#fff,#fafafa_30%,#fff)] py-16">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 xl:px-[82px]">
            <div className="flex flex-col gap-1">
              <h2 id="tiers-title" className="text-[24px] leading-8 font-medium text-ink">
                Choose your seat
              </h2>
              <p className="max-w-[520px] text-[14px] leading-6 text-text">Pick what feels right. Every pass is monthly, and every one helps the same.</p>
            </div>
            <ScrollFlight className="mt-4 hidden md:block" />
            <div className="mt-6 grid gap-5 md:mt-0 md:grid-cols-3 md:items-stretch">
              {TIERS.map((tier, i) => (
                <BoardingPass key={tier.id} tier={tier} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Manifest -------------------------------------------------------------- */}
        <section aria-labelledby="manifest-title" className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 xl:px-[82px]">
          <div className="flex flex-col gap-1">
            <h2 id="manifest-title" className="text-[24px] leading-8 font-medium text-ink">
              Passenger manifest
            </h2>
            <p className="text-[14px] leading-6 text-text">Everyone who sponsors Icona is listed here.</p>
          </div>
          <div className="mt-6 overflow-hidden rounded-[16px] border border-line">
            <div className="flex items-center justify-between border-b border-line bg-ink px-5 py-3 text-[11px] leading-4 font-medium tracking-[0.08em] text-white/70 uppercase">
              <span>Seat</span>
              <span>Passenger</span>
              <span>Status</span>
            </div>
            <ul className="divide-y divide-line bg-white">
              {["1A", "1B", "2A", "2B"].map((seat, i) => (
                <li key={seat} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 px-5 py-3.5 text-[13px] leading-5">
                  <span className="font-mono font-medium text-ink">{seat}</span>
                  <span className="text-muted">{i === 0 ? "Waiting for the first name" : "—"}</span>
                  <span className="rounded-[5px] bg-badge px-1.5 py-0.5 text-[10px] leading-3 font-medium text-muted">Open</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-card px-5 py-4">
              <p className="text-[13px] leading-5 text-text">No one has boarded yet, so seat 1A is yours.</p>
              <TakeoffButton href={SPONSOR_URL} className="h-9 px-4">
                Take seat 1A
              </TakeoffButton>
            </div>
          </div>
        </section>

        {/* Other ways to help ---------------------------------------------------- */}
        <section aria-labelledby="help-title" className="mx-auto max-w-[1440px] px-4 pb-16 md:px-8 xl:px-[82px]">
          <div className="grid gap-8 rounded-[18px] border border-line bg-card p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <h2 id="help-title" className="text-[20px] leading-7 font-medium text-ink">
                Can&apos;t sponsor right now?
              </h2>
              <p className="mt-1 max-w-[520px] text-[14px] leading-6 text-text">A star on GitHub or a link sent to someone who needs icons helps just as much.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <ButtonLink href={GITHUB_URL} target="_blank" rel="noreferrer" className="h-9 px-4">
                Star on GitHub
              </ButtonLink>
              <CopyLinkButton />
            </div>
          </div>
        </section>

        {/* FAQ ------------------------------------------------------------------- */}
        <section aria-labelledby="faq-title" className="mx-auto max-w-[820px] px-4 pb-24 md:px-8">
          <h2 id="faq-title" className="text-[24px] leading-8 font-medium text-ink">
            Questions
          </h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[8px] text-[14px] leading-6 font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="mt-2 max-w-[640px] text-[14px] leading-6 text-text">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
