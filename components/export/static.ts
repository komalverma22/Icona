import { geometryAttrs, maskIdFor, paintAttrs, ROOT_ATTRS, splitNodes, VIEWBOX } from "../icons/svgAttributes";
import type { IconNode, IconVariant } from "../icons/types";
import { el, toMarkup, type Attrs, type El } from "./markup";

/** Root presentation attributes shared by every exported <svg>. */
export const rootAttrs = (size: number, strokeWidth: number): Attrs => ({
  width: size,
  height: size,
  viewBox: VIEWBOX,
  ...ROOT_ATTRS,
  strokeWidth,
});

/** One drawable node as an element (geometry + paint + static attributes). */
export function nodeEl(node: IconNode, extra: Attrs = {}, omit: ReadonlySet<string> = new Set()): El {
  const attrs: Attrs = { ...geometryAttrs(node), ...paintAttrs(node), ...(node.attrs ?? {}) };
  for (const key of omit) delete attrs[key];
  return el(node.type, { ...attrs, ...extra });
}

/** Replace `currentColor` in every attribute of a tree (used to bake a colour in, or to build a white mask). */
export function recolor(node: El, color: string): El {
  const attrs = node.attrs && Object.fromEntries(Object.entries(node.attrs).map(([k, v]) => [k, v === "currentColor" ? color : v]));
  return { tag: node.tag, attrs, children: node.children?.map((c) => (typeof c === "string" ? c : recolor(c, color))) };
}

/**
 * The still icon as elements. Knock-out nodes go into a <mask> (ids are
 * namespaced by `prefix` so several copies can live in one document).
 */
export function stillTree(variant: IconVariant, prefix = "", opts: { ink?: string } = {}): El[] {
  const nodes = variant.nodes.filter((n) => !n.animationOnly);
  const { knockouts, body } = splitNodes(nodes);
  let out: El[];
  if (knockouts.length === 0) {
    out = body.map((n) => nodeEl(n));
  } else {
    const id = maskIdFor(variant, prefix);
    out = [
      el("defs", {}, [
        el("mask", { id, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 24, height: 24 }, [
          el("rect", { width: 24, height: 24, fill: "#fff", stroke: "none" }),
          ...knockouts.map((n) => nodeEl(n)),
        ]),
      ]),
      el("g", { mask: `url(#${id})` }, body.map((n) => nodeEl(n))),
    ];
  }
  return opts.ink ? out.map((n) => recolor(n, opts.ink!)) : out;
}

export interface MarkupOptions {
  /** Stroke width on the 24px grid (default 1.5). */
  strokeWidth?: number;
  /** Hex colour to bake in; omitted keeps `currentColor` so the icon inherits text colour. */
  color?: string | null;
}

/** The static icon as a standalone <svg> element tree. */
export function staticSvg(variant: IconVariant, size: number, options: MarkupOptions = {}): El {
  const root = el("svg", { xmlns: "http://www.w3.org/2000/svg", ...rootAttrs(size, options.strokeWidth ?? ROOT_ATTRS.strokeWidth) }, stillTree(variant));
  return options.color ? recolor(root, options.color) : root;
}

/**
 * Serialize an icon to standalone, valid SVG markup (viewBox, paths, paints,
 * masks preserved). Animation-only helper nodes are excluded. This is exactly
 * what the card's "Copy as SVG" copies.
 */
export function toSvgMarkup(variant: IconVariant, size: number, options: MarkupOptions = {}): string {
  return toMarkup(staticSvg(variant, size, options));
}
