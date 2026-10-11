"use client";

import { useMemo, useState } from "react";
import { generateCode, needsParticleRuntime, type CodeFile } from "../export/code";
import { copyCode, downloadBlob, downloadText } from "../export/delivery";
import { componentName, iconSlug } from "../export/naming";
import { motionOf, type ExportOptions } from "../export/options";
import { importPath, installCommandFor, PACKAGE, type PackageManager } from "../export/packageInfo";
import { installCommand } from "../export/registry";
import { zipFiles } from "../export/zip";
import type { IconVariant } from "../icons/types";
import { SegmentedControl, type SegmentOption } from "../ui/SegmentedControl";
import { CodeBlock } from "./CodeBlock";
import { ActionButton } from "./CopyButton";
import { Note, useOrigin, useParticleSource } from "./shared";

type Method = "package" | "cli" | "manual";
type Framework = "react" | "next" | "html";

const METHODS: readonly SegmentOption<Method>[] = [
  ...(PACKAGE.published ? [{ value: "package" as const, label: "Package" }] : []),
  { value: "cli", label: "CLI" },
  { value: "manual", label: "Manual" },
];
const MANAGERS: readonly SegmentOption<PackageManager>[] = (["pnpm", "npm", "yarn", "bun"] as const).map((m) => ({ value: m, label: m }));
const FRAMEWORKS: readonly SegmentOption<Framework>[] = [
  { value: "react", label: "React" },
  { value: "next", label: "Next.js" },
  { value: "html", label: "HTML / CSS" },
];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full bg-badge text-[11px] leading-none font-medium text-ink">
        {n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h4 className="text-[13px] leading-5 font-medium text-ink">{title}</h4>
        {children}
      </div>
    </li>
  );
}

const code = (path: string, language: CodeFile["language"], content: string): CodeFile => ({ path, language, content });

export function InstallPanel({ variant, options }: { variant: IconVariant; options: ExportOptions }) {
  const [method, setMethod] = useState<Method>(PACKAGE.published ? "package" : "cli");
  const [manager, setManager] = useState<PackageManager>("pnpm");
  const [framework, setFramework] = useState<Framework>("react");
  const origin = useOrigin();
  const motion = motionOf(variant, options);
  const slug = iconSlug(variant, motion);
  const name = componentName(variant, motion);
  const tsx = useMemo(() => generateCode(variant, options, "tsx"), [variant, options]);
  const html = useMemo(() => generateCode(variant, options, "html"), [variant, options]);
  const particles = needsParticleRuntime(tsx.scene);
  const runtime = useParticleSource(particles && method === "manual");
  const animated = tsx.scene.info.tier === "animated";

  const command = installCommand(origin, variant, options);
  // Pointer-following animations only exist live, so the package ships their static icon.
  const pkgName = tsx.scene.info.tier === "interactive" ? componentName(variant) : name;
  const props = animated ? ` animate="hover"` : "";
  const reactSnippet = `import { ${name} } from "${framework === "next" ? "@/" : "./"}components/icona/${slug}";\n\nexport default function Example() {\n  return <${name}${props} />;\n}\n`;

  const files = [`components/icona/${slug}.tsx`, ...(particles ? ["components/icona/particles.ts"] : [])];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full max-w-[300px]">
          <SegmentedControl ariaLabel="Framework" options={FRAMEWORKS} value={framework} onChange={setFramework} />
        </div>
        {framework !== "html" && (
          <div className={PACKAGE.published ? "w-[240px]" : "w-[160px]"}>
            <SegmentedControl ariaLabel="Install method" options={METHODS} value={method} onChange={setMethod} />
          </div>
        )}
      </div>

      {framework !== "html" && method === "package" && PACKAGE.published && (
        <ol className="flex flex-col gap-5">
          <Step n={1} title="Install the package">
            <div className="w-[260px]">
              <SegmentedControl ariaLabel="Package manager" options={MANAGERS} value={manager} onChange={setManager} />
            </div>
            <CodeBlock file={code("terminal", "bash", installCommandFor(manager))} download={false} />
            <p className="text-[12px] leading-[18px] text-muted">Tree-shakeable ESM with types. Only the icons you import end up in your bundle. Needs React 18 or newer.</p>
          </Step>
          <Step n={2} title="Import and use it">
            <CodeBlock
              file={code("Example.tsx", "tsx", `import { ${pkgName} } from "${importPath(animated)}";

export default function Example() {
  return <${pkgName}${props} />;
}
`)}
              download={false}
            />
            <p className="text-[12px] leading-[18px] text-muted">Color, size and speed are props here. Set them on the component instead of baking them in.</p>
          </Step>
        </ol>
      )}

      {framework !== "html" && method === "cli" && (
        <ol className="flex flex-col gap-5">
          <Step n={1} title="Run the command in your project">
            <CodeBlock file={code("terminal", "bash", command)} download={false} />
            <p className="text-[12px] leading-[18px] text-muted">
              Uses the <span className="font-medium text-ink">shadcn CLI</span>, which reads this site&apos;s registry. Your project needs a <span className="font-medium text-ink">components.json</span>; if it
              has none, run <span className="font-medium text-ink">npx shadcn@latest init</span> first. Your color, size, stroke and speed choices are part of the command.
            </p>
          </Step>
          <Step n={2} title="It adds these files">
            <ul className="flex flex-col gap-1 text-[12px] leading-[18px] text-ink">
              {files.map((f) => (
                <li key={f} className="font-mono">
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-[12px] leading-[18px] text-muted">The path follows your <span className="font-medium text-ink">components</span> alias. No packages are installed.</p>
          </Step>
          <Step n={3} title="Use it">
            <CodeBlock file={code("Example.tsx", "tsx", reactSnippet)} download={false} />
          </Step>
        </ol>
      )}

      {framework !== "html" && method === "manual" && (
        <ol className="flex flex-col gap-5">
          <Step n={1} title={`Add ${slug}.tsx to your project`}>
            <p className="text-[12px] leading-[18px] text-muted">
              Save it as <span className="font-medium text-ink">components/icona/{slug}.tsx</span>.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <ActionButton action={() => copyCode(tsx.main.content, `${slug}.tsx`)} label="Copy component source">
                Copy component
              </ActionButton>
              <ActionButton action={() => downloadText(tsx.main.content, `${slug}.tsx`)} done="Saved" label="Download component file">
                Download .tsx
              </ActionButton>
              <ActionButton
                action={() => {
                  if (particles && !runtime.file) return { ok: false, message: "Still loading the particle runtime. Try again in a moment." };
                  const list = [{ path: tsx.main.path, content: tsx.main.content }, ...(runtime.file ? [{ path: runtime.file.path, content: runtime.file.content }] : [])];
                  return downloadBlob(new Blob([zipFiles(list) as BlobPart], { type: "application/zip" }), `${slug}.zip`);
                }}
                done="Saved"
                label="Download all files as zip"
              >
                Download all (.zip)
              </ActionButton>
            </div>
          </Step>
          {particles && (
            <Step n={2} title="Add the particle runtime next to it">
              <p className="text-[12px] leading-[18px] text-muted">
                Save as <span className="font-medium text-ink">components/icona/particles.ts</span>. One copy serves every animated icon that uses particles. It has no dependencies.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <ActionButton action={() => (runtime.file ? copyCode(runtime.file.content, "particles.ts") : { ok: false, message: "Still loading the particle runtime." })} label="Copy particles.ts">
                  Copy particles.ts
                </ActionButton>
                <ActionButton action={() => (runtime.file ? downloadText(runtime.file.content, "particles.ts") : { ok: false, message: "Still loading the particle runtime." })} done="Saved" label="Download particles.ts">
                  Download .ts
                </ActionButton>
              </div>
            </Step>
          )}
          <Step n={particles ? 3 : 2} title="Use it">
            <CodeBlock file={code("Example.tsx", "tsx", reactSnippet)} download={false} />
          </Step>
        </ol>
      )}

      {framework === "html" && (
        <ol className="flex flex-col gap-5">
          <Step n={1} title="Paste the SVG where you want the icon">
            <CodeBlock file={html.main} />
          </Step>
          <Step n={2} title="Or reference the file">
            <p className="text-[12px] leading-[18px] text-muted">
              Download <span className="font-medium text-ink">{slug}.svg</span> from the Download tab and load it as an image{animated ? ". It loops by itself" : ""}. Images can&apos;t inherit text color or react to hover.
            </p>
            <CodeBlock file={code("index.html", "html", `<img src="${slug}.svg" width="${options.size}" height="${options.size}" alt="">\n`)} download={false} />
            {animated && html.scene.script && (
              <Note tone="warn">This animation also has particles, which a plain HTML page doesn&apos;t get. Use the React component, GIF or APNG to include them.</Note>
            )}
          </Step>
        </ol>
      )}

      <section className="flex flex-col gap-2 rounded-[12px] border border-line bg-card p-3.5">
        <h3 className="text-[13px] leading-4 font-medium text-ink">{framework === "react" ? "React" : framework === "next" ? "Next.js" : "HTML / CSS"}</h3>
        <p className="text-[12px] leading-[18px] text-muted">
          {framework === "react" && "A plain function component with no dependencies beyond React. Import it like any local component."}
          {framework === "next" && `Works in the App Router. ${particles ? 'The file starts with "use client" because it plays particles in the browser. ' : "It needs no client directive, so it can render in a Server Component. "}Imports use the default @/ alias.`}
          {framework === "html" && "No build step or framework: the SVG carries its own CSS."}
        </p>
        <p className="text-[12px] leading-[18px] text-muted">
          <span className="font-medium text-ink">Dependencies:</span> {particles ? "none to install. The component imports particles.ts, a file in this registry." : "none."}
          {animated ? " Animations respect prefers-reduced-motion." : ""}
        </p>
      </section>
    </div>
  );
}
