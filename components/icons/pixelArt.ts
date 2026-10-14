import type { IconNode, PixelGrid } from "./types";

/**
 * Pixel-art helpers shared by the icon data (static nodes, copy-as-SVG) and
 * the pixel animation player. Sprites live on a 12×12 grid; every pixel is a
 * 2×2 square on the 24px icon grid, so icons stay crisp at 24px and 48px and
 * `shape-rendering: crispEdges` keeps edges hard at every other size.
 */

export const PIXEL_GRID = 12;
export const PIXEL_UNIT = 24 / PIXEL_GRID;
/** Opacity of "+" shade pixels. */
export const SHADE_OPACITY = 0.4;

/** One lit pixel. `t` 1 = solid, 2 = shade; `c` overrides the colour (effects only). */
export interface Pixel {
  x: number;
  y: number;
  t: 1 | 2;
  c?: string;
}

export function parseSprite(grid: PixelGrid): Pixel[] {
  const pixels: Pixel[] = [];
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === "#") pixels.push({ x, y, t: 1 });
      else if (ch === "+") pixels.push({ x, y, t: 2 });
    }
  });
  return pixels;
}

/**
 * Outline style for a sprite: keep every solid pixel that touches something
 * other than solid (empty space or shade), drop shade and interior pixels -
 * the classic 1px pixel-art line version of the same silhouette.
 */
export function outlineSprite(grid: PixelGrid): PixelGrid {
  const at = (x: number, y: number) => grid[y]?.[x] ?? ".";
  const filled = (ch: string) => ch === "#" || ch === "+";
  return grid.map((row, y) =>
    Array.from(row, (ch, x) => {
      const around = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];
      if (ch === "#") return around.some((n) => n !== "#") ? "#" : ".";
      // Shade on the silhouette edge becomes line so the outline stays closed.
      if (ch === "+") return around.some((n) => !filled(n)) ? "#" : ".";
      return ".";
    }).join(""),
  );
}

/** Pixels → one path, merging horizontal runs into rectangles (fewer commands, no seams). */
export function pixelsToPath(pixels: readonly Pixel[], unit = PIXEL_UNIT): string {
  const rows = new Map<number, Set<number>>();
  for (const p of pixels) {
    const row = rows.get(p.y) ?? new Set<number>();
    row.add(p.x);
    rows.set(p.y, row);
  }
  let d = "";
  for (const [y, set] of rows) {
    const xs = [...set].sort((a, b) => a - b);
    let start = xs[0];
    for (let i = 0; i < xs.length; i++) {
      if (xs[i + 1] === xs[i] + 1) continue;
      const w = (xs[i] - start + 1) * unit;
      d += `M${start * unit} ${y * unit}h${w}v${unit}h${-w}z`;
      start = xs[i + 1];
    }
  }
  return d;
}

/** Static icon nodes for a sprite: a solid layer and (if present) a shade layer. */
export function spriteNodes(grid: PixelGrid): IconNode[] {
  const pixels = parseSprite(grid);
  const solid = pixels.filter((p) => p.t === 1);
  const shade = pixels.filter((p) => p.t === 2);
  const nodes: IconNode[] = [];
  if (shade.length) {
    nodes.push({
      id: "shade",
      type: "path",
      d: pixelsToPath(shade),
      paint: "fillOnly",
      attrs: { fillOpacity: SHADE_OPACITY, shapeRendering: "crispEdges" },
    });
  }
  nodes.push({ id: "pixels", type: "path", d: pixelsToPath(solid), paint: "fillOnly", attrs: { shapeRendering: "crispEdges" } });
  return nodes;
}
