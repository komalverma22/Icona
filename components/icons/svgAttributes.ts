import type { IconNode, IconVariant } from "./types";

/**
 * Single source of truth for how icon nodes become SVG attributes.
 * Used both by the React renderer and by the "Copy as SVG" serializer, so
 * what users copy is exactly what they see.
 */

export const VIEWBOX = "0 0 24 24";

/** Presentation attributes on the <svg> root (React prop names). */
export const ROOT_ATTRS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

type AttrMap = Record<string, string | number>;

export function geometryAttrs(node: IconNode): AttrMap {
  switch (node.type) {
    case "path":
      return { d: node.d };
    case "circle":
      return { cx: node.cx, cy: node.cy, r: node.r };
    case "line":
      return { x1: node.x1, y1: node.y1, x2: node.x2, y2: node.y2 };
  }
}

/** Paint attributes. Knock-out nodes live inside a <mask>: black removes, white keeps. */
export function paintAttrs(node: IconNode): AttrMap {
  const paint = node.paint ?? "stroke";
  if (node.knockout) {
    return paint === "stroke" ? { stroke: "#000" } : { fill: "#000", stroke: paint === "fillOnly" ? "none" : "#000" };
  }
  if (paint === "fill") return { fill: "currentColor" };
  if (paint === "fillOnly") return { fill: "currentColor", stroke: "none" };
  return {};
}

export function maskIdFor(variant: IconVariant, suffix = "") {
  return `icona-${variant.key}${suffix}-cutout`;
}

export function splitNodes(nodes: readonly IconNode[]) {
  const knockouts: IconNode[] = [];
  const body: IconNode[] = [];
  for (const node of nodes) (node.knockout ? knockouts : body).push(node);
  return { knockouts, body };
}

/* -------------------------------------------------------------------------- */
/* Serializer                                                                  */
/* -------------------------------------------------------------------------- */

/** Presentation attributes are kebab-case in markup; geometry/structural ones (viewBox, maskUnits) are not. */
const kebab = (name: string) =>
  /^(stroke|fill)[A-Z]/.test(name) ? name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`) : name;

const escapeAttr = (value: string | number) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function attrsToString(attrs: AttrMap): string {
  return Object.entries(attrs)
    .map(([k, v]) => `${kebab(k)}="${escapeAttr(v)}"`)
    .join(" ");
}

function nodeToString(node: IconNode): string {
  return `<${node.type} ${attrsToString({ ...geometryAttrs(node), ...paintAttrs(node), ...(node.attrs ?? {}) })}/>`;
}

export interface MarkupOptions {
  /** Stroke width on the 24px grid (default 1.5). */
  strokeWidth?: number;
  /** Hex colour to bake in; omitted keeps `currentColor` so the icon inherits text colour. */
  color?: string | null;
}

/**
 * Serialize an icon to standalone, valid SVG markup (viewBox, paths, paints,
 * masks preserved). Animation-only helper nodes are excluded.
 */
export function toSvgMarkup(variant: IconVariant, size: number, options: MarkupOptions = {}): string {
  const nodes = variant.nodes.filter((n) => !n.animationOnly);
  const { knockouts, body } = splitNodes(nodes);
  const root = attrsToString({
    width: size,
    height: size,
    viewBox: VIEWBOX,
    ...ROOT_ATTRS,
    strokeWidth: options.strokeWidth ?? ROOT_ATTRS.strokeWidth,
  });

  const lines: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" ${root}>`];
  if (knockouts.length > 0) {
    const id = maskIdFor(variant);
    lines.push(
      `  <defs>`,
      `    <mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">`,
      `      <rect width="24" height="24" fill="#fff" stroke="none"/>`,
      ...knockouts.map((n) => `      ${nodeToString(n)}`),
      `    </mask>`,
      `  </defs>`,
      `  <g mask="url(#${id})">`,
      ...body.map((n) => `    ${nodeToString(n)}`),
      `  </g>`,
    );
  } else {
    lines.push(...body.map((n) => `  ${nodeToString(n)}`));
  }
  lines.push(`</svg>`);
  const markup = lines.join("\n");
  return options.color ? markup.replaceAll("currentColor", options.color) : markup;
}
