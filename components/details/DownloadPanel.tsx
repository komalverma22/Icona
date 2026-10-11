"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { generateCode, needsParticleRuntime } from "../export/code";
import { copyCode, copyImage, downloadBlob, type Outcome } from "../export/delivery";
import { iconSlug } from "../export/naming";
import { motionOf, type ExportOptions } from "../export/options";
import { frameSize, renderApng, renderFrames, renderGif, renderPng, type FrameSet, type RasterScale } from "../export/raster";
import { zipFiles } from "../export/zip";
import type { IconVariant } from "../icons/types";
import { SegmentedControl, type SegmentOption } from "../ui/SegmentedControl";
import { ActionButton } from "./CopyButton";
import { Badge, Note, useParticleSource } from "./shared";

const SCALES: readonly SegmentOption<RasterScale>[] = [
  { value: 1, label: "1×", ariaLabel: "1 times" },
  { value: 2, label: "2×", ariaLabel: "2 times" },
  { value: 4, label: "4×", ariaLabel: "4 times" },
  { value: 8, label: "8×", ariaLabel: "8 times" },
];

const BACKGROUNDS: readonly SegmentOption<"transparent" | "white">[] = [
  { value: "transparent", label: "Transparent" },
  { value: "white", label: "White" },
];

/** Longest edge of an exported animation, so a 64px icon at 8× doesn't produce a 100 MB GIF. */
const MEDIA_MAX_EDGE = 640;

function Card({ title, badge, description, children, actions }: { title: string; badge: ReactNode; description: ReactNode; children?: ReactNode; actions: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-[12px] border border-line bg-card p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] leading-4 font-medium text-ink">{title}</h3>
        {badge}
      </div>
      <p className="text-[12px] leading-[18px] text-muted">{description}</p>
      {children}
      <div className="flex flex-wrap items-center gap-1.5">{actions}</div>
    </section>
  );
}

export function DownloadPanel({ variant, options }: { variant: IconVariant; options: ExportOptions }) {
  const motion = motionOf(variant, options);
  const slug = iconSlug(variant, motion);
  const svg = useMemo(() => generateCode(variant, options, "svg"), [variant, options]);
  const tsx = useMemo(() => generateCode(variant, options, "tsx"), [variant, options]);
  const { scene } = svg;
  const animatedSvg = Boolean(scene.css);
  const hasMedia = scene.info.tier === "animated" && (Boolean(scene.css) || Boolean(scene.script));
  const particles = needsParticleRuntime(tsx.scene);
  const runtime = useParticleSource(particles);

  const [scale, setScale] = useState<RasterScale>(2);
  const [gifBackground, setGifBackground] = useState<"transparent" | "white">("transparent");

  // Rendered frames are reused between GIF and APNG while nothing changes.
  const cache = useRef<{ key: string; frames: Promise<FrameSet> } | null>(null);
  useEffect(() => {
    cache.current = null;
  }, [variant, options]);

  const mediaScale = Math.max(1, Math.min(scale, Math.floor(MEDIA_MAX_EDGE / Math.max(scene.width, scene.height))) || 1) as RasterScale;
  const frames = (background: string | null) => {
    const key = JSON.stringify([variant.key, options, mediaScale, background]);
    if (cache.current?.key !== key) cache.current = { key, frames: renderFrames(variant, options, { scale: mediaScale, background }) };
    return cache.current.frames;
  };

  const guard = async (work: () => Promise<Outcome>): Promise<Outcome> => {
    try {
      return await work();
    } catch (error) {
      cache.current = null;
      return { ok: false, message: error instanceof Error && error.message ? error.message : "That export failed. Try a smaller size." };
    }
  };

  const pngPx = `${Math.round(options.size * scale)} × ${Math.round(options.size * scale)} px`;
  const media = frameSize(scene, mediaScale);
  const mediaPx = `${media.width} × ${media.height} px`;

  return (
    <div className="flex flex-col gap-3">
      {scene.info.tier === "interactive" && (
        <Note tone="warn" title="Animated exports aren't available for this animation">
          {scene.info.reason} SVG, PNG and the React component export the static icon.
        </Note>
      )}

      <Card
        title="SVG"
        badge={<Badge tone={animatedSvg ? "animated" : "still"}>{animatedSvg ? "Animated · loops" : "Vector"}</Badge>}
        description={
          animatedSvg
            ? "Self-contained: the animation is CSS inside the file, so it plays in <img>, backgrounds and inline."
            : "Scalable vector with your color, size and stroke baked in."
        }
        actions={
          <>
            <ActionButton action={() => copyCode(svg.main.content, "SVG markup")} label="Copy SVG markup">
              Copy SVG
            </ActionButton>
            <ActionButton variant="accent" action={() => downloadBlob(new Blob([svg.main.content], { type: "image/svg+xml" }), `${slug}.svg`)} done="Saved" label={`Download ${slug}.svg`}>
              Download .svg
            </ActionButton>
          </>
        }
      >
        {scene.info.tier === "animated" && scene.script && (
          <Note tone="warn">The SVG has the motion but not the particles (they're canvas-drawn). GIF, APNG and React include them.</Note>
        )}
        {scene.info.tier === "animated" && !animatedSvg && <Note tone="warn">Nothing in this animation moves inside the SVG, so the file is the still icon.</Note>}
      </Card>

      <Card
        title="PNG"
        badge={<Badge tone="still">{scene.info.tier === "animated" ? "Still · resting pose" : "Image"}</Badge>}
        description={
          <>
            Transparent PNG, {pngPx}.{options.color ? "" : " Drawn in ink (#1C1F21), since a raster can't inherit text color."}
            {scene.info.tier === "animated" && " PNG can't animate; use APNG or GIF below for movement."}
          </>
        }
        actions={
          <>
            <ActionButton action={() => guard(async () => copyImage(await renderPng(variant, options, scale)))} done="Copied" label="Copy PNG to clipboard">
              Copy PNG
            </ActionButton>
            <ActionButton variant="accent" action={() => guard(async () => downloadBlob(await renderPng(variant, options, scale), `${slug}@${scale}x.png`))} done="Saved" label="Download PNG">
              Download .png
            </ActionButton>
          </>
        }
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted">Scale</span>
          <div className="w-[190px]">
            <SegmentedControl ariaLabel="PNG scale" options={SCALES} value={scale} onChange={setScale} />
          </div>
        </div>
      </Card>

      {hasMedia && (
        <>
          <Card
            title="APNG"
            badge={<Badge tone="animated">Animated · full color</Badge>}
            description={
              <>
                Animated PNG, {mediaPx}, with smooth transparency. {particles ? "Includes particles. " : ""}Plays in every current browser; many apps treat it as a still PNG, so use GIF there.
              </>
            }
            actions={
              <ActionButton variant="accent" action={() => guard(async () => downloadBlob(await renderApng(await frames(null)), `${slug}-animated.png`))} done="Saved" label="Download animated PNG">
                Download APNG
              </ActionButton>
            }
          />
          <Card
            title="GIF"
            badge={<Badge tone="animated">Animated · 256 colors</Badge>}
            description={
              <>
                Works everywhere, {mediaPx}. {particles ? "Includes particles. " : ""}GIF has no partial transparency, so a transparent GIF has hard edges; pick White to blend onto a white page.
              </>
            }
            actions={
              <ActionButton
                variant="accent"
                action={() => guard(async () => downloadBlob(await renderGif(await frames(gifBackground === "white" ? "#ffffff" : null)), `${slug}.gif`))}
                done="Saved"
                label="Download GIF"
              >
                Download GIF
              </ActionButton>
            }
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted">Background</span>
              <div className="w-[190px]">
                <SegmentedControl ariaLabel="GIF background" options={BACKGROUNDS} value={gifBackground} onChange={setGifBackground} />
              </div>
            </div>
          </Card>
        </>
      )}

      <Card
        title="Source files"
        badge={<Badge tone="neutral">.zip</Badge>}
        description={`The React component${particles ? ", its particle runtime" : ""} and the SVG, ready to drop into a project.`}
        actions={
          <ActionButton
            action={() => {
              const files = [
                { path: tsx.main.path, content: tsx.main.content },
                { path: `${slug}.svg`, content: svg.main.content },
                ...(particles ? (runtime.file ? [{ path: runtime.file.path, content: runtime.file.content }] : []) : []),
              ];
              if (particles && !runtime.file) return { ok: false, message: "Still loading the particle runtime. Try again in a moment." };
              return downloadBlob(new Blob([zipFiles(files) as BlobPart], { type: "application/zip" }), `${slug}.zip`);
            }}
            done="Saved"
            label="Download source files as zip"
          >
            Download .zip
          </ActionButton>
        }
      />
    </div>
  );
}
