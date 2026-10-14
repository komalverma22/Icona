import { iconVariantsByKey } from "../icons/iconLibrary";
import type { IconVariant } from "../icons/types";
import { getMotions } from "../motion/registry";
import type { MotionVariant } from "../motion/types";
import { normalizeHex } from "../ui/colorUtils";

/** Everything a user can customise on the details page - and everything an export bakes in. */
export interface ExportOptions {
  /** Motion variant id, or null for the static icon. */
  motionId: string | null;
  /** Hex colour, or null to inherit `currentColor`. */
  color: string | null;
  /** Rendered size in px. */
  size: number;
  /** Stroke width on the 24-unit grid (vector icons). */
  strokeWidth: number;
  /** Playback speed multiplier. */
  speed: number;
}

export const SIZE_RANGE = { min: 12, max: 512 } as const;
export const STROKE_RANGE = { min: 0.5, max: 3 } as const;
export const SPEED_RANGE = { min: 0.25, max: 3 } as const;

export const DEFAULT_OPTIONS: ExportOptions = { motionId: null, color: null, size: 24, strokeWidth: 1.5, speed: 1 };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/* -------------------------------------------------------------------------- */
/* Lookup                                                                      */
/* -------------------------------------------------------------------------- */

export const motionOf = (variant: IconVariant, options: Pick<ExportOptions, "motionId">): MotionVariant | undefined =>
  options.motionId ? getMotions(variant).find((m) => m.id === options.motionId) : undefined;

/* -------------------------------------------------------------------------- */
/* URL <-> options                                                             */
/* -------------------------------------------------------------------------- */

type Params = Pick<URLSearchParams, "get">;

const num = (raw: string | null, fallback: number, min: number, max: number) => {
  const n = raw === null || raw === "" ? NaN : Number(raw);
  return Number.isFinite(n) ? clamp(n, min, max) : fallback;
};

/** Read customisations from a query string. Unknown / invalid values fall back to defaults. */
export function parseOptions(params: Params, variant: IconVariant, base: ExportOptions = DEFAULT_OPTIONS): ExportOptions {
  const motion = params.get("motion");
  const color = params.get("color");
  return {
    motionId: motion && getMotions(variant).some((m) => m.id === motion) ? motion : base.motionId,
    color: color === "none" ? null : color ? (normalizeHex(color) ?? base.color) : base.color,
    size: Math.round(num(params.get("size"), base.size, SIZE_RANGE.min, SIZE_RANGE.max)),
    strokeWidth: num(params.get("stroke"), base.strokeWidth, STROKE_RANGE.min, STROKE_RANGE.max),
    speed: num(params.get("speed"), base.speed, SPEED_RANGE.min, SPEED_RANGE.max),
  };
}

/** Only options that differ from the defaults are written, so links and install commands stay short. */
export function optionsToParams(options: ExportOptions, base: ExportOptions = DEFAULT_OPTIONS): URLSearchParams {
  const p = new URLSearchParams();
  if (options.motionId) p.set("motion", options.motionId);
  if (options.color !== base.color) p.set("color", options.color ?? "none");
  if (options.size !== base.size) p.set("size", String(options.size));
  if (options.strokeWidth !== base.strokeWidth) p.set("stroke", String(options.strokeWidth));
  if (options.speed !== base.speed) p.set("speed", String(options.speed));
  return p;
}

export const variantFor = (key: string) => iconVariantsByKey.get(key);
