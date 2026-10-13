import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { IsoShowcase } from "@/components/landing/IsoShowcase";
import { Reveal } from "@/components/landing/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { InstallGuide } from "@/components/landing/InstallGuide";
import { SectionHead } from "@/components/landing/SectionHead";
import { Hero } from "@/components/site/Hero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GITHUB_URL } from "@/components/site/config";
import { SiteHeader } from "@/components/site/SiteHeader";

const SECTION = "mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24 xl:px-[82px]";

export default function Page() {
  return (
    <>
      <SiteHeader cta="login" bordered={false} />
      <main>
        <Hero />


        {/* <section aria-labelledby="features" className={SECTION}>
          <SectionHead eyebrow="Why Icona" title={<span id="features">Everything an icon library should do, and then it moves</span>}>
            One consistent 24px grid, one stroke language and a motion for every shape.
          </SectionHead>
          <div className="mt-10 md:mt-12">
            <Features />
          </div>
        </section> */}

        <section aria-labelledby="how" className="bg-white">
          <div className={SECTION}>
            <SectionHead eyebrow="How it works" pillIcon="settings" title={<span id="how">From idea to interface<br />in three steps</span>} />
            <div className="mt-10 md:mt-12">
              <HowItWorks />
            </div>
          </div>
        </section>
        <section aria-labelledby="showcase" className="">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 pt-6 pb-16 md:px-8 md:pt-8 md:pb-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 xl:px-[82px]">
            <div>
              <SectionHead eyebrow="Animated icon library" pillIcon="sparkles" title={<span id="showcase">Icons that move<br />with intent</span>}>
                Every icon has its own motion, drawn for its shape. Hover one to play it, or watch the board pick them for you.
              </SectionHead>
              <Reveal delay={0.1} className="mt-8">
                <ButtonLink size="lg" href="/icons">
                  Browse all icons
                </ButtonLink>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <IsoShowcase />
            </Reveal>
          </div>
        </section>

        {/* <section aria-labelledby="install" id="install" className={SECTION}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHead eyebrow="Get started" title={<span id="install">Install and use it in a minute</span>}>
                Add a single icon with the shadcn CLI, or install the package. Either way you get a typed React component with props for color, size, stroke and motion.
              </SectionHead>
            </div>
            <InstallGuide />
          </div>
        </section> */}

        <section aria-labelledby="faq" className="bg-card">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 xl:px-[82px]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHead eyebrow="FAQ" pillIcon="message" title={<span id="faq">Frequently asked<br />questions</span>}>
                Find your starting point and learn how to make the most of Icona.
              </SectionHead>
              <Reveal delay={0.1} className="mt-8">
                <ButtonLink variant="accent" size="lg" href={GITHUB_URL} target="_blank" rel="noreferrer">
                  Ask on GitHub
                </ButtonLink>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <Faq />
            </Reveal>
          </div>
        </section>

        <section className={SECTION}>
          <FinalCta />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
