import type { IconNode, IconVariant } from "./types";

/**
 * Single source of truth for how icon nodes become SVG attributes.
 * Used both by the React renderer and by the exporter (components/export), so
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
  if (node.tint) {
    if (paint === "fill") return { fill: node.tint };
    if (paint === "fillOnly") return { fill: node.tint, stroke: "none" };
    return { stroke: node.tint };
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
