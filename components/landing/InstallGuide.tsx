"use client";

import { useState } from "react";
import { DocCode } from "../docs/DocCode";
import { installCommandFor, PACKAGE, type PackageManager } from "../export/packageInfo";
import { cx } from "../ui/Button";
import { Reveal } from "./Reveal";

type Method = "cli" | PackageManager;

const TABS: { id: Method; label: string }[] = [
  { id: "cli", label: "shadcn CLI" },
  { id: "npm", label: "npm" },
  { id: "pnpm", label: "pnpm" },
  { id: "yarn", label: "yarn" },
  { id: "bun", label: "bun" },
];

const CLI_USAGE = `import { HeartFillIcon } from "@/components/icona/heart-fill";

export default function Example() {
  return <HeartFillIcon size={32} color="#2b9af3" />;
}`;

const PACKAGE_USAGE = `import { HeartIcon } from "${PACKAGE.name}";
import { HeartHeartbeatIcon } from "${PACKAGE.name}/animated";

export default function Example() {
  return (
    <>
      <HeartIcon size={32} color="#2b9af3" />
      <HeartHeartbeatIcon size={32} animate="loop" />
    </>
  );
}`;

const PROPS_USAGE = `<HeartHeartbeatIcon
  size={40}          // px
  color="#2b9af3"    // any CSS color, defaults to currentColor
  strokeWidth={1.5}  // outline thickness
  speed={1.25}       // animation speed multiplier
  animate="hover"    // "hover" | "loop" | "none"
/>`;

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="relative pl-12 sm:pl-14">
      <span className="absolute top-0 left-0 flex size-8 items-center justify-center rounded-full border border-[rgba(28,31,33,0.22)] bg-card text-[13px] leading-4 font-semibold text-ink sm:size-9">{n}</span>
      <h3 className="text-[18px] leading-7 font-semibold tracking-[-0.015em] text-ink">{title}</h3>
      {children}
    </li>
  );
}

/** Install, use and customize walkthrough with a tab per install method. */
export function InstallGuide() {
  const [method, setMethod] = useState<Method>("cli");
  const isPackage = method !== "cli";
  const pending = isPackage && !PACKAGE.published;

  return (
    <Reveal>
      <ol className="flex flex-col gap-10">
        <Step n={1} title="Install">
          <div role="tablist" aria-label="Install method" className="mt-3 inline-flex max-w-full gap-1 overflow-x-auto rounded-[10px] border border-line bg-card p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={method === tab.id}
                onClick={() => setMethod(tab.id)}
                className={cx(
                  "h-7 shrink-0 cursor-pointer rounded-[7px] px-3 text-[12px] leading-4 font-medium transition-colors",
                  method === tab.id ? "bg-white text-ink shadow-segment" : "text-muted hover:text-ink",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {isPackage ? (
            <DocCode language="bash" title="terminal" code={installCommandFor(method)} />
          ) : (
            <DocCode language="bash" title="terminal" code={"npx shadcn@latest add {origin}/r/heart-fill.json"} />
          )}
          <p className="text-[13px] leading-5 text-muted">
            {pending
              ? `The ${PACKAGE.name} package isn't on npm yet. Use the shadcn CLI or copy the file today; this tab will work as soon as it is published.`
              : isPackage
                ? "Needs React 18 or newer. Tree-shakeable ESM with TypeScript types."
                : "Adds the icon as a file you own in your components folder. Nothing else is installed."}
          </p>
        </Step>

        <Step n={2} title="Use it like any component">
          <DocCode language="tsx" title="Example.tsx" code={isPackage ? PACKAGE_USAGE : CLI_USAGE} />
        </Step>

        <Step n={3} title="Customize with props">
          <DocCode language="tsx" title="Props" code={PROPS_USAGE} />
          <p className="text-[13px] leading-5 text-muted">Animated icons play on hover by default. Set animate to loop for a continuous motion, or none for a still icon.</p>
        </Step>
      </ol>
    </Reveal>
  );
}
