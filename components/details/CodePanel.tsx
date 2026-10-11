"use client";

import { useEffect, useMemo, useState } from "react";
import { generateCode, needsParticleRuntime, type CodeFormat } from "../export/code";
import type { ExportOptions } from "../export/options";
import type { IconVariant } from "../icons/types";
import { SegmentedControl, type SegmentOption } from "../ui/SegmentedControl";
import { CodeBlock } from "./CodeBlock";
import { Badge, Note, useParticleSource } from "./shared";

const FORMATS: { value: CodeFormat; label: string; ariaLabel: string }[] = [
  { value: "tsx", label: "React TSX", ariaLabel: "React component, TypeScript" },
  { value: "jsx", label: "React JSX", ariaLabel: "React component, JavaScript" },
  { value: "svg", label: "SVG", ariaLabel: "Standalone SVG file" },
  { value: "html", label: "HTML", ariaLabel: "Inline HTML snippet" },
  { value: "css", label: "CSS", ariaLabel: "Animation CSS only" },
];

/** What each format reproduces, in a sentence. */
function explain(format: CodeFormat, animated: boolean, particles: boolean): string {
  switch (format) {
    case "tsx":
    case "jsx":
      return animated
        ? `A self-contained component: the animation is plain CSS${particles ? " plus a small canvas particle runtime" : ""}. Props: size, color, strokeWidth, speed, animate (hover / loop / none).`
        : "A typed component with size, color and strokeWidth props. No dependencies.";
    case "svg":
      return animated ? "One file that animates on its own and loops. Works in <img>, CSS backgrounds and inline." : "A clean vector file with your color, size and stroke baked in.";
    case "html":
      return animated ? "Paste anywhere: the SVG and its CSS travel together and the icon plays on hover or focus." : "Inline SVG that follows the surrounding text color.";
    case "css":
      return "Just the animation: keyframes and the rules that apply them. Class names match the SVG and HTML tabs.";
  }
}

export function CodePanel({ variant, options }: { variant: IconVariant; options: ExportOptions }) {
  const [format, setFormat] = useState<CodeFormat>("tsx");
  const generated = useMemo(() => generateCode(variant, options, format), [variant, options, format]);
  const { scene } = generated;
  const animated = scene.info.tier === "animated";
  const particles = needsParticleRuntime(scene);
  const hasCss = Boolean(scene.css);
  const react = format === "tsx" || format === "jsx";
  const runtime = useParticleSource(particles && react);

  const formats: readonly SegmentOption<CodeFormat>[] = FORMATS.filter((f) => f.value !== "css" || hasCss);
  const active = format;
  // Switching to a static icon removes the CSS tab; fall back to the component.
  useEffect(() => {
    if (format === "css" && !hasCss) setFormat("tsx");
  }, [format, hasCss]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="w-full max-w-[420px]">
          <SegmentedControl ariaLabel="Code format" options={formats} value={active} onChange={setFormat} />
        </div>
        <div className="flex items-center gap-1.5">
          <Badge tone={animated ? "animated" : "still"}>{animated ? "Animated" : "Static"}</Badge>
          <Badge tone="neutral">{react && particles ? "needs particles.ts" : "No dependencies"}</Badge>
        </div>
      </div>

      <p className="text-[12px] leading-[18px] text-muted">{explain(active, animated, particles)}</p>

      {scene.info.tier === "interactive" && (
        <Note tone="warn" title="Static export only">
          {scene.info.reason}
        </Note>
      )}
      {animated && particles && !react && (
        <Note tone="warn" title="Particles aren't included in this format">
          Particles are drawn on a canvas, so they can't live in an SVG or CSS file. The motion itself is complete. Use React, GIF or APNG to include them.
        </Note>
      )}
      {animated && !hasCss && (
        <Note tone="warn" title="This animation is made of particles only">
          There is no movement to put in an SVG. Use the React component, GIF or APNG instead.
        </Note>
      )}
      {animated &&
        scene.info.notes
          .filter((n) => !n.startsWith("Particles are drawn"))
          .map((n) => (
            <Note key={n}>{n}</Note>
          ))}

      <CodeBlock file={generated.main} />

      {react && particles && (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] leading-[18px] text-muted">
            This animation uses particles, so the component imports <span className="font-medium text-ink">./particles</span>. Save this file next to it.
          </p>
          {runtime.file ? <CodeBlock file={runtime.file} /> : <p className="text-[12px] text-muted">{runtime.error ? "Couldn't load particles.ts. Is the registry reachable?" : "Loading particles.ts…"}</p>}
        </div>
      )}
    </div>
  );
}
