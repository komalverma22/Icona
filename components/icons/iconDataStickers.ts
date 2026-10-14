import { TINT } from "./colorStyle";
import { spriteNodes, outlineSprite } from "./pixelArt";
import { ICON_SIZES, type CategoryId, type IconDefinition, type IconNode, type PixelGrid } from "./types";

/**
 * Character & style sets: Doodle Faces (hand-drawn heads with pops of colour),
 * Sketch Critters (loose black-line monsters and cats), Glass (dark + frosted
 * layers), Shadow (flat objects with a hard cast shadow) and Pixel Smiles
 * (1-bit 12×12 sprites that live in the Pixel Art set).
 *
 * Vector icons use one part list for both styles:
 *   shape → ink outline, soft tint in Color
 *   line  → stroke in both (optionally tinted in Color)
 *   dot   → small solid mark
 *   spot  → colour-only fill (blush, highlights); left out of Outline
 */

type Geo = { type: "path"; d: string } | { type: "circle"; cx: number; cy: number; r: number };
type Part = { outline?: IconNode; fill?: IconNode; color: IconNode };

const P = (d: string): Geo => ({ type: "path", d });
const C = (cx: number, cy: number, r: number): Geo => ({ type: "circle", cx, cy, r });

const node = (id: string, g: Geo, extra: Partial<IconNode> = {}) => ({ id, ...g, ...extra }) as IconNode;

const shape = (id: string, g: Geo, tint: string): Part => ({ outline: node(id, g), color: node(id, g, { paint: "fill", tint }) });
const line = (id: string, g: Geo, tint?: string): Part => ({ outline: node(id, g), color: node(id, g, tint ? { tint } : {}) });
const dot = (id: string, g: Geo, tint?: string): Part => ({
  outline: node(id, g, { paint: "fill" }),
  color: node(id, g, tint ? { paint: "fillOnly", tint } : { paint: "fill" }),
});
const spot = (id: string, g: Geo, tint: string): Part => ({ color: node(id, g, { paint: "fillOnly", tint }) });

function make(category: CategoryId, id: string, name: string, subcategory: string, tags: string[], parts: Part[]): IconDefinition {
  const fill = parts.flatMap((p) => (p.fill ? [p.fill] : []));
  return {
    id,
    name,
    category,
    subcategory,
    tags: [id, ...tags],
    sizes: ICON_SIZES,
    isNew: true,
    animation: "draw",
    outline: parts.flatMap((p) => (p.outline ? [p.outline] : [])),
    ...(fill.length ? { fill } : {}),
    color: parts.map((p) => p.color),
  };
}

/* Doodle Faces ------------------------------------------------------------ */

const RED = "#E5534B";
const BLUE = "#3B8BEB";
const GOLD = "#D9A400";
const INK = "#2B2D31";
const PINK = "#F7A8CB";

const SHOULDERS = "M4.5 21C4.5 17.8 7.8 16.3 12 16.3C16.2 16.3 19.5 17.8 19.5 21";
const face = (): Part[] => [
  dot("eye-l", C(9.6, 11.2, 0.75)),
  dot("eye-r", C(14.4, 11.2, 0.75)),
  line("smile", P("M10.7 13.4C11.4 14 12.6 14 13.3 13.4")),
  spot("blush-l", C(8.3, 13.2, 1.1), PINK),
  spot("blush-r", C(15.7, 13.2, 1.1), PINK),
];
const doodle = (id: string, name: string, tags: string[], parts: Part[]) =>
  make("doodle", id, name, "Faces", [...tags, "doodle", "avatar", "face", "character", "hand drawn"], parts);

const doodleDefs: IconDefinition[] = [
  doodle("doodle-beanie", "Beanie Kid", ["hat", "red", "kid"], [
    line("head", P("M6.9 9C6.6 12.7 8.6 16.2 12 16.2C15.4 16.2 17.4 12.7 17.1 9")),
    shape("hat", P("M6.8 9C6.5 5.8 8.7 4.2 12 4.2C15.3 4.2 17.5 5.8 17.2 9Z"), TINT.red),
    shape("pompom", C(12, 3.2, 1.4), TINT.red),
    ...face(),
    line("shoulders", P(SHOULDERS), RED),
  ]),
  doodle("doodle-glasses", "Round Glasses", ["glasses", "nerd", "blue", "smart"], [
    shape("head", C(12, 11, 5.2), TINT.white),
    line("hair", P("M7 8.5C8.5 6.5 11 6 12 6.3C13.5 5.8 16 6.5 17 8.5"), RED),
    line("lens-l", C(9.4, 11, 2.1), BLUE),
    line("lens-r", C(14.6, 11, 2.1), BLUE),
    line("bridge", P("M11.5 11H12.5"), BLUE),
    line("smile", P("M10.8 14.2C11.5 14.8 12.5 14.8 13.2 14.2")),
    line("shoulders", P(SHOULDERS), BLUE),
  ]),
  doodle("doodle-sunny", "Sunny Kid", ["sun", "happy", "yellow", "bright"], [
    line("rays", P("M12 1.8V3.4M7.3 3.2L8.2 4.5M16.7 3.2L15.8 4.5M3.8 6.4L5.1 7.1M20.2 6.4L18.9 7.1"), GOLD),
    shape("head", C(12, 11.2, 5), TINT.yellow),
    dot("eye-l", C(9.9, 11, 0.75)),
    dot("eye-r", C(14.1, 11, 0.75)),
    line("smile", P("M10.8 13.2C11.5 13.8 12.5 13.8 13.2 13.2")),
    spot("blush-l", C(8.7, 13, 1), TINT.orange),
    spot("blush-r", C(15.3, 13, 1), TINT.orange),
    line("shoulders", P(SHOULDERS), GOLD),
  ]),
  doodle("doodle-bob", "Bob Cut", ["hair", "girl", "black hair"], [
    shape("head", C(12, 11.2, 5), TINT.white),
    shape("hair", P("M6.8 10C6.5 6.5 8.8 4.8 12 4.8C15.2 4.8 17.5 6.5 17.2 10C15 9.8 11 9 9.5 7C9 8.5 8 9.6 6.8 10Z"), TINT.dark),
    line("lock-l", P("M6.8 10V14.5"), INK),
    line("lock-r", P("M17.2 10V14.5"), INK),
    ...face(),
    line("shoulders", P(SHOULDERS)),
  ]),
  doodle("doodle-pigtails", "Pigtails", ["hair", "girl", "surprised"], [
    shape("tail-l", C(5.3, 11.5, 2.2), TINT.dark),
    shape("tail-r", C(18.7, 11.5, 2.2), TINT.dark),
    shape("head", C(12, 11.2, 5), TINT.white),
    shape("hair", P("M7 9C8.5 6.5 15.5 6.5 17 9C14 8.4 10 8.4 7 9Z"), TINT.dark),
    dot("eye-l", C(9.9, 11.6, 0.75)),
    dot("eye-r", C(14.1, 11.6, 0.75)),
    line("mouth", C(12, 14, 0.9), RED),
    spot("blush-l", C(8.5, 13.2, 1), PINK),
    spot("blush-r", C(15.5, 13.2, 1), PINK),
    line("shoulders", P(SHOULDERS)),
  ]),
  doodle("doodle-hoodie", "Blue Hoodie", ["hood", "blue", "hoodie"], [
    shape("hood", P("M5.5 11.5C5.5 7.3 8.3 4.8 12 4.8C15.7 4.8 18.5 7.3 18.5 11.5C18.5 15.5 16.3 17 12 17C7.7 17 5.5 15.5 5.5 11.5Z"), TINT.blue),
    shape("face", P("M8.2 11C8.2 9 9.7 7.8 12 7.8C14.3 7.8 15.8 9 15.8 11C15.8 13.4 14.3 14.6 12 14.6C9.7 14.6 8.2 13.4 8.2 11Z"), TINT.white),
    dot("eye-l", C(10.7, 10.8, 0.6)),
    dot("eye-r", C(13.3, 10.8, 0.6)),
    line("smile", P("M11.2 12.6C11.7 13 12.3 13 12.8 12.6")),
    line("shoulders", P(SHOULDERS), BLUE),
  ]),
  doodle("doodle-bear", "Teddy Bear", ["bear", "animal", "cute"], [
    shape("ear-l", C(7, 7, 2), TINT.brown),
    shape("ear-r", C(17, 7, 2), TINT.brown),
    shape("head", P("M5.5 12C5.5 8.8 8.4 7 12 7C15.6 7 18.5 8.8 18.5 12C18.5 15.4 15.6 17.5 12 17.5C8.4 17.5 5.5 15.4 5.5 12Z"), TINT.cream),
    spot("muzzle", P("M10 13.3C10 12.5 10.9 12 12 12C13.1 12 14 12.5 14 13.3C14 14.3 13.1 14.8 12 14.8C10.9 14.8 10 14.3 10 13.3Z"), TINT.brown),
    dot("nose", C(12, 12.6, 0.6)),
    dot("eye-l", C(9, 10.4, 0.7)),
    dot("eye-r", C(15, 10.4, 0.7)),
    line("body", P("M7 21C7 19.2 9 18 12 18C15 18 17 19.2 17 21")),
  ]),
  doodle("doodle-mouse", "Red Mouse", ["mouse", "animal", "cute"], [
    shape("ear-l", C(6.5, 6.6, 2.6), TINT.pink),
    shape("ear-r", C(17.5, 6.6, 2.6), TINT.pink),
    shape("head", P("M6 12.5C6 9.5 8.7 8 12 8C15.3 8 18 9.5 18 12.5C18 15.8 15.3 17.5 12 17.5C8.7 17.5 6 15.8 6 12.5Z"), TINT.white),
    dot("eye-l", C(9.6, 11.8, 0.7)),
    dot("eye-r", C(14.4, 11.8, 0.7)),
    dot("nose", C(12, 13.6, 0.8), RED),
    line("whiskers", P("M3.5 13L6 13.4M3.5 15.5L6.2 14.8M20.5 13L18 13.4M20.5 15.5L17.8 14.8")),
    line("body", P("M7 21C7 19.4 9 18.4 12 18.4C15 18.4 17 19.4 17 21"), RED),
  ]),
  doodle("doodle-cloud", "Cloud Buddy", ["cloud", "weather", "surprised"], [
    shape("body", P("M7 18C4.8 18 3.5 16.4 3.5 14.5C3.5 12.8 4.7 11.5 6.3 11.2C6.4 8.5 8.6 6.5 11.3 6.5C13.4 6.5 15.1 7.7 15.9 9.4C18.4 9.4 20.5 11.3 20.5 13.9C20.5 16.2 18.8 18 16.5 18Z"), TINT.white),
    dot("eye-l", C(10, 12.8, 0.7)),
    dot("eye-r", C(14, 12.8, 0.7)),
    line("mouth", C(12, 15.4, 0.8), RED),
    spot("blush-l", C(8.2, 14.6, 1), PINK),
    spot("blush-r", C(15.8, 14.6, 1), PINK),
    line("spark", P("M19.5 2.8V5M17.6 3.9L16.6 2.8M21.4 3.9L22.4 2.8"), GOLD),
  ]),
  doodle("doodle-red-hood", "Red Hood", ["hood", "glasses", "red"], [
    shape("hood", P("M5.5 20V11C5.5 7.2 8.3 4.5 12 4.5C15.7 4.5 18.5 7.2 18.5 11V20Z"), TINT.red),
    shape("face", P("M8.3 11.5C8.3 9.4 9.9 8.2 12 8.2C14.1 8.2 15.7 9.4 15.7 11.5C15.7 14 14.1 15.2 12 15.2C9.9 15.2 8.3 14 8.3 11.5Z"), TINT.white),
    line("lens-l", C(10.4, 11.3, 1.5), INK),
    line("lens-r", C(13.6, 11.3, 1.5), INK),
    line("smile", P("M11 13.7C11.6 14.1 12.4 14.1 13 13.7")),
  ]),
];

/* Sketch Critters --------------------------------------------------------- */

const sketch = (id: string, name: string, tags: string[], parts: Part[]) =>
  make("sketch", id, name, "Critters", [...tags, "sketch", "doodle", "monster", "cute", "hand drawn"], parts);

const pupils = (y: number): Part[] => [dot("pupil-l", C(9.4, y, 0.7)), dot("pupil-r", C(14.6, y, 0.7))];

const CAT_HEAD =
  "M4.5 9.5L5 3.8L9.3 6.4C10.9 5.9 13.1 5.9 14.7 6.4L19 3.8L19.5 9.5C20.4 11 20.6 12.6 20 14.4C19 18.2 15.8 20.2 12 20.2C8.2 20.2 5 18.2 4 14.4C3.4 12.6 3.6 11 4.5 9.5Z";

const sketchDefs: IconDefinition[] = [
  sketch("sketch-cat", "Sketch Cat", ["cat", "kitten", "pet"], [
    shape("head", P(CAT_HEAD), TINT.white),
    line("eye-l", C(9, 12.3, 1.9)),
    line("eye-r", C(15, 12.3, 1.9)),
    ...pupils(12.4),
    line("nose", P("M11.3 15.6H12.7")),
    line("whiskers", P("M3.5 16L1.6 15.5M20.5 16L22.4 15.5")),
  ]),
  sketch("sketch-bunny", "Sketch Bunny", ["rabbit", "bunny", "pet"], [
    shape("ear-l", P("M8 10C6.4 6.4 6.6 2.8 8.2 2.8C9.8 2.8 10.8 6.2 10.5 9.8Z"), TINT.white),
    shape("ear-r", P("M16 10C17.6 6.4 17.4 2.8 15.8 2.8C14.2 2.8 13.2 6.2 13.5 9.8Z"), TINT.white),
    shape("head", P("M6 14.5C6 11.5 8.5 9.5 12 9.5C15.5 9.5 18 11.5 18 14.5C18 18 15.5 20.5 12 20.5C8.5 20.5 6 18 6 14.5Z"), TINT.white),
    dot("eye-l", C(9.6, 14.4, 0.8)),
    dot("eye-r", C(14.4, 14.4, 0.8)),
    line("mouth", P("M11 16.9C11.5 17.4 12.5 17.4 13 16.9")),
  ]),
  sketch("sketch-ghost", "Sketch Ghost", ["ghost", "spooky", "halloween"], [
    shape("body", P("M5.5 20.5V11C5.5 7.4 8.4 4.5 12 4.5C15.6 4.5 18.5 7.4 18.5 11V20.5L16.2 18.7L14 20.5L12 18.7L10 20.5L7.8 18.7Z"), TINT.white),
    dot("eye-l", C(9.5, 11, 1)),
    dot("eye-r", C(14.5, 11, 1)),
    line("mouth", P("M11 14C11.6 14.6 12.4 14.6 13 14")),
  ]),
  sketch("sketch-cyclops", "Cyclops", ["one eye", "monster", "alien"], [
    shape("body", P("M6 19.5C5 14 5.5 8.5 8.5 5.8C10.5 4 13.5 4 15.5 5.8C18.5 8.5 19 14 18 19.5C16 20.3 13.5 20.3 12 19.5C10.5 20.3 8 20.3 6 19.5Z"), TINT.white),
    line("eye", C(12, 11, 3.4)),
    dot("pupil", C(12.6, 11, 1.5)),
    line("mouth", P("M10.8 16.2C11.5 16.8 12.5 16.8 13.2 16.2")),
  ]),
  sketch("sketch-chomper", "Chomper", ["pac-man", "game", "mouth", "eat"], [
    shape("body", P("M18.55 7.4A8 8 0 1 0 18.55 16.6L12 12Z"), TINT.yellow),
    dot("eye", C(11.5, 7.6, 1)),
    dot("pellet", C(20.6, 12, 0.9)),
  ]),
  sketch("sketch-robot", "Sketch Robot", ["robot", "bot", "ai", "machine"], [
    line("antenna-l", P("M8 8.5V5.8")),
    line("antenna-r", P("M16 8.5V5.8")),
    shape("bulb-l", C(8, 4.6, 1.2), TINT.white),
    shape("bulb-r", C(16, 4.6, 1.2), TINT.white),
    shape("head", P("M5 8.5H19V18C19 19.1 18.1 20 17 20H7C5.9 20 5 19.1 5 18Z"), TINT.white),
    line("eye-l", C(9.5, 13.4, 1.8)),
    line("eye-r", C(14.5, 13.4, 1.8)),
    dot("pupil-l", C(9.5, 13.4, 0.6)),
    dot("pupil-r", C(14.5, 13.4, 0.6)),
    line("mouth", P("M10 17.3H14")),
  ]),
  sketch("sketch-fluff", "Fluffy Cat", ["cat", "fluffy", "fur", "pet"], [
    line("ears", P("M7 8.5L7.5 4.5L10.5 7M17 8.5L16.5 4.5L13.5 7")),
    shape("fur", P("M5 10C3.5 10 3 12 4 13C3 14.5 4 16.5 5.5 16.5C5.5 18.5 7.5 19.5 9 18.8C10 20.3 12.5 20.3 13.5 19C15 20 17 19.2 17.3 17.4C19 17.6 20.3 16 19.6 14.5C21 13.5 20.8 11.4 19.2 10.8C19.6 9.2 18 8 16.5 8.5C15.6 6.8 13.6 6.8 12.5 7.7C11.4 6.5 9.4 6.8 8.8 8.3C7 8 5.8 9 5 10Z"), TINT.white),
    line("eye-l", C(9.2, 13, 1.6)),
    line("eye-r", C(14.8, 13, 1.6)),
    dot("pupil-l", C(9.2, 13.1, 0.6)),
    dot("pupil-r", C(14.8, 13.1, 0.6)),
    line("nose", P("M11.4 15.6H12.6")),
  ]),
  sketch("sketch-apple", "Apple Buddy", ["apple", "fruit", "food", "monster"], [
    shape("body", P("M12 8C10.5 6.8 7.8 6.7 6.2 8.3C4.3 10.2 4.6 14.1 6.3 17.1C7.6 19.5 9.4 21 11 20.7C11.5 20.6 11.8 20.4 12 20.4C12.2 20.4 12.5 20.6 13 20.7C14.6 21 16.4 19.5 17.7 17.1C19.4 14.1 19.7 10.2 17.8 8.3C16.2 6.7 13.5 6.8 12 8Z"), TINT.red),
    line("stem", P("M12 8C12 6.3 12.6 4.9 13.6 4")),
    line("eye-l", P("M9.2 11.8V13.8")),
    line("eye-r", P("M14.8 11.8V13.8")),
  ]),
  sketch("sketch-mushroom", "Mushroom", ["mushroom", "toadstool", "nature"], [
    shape("stem", P("M8.5 12.5V17C8.5 18.4 10 19.5 12 19.5C14 19.5 15.5 18.4 15.5 17V12.5"), TINT.cream),
    shape("cap", P("M4 11C4 7 7.5 4.5 12 4.5C16.5 4.5 20 7 20 11C20 11.8 19.4 12.5 18.5 12.5H5.5C4.6 12.5 4 11.8 4 11Z"), TINT.white),
    dot("eye-l", C(9.3, 8.8, 1)),
    dot("eye-r", C(14.7, 8.8, 1)),
    line("gills", P("M10.2 14.5V17.5M12 14.5V18M13.8 14.5V17.5")),
  ]),
  sketch("sketch-grin", "Grin Monster", ["monster", "teeth", "smile"], [
    shape("body", P("M5.5 9C5.5 6.8 7.2 5 9.4 5H14.6C16.8 5 18.5 6.8 18.5 9V16C18.5 18.2 16.8 20 14.6 20H9.4C7.2 20 5.5 18.2 5.5 16Z"), TINT.white),
    line("eye-l", C(9.5, 10, 1.4)),
    line("eye-r", C(14.5, 10, 1.4)),
    dot("pupil-l", C(9.5, 10, 0.5)),
    dot("pupil-r", C(14.5, 10, 0.5)),
    shape("mouth", P("M8 14H16C16 17 14.3 18.5 12 18.5C9.7 18.5 8 17 8 14Z"), TINT.dark),
  ]),
  {
    id: "sketch-black-cat",
    name: "Black Cat",
    category: "sketch",
    subcategory: "Critters",
    tags: ["sketch-black-cat", "cat", "black", "night", "sketch", "monster", "cute"],
    sizes: ICON_SIZES,
    isNew: true,
    animation: "draw",
    outline: [
      node("head", P(CAT_HEAD)),
      node("eye-l", C(9, 12.8, 1.9)),
      node("eye-r", C(15, 12.8, 1.9)),
      node("pupil-l", C(9.3, 12.9, 0.8), { paint: "fill" }),
      node("pupil-r", C(14.7, 12.9, 0.8), { paint: "fill" }),
    ],
    fill: [
      node("head", P(CAT_HEAD), { paint: "fill" }),
      node("eye-l", C(9, 12.8, 1.9), { knockout: true, paint: "fill" }),
      node("eye-r", C(15, 12.8, 1.9), { knockout: true, paint: "fill" }),
      node("pupil-l", C(9.3, 12.9, 0.8), { paint: "fillOnly" }),
      node("pupil-r", C(14.7, 12.9, 0.8), { paint: "fillOnly" }),
    ],
    color: [
      node("head", P(CAT_HEAD), { paint: "fill", tint: TINT.dark }),
      node("eye-l", C(9, 12.8, 1.9), { paint: "fill", tint: TINT.white }),
      node("eye-r", C(15, 12.8, 1.9), { paint: "fill", tint: TINT.white }),
      node("pupil-l", C(9.3, 12.9, 0.8), { paint: "fill" }),
      node("pupil-r", C(14.7, 12.9, 0.8), { paint: "fill" }),
    ],
  },
];

/* Glass ------------------------------------------------------------------- */

const DARK = "#33363B";
const FROST = "#DADDE2";

/** A glass layer: dark (solid) or frost (see-through). Outline style draws both as strokes. */
const glassLayer = (id: string, g: Geo, tone: "dark" | "frost"): Part => ({
  outline: node(id, g),
  fill: node(id, g, tone === "dark" ? { paint: "fillOnly" } : { paint: "fillOnly", attrs: { fillOpacity: 0.38 } }),
  color: node(id, g, { paint: "fillOnly", tint: tone === "dark" ? DARK : FROST }),
});
const glassLine = (id: string, g: Geo): Part => ({ outline: node(id, g), fill: node(id, g), color: node(id, g, { tint: DARK }) });

const glass = (id: string, name: string, tags: string[], parts: Part[]) =>
  make("glass", id, name, "Frosted", [...tags, "glass", "frosted", "3d", "gradient"], parts);

const glassDefs: IconDefinition[] = [
  glass("glass-folder", "Glass Folder", ["folder", "files", "directory"], [
    glassLayer("back", P("M3.5 7.5C3.5 6.4 4.4 5.5 5.5 5.5H9.2L11 7.5H18.5C19.6 7.5 20.5 8.4 20.5 9.5V17.5C20.5 18.6 19.6 19.5 18.5 19.5H5.5C4.4 19.5 3.5 18.6 3.5 17.5Z"), "dark"),
    glassLayer("front", P("M3.5 11.5C3.5 10.4 4.4 9.5 5.5 9.5H18.5C19.6 9.5 20.5 10.4 20.5 11.5V17.5C20.5 18.6 19.6 19.5 18.5 19.5H5.5C4.4 19.5 3.5 18.6 3.5 17.5Z"), "frost"),
  ]),
  glass("glass-layers", "Glass Layers", ["layers", "stack", "design"], [
    glassLayer("bottom", P("M12 9L20.5 14L12 19L3.5 14Z"), "dark"),
    glassLayer("top", P("M12 4L20.5 9L12 14L3.5 9Z"), "frost"),
  ]),
  glass("glass-bag", "Glass Bag", ["bag", "shop", "shopping", "store"], [
    glassLine("handle", P("M8.5 8V6.5C8.5 4.8 10 3.5 12 3.5C14 3.5 15.5 4.8 15.5 6.5V8")),
    glassLayer("body", P("M5.5 8H18.5C19.1 8 19.5 8.4 19.5 9V18.5C19.5 19.6 18.6 20.5 17.5 20.5H6.5C5.4 20.5 4.5 19.6 4.5 18.5V9C4.5 8.4 4.9 8 5.5 8Z"), "dark"),
    glassLayer("pocket", P("M11.5 13H19C19.6 13 20 13.4 20 14V19.5C20 20.3 19.3 21 18.5 21H13C12.2 21 11.5 20.3 11.5 19.5Z"), "frost"),
  ]),
  glass("glass-video", "Glass Camera", ["video", "camera", "record", "film"], [
    glassLayer("body", P("M3.5 8.5C3.5 7.4 4.4 6.5 5.5 6.5H13C14.1 6.5 15 7.4 15 8.5V15.5C15 16.6 14.1 17.5 13 17.5H5.5C4.4 17.5 3.5 16.6 3.5 15.5Z"), "frost"),
    glassLayer("lens", P("M15 10.5L19.4 8.2C19.9 7.9 20.5 8.3 20.5 8.9V15.1C20.5 15.7 19.9 16.1 19.4 15.8L15 13.5Z"), "dark"),
    glassLayer("light", C(6.5, 9.5, 0.9), "dark"),
  ]),
  glass("glass-image", "Glass Chart", ["image", "chart", "analytics", "photo"], [
    glassLayer("frame", P("M6 4.5H18C19.1 4.5 20 5.4 20 6.5V17.5C20 18.6 19.1 19.5 18 19.5H6C4.9 19.5 4 18.6 4 17.5V6.5C4 5.4 4.9 4.5 6 4.5Z"), "dark"),
    glassLayer("ground", P("M4 14L9 11.5L12.5 13.5L20 9.5V17.5C20 18.6 19.1 19.5 18 19.5H6C4.9 19.5 4 18.6 4 17.5Z"), "frost"),
  ]),
  glass("glass-wand", "Glass Wand", ["magic", "wand", "ai", "sparkle", "effects"], [
    glassLine("stick", P("M3.5 20.5L11 13")),
    glassLayer("star", P("M15.5 3L16.9 6.4L20.5 7.2L17.8 9.6L18.5 13.2L15.5 11.4L12.5 13.2L13.2 9.6L10.5 7.2L14.1 6.4Z"), "frost"),
    glassLayer("spark-a", P("M6 4L6.9 6.1L9 7L6.9 7.9L6 10L5.1 7.9L3 7L5.1 6.1Z"), "dark"),
    glassLayer("spark-b", P("M18.5 15.5L19.2 17.1L20.8 17.8L19.2 18.5L18.5 20.1L17.8 18.5L16.2 17.8L17.8 17.1Z"), "dark"),
  ]),
  glass("glass-pen", "Glass Pen", ["pen", "write", "edit", "draw"], [
    glassLayer("body", P("M16.5 4.5L19.5 7.5L9 18L5 19L6 15Z"), "frost"),
    glassLayer("tip", P("M6 15L9 18L5 19Z"), "dark"),
    glassLayer("cap", P("M19.5 7.5L21 6C21.6 5.4 21.6 4.5 21 3.9L20.1 3C19.5 2.4 18.6 2.4 18 3L16.5 4.5Z"), "dark"),
  ]),
  glass("glass-shapes", "Glass Shapes", ["shapes", "circle", "geometry", "design"], [
    glassLayer("circle-a", C(9, 9, 4.7), "dark"),
    glassLayer("circle-b", C(15, 15, 4.7), "frost"),
    glassLayer("tri-up", P("M18.5 3.5L20.5 7H16.5Z"), "dark"),
    glassLayer("tri-down", P("M5.5 20.5L3.5 17H7.5Z"), "dark"),
  ]),
];

/* Shadow ------------------------------------------------------------------ */

const shadow = (id: string, d: string): Part => {
  const n = node(id, P(d), { paint: "fillOnly" });
  return { outline: n, color: n };
};
const sh = (id: string, name: string, tags: string[], parts: Part[]) =>
  make("shadow", id, name, "Objects", [...tags, "shadow", "isometric", "flat", "cast shadow"], parts);

const shadowDefs: IconDefinition[] = [
  sh("shadow-folder", "Shadow Folder", ["folder", "check", "done", "files"], [
    shadow("shadow", "M3 21.5L7 19.5V12.5L3 15.5Z"),
    shape("flap", P("M9 5.5H13L14.5 7.5H20.5V11H9Z"), TINT.white),
    shape("front", P("M7 9.5H12.5L14 11.5H21V19.5H7Z"), TINT.white),
    line("check", P("M11 15.5L13 17.5L17 13.5")),
  ]),
  sh("shadow-calendar", "Shadow Calendar", ["calendar", "date", "star", "event"], [
    shadow("shadow", "M3 21.5L8 19.5V12L3 15Z"),
    shape("page", P("M8 8.5H20V19.5H8Z"), TINT.white),
    shape("top", P("M8 8.5L10 5.5H18L20 8.5Z"), TINT.white),
    dot("star", P("M14 11.5L14.9 13.6L17.2 13.8L15.5 15.3L16 17.5L14 16.3L12 17.5L12.5 15.3L10.8 13.8L13.1 13.6Z")),
  ]),
  sh("shadow-case", "Shadow Case", ["briefcase", "lock", "work", "secure", "bag"], [
    shadow("shadow", "M3 21.5L7 20V12.5L3 15.5Z"),
    line("handle", P("M11.5 9.5V7C11.5 6.2 12.2 5.5 13 5.5H15C15.8 5.5 16.5 6.2 16.5 7V9.5")),
    shape("body", P("M7 9.5H21V20H7Z"), TINT.white),
    dot("lock", C(14, 14.2, 1.2)),
    line("keyhole", P("M14 15.4V17.2")),
  ]),
  sh("shadow-mail", "Shadow Mail", ["mail", "email", "envelope", "message"], [
    shadow("shadow", "M3 21L7 19.5V11.5L3 14.5Z"),
    shape("back", P("M7 11L14 6.5L21 11V19.5H7Z"), TINT.white),
    line("flap", P("M7 11L14 15.5L21 11")),
  ]),
  sh("shadow-document", "Shadow Document", ["document", "file", "page", "text", "paper"], [
    shadow("shadow", "M4.5 21.5L9 20V9L4.5 12.5Z"),
    shape("page", P("M9 5.5H18.5V20H9Z"), TINT.white),
    line("text", P("M11.5 9.5H16M11.5 12.5H16M11.5 15.5H14.5")),
  ]),
  sh("shadow-bars", "Shadow Bars", ["chart", "bars", "stats", "growth", "analytics"], [
    shadow("shadow", "M3.5 22L8 20V15.5L3.5 18.5Z"),
    shape("bar-a", P("M8 15H11V20H8Z"), TINT.white),
    shape("bar-b", P("M12.5 11H15.5V20H12.5Z"), TINT.white),
    shape("bar-c", P("M17 7H20V20H17Z"), TINT.white),
  ]),
  sh("shadow-bell", "Shadow Bell", ["bell", "notification", "alert", "ring"], [
    shadow("shadow", "M3 20.5L8.5 18.5V12L3 15.5Z"),
    dot("top", C(14, 5.8, 0.8)),
    shape("dome", P("M8.5 18C8.5 13 9.5 7.5 14 7.5C18.5 7.5 19.5 13 19.5 18Z"), TINT.white),
    line("rim", P("M7 18H21")),
    line("clapper", P("M12.5 20C12.5 21.2 13.2 21.8 14 21.8C14.8 21.8 15.5 21.2 15.5 20")),
  ]),
];

/* Pixel Smiles (join the Pixel Art set) ----------------------------------- */

const TOAST: PixelGrid = [
  "............",
  "............",
  "..########..",
  ".#++++++++#.",
  "#++#++++#++#",
  "#++++++++++#",
  ".#++#++#++#.",
  ".#+++##+++#.",
  ".#++++++++#.",
  ".##########.",
  "............",
  "............",
];
const COMPUTER: PixelGrid = [
  "............",
  ".##########.",
  ".#++++++++#.",
  ".#++#++#++#.",
  ".#++++++++#.",
  ".#++#++#++#.",
  ".#+++##+++#.",
  ".##########.",
  "...######...",
  ".##########.",
  ".#++++++++#.",
  ".##########.",
];
const MUG: PixelGrid = [
  "............",
  "....#..#....",
  "...#..#.....",
  "..########..",
  "..#+#++#+#..",
  "..#++++++###",
  "..#+#++#+#.#",
  "..#++##++###",
  "..#++++++#..",
  "..########..",
  "............",
  "............",
];
const PHONE: PixelGrid = [
  "............",
  "..########..",
  "..#++++++#..",
  "..#++++++#..",
  "..#+#++#+#..",
  "..#++++++#..",
  "..#+#++#+#..",
  "..#++##++#..",
  "..#++++++#..",
  "..#++++++#..",
  "..########..",
  "............",
];
const ICE_POP: PixelGrid = [
  "............",
  "...######...",
  "..#++++++#..",
  "..#+#++#+#..",
  "..#++++++#..",
  "..#+#++#+#..",
  "..#++##++#..",
  "..#++++++#..",
  "..#++++++#..",
  "..########..",
  ".....##.....",
  ".....##.....",
];
const NOTEPAD: PixelGrid = [
  "............",
  "..#.#.#.#.#.",
  ".##########.",
  ".#++++++++#.",
  ".#++#++#++#.",
  ".#++++++++#.",
  ".#++#++#++#.",
  ".#+++##+++#.",
  ".#++++++++#.",
  ".#+######+#.",
  ".##########.",
  "............",
];

const SMILES: { id: string; name: string; tags: string[]; sprite: PixelGrid }[] = [
  { id: "pixel-smile-toast", name: "Happy Toast", tags: ["toast", "bread", "breakfast", "food"], sprite: TOAST },
  { id: "pixel-smile-computer", name: "Happy Computer", tags: ["computer", "pc", "desktop", "retro"], sprite: COMPUTER },
  { id: "pixel-smile-mug", name: "Happy Mug", tags: ["mug", "coffee", "tea", "cup"], sprite: MUG },
  { id: "pixel-smile-phone", name: "Happy Phone", tags: ["phone", "mobile", "smartphone", "device"], sprite: PHONE },
  { id: "pixel-smile-pop", name: "Happy Ice Pop", tags: ["ice pop", "popsicle", "summer", "dessert"], sprite: ICE_POP },
  { id: "pixel-smile-notepad", name: "Happy Notepad", tags: ["notepad", "notes", "memo", "write"], sprite: NOTEPAD },
];

const pixelSmileDefs: IconDefinition[] = SMILES.map((s) => ({
  id: s.id,
  name: s.name,
  category: "pixel",
  subcategory: "Smiles",
  tags: [...s.tags, "smile", "kawaii", "pixel", "pixel art", "retro", "1-bit"],
  sizes: ICON_SIZES,
  isNew: true,
  pixel: { sprite: s.sprite },
  outline: spriteNodes(outlineSprite(s.sprite)),
  fill: spriteNodes(s.sprite),
}));

export const stickerIconDefinitions: IconDefinition[] = [...doodleDefs, ...sketchDefs, ...glassDefs, ...shadowDefs, ...pixelSmileDefs];
