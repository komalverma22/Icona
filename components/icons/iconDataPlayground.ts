import { ICON_SIZES, type IconDefinition, type IconNode } from "./types";

/**
 * Playground set - icons picked for their motion potential (vehicles,
 * celebrations, physics, creative tools). Their parts are split into named
 * nodes so context-aware recipes can animate them (car spokes and speed lines,
 * rocket flame, popper streamers). `animationOnly` nodes only appear while a
 * recipe plays.
 */

type Extra = Omit<Partial<IconNode>, "type" | "id">;

const p = (id: string, d: string, extra: Extra = {}): IconNode => ({ id, type: "path", d, ...extra }) as IconNode;
const c = (id: string, cx: number, cy: number, r: number, extra: Extra = {}): IconNode =>
  ({ id, type: "circle", cx, cy, r, ...extra }) as IconNode;

const FILL = { paint: "fill" } as const;
const KO = { knockout: true } as const;
const KO_FILL = { knockout: true, paint: "fill" } as const;
const ONLY = { animationOnly: true } as const;
const sizes = ICON_SIZES;
const isNew = true;

const CAR_BODY =
  "M5 16.5H3.5V12.8C3.5 12.1 4 11.5 4.7 11.3L7.5 10.5L9.6 7.6C9.9 7.2 10.3 7 10.8 7H15C15.5 7 15.9 7.2 16.2 7.6L18.5 10.5L19.4 10.7C20.1 10.9 20.5 11.5 20.5 12.2V16.5H19";
const CAR_EXTRAS: IconNode[] = [
  p("spokeL", "M5.6 16.5H8.4M7 15.1V17.9", ONLY),
  p("spokeR", "M15.6 16.5H18.4M17 15.1V17.9", ONLY),
  p("sl1", "M2.4 9.5H0.4", ONLY),
  p("sl2", "M2.4 12.5H0.2", ONLY),
  p("sl3", "M2.4 15.5H0.9", ONLY),
  p("sr1", "M21.6 9.5H23.6", ONLY),
  p("sr2", "M21.6 12.5H23.8", ONLY),
  p("sr3", "M21.6 15.5H23.1", ONLY),
];
const ROCKET = "M12 2.5C14.8 4.6 16 7.8 16 11.5V16H8V11.5C8 7.8 9.2 4.6 12 2.5Z";
const ROCKET_FIN_L = "M8 12.5L5.5 15V18.5L8 17";
const ROCKET_FIN_R = "M16 12.5L18.5 15V18.5L16 17";
const ROCKET_FLAME = "M10.8 18.5C10.8 20 11.4 21.2 12 22C12.6 21.2 13.2 20 13.2 18.5";
const PLANE = "M20.5 3.5L3.5 10.5L10.5 13.5L13.5 20.5Z";
const CONE = "M3.5 20.5L8 9L15 16Z";
const GHOST = "M5.5 20.5V11A6.5 6.5 0 0 1 18.5 11V20.5L16.3 18.8L14.2 20.5L12 18.8L9.8 20.5L7.7 18.8Z";
const MAGNET = "M6 3.5H9.5V12A2.5 2.5 0 0 0 14.5 12V3.5H18V12A6 6 0 0 1 6 12Z";
const CUP = "M5 9.5H16V15A4.5 4.5 0 0 1 11.5 19.5H9.5A4.5 4.5 0 0 1 5 15Z";
const CANOPY = "M3 12A9 9 0 0 1 21 12C19.5 11 18 11 16.5 12C15 11 13.5 11 12 12C10.5 11 9 11 7.5 12C6 11 4.5 11 3 12Z";
const HORN = "M4 9.5H7.5L16.5 4.5V18.5L7.5 13.5H4A0.5 0.5 0 0 1 3.5 13V10A0.5 0.5 0 0 1 4 9.5Z";
const BUG = "M8 11A4 4 0 0 1 16 11V15A4 4 0 0 1 8 15Z";
const SPARK = "M18 2.5L18.8 4.7L21 5.5L18.8 6.3L18 8.5L17.2 6.3L15 5.5L17.2 4.7Z";
const DIE = "M6.5 3.5H17.5A3 3 0 0 1 20.5 6.5V17.5A3 3 0 0 1 17.5 20.5H6.5A3 3 0 0 1 3.5 17.5V6.5A3 3 0 0 1 6.5 3.5Z";
const ORBIT = "M3 12A9 3.5 0 1 1 21 12A9 3.5 0 1 1 3 12";
const BALLOON = "M12 3A6 6 0 0 1 18 9C18 12.8 15 15.5 12 15.5C9 15.5 6 12.8 6 9A6 6 0 0 1 12 3Z";
const LEAF_L = "M12 14C8 14 5.5 11.5 5.5 8C9.5 8 12 10.5 12 14Z";
const LEAF_R = "M12 11C12 7.5 14.5 5 18.5 5C18.5 8.5 16 11 12 11Z";
const PIPETTE_TUBE = "M12.8 9.2L5.6 16.4C5.2 16.8 5 17.4 5 17.9V19H6.1C6.6 19 7.2 18.8 7.6 18.4L14.8 11.2";
const NIB = "M12 3.5L17 11L14 18.5H10L7 11Z";
const PALETTE =
  "M12 3.5C7.3 3.5 3.5 7.3 3.5 12S7.3 20.5 12 20.5C13 20.5 13.5 19.8 13.5 19C13.5 18.2 13 17.8 13 17C13 16.2 13.6 15.5 14.5 15.5H16.5C18.7 15.5 20.5 13.7 20.5 11.5C20.5 7.1 16.7 3.5 12 3.5Z";

export const playgroundIconDefinitions: IconDefinition[] = [
  {
    id: "car",
    name: "Car",
    category: "maps",
    subcategory: "Transport",
    tags: ["car", "drive", "vehicle", "transport", "ride", "delivery", "auto"],
    sizes,
    isNew,
    animation: "carWheels",
    outline: [p("body", CAR_BODY), p("base", "M9 16.5H15"), p("window", "M7.5 10.5H18.5"), c("wheelL", 7, 16.5, 2), c("wheelR", 17, 16.5, 2), ...CAR_EXTRAS],
    fill: [
      p("body", CAR_BODY, FILL),
      p("window", "M7.5 10.5H18.5", KO),
      c("wheelL", 7, 16.5, 2, FILL),
      c("wheelR", 17, 16.5, 2, FILL),
      c("hubL", 7, 16.5, 0.6, KO_FILL),
      c("hubR", 17, 16.5, 0.6, KO_FILL),
      ...CAR_EXTRAS,
    ],
  },
  {
    id: "rocket",
    name: "Rocket",
    category: "developer",
    subcategory: "Deploy",
    tags: ["rocket", "launch", "deploy", "ship", "release", "startup", "space"],
    sizes,
    isNew,
    animation: "rocketFlame",
    outline: [p("body", ROCKET), c("window", 12, 9.5, 1.6), p("finL", ROCKET_FIN_L), p("finR", ROCKET_FIN_R), p("nozzle", "M10.5 16V18H13.5V16"), p("flame", ROCKET_FLAME, ONLY)],
    fill: [
      p("body", ROCKET, FILL),
      c("window", 12, 9.5, 1.6, KO_FILL),
      p("finL", ROCKET_FIN_L, FILL),
      p("finR", ROCKET_FIN_R, FILL),
      p("nozzle", "M10.5 16V18H13.5V16", FILL),
      p("flame", ROCKET_FLAME, ONLY),
    ],
  },
  {
    id: "paper-plane",
    name: "Paper Plane",
    category: "communication",
    tags: ["paper plane", "send", "message", "submit", "fly", "dispatch"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("body", PLANE), p("fold", "M20.5 3.5L10.5 13.5")],
    fill: [p("body", PLANE, FILL), p("fold", "M20.5 3.5L10.5 13.5", KO)],
  },
  {
    id: "party-popper",
    name: "Party Popper",
    category: "social",
    subcategory: "Celebrate",
    tags: ["party", "celebrate", "confetti", "congrats", "success", "launch", "tada"],
    sizes,
    isNew,
    animation: "partyStreamers",
    outline: [
      p("cone", CONE),
      p("stripe", "M6.2 13.5L10.5 17.8"),
      p("s1", "M12 10.5C12.5 8 11.5 6 13 4.5"),
      p("s2", "M13.5 12C16 11 17 9 19.5 9.5"),
      p("s3", "M15 7.5C16 6 18 5.5 19 3.5"),
      c("d1", 8.5, 5.5, 0.6, FILL),
      c("d2", 20, 13, 0.6, FILL),
    ],
    fill: [
      p("cone", CONE, FILL),
      p("stripe", "M6.2 13.5L10.5 17.8", KO),
      p("s1", "M12 10.5C12.5 8 11.5 6 13 4.5"),
      p("s2", "M13.5 12C16 11 17 9 19.5 9.5"),
      p("s3", "M15 7.5C16 6 18 5.5 19 3.5"),
      c("d1", 8.5, 5.5, 0.6, FILL),
      c("d2", 20, 13, 0.6, FILL),
    ],
  },
  {
    id: "ghost",
    name: "Ghost",
    category: "social",
    subcategory: "Fun",
    tags: ["ghost", "spooky", "halloween", "hidden", "anonymous", "boo", "incognito"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("body", GHOST), c("eyeL", 9.5, 11, 1, FILL), c("eyeR", 14.5, 11, 1, FILL)],
    fill: [p("body", GHOST, FILL), c("eyeL", 9.5, 11, 1, KO_FILL), c("eyeR", 14.5, 11, 1, KO_FILL)],
  },
  {
    id: "magnet",
    name: "Magnet",
    category: "ui",
    subcategory: "Interaction",
    tags: ["magnet", "snap", "attract", "align", "pull", "sticky", "magnetic"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("body", MAGNET), p("b1", "M6 7H9.5"), p("b2", "M14.5 7H18")],
    fill: [p("body", MAGNET, FILL), p("b1", "M6 7H9.5", KO), p("b2", "M14.5 7H18", KO)],
  },
  {
    id: "coffee",
    name: "Coffee",
    category: "social",
    subcategory: "Lifestyle",
    tags: ["coffee", "cup", "break", "cafe", "morning", "tea", "buy me a coffee"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("cup", CUP), p("handle", "M16 11H17.5A2.25 2.25 0 0 1 17.5 15.5H16"), p("st1", "M8.5 3.5C8 4.5 9 5.5 8.5 6.5"), p("st2", "M12.5 3.5C12 4.5 13 5.5 12.5 6.5")],
    fill: [p("cup", CUP, FILL), p("handle", "M16 11H17.5A2.25 2.25 0 0 1 17.5 15.5H16"), p("st1", "M8.5 3.5C8 4.5 9 5.5 8.5 6.5"), p("st2", "M12.5 3.5C12 4.5 13 5.5 12.5 6.5")],
  },
  {
    id: "umbrella",
    name: "Umbrella",
    category: "nature",
    subcategory: "Weather",
    tags: ["umbrella", "rain", "weather", "protection", "insurance", "cover"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("canopy", CANOPY), p("shaft", "M12 12V18.5A2 2 0 0 1 8 18.5"), p("tip", "M12 3V1.8")],
    fill: [p("canopy", CANOPY, FILL), p("shaft", "M12 12V18.5A2 2 0 0 1 8 18.5"), p("tip", "M12 3V1.8")],
  },
  {
    id: "megaphone",
    name: "Megaphone",
    category: "communication",
    tags: ["megaphone", "announce", "marketing", "broadcast", "promote", "loud"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("horn", HORN), p("handle", "M7.5 13.5L8.8 18.5A1 1 0 0 1 7.8 19.5H7A1 1 0 0 1 6 18.7L5.5 13.5"), p("w1", "M19 9A3.5 3.5 0 0 1 19 14")],
    fill: [p("horn", HORN, FILL), p("handle", "M7.5 13.5L8.8 18.5A1 1 0 0 1 7.8 19.5H7A1 1 0 0 1 6 18.7L5.5 13.5"), p("w1", "M19 9A3.5 3.5 0 0 1 19 14")],
  },
  {
    id: "bug",
    name: "Bug",
    category: "developer",
    subcategory: "Debug",
    tags: ["bug", "debug", "issue", "error", "insect", "qa", "report"],
    sizes,
    isNew,
    animation: "draw",
    outline: [
      p("body", BUG),
      p("head", "M10 7.3A2 2 0 0 1 14 7.3"),
      p("seam", "M12 11V19"),
      p("l1", "M8 12H5"),
      p("l2", "M8 15.5L5 17"),
      p("l3", "M16 12H19"),
      p("l4", "M16 15.5L19 17"),
      p("a1", "M10.5 5.5L9 4"),
      p("a2", "M13.5 5.5L15 4"),
    ],
    fill: [
      p("body", BUG, FILL),
      p("head", "M10 7.3A2 2 0 0 1 14 7.3"),
      p("seam", "M12 11V19", KO),
      p("l1", "M8 12H5"),
      p("l2", "M8 15.5L5 17"),
      p("l3", "M16 12H19"),
      p("l4", "M16 15.5L19 17"),
      p("a1", "M10.5 5.5L9 4"),
      p("a2", "M13.5 5.5L15 4"),
    ],
  },
  {
    id: "magic-wand",
    name: "Magic Wand",
    category: "creative",
    tags: ["magic", "wand", "ai", "auto", "enhance", "generate", "sparkle"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("wand", "M4.5 19.5L14.5 9.5"), p("band", "M12.5 9.5L14.5 11.5"), p("star", SPARK), p("t1", "M8.5 3.5V5.5"), p("t2", "M7.5 4.5H9.5"), p("t3", "M20 12V14"), p("t4", "M19 13H21")],
    fill: [p("wand", "M4.5 19.5L14.5 9.5"), p("band", "M12.5 9.5L14.5 11.5"), p("star", SPARK, FILL), p("t1", "M8.5 3.5V5.5"), p("t2", "M7.5 4.5H9.5"), p("t3", "M20 12V14"), p("t4", "M19 13H21")],
  },
  {
    id: "dice",
    name: "Dice",
    category: "ui",
    subcategory: "Interaction",
    tags: ["dice", "random", "shuffle", "game", "chance", "roll", "luck"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("die", DIE), c("p1", 8, 8, 1.1, FILL), c("p2", 16, 8, 1.1, FILL), c("p3", 12, 12, 1.1, FILL), c("p4", 8, 16, 1.1, FILL), c("p5", 16, 16, 1.1, FILL)],
    fill: [p("die", DIE, FILL), c("p1", 8, 8, 1.1, KO_FILL), c("p2", 16, 8, 1.1, KO_FILL), c("p3", 12, 12, 1.1, KO_FILL), c("p4", 8, 16, 1.1, KO_FILL), c("p5", 16, 16, 1.1, KO_FILL)],
  },
  {
    id: "atom",
    name: "Atom",
    category: "nature",
    subcategory: "Science",
    tags: ["atom", "science", "physics", "react", "nuclear", "chemistry", "orbit"],
    sizes,
    isNew,
    animation: "draw",
    outline: [
      p("o1", ORBIT),
      p("o2", ORBIT, { attrs: { transform: "rotate(60 12 12)" } }),
      p("o3", ORBIT, { attrs: { transform: "rotate(120 12 12)" } }),
      c("nucleus", 12, 12, 1.4, FILL),
    ],
  },
  {
    id: "balloon",
    name: "Balloon",
    category: "social",
    subcategory: "Celebrate",
    tags: ["balloon", "party", "birthday", "celebrate", "float", "event"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("balloon", BALLOON), p("knot", "M11 15.5L12 17L13 15.5"), p("string", "M12 17C11 18.5 13 19.5 12 21"), p("shine", "M9 7.5A3 3 0 0 1 10.5 6")],
    fill: [p("balloon", BALLOON, FILL), p("knot", "M11 15.5L12 17L13 15.5"), p("string", "M12 17C11 18.5 13 19.5 12 21"), p("shine", "M9 7.5A3 3 0 0 1 10.5 6", KO)],
  },
  {
    id: "sprout",
    name: "Sprout",
    category: "nature",
    tags: ["sprout", "grow", "plant", "seedling", "growth", "eco", "start"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("stem", "M12 21V11"), p("leafL", LEAF_L), p("leafR", LEAF_R), p("soil", "M7.5 21H16.5")],
    fill: [p("stem", "M12 21V11"), p("leafL", LEAF_L, FILL), p("leafR", LEAF_R, FILL), p("soil", "M7.5 21H16.5")],
  },
  {
    id: "eyedropper",
    name: "Eyedropper",
    category: "creative",
    tags: ["eyedropper", "pipette", "color picker", "sample", "pick", "design"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("collar", "M11.5 7L17 12.5"), p("bulb", "M13.2 8.7L16.2 5.7A1.5 1.5 0 0 1 18.3 7.8L15.3 10.8"), p("tube", PIPETTE_TUBE), p("tip", "M5 19L3.5 20.5")],
    fill: [p("collar", "M11.5 7L17 12.5"), p("bulb", "M13.2 8.7L16.2 5.7A1.5 1.5 0 0 1 18.3 7.8L15.3 10.8", FILL), p("tube", PIPETTE_TUBE, FILL), p("tip", "M5 19L3.5 20.5")],
  },
  {
    id: "pen-tool",
    name: "Pen Tool",
    category: "creative",
    tags: ["pen tool", "bezier", "vector", "path", "design", "illustrate", "nib"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("nib", NIB), p("slit", "M12 3.5V10.5"), c("hole", 12, 12, 1.2), p("base", "M9.5 18.5V20.5H14.5V18.5")],
    fill: [p("nib", NIB, FILL), p("slit", "M12 3.5V10.5", KO), c("hole", 12, 12, 1.2, KO_FILL), p("base", "M9.5 18.5V20.5H14.5V18.5")],
  },
  {
    id: "palette",
    name: "Palette",
    category: "creative",
    tags: ["palette", "paint", "colors", "theme", "art", "design", "brand"],
    sizes,
    isNew,
    animation: "draw",
    outline: [p("palette", PALETTE), c("c1", 8, 11, 1.2, FILL), c("c2", 10.5, 7.5, 1.2, FILL), c("c3", 15, 7.5, 1.2, FILL), c("c4", 17, 11, 1.2, FILL)],
    fill: [p("palette", PALETTE, FILL), c("c1", 8, 11, 1.2, KO_FILL), c("c2", 10.5, 7.5, 1.2, KO_FILL), c("c3", 15, 7.5, 1.2, KO_FILL), c("c4", 17, 11, 1.2, KO_FILL)],
  },
];
