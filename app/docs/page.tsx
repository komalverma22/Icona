import type { Metadata } from "next";
import Link from "next/link";
import { C, Callout, H3, P, Section, Step, Steps, Table, UL } from "@/components/docs/Prose";
import { DocCode } from "@/components/docs/DocCode";
import { DocsRail } from "@/components/docs/DocsRail";
import { isInteractive } from "@/components/export/scene";
import { PACKAGE } from "@/components/export/packageInfo";
import { iconVariants } from "@/components/icons/iconLibrary";
import { getMotions } from "@/components/motion/registry";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Documentation — Icona",
  description: "How to find, customize, export and install Icona icons: React components, SVG, PNG, GIF and APNG, with the shadcn CLI or by copying the file.",
};

const animatedCount = iconVariants.reduce((n, v) => n + getMotions(v).filter((m) => !isInteractive(m)).length, 0);

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 xl:px-[82px]">
        {/* Hero ------------------------------------------------------------------ */}
        {/* <div className="relative overflow-hidden border-b border-divider py-12 md:py-16">
          <div className="relative z-10 max-w-[620px]">
            <p className="inline-flex h-6 items-center rounded-full bg-[rgba(43,154,243,0.1)] px-2.5 text-[12px] leading-4 font-medium text-accent-ink">Documentation</p>
            <h1 className="mt-4 text-[36px] leading-[42px] font-medium tracking-[-0.03em] text-ink md:text-[48px] md:leading-[54px]">Find an icon. Make it yours. Ship it.</h1>
            <p className="mt-4 text-[16px] leading-[26px] text-text">
              Everything you need to use the {iconVariants.length} icons and {animatedCount.toLocaleString()} animated versions in Icona, from the first copy-paste to a full install.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink variant="accent" href="#quick-start" size="lg">
                Quick start
                <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-150 group-hover/btn:translate-x-0.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </ButtonLink>
              <ButtonLink href="/icons" size="lg">
                Browse icons
              </ButtonLink>
            </div>
          </div>
        </div> */}

        <div className="pt-0 lg:flex lg:items-start lg:gap-12 lg:pt-10">
          <DocsRail />
          <article className="min-w-0 max-w-[740px] flex-1 pb-24">
            <Section id="introduction" eyebrow="Getting started" title="Introduction">
              <P>
                Icona is a library of static, animated and pixel-art icons. Every icon works the same way: open it, adjust the color, size, stroke and animation, then copy the code, download a file or install it into your project.
              </P>
              <P>What you see on the preview is what you get. The color, size, stroke width, speed and animation you pick are carried into every export, and each export says plainly what it keeps and what it loses.</P>
              <UL>
                <li>
                  <strong className="font-medium text-ink">{iconVariants.length} icons</strong> in outline and fill styles, plus a pixel-art set.
                </li>
                <li>
                  <strong className="font-medium text-ink">{animatedCount.toLocaleString()} animated versions</strong>, from gentle hovers to loops and particle effects.
                </li>
                <li>
                  <strong className="font-medium text-ink">No runtime to learn.</strong> Each icon is a plain React function component or a single SVG file.
                </li>
              </UL>
            </Section>

            <Section id="quick-start" eyebrow="Getting started" title="Quick start">
              <Steps>
                <Step title="Pick an icon">
                  Search on the <Link href="/icons" className="font-medium text-ink underline decoration-[rgba(28,31,33,0.25)] underline-offset-2 hover:decoration-ink">icons page</Link>, filter by style, size, color or animation, and click a card to preview its animations.
                </Step>
                <Step title="Open its page">
                  Press <C>Get code, export &amp; install</C>. Your current color, size and animation come along.
                </Step>
                <Step title="Choose how to use it">
                  <strong className="font-medium text-ink">Install</strong> adds the component to your project, <strong className="font-medium text-ink">Download</strong> saves SVG, PNG, GIF or APNG, and{" "}
                  <strong className="font-medium text-ink">Code</strong> copies React, SVG, HTML or CSS.
                </Step>
              </Steps>
              <Callout title="Every page is a link">
                An icon page&apos;s address holds your choices (<C>?motion=…&amp;color=…&amp;size=…</C>), so you can share exactly what you configured.
              </Callout>
            </Section>

            <Section id="installation" eyebrow="Getting started" title="Installation">
              <P>There are two ways to bring an icon into a project. Both give you a normal file you own.</P>

              <H3>With the shadcn CLI</H3>
              <P>
                This site is a shadcn registry. In a project that has a <C>components.json</C> (run <C>npx shadcn@latest init</C> if it doesn&apos;t), add any icon by name:
              </P>
              <DocCode language="bash" title="terminal" code={"npx shadcn@latest add {origin}/r/heart-fill.json"} />
              <P>
                The file lands in your <C>components</C> folder, for example <C>components/icona/heart-fill.tsx</C>. Nothing else is installed. Icons with particle effects also add one shared <C>particles.ts</C> file. The Install tab builds the exact command for your choices.
              </P>

              <H3>By copying the file</H3>
              <P>
                On any icon page, open <strong className="font-medium text-ink">Install → Manual</strong> to copy or download the component (or a zip with everything it needs), then save it anywhere in your project.
              </P>

              <H3>As an npm package</H3>
              {PACKAGE.published ? (
                <>
                  <DocCode language="bash" title="terminal" code={`pnpm add ${PACKAGE.name}`} />
                  <DocCode
                    language="tsx"
                    title="App.tsx"
                    code={`import { HeartFillIcon } from "${PACKAGE.name}";\nimport { HeartFillHeartbeatIcon } from "${PACKAGE.name}/animated";`}
                  />
                  <P>Static icons come from the main entry and animated ones from <C>/animated</C>. It is tree-shakeable, so only the icons you import reach your bundle.</P>
                </>
              ) : (
                <Callout tone="warn" title="Not published yet">
                  The <C>{PACKAGE.name}</C> package is built from this library but hasn&apos;t been published to npm, so there is no <C>pnpm add</C> command to run yet. Until then, use the CLI or copy the file. This page will show the package install as soon as it is live.
                </Callout>
              )}
            </Section>

            <Section id="usage" eyebrow="Using icons" title="Using an icon">
              <P>Each icon is a function component with no dependencies besides React. Import it and render it like any other component.</P>
              <DocCode
                language="tsx"
                title="Example.tsx"
                code={`import { HeartFillIcon } from "@/components/icona/heart-fill";

export default function Example() {
  return <HeartFillIcon size={32} color="#2b9af3" strokeWidth={1.5} />;
}`}
              />
              <H3>Props</H3>
              <Table
                head={["Prop", "Default", "What it does"]}
                rows={[
                  [<C key="a">size</C>, "what you picked", "Width and height in pixels."],
                  [<C key="b">color</C>, <>the text color (<C>currentColor</C>)</>, "Any CSS color. Leave it out and the icon follows the surrounding text."],
                  [<C key="c">strokeWidth</C>, "1.5", "Line thickness on outline icons."],
                  [<C key="d">speed</C>, "1", "Animation speed multiplier. Animated icons only."],
                  [<C key="e">animate</C>, <C key="e2">&quot;hover&quot;</C>, <><C>&quot;hover&quot;</C>, <C>&quot;loop&quot;</C> or <C>&quot;none&quot;</C>. Animated icons only.</>],
                  [<C key="f">className, style, …</C>, "—", "Everything else is passed to the <svg> element."],
                ]}
              />
              <P>
                Props work on the installed component. In a downloaded SVG, PNG or GIF the values are fixed at export time.
              </P>
            </Section>

            <Section id="animations" eyebrow="Using icons" title="Animations">
              <P>
                Animated icons are plain SVG with CSS keyframes, so they need no animation library. With <C>animate=&quot;hover&quot;</C> they play when the pointer enters or the icon receives keyboard focus; <C>&quot;loop&quot;</C> repeats; <C>&quot;none&quot;</C> keeps them still.
              </P>
              <DocCode language="tsx" title="Loop it" code={`<HeartFillHeartbeatIcon animate="loop" speed={1.5} />`} />
              <UL>
                <li>
                  <strong className="font-medium text-ink">Reduced motion is respected.</strong> The generated CSS pauses animation for visitors who set <C>prefers-reduced-motion</C>.
                </li>
                <li>
                  <strong className="font-medium text-ink">Particle effects</strong> (confetti, sparks) are drawn on a canvas by a small shared file, so they work in the React component, GIF and APNG but not in a standalone SVG.
                </li>
                <li>
                  <strong className="font-medium text-ink">Cursor-following animations</strong> only exist live on the website. Their export is the static icon.
                </li>
              </UL>
            </Section>

            <Section id="customize" eyebrow="Using icons" title="Customize">
              <P>The Customize panel on an icon page controls four things, and each one is baked into what you copy, install or download:</P>
              <Table
                head={["Control", "Range", "Notes"]}
                rows={[
                  ["Color", "Any hex color", "Ink uses currentColor, so the icon adopts your text color. A custom color is fixed in the file."],
                  ["Size", "12 – 512 px", "Pick a preset or type your own."],
                  ["Stroke", "1, 1.5 or 2", "Hidden for pixel art, which has no strokes."],
                  ["Speed", "0.5× – 2×", "Shown only for animated icons."],
                ]}
              />
              <P>You can also switch between the outline and fill version of an icon from its page without losing your settings.</P>
            </Section>

            <Section id="exports" eyebrow="Exporting" title="Export formats">
              <P>Pick the format by where the icon is going. Formats differ in what they can keep, so here is what each one does with animation:</P>
              <Table
                head={["Format", "Animation", "Good for", "Watch out for"]}
                rows={[
                  ["React (TSX / JSX)", "Yes, plus particles", "Apps and sites with React", "Needs React 18 or newer."],
                  ["SVG", "Yes (CSS), loops on its own", "Web pages, design tools, <img>", "No particles. As an <img> it can't inherit text color or react to hover."],
                  ["HTML / CSS", "Yes", "Plain sites, no build step", "No particles."],
                  ["PNG", "No, a single still frame", "Slides, docs, app stores", "Choose 1× to 8× for sharpness."],
                  ["APNG", "Yes, full color and smooth transparency", "Modern browsers", "Some apps show only the first frame."],
                  ["GIF", "Yes", "Email, chat, anywhere", "256 colors and hard-edged transparency. Pick a background to blend smoothly."],
                  [".zip", "Same files as above", "Handing off the source", "—"],
                ]}
              />
              <Callout title="Honest by design">
                When an export can&apos;t carry something, the page tells you before you download. For example, PNG says it can&apos;t animate, and the SVG notes when particles are left out.
              </Callout>
            </Section>

            <Section id="pixel-art" eyebrow="Exporting" title="Pixel art">
              <P>
                Pixel icons are drawn on a 12 × 12 grid and animate frame by frame, the way sprites do. They are never smoothed: exports keep square pixels crisp at any size, and GIF and APNG hold every frame.
              </P>
              <UL>
                <li>Use whole-number sizes (24, 48, 96…) so each pixel lands on the screen grid.</li>
                <li>
                  When you place one in your own page, add <C>image-rendering: pixelated</C> if you scale a raster export.
                </li>
              </UL>
            </Section>

            <Section id="accessibility" eyebrow="Reference" title="Accessibility">
              <P>
                Icons are decorative by default: the component sets <C>aria-hidden=&quot;true&quot;</C>. When an icon is the only thing in a button, give the button a name instead of the icon:
              </P>
              <DocCode language="tsx" title="Icon button" code={`<button type="button" aria-label="Save to favorites">\n  <HeartFillIcon />\n</button>`} />
              <P>
                If an icon carries meaning on its own, pass <C>aria-hidden={"{false}"}</C> with <C>role=&quot;img&quot;</C> and an <C>aria-label</C>. Animations stop for people who ask for reduced motion.
              </P>
            </Section>

            <Section id="limits" eyebrow="Reference" title="Good to know">
              <UL>
                <li>A few animations that reshape a path (a morph) don&apos;t animate in Safari. The icon still shows correctly, just without the morph.</li>
                <li>GIF is limited to 256 colors and has no soft transparency; APNG has neither limit.</li>
                <li>Animated exports are larger than static ones, and the biggest animated components are tens of kilobytes. Import only what you use.</li>
                <li>
                  The npm package is ESM only. {PACKAGE.published ? "" : "It also isn't published yet. "}The CLI and copy-paste routes work with any setup that can use a React component.
                </li>
              </UL>
              <P>
                Found something off or missing? Browse the <Link href="/icons" className="font-medium text-ink underline decoration-[rgba(28,31,33,0.25)] underline-offset-2 hover:decoration-ink">icons</Link> or see how to{" "}
                <Link href="/sponsor" className="font-medium text-ink underline decoration-[rgba(28,31,33,0.25)] underline-offset-2 hover:decoration-ink">support Icona</Link>.
              </P>
            </Section>
          </article>
        </div>
      </div>
    </>
  );
}
