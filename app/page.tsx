import { isInteractive } from "@/components/export/scene";
import { iconVariants } from "@/components/icons/iconLibrary";
import { FinalCta } from "@/components/landing/FinalCta";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { IconMarquee } from "@/components/landing/IconMarquee";
import { InstallGuide } from "@/components/landing/InstallGuide";
import { SectionHead } from "@/components/landing/SectionHead";
import { Stats } from "@/components/landing/Stats";
import { getMotions } from "@/components/motion/registry";
import { Hero } from "@/components/site/Hero";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const animatedCount = iconVariants.reduce((n, v) => n + getMotions(v).filter((m) => !isInteractive(m)).length, 0);

const SECTION = "mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24 xl:px-[82px]";

export default function Page() {
  return (
    <>
      <SiteHeader cta="login" bordered={false} />
      <main>
        <Hero />

        <section aria-labelledby="showcase" className="border-y border-divider bg-white py-12 md:py-16">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 xl:px-[82px]">
            <SectionHead eyebrow="Animated icon library" title={<span id="showcase">Icons that move with intent</span>} center>
              Every icon has its own motion. Hover one to play it, or just watch them come alive.
            </SectionHead>
          </div>
          <div className="mt-10">
            <IconMarquee />
          </div>
        </section>

        <section className={SECTION}>
          <Stats icons={iconVariants.length} animated={animatedCount} />
        </section>

        <section aria-labelledby="features" className="mx-auto max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24 xl:px-[82px]">
          <SectionHead eyebrow="Why Icona" title={<span id="features">Everything an icon library should do, and then it moves</span>}>
            One consistent 24px grid, one stroke language and a motion for every shape.
          </SectionHead>
          <div className="mt-10 md:mt-12">
            <Features />
          </div>
        </section>

        <section aria-labelledby="how" className="border-y border-divider bg-white">
          <div className={SECTION}>
            <SectionHead eyebrow="How it works" pillIcon="settings" title={<span id="how">From idea to interface in three steps</span>} />
            <div className="mt-10 md:mt-12">
              <HowItWorks />
            </div>
          </div>
        </section>

        <section aria-labelledby="install" id="install" className={SECTION}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHead eyebrow="Get started" title={<span id="install">Install and use it in a minute</span>}>
                Add a single icon with the shadcn CLI, or install the package. Either way you get a typed React component with props for color, size, stroke and motion.
              </SectionHead>
            </div>
            <InstallGuide />
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 pb-16 md:px-8 md:pb-24 xl:px-[82px]">
          <FinalCta />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
