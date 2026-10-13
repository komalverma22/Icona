"use client";

import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { type ExportOptions, motionOf, optionsToParams } from "../export/options";
import { buildScene } from "../export/scene";
import { bakedSpeed } from "../export/render";
import { categoryLabel, iconVariantsByKey } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";
import type { IconVariant } from "../icons/types";
import { getMotions } from "../motion/registry";
import { cx } from "../ui/Button";
import { CodePanel } from "./CodePanel";
import { Customize, MotionPicker } from "./Controls";
import { DownloadPanel } from "./DownloadPanel";
import { InstallPanel } from "./InstallPanel";
import { Badge } from "./shared";
import { PreviewStage, type PlayMode, type Tone } from "./Stage";
import { ToastProvider } from "./Toast";

const ICON = (key: string) => iconVariantsByKey.get(key)!;
const BACK = ICON("arrow-left-outline");
const REPLAY = ICON("refresh-outline");
const LOGO = "/figma/logo.png";

const TABS = [
  { id: "install", label: "Install", hint: "CLI, manual, frameworks" },
  { id: "download", label: "Download", hint: "SVG, PNG, GIF, APNG, zip" },
  { id: "code", label: "Code", hint: "Copy React, SVG or HTML" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const TOOL_BUTTON =
  "flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border border-line bg-white px-2.5 text-[12px] leading-[14.4px] font-medium text-ink shadow-button transition-[background-color,color,opacity] hover:bg-card";

function Tabs({ value, onChange }: { value: TabId; onChange: (id: TabId) => void }) {
  const layoutId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (i + d + TABS.length) % TABS.length;
    onChange(TABS[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label="Export options" className="flex gap-1.5 rounded-[12px] border border-line bg-card p-1">
      {TABS.map((tab, i) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKey(e, i)}
            className="group relative flex h-8 flex-1 cursor-pointer items-center justify-center rounded-[8px] px-3.5 text-[12px] leading-4 font-medium focus-visible:outline-offset-1"
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                aria-hidden
                className="absolute inset-0 rounded-[7.5px] border-[0.5px] border-accent-ring surface-accent shadow-accent"
                transition={{ type: "spring", stiffness: 520, damping: 42 }}
              />
            )}
            <span className={cx("relative transition-colors duration-150", selected ? "text-white [text-shadow:0px_0.5px_0px_rgba(10,10,11,0.15)]" : "text-muted group-hover:text-ink")}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Icon details: a live preview of exactly what will be exported, the
 * animation picker and customisations on one side, and Code / Download /
 * Install on the other. Everything shown works: each tab's actions produce
 * real files from the same scene the preview is playing.
 */
export function IconDetails({ variantKey, initial }: { variantKey: string; initial: ExportOptions }) {
  const variant = ICON(variantKey) as IconVariant;
  const reduce = useReducedMotion();
  const [options, setOptions] = useState<ExportOptions>(initial);
  const [tab, setTab] = useState<TabId>("install");
  const [mode, setMode] = useState<PlayMode>("loop");
  const [tone, setTone] = useState<Tone>("light");
  const [playKey, setPlayKey] = useState(0);

  const patch = useCallback((p: Partial<ExportOptions>) => setOptions((o) => ({ ...o, ...p })), []);
  const replay = useCallback(() => setPlayKey((k) => k + 1), []);

  // Keep the URL shareable: it always describes what is on screen.
  useEffect(() => {
    const query = optionsToParams(options).toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [options]);

  // Replay whenever the animation changes.
  useEffect(() => replay(), [options.motionId, replay]);

  const motions = getMotions(variant);
  const motion = motionOf(variant, options);
  const info = useMemo(() => buildScene(variant, options, bakedSpeed(options.speed)).info, [variant, options]);
  const animated = info.tier === "animated";

  const twinKey = `${variant.iconId}-${variant.style === "outline" ? "fill" : "outline"}`;
  const twin = iconVariantsByKey.get(twinKey);
  const carry = optionsToParams({ ...options, motionId: null }).toString();
  const href = (key: string) => `/icons/${key}${carry ? `?${carry}` : ""}`;

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <header className="sticky top-0 z-40 border-b border-divider bg-white">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 md:px-8 xl:px-[82px]">
            <Link href="/" aria-label="Icona — all icons" className="shrink-0 rounded-[10px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt="" width={32} height={32} className="size-8 object-cover" />
            </Link>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[12px] leading-[14.4px] font-medium">
              <Link href="/" className="flex h-8 items-center gap-1 rounded-[10px] pr-2 text-muted transition-colors hover:text-ink">
                <IconRenderer variant={BACK} size={14} recipe={null} />
                All icons
              </Link>
              <span aria-hidden className="text-muted">
                /
              </span>
              <span aria-current="page" className="truncate text-ink">
                {variant.name}
              </span>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 pt-6 pb-20 md:px-8 md:pt-9 xl:px-[82px]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-[24px] leading-8 font-medium text-ink">{variant.name}</h1>
              <p className="mt-1 text-[13px] leading-5 text-muted">
                {categoryLabel(variant.category)} · {variant.style === "fill" ? "Fill" : "Outline"} · {motions.length} animations
                {variant.pixel ? " · Pixel art" : ""}
              </p>
            </div>
            {twin && (
              <div role="group" aria-label="Icon style" className="flex shrink-0 rounded-[10px] border border-line bg-card p-0.5">
                {(["outline", "fill"] as const).map((style) => {
                  const selected = variant.style === style;
                  const classes = cx("flex h-7 items-center rounded-[8px] px-3 text-[12px] leading-3 font-medium capitalize transition-colors", selected ? "surface-raised text-ink shadow-segment" : "text-muted hover:text-ink");
                  return selected ? (
                    <span key={style} aria-current="true" className={classes}>
                      {style}
                    </span>
                  ) : (
                    <Link key={style} href={href(`${variant.iconId}-${style}`)} replace className={classes}>
                      {style}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start lg:gap-12">
            {/* Preview + animation ------------------------------------------------ */}
            <section aria-label="Preview" className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-104px)] lg:overflow-y-auto lg:pr-1">
              <PreviewStage variant={variant} options={options} mode={mode} playKey={playKey} tone={tone} onHover={() => mode === "once" && replay()} />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 text-[12px] leading-4 text-muted">
                  {animated ? (
                    <>
                      <span className="font-medium text-ink">{motion?.label}</span>
                      {info.loops ? " · loops" : ` · ${Math.round(info.duration * 10) / 10}s`}
                    </>
                  ) : info.tier === "interactive" ? (
                    <>
                      <span className="font-medium text-ink">{motion?.label}</span> · follows the cursor
                    </>
                  ) : (
                    "Static icon"
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {animated && (
                    <>
                      <button type="button" onClick={replay} className={TOOL_BUTTON} aria-label="Replay animation">
                        <IconRenderer variant={REPLAY} size={12} recipe={null} />
                        Replay
                      </button>
                      <button
                        type="button"
                        aria-pressed={mode === "loop"}
                        onClick={() => {
                          setMode((m) => (m === "loop" ? "once" : "loop"));
                          replay();
                        }}
                        className={cx(TOOL_BUTTON, mode === "loop" && "border-accent bg-[rgba(43,154,243,0.08)] hover:bg-[rgba(43,154,243,0.14)]")}
                      >
                        Loop
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    aria-pressed={tone === "dark"}
                    aria-label={tone === "dark" ? "Switch preview to light background" : "Switch preview to dark background"}
                    onClick={() => setTone((t) => (t === "dark" ? "light" : "dark"))}
                    className={cx(TOOL_BUTTON, "w-8 px-0")}
                  >
                    <span aria-hidden className={cx("size-3.5 rounded-full border border-line", tone === "dark" ? "bg-ink" : "bg-white")} />
                  </button>
                </div>
              </div>
              {reduce && (
                <p role="note" className="rounded-[8px] bg-card px-2.5 py-2 text-[11px] leading-4 text-muted">
                  Your system asks for reduced motion, so previews are paused. Exports still contain the animation, and the generated CSS pauses it for visitors with that setting.
                </p>
              )}

              <MotionPicker variant={variant} value={options.motionId} onChange={(id) => patch({ motionId: id })} />
            </section>

            {/* Customise + export -------------------------------------------------- */}
            <div className="flex min-w-0 flex-col gap-6">
              <section aria-label="Customize" className="rounded-[14px] border border-line bg-card p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[13px] leading-4 font-medium text-ink">Customize</h2>
                  <span className="text-[11px] leading-3 text-muted">Applied to every export</span>
                </div>
                <Customize variant={variant} options={options} animated={animated} onChange={patch} />
              </section>

              <section aria-label="Export">
                <Tabs value={tab} onChange={setTab} />
                <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-5">
                  <p className="mb-4 flex items-center gap-2 text-[12px] leading-4 text-muted">
                    {TABS.find((t) => t.id === tab)?.hint}
                    {animated ? <Badge tone="animated">Animated export</Badge> : <Badge tone="still">Static export</Badge>}
                  </p>
                  {tab === "code" && <CodePanel variant={variant} options={options} />}
                  {tab === "download" && <DownloadPanel variant={variant} options={options} />}
                  {tab === "install" && <InstallPanel variant={variant} options={options} />}
                </div>
              </section>
            </div>
          </div>
        </main>
      </ToastProvider>
    </MotionConfig>
  );
}
