"use client";

import { useId, useState } from "react";
import { SIZE_RANGE, type ExportOptions } from "../export/options";
import { isInteractive } from "../export/scene";
import { FilterSection } from "../filters/FilterSection";
import { IconRenderer } from "../icons/IconRenderer";
import type { IconVariant } from "../icons/types";
import { MotionIcon } from "../motion/MotionIcon";
import { getMotions } from "../motion/registry";
import { MOTION_STYLE_BY_ID } from "../motion/styles";
import type { MotionVariant } from "../motion/types";
import { cx } from "../ui/Button";
import { ColorPicker, normalizeHex } from "../ui/ColorPicker";
import { SegmentedControl, type SegmentOption } from "../ui/SegmentedControl";

/* -------------------------------------------------------------------------- */
/* Animation picker                                                            */
/* -------------------------------------------------------------------------- */

function Tile({
  variant,
  motion,
  selected,
  onSelect,
  label,
  hint,
}: {
  variant: IconVariant;
  motion?: MotionVariant;
  selected: boolean;
  onSelect: () => void;
  label: string;
  hint?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onPointerEnter={(e) => e.pointerType !== "touch" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => e.target.matches(":focus-visible") && setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group flex min-w-0 cursor-pointer flex-col items-stretch gap-1 rounded-[12px] p-0 text-left focus-visible:outline-offset-1"
    >
      <span
        className={cx(
          "relative block h-[64px] overflow-visible rounded-[12px] border bg-card text-ink transition-colors",
          selected ? "border-accent bg-white shadow-card-hover" : "border-line group-hover:border-[rgba(28,31,33,0.2)]",
        )}
      >
        {motion ? (
          <MotionIcon variant={variant} motion={motion} active={hovered} size={variant.pixel ? 24 : 22} />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <IconRenderer variant={variant} size={variant.pixel ? 24 : 22} recipe={null} />
          </span>
        )}
      </span>
      <span className={cx("truncate px-0.5 text-[11px] leading-[14px] font-medium", selected ? "text-ink" : "text-muted")}>{label}</span>
      {hint && <span className="-mt-0.5 truncate px-0.5 text-[10px] leading-3 text-muted">{hint}</span>}
    </button>
  );
}

/** Pick the static icon or any of its animations; hover a tile to preview it. */
export function MotionPicker({ variant, value, onChange }: { variant: IconVariant; value: string | null; onChange: (id: string | null) => void }) {
  const motions = getMotions(variant);
  const labelId = useId();
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 id={labelId} className="text-[12px] leading-3 font-medium text-muted">
          Animation
        </h3>
        <span className="text-[11px] leading-3 font-medium text-muted">{motions.length} available</span>
      </div>
      <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-3 gap-x-1.5 gap-y-2.5">
        <Tile variant={variant} selected={value === null} onSelect={() => onChange(null)} label="Static" />
        {motions.map((m) => (
          <Tile
            key={m.id}
            variant={variant}
            motion={m}
            selected={value === m.id}
            onSelect={() => onChange(m.id)}
            label={m.label}
            hint={isInteractive(m) ? "Follows cursor" : MOTION_STYLE_BY_ID.get(m.style)?.label}
          />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Customise                                                                   */
/* -------------------------------------------------------------------------- */

const dot = (hex: string) => <span aria-hidden className="size-2.5 rounded-full shadow-[0_0_0_1px_rgba(28,31,33,0.1)]" style={{ backgroundColor: hex }} />;

type Preset = "ink" | "green" | "blue";
const PRESETS: Record<Preset, { label: string; hex: string; value: string | null }> = {
  ink: { label: "Ink", hex: "#1c1f21", value: null },
  green: { label: "Green", hex: "#049f5e", value: "#049f5e" },
  blue: { label: "Blue", hex: "#3d7bfa", value: "#3d7bfa" },
};
const COLOR_OPTIONS: readonly SegmentOption<Preset>[] = (Object.keys(PRESETS) as Preset[]).map((k) => ({
  value: k,
  label: PRESETS[k].label,
  icon: dot(PRESETS[k].hex),
  ariaLabel: k === "ink" ? "Ink (inherits currentColor)" : undefined,
}));
const presetFor = (color: string | null): Preset | null =>
  color === null ? "ink" : ((Object.keys(PRESETS) as Preset[]).find((k) => PRESETS[k].value === normalizeHex(color)) ?? null);

const SIZES = [24, 32, 48, 64];
const SIZE_OPTIONS: readonly SegmentOption<number>[] = SIZES.map((n) => ({ value: n, label: String(n), ariaLabel: `${n} pixels` }));
const STROKES: readonly SegmentOption<number>[] = [
  { value: 1, label: "1", ariaLabel: "Stroke 1" },
  { value: 1.5, label: "1.5", ariaLabel: "Stroke 1.5" },
  { value: 2, label: "2", ariaLabel: "Stroke 2" },
];
const SPEEDS: readonly SegmentOption<number>[] = [0.5, 1, 1.5, 2].map((n) => ({ value: n, label: `${n}×`, ariaLabel: `${n} times speed` }));

/** Color, size, stroke and speed — everything here is baked into every export. */
export function Customize({
  variant,
  options,
  animated,
  onChange,
}: {
  variant: IconVariant;
  options: ExportOptions;
  animated: boolean;
  onChange: (patch: Partial<ExportOptions>) => void;
}) {
  const ids = [useId(), useId(), useId(), useId()];
  const preset = presetFor(options.color);
  const [sizeText, setSizeText] = useState<string | null>(null);

  const commitSize = (raw: string) => {
    const n = Math.round(Number(raw));
    setSizeText(null);
    if (Number.isFinite(n) && n >= SIZE_RANGE.min) onChange({ size: Math.min(SIZE_RANGE.max, n) });
  };

  return (
    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      <FilterSection labelId={ids[0]} label="Color" hint={options.color ? options.color.toUpperCase() : "currentColor"}>
        <div className="flex w-full items-center gap-1.5">
          <SegmentedControl labelledBy={ids[0]} options={COLOR_OPTIONS} value={preset} onChange={(v) => onChange({ color: PRESETS[v].value })} className="min-w-0 flex-1" />
          <ColorPicker value={options.color} active={preset === null} onChange={(hex) => onChange({ color: hex })} />
        </div>
      </FilterSection>

      <FilterSection labelId={ids[1]} label="Size" hint={`${options.size}px`}>
        <div className="flex items-center gap-1.5">
          <SegmentedControl
            labelledBy={ids[1]}
            options={SIZE_OPTIONS}
            value={SIZES.includes(options.size) ? options.size : null}
            onChange={(v) => onChange({ size: v })}
            className="min-w-0 flex-1"
          />
          <label className="flex h-[34px] w-[68px] shrink-0 items-center gap-1 rounded-[10px] border border-line bg-card px-2 text-[12px] font-medium text-muted focus-within:border-accent">
            <span className="sr-only">Custom size in pixels</span>
            <input
              inputMode="numeric"
              value={sizeText ?? String(options.size)}
              onChange={(e) => setSizeText(e.target.value.replace(/\D/g, "").slice(0, 3))}
              onBlur={(e) => commitSize(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitSize(e.currentTarget.value)}
              className="w-full min-w-0 bg-transparent text-ink outline-none"
            />
            <span aria-hidden>px</span>
          </label>
        </div>
      </FilterSection>

      {!variant.pixel && (
        <FilterSection labelId={ids[2]} label="Stroke" hint={`${options.strokeWidth}px`}>
          <SegmentedControl labelledBy={ids[2]} options={STROKES} value={options.strokeWidth} onChange={(v) => onChange({ strokeWidth: v })} />
        </FilterSection>
      )}

      {animated && (
        <FilterSection labelId={ids[3]} label="Speed" hint={`${options.speed}×`}>
          <SegmentedControl labelledBy={ids[3]} options={SPEEDS} value={options.speed} onChange={(v) => onChange({ speed: v })} />
        </FilterSection>
      )}
    </div>
  );
}
