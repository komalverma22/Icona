import type { Metadata } from "next";
import Link from "next/link";
import { C, Callout, H3, P, Section, Step, Steps, Table, UL } from "@/components/docs/Prose";
import { DocCode } from "@/components/docs/DocCode";
import { DocsRail } from "@/components/docs/DocsRail";
import { isInteractive } from "@/components/export/scene";
import { PACKAGE } from "@/components/export/packageInfo";
import { iconVariants } from "@/components/icons/iconLibrary";
import { getMotions } from "@/components/motion/registry";
import { GITHUB_URL } from "@/components/site/config";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Documentation - Icona",
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
                Icona is a set of {iconVariants.length} icons in outline, fill and pixel styles. Most of them also come with animated versions, {animatedCount.toLocaleString()} in total. Open an icon, change its color, size and animation, then copy the code, download a file or install it.
              </P>
              <P>Whatever you pick in the preview is what gets exported.</P>
              <UL>
                <li>Each icon is a normal React component or a single SVG file.</li>
                <li>Animations use CSS, so there is no animation library to add.</li>
                <li>You own the file once it is in your project.</li>
              </UL>
            </Section>

            <Section id="quick-start" eyebrow="Getting started" title="Quick start">
              <Steps>
                <Step title="Find an icon">
                  Search on the <Link href="/icons" className="font-medium text-ink underline decoration-[rgba(28,31,33,0.25)] underline-offset-2 hover:decoration-ink">icons page</Link> or use the filters. Click a card to try its animations.
                </Step>
                <Step title="Open the export page">
                  Press <C>Get code &amp; export</C>. The color, size and animation you chose carry over.
                </Step>
                <Step title="Take it with you">
                  Use <strong className="font-medium text-ink">Install</strong> to add the component to your project, <strong className="font-medium text-ink">Download</strong> for SVG, PNG, GIF or APNG, or{" "}
                  <strong className="font-medium text-ink">Code</strong> to copy React, SVG, HTML or CSS.
                </Step>
              </Steps>
              <P>
                The address of an icon page keeps your choices (for example <C>?motion=spin&amp;color=2b9af3</C>), so you can send someone the exact setup.
              </P>
            </Section>

            <Section id="installation" eyebrow="Getting started" title="Installation">
              <P>There are two ways to add an icon. Either way you end up with a plain file in your project.</P>

              <H3>With the shadcn CLI</H3>
              <P>
                Your project needs a <C>components.json</C>. If it does not have one, run <C>npx shadcn@latest init</C> first. Then add an icon by name:
              </P>
              <DocCode language="bash" title="terminal" code={"npx shadcn@latest add {origin}/r/heart-fill.json"} />
              <P>
                The icon is saved in your components folder, for example <C>components/icona/heart-fill.tsx</C>. Icons with particle effects also add one shared <C>particles.ts</C>. The Install tab on each icon page gives you the exact command for your settings.
              </P>

              <H3>By copying the file</H3>
              <P>
                On an icon page, open <strong className="font-medium text-ink">Install</strong>, then <strong className="font-medium text-ink">Manual</strong>. Copy or download the component (or a zip with everything it needs) and put it anywhere in your project.
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
                  <P>Static icons come from the main entry and animated ones from <C>/animated</C>. Only the icons you import end up in your bundle.</P>
                </>
              ) : (
                <Callout tone="warn" title="Not on npm yet">
                  The <C>{PACKAGE.name}</C> package is not published, so there is no <C>pnpm add</C> command yet. Use the CLI or copy the file for now.
                </Callout>
              )}
            </Section>

            <Section id="usage" eyebrow="Using icons" title="Using an icon">
              <P>An icon is a React component that only needs React. Import it and use it like any other component.</P>
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
                  [<C key="a">size</C>, "The size you picked", "Width and height in pixels."],
                  [<C key="b">color</C>, <C key="b2">currentColor</C>, "Any CSS color. Without it the icon takes the color of the surrounding text."],
                  [<C key="c">strokeWidth</C>, "1.5", "Line thickness on outline icons."],
                  [<C key="d">speed</C>, "1", "Animation speed. Animated icons only."],
                  [<C key="e">animate</C>, <C key="e2">&quot;hover&quot;</C>, <><C>&quot;hover&quot;</C>, <C>&quot;loop&quot;</C> or <C>&quot;none&quot;</C>. Animated icons only.</>],
                  [<C key="f">className, style</C>, "None", "Anything else is passed to the svg element."],
                ]}
              />
              <P>Props work on the installed component. A downloaded SVG, PNG or GIF keeps the values you had at export time.</P>
            </Section>

            <Section id="animations" eyebrow="Using icons" title="Animations">
              <P>
                Animated icons are SVG with CSS keyframes. With <C>animate=&quot;hover&quot;</C> they play when the pointer enters or the icon gets keyboard focus. <C>&quot;loop&quot;</C> repeats the animation and <C>&quot;none&quot;</C> keeps the icon still.
              </P>
              <DocCode language="tsx" title="Loop it" code={`<HeartFillHeartbeatIcon animate="loop" speed={1.5} />`} />
              <UL>
                <li>Animation pauses for visitors who turn on <C>prefers-reduced-motion</C>.</li>
                <li>Particle effects such as confetti and sparks work in the React component, GIF and APNG. They are left out of a standalone SVG.</li>
                <li>Animations that follow the cursor only work on this website. Their export is the still icon.</li>
              </UL>
            </Section>

            <Section id="customize" eyebrow="Using icons" title="Customize">
              <P>The Customize panel on an icon page has four controls. Whatever you set is saved into the code or file you export.</P>
              <Table
                head={["Control", "Range", "Notes"]}
                rows={[
                  ["Color", "Any hex color", "Ink uses currentColor, so the icon follows your text color. A custom color is fixed in the file."],
                  ["Size", "12 to 512 px", "Pick a preset or type a number."],
                  ["Stroke", "1, 1.5 or 2", "Not available for pixel art."],
                  ["Speed", "0.5x to 2x", "Animated icons only."],
                ]}
              />
              <P>You can switch between the outline and fill version of an icon on its page and your settings stay.</P>
            </Section>

            <Section id="exports" eyebrow="Exporting" title="Export formats">
              <P>Choose a format based on where the icon will be used. Not every format can keep the animation.</P>
              <Table
                head={["Format", "Animation", "Good for", "Keep in mind"]}
                rows={[
                  ["React (TSX or JSX)", "Yes, with particles", "React apps and sites", "Needs React 18 or newer."],
                  ["SVG", "Yes, with CSS", "Web pages and design tools", "No particles. Inside an img tag it cannot use text color or react to hover."],
                  ["HTML and CSS", "Yes", "Plain sites with no build step", "No particles."],
                  ["PNG", "No, one still frame", "Slides, docs and app stores", "Pick 1x to 8x for sharper edges."],
                  ["APNG", "Yes, full color and soft edges", "Modern browsers", "Some apps only show the first frame."],
                  ["GIF", "Yes", "Email and chat", "256 colors and hard transparency. Pick a background color to blend the edges."],
                  ["Zip", "Same as the files inside", "Sharing the source", "None"],
                ]}
              />
              <P>If a format cannot keep something, the export page says so before you download.</P>
            </Section>

            <Section id="pixel-art" eyebrow="Exporting" title="Pixel art">
              <P>
                Pixel icons sit on a 12 by 12 grid and animate frame by frame. They are never smoothed, so pixels stay sharp at any size. GIF and APNG keep every frame.
              </P>
              <UL>
                <li>Use sizes like 24, 48 or 96 so each pixel lines up with the screen.</li>
                <li>If you scale a raster export in your own page, add <C>image-rendering: pixelated</C>.</li>
              </UL>
            </Section>

            <Section id="accessibility" eyebrow="Reference" title="Accessibility">
              <P>
                Icons are hidden from screen readers by default (<C>aria-hidden=&quot;true&quot;</C>). If an icon is the only content of a button, name the button:
              </P>
              <DocCode language="tsx" title="Icon button" code={`<button type="button" aria-label="Save to favorites">\n  <HeartFillIcon />\n</button>`} />
              <P>
                If an icon carries meaning by itself, pass <C>aria-hidden={"{false}"}</C> together with <C>role=&quot;img&quot;</C> and an <C>aria-label</C>.
              </P>
            </Section>

            <Section id="limits" eyebrow="Reference" title="Good to know">
              <UL>
                <li>A few animations that reshape a path do not animate in Safari. The icon still shows, only without the morph.</li>
                <li>GIF is limited to 256 colors and has no soft transparency. APNG has no such limit.</li>
                <li>Animated components are bigger than static ones, some are tens of kilobytes. Import only what you use.</li>
                <li>
                  The npm package is ESM only.{PACKAGE.published ? "" : " It is also not published yet."} The CLI and copy-paste routes work in any setup that can use a React component.
                </li>
              </UL>
              <P>
                Found a bug or want an icon added? Open an issue on{" "}
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="font-medium text-ink underline decoration-[rgba(28,31,33,0.25)] underline-offset-2 hover:decoration-ink">GitHub</a>, or{" "}
                <Link href="/sponsor" className="font-medium text-ink underline decoration-[rgba(28,31,33,0.25)] underline-offset-2 hover:decoration-ink">support Icona</Link>.
              </P>
            </Section>
          </article>
        </div>
      </div>
    </>
  );
}
