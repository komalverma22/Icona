import type { IconDefinition, IconNode } from "./types";

/**
 * The "Color" style: the ink outline stays `currentColor`, closed shapes get a
 * soft colour fill. Icons can author it directly (`def.color`); every other
 * vector icon gets one derived from its fill style (or, for line-only icons,
 * from its outline with a deeper tinted stroke).
 */

/** Soft fills, used inside an ink outline. */
export const TINT = {
  red: "#FF8A80",
  orange: "#FFB27A",
  yellow: "#FFD66B",
  green: "#86D99F",
  leaf: "#5FBF7A",
  teal: "#7DD8CC",
  blue: "#8EC5FF",
  lavender: "#B9B2F8",
  purple: "#A98CEB",
  pink: "#F7A8CB",
  peach: "#FFC3A6",
  brown: "#E2B07C",
  bread: "#F2C88B",
  cream: "#FBEBCF",
  white: "#FFFFFF",
  gray: "#D7DAE0",
  steel: "#E3E7EC",
  dark: "#4B5058",
} as const;

/** Deeper tones for line-only icons, where the colour is the stroke itself. */
const DEEP: Record<string, string> = {
  red: "#E5534B",
  orange: "#EE8435",
  yellow: "#D9A400",
  green: "#2FA36B",
  teal: "#1F9E92",
  blue: "#3B8BEB",
  lavender: "#7C6FE6",
  pink: "#E0609B",
  brown: "#A86F3C",
};

type Hue = keyof typeof DEEP;

/** Colour by meaning where an icon has an obvious one. */
const ICON_HUE: Record<string, Hue> = {
  heart: "red",
  star: "yellow",
  bell: "yellow",
  bookmark: "lavender",
  lock: "yellow",
  key: "yellow",
  folder: "yellow",
  file: "blue",
  trash: "red",
  check: "green",
  "check-circle": "green",
  x: "red",
  plus: "green",
  minus: "red",
  alert: "orange",
  info: "blue",
  home: "orange",
  user: "lavender",
  search: "blue",
  settings: "lavender",
  mail: "blue",
  message: "lavender",
  camera: "lavender",
  image: "teal",
  cloud: "blue",
  cart: "orange",
  tag: "pink",
  "credit-card": "lavender",
  calendar: "red",
  clock: "blue",
  eye: "blue",
  "eye-off": "blue",
  leaf: "green",
  sun: "yellow",
  moon: "lavender",
  zap: "yellow",
  sparkles: "yellow",
  flame: "orange",
  droplet: "blue",
  "map-pin": "red",
  flag: "red",
  gift: "pink",
  lightbulb: "yellow",
  "shield-check": "green",
  download: "green",
  upload: "blue",
  share: "teal",
  play: "green",
  pause: "orange",
  volume: "teal",
  mic: "pink",
  headphones: "lavender",
  battery: "green",
  wifi: "blue",
  compass: "blue",
  anchor: "blue",
  target: "red",
};

const HUES = Object.keys(DEEP) as Hue[];

function hueFor(id: string): Hue {
  const known = ICON_HUE[id];
  if (known) return known;
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return HUES[h % HUES.length];
}

/** The colour-style nodes for an icon, or undefined when it has none (pixel art). */
export function colorNodes(def: IconDefinition): IconNode[] | undefined {
  if (def.color) return def.color;
  if (def.pixel) return undefined;
  const hue = hueFor(def.id);

  if (def.fill) {
    const tint = TINT[hue as keyof typeof TINT] ?? TINT.gray;
    const body: IconNode[] = [];
    const details: IconNode[] = [];
    for (const node of def.fill) {
      const paint = node.paint ?? "stroke";
      if (node.knockout) {
        // Cut-outs become ink details drawn on top of the colour.
        details.push({ ...node, knockout: false, paint: paint === "stroke" ? "stroke" : "fill" });
      } else if (paint === "fill" || paint === "fillOnly") {
        body.push({ ...node, tint });
      } else {
        body.push(node);
      }
    }
    return [...body, ...details];
  }

  return def.outline?.map((node) => ({ ...node, tint: DEEP[hue] }));
}
