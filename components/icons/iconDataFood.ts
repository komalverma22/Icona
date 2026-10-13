import { TINT } from "./colorStyle";
import { ICON_SIZES, type IconDefinition, type IconNode } from "./types";

/**
 * Food & kitchen icons, authored in the Color style (ink outline + soft fills).
 * The outline style is derived from the same parts:
 *   shape → filled with a tint in Color, a plain outline in Outline
 *   line  → a stroke in both (optionally tinted in Color)
 *   dot   → a small solid mark in both
 *   spot  → a colour-only fill (liquid, highlights); left out of Outline
 */

type Geo = { type: "path"; d: string } | { type: "circle"; cx: number; cy: number; r: number };
type Part = { outline?: IconNode; color: IconNode };

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

const DEEP_GREEN = "#2FA36B";
const DEEP_BROWN = "#A86F3C";

function food(id: string, name: string, subcategory: string, tags: string[], parts: Part[]): IconDefinition {
  return {
    id,
    name,
    category: "food",
    subcategory,
    tags: [id, ...tags],
    sizes: ICON_SIZES,
    isNew: true,
    animation: "draw",
    outline: parts.flatMap((p) => (p.outline ? [p.outline] : [])),
    color: parts.map((p) => p.color),
  };
}

const leaf = (d: string) => shape("leaf", P(d), TINT.leaf);

export const foodIconDefinitions: IconDefinition[] = [
  /* Fruits ---------------------------------------------------------------- */
  food("apple", "Apple", "Fruits", ["fruit", "healthy", "food"], [
    shape("body", P("M12 7.5C10.5 6.3 7.8 6.2 6.2 7.8C4.3 9.7 4.6 13.6 6.3 16.6C7.6 19 9.4 20.6 11 20.2C11.5 20.1 11.8 19.9 12 19.9C12.2 19.9 12.5 20.1 13 20.2C14.6 20.6 16.4 19 17.7 16.6C19.4 13.6 19.7 9.7 17.8 7.8C16.2 6.2 13.5 6.3 12 7.5Z"), TINT.red),
    line("stem", P("M12 7.5C12 5.8 12.6 4.4 13.6 3.5")),
    leaf("M12.8 5.4C13.4 3.6 15.3 2.9 17 3.4C16.6 5.1 14.7 6.1 12.8 5.4Z"),
    spot("shine", P("M7.6 11.2C7.7 10 8.4 9.1 9.4 8.8C9.6 9.6 9.1 10.6 7.6 11.2Z"), TINT.white),
  ]),
  food("banana", "Banana", "Fruits", ["fruit", "food"], [
    shape("body", P("M4 8.5C4.5 15.5 11 20.5 19 16.5C20 16 19.8 14.6 18.8 14.6C13.5 15 8.8 12 7 7.6C6.4 6.4 4 6.8 4 8.5Z"), TINT.yellow),
    line("tip", P("M18.8 14.6L20.2 14")),
    line("stem", P("M5.3 7.2L4.8 5.2")),
    line("ridge", P("M7 11.4C9.6 14.6 13 16.2 16.4 16.2")),
  ]),
  food("orange-fruit", "Orange", "Fruits", ["orange", "citrus", "fruit", "food"], [
    shape("body", C(12, 13.5, 7), TINT.orange),
    line("stem", P("M12 6.5V4.8")),
    leaf("M12 6.5C12.5 4.5 14.5 3.5 16.5 4C16 6 14 7 12 6.5Z"),
    dot("pore-a", C(9.4, 12, 0.6)),
    dot("pore-b", C(14.6, 15.4, 0.6)),
    dot("pore-c", C(11.6, 17.2, 0.6)),
  ]),
  food("lemon", "Lemon", "Fruits", ["citrus", "sour", "fruit", "food"], [
    shape("body", P("M3.8 12.3L5.2 11.4C6.4 8.6 9 7 12 7C15 7 17.6 8.6 18.8 11.4L20.2 12.3L18.8 13.2C17.6 16 15 17.6 12 17.6C9 17.6 6.4 16 5.2 13.2Z"), TINT.yellow),
    leaf("M12 7C12.4 5.2 14 4.2 15.8 4.5C15.4 6.3 13.8 7.3 12 7Z"),
    spot("shine", P("M7.4 11.6C7.8 10.4 8.8 9.6 10 9.4C10 10.3 9 11.3 7.4 11.6Z"), TINT.white),
  ]),
  food("avocado", "Avocado", "Fruits", ["guacamole", "fruit", "food"], [
    shape("skin", P("M12 3.5C9.6 3.5 8.3 5.7 7.6 8.6C7.1 10.6 5.5 12 5.5 14.8C5.5 18.3 8.4 20.5 12 20.5C15.6 20.5 18.5 18.3 18.5 14.8C18.5 12 16.9 10.6 16.4 8.6C15.7 5.7 14.4 3.5 12 3.5Z"), TINT.leaf),
    shape("flesh", P("M12 7C10.6 7 10 8.6 9.6 10.4C9.3 11.8 8.3 12.8 8.3 14.6C8.3 16.9 10 18.3 12 18.3C14 18.3 15.7 16.9 15.7 14.6C15.7 12.8 14.7 11.8 14.4 10.4C14 8.6 13.4 7 12 7Z"), "#E4F1A4"),
    shape("pit", C(12, 14.6, 2.2), "#B8875A"),
  ]),
  food("strawberry", "Strawberry", "Fruits", ["berry", "fruit", "food"], [
    shape("body", P("M12 20.5C8.5 18.5 5.5 14.8 5.5 11.4C5.5 9 7.4 7.5 9.4 7.8C10.3 7.9 11.2 8.3 12 8.3C12.8 8.3 13.7 7.9 14.6 7.8C16.6 7.5 18.5 9 18.5 11.4C18.5 14.8 15.5 18.5 12 20.5Z"), TINT.red),
    shape("leaves", P("M8.5 7.8L7.5 5.8L10 6.2L12 4.2L14 6.2L16.5 5.8L15.5 7.8C14.4 8.6 13.2 9 12 9C10.8 9 9.6 8.6 8.5 7.8Z"), TINT.leaf),
    dot("seed-a", C(9.5, 11.6, 0.55), "#FFE9A6"),
    dot("seed-b", C(14.5, 11.6, 0.55), "#FFE9A6"),
    dot("seed-c", C(12, 13.6, 0.55), "#FFE9A6"),
    dot("seed-d", C(10.2, 15.8, 0.55), "#FFE9A6"),
    dot("seed-e", C(13.8, 15.8, 0.55), "#FFE9A6"),
  ]),
  food("blueberries", "Blueberries", "Fruits", ["berry", "fruit", "food"], [
    shape("berry-back", C(15.5, 11, 4.5), "#7D9CF0"),
    shape("berry-front", C(9, 14.5, 5), "#93AEF5"),
    line("crown-a", P("M7.6 12.6L9 13.6L10.4 12.6")),
    line("crown-b", P("M14.3 9.4L15.5 10.2L16.7 9.4")),
  ]),
  food("cherries", "Cherries", "Fruits", ["cherry", "fruit", "food"], [
    line("stems", P("M7.5 13.5C8.5 9 11 5.5 14 4M16 12.5C15.5 9 14.8 6.5 14 4"), DEEP_GREEN),
    leaf("M14 4C15.5 2.8 18 3 19.5 4.5C18 5.8 15.5 5.6 14 4Z"),
    shape("cherry-a", C(7.5, 17, 3.5), TINT.red),
    shape("cherry-b", C(16, 16, 3.5), TINT.red),
  ]),
  food("peach", "Peach", "Fruits", ["fruit", "food"], [
    shape("body", P("M12 6.8C9 4.6 4.5 6.4 4.5 11.5C4.5 16.5 8 20.5 12 20.5C16 20.5 19.5 16.5 19.5 11.5C19.5 6.4 15 4.6 12 6.8Z"), TINT.peach),
    line("crease", P("M12 6.8C10.8 9.5 10.8 13 12 16")),
    leaf("M12.5 6.2C13 4.2 15.2 3.1 17.4 3.6C16.9 5.6 14.7 6.7 12.5 6.2Z"),
  ]),
  food("watermelon", "Watermelon", "Fruits", ["melon", "summer", "fruit", "food"], [
    shape("rind", P("M3.5 8.5H20.5C20.5 13.2 16.7 17 12 17C7.3 17 3.5 13.2 3.5 8.5Z"), TINT.leaf),
    shape("flesh", P("M5.8 8.5H18.2C18.2 11.9 15.4 14.7 12 14.7C8.6 14.7 5.8 11.9 5.8 8.5Z"), TINT.red),
    dot("seed-a", C(9.2, 10.4, 0.6)),
    dot("seed-b", C(12, 12, 0.6)),
    dot("seed-c", C(14.8, 10.4, 0.6)),
  ]),

  /* Vegetables ------------------------------------------------------------ */
  food("tomato", "Tomato", "Vegetables", ["vegetable", "food"], [
    shape("body", P("M12 7.8C7.5 7.8 4.5 10.4 4.5 14C4.5 17.6 7.8 20.5 12 20.5C16.2 20.5 19.5 17.6 19.5 14C19.5 10.4 16.5 7.8 12 7.8Z"), TINT.red),
    shape("calyx", P("M8.5 8.6L9.8 6.8L12 7.6L14.2 6.8L15.5 8.6L13.3 9.4L12 10.6L10.7 9.4Z"), TINT.leaf),
    line("stem", P("M12 7.6V5")),
    spot("shine", P("M7 13.2C7.2 11.9 8.1 10.9 9.3 10.6C9.4 11.6 8.5 12.7 7 13.2Z"), TINT.white),
  ]),
  food("broccoli", "Broccoli", "Vegetables", ["vegetable", "greens", "food"], [
    shape("stalk", P("M10 13H14L14.6 20.5H9.4Z"), "#BFE38A"),
    shape("florets", P("M7.5 13.5C5.6 13.5 4.3 11.9 4.7 10.1C5 8.8 6.2 8 7.4 8.1C7.7 6.2 9.6 4.9 11.5 5.3C12.4 4.1 14.3 3.9 15.5 4.9C16.6 5.7 16.9 7.1 16.4 8.2C18.2 8.3 19.6 9.9 19.3 11.7C19.1 12.8 18.1 13.5 17 13.5Z"), TINT.leaf),
    line("branches", P("M12 13.4V10.6M10.5 13.4L9.2 11.4M13.5 13.4L14.8 11.4")),
  ]),
  food("carrot", "Carrot", "Vegetables", ["vegetable", "food"], [
    line("greens", P("M15.6 8.4L17.6 3.6M16.6 9.4L20.6 7M15.6 8.4L14.4 4"), DEEP_GREEN),
    shape("root", P("M13.2 7.2L16.8 10.8C17.4 11.4 17.3 12.4 16.6 12.9L6.4 20.3C5.1 21.2 3.6 19.7 4.5 18.4L11.4 7.4C11.9 6.7 12.6 6.6 13.2 7.2Z"), TINT.orange),
    line("ridges", P("M10.4 12.2L12 13.8M8.4 15.4L9.7 16.7M12.6 9.8L14 11.2")),
  ]),
  food("bell-pepper", "Bell Pepper", "Vegetables", ["pepper", "capsicum", "vegetable", "food"], [
    shape("body", P("M8 8.5C5.6 8.5 4.5 10.5 4.8 13.5C5.2 17.5 7.3 20.5 9.5 20.5C10.6 20.5 11.2 19.8 12 19.8C12.8 19.8 13.4 20.5 14.5 20.5C16.7 20.5 18.8 17.5 19.2 13.5C19.5 10.5 18.4 8.5 16 8.5C14.5 8.5 13.4 9.2 12 9.2C10.6 9.2 9.5 8.5 8 8.5Z"), TINT.red),
    line("stem", P("M12 9.2V7.2C12 5.6 12.9 4.4 14.4 4"), DEEP_GREEN),
    line("fold", P("M12 12.5V17")),
  ]),
  food("eggplant", "Eggplant", "Vegetables", ["aubergine", "vegetable", "food"], [
    shape("body", P("M8 6.5C11 5.5 14.4 7 15.5 10.5C16.6 14 18.8 15.5 18.6 18C18.4 20.2 15.7 21.2 13.2 19.8C9.5 17.8 8.6 14.6 6.6 12.2C4.8 10 5.3 7.4 8 6.5Z"), TINT.purple),
    shape("cap", P("M5.4 8.6C6.2 6.4 8.6 5.2 10.9 5.8L10.1 8L7.8 9.1Z"), TINT.leaf),
    line("stem", P("M7.6 6L6.2 3.6")),
    spot("shine", P("M14.2 16.6C15 17.6 16.1 18.1 17.1 18C16.9 17.2 15.8 16.6 14.2 16.6Z"), TINT.white),
  ]),
  food("corn", "Corn", "Vegetables", ["maize", "vegetable", "food"], [
    shape("cob", P("M12 3.5C14.5 3.5 15.8 6.5 15.8 11C15.8 15.5 14.5 18.5 12 18.5C9.5 18.5 8.2 15.5 8.2 11C8.2 6.5 9.5 3.5 12 3.5Z"), TINT.yellow),
    line("kernels", P("M8.5 8H15.5M8.3 11H15.7M8.6 14H15.4M12 3.6V18.4")),
    shape("husk-left", P("M12 20.8C8.2 20.8 5.2 17.4 5.2 12.6C7.4 13.8 9.1 15.8 10 18.4Z"), TINT.leaf),
    shape("husk-right", P("M12 20.8C15.8 20.8 18.8 17.4 18.8 12.6C16.6 13.8 14.9 15.8 14 18.4Z"), TINT.leaf),
  ]),
  food("mushroom", "Mushroom", "Vegetables", ["fungi", "vegetable", "food"], [
    shape("stem", P("M9.2 13H14.8L15.4 18.6C15.5 19.6 14.7 20.5 13.7 20.5H10.3C9.3 20.5 8.5 19.6 8.6 18.6Z"), TINT.cream),
    shape("cap", P("M3.8 11.5C3.8 7.3 7.5 4 12 4C16.5 4 20.2 7.3 20.2 11.5C20.2 12.3 19.5 13 18.7 13H5.3C4.5 13 3.8 12.3 3.8 11.5Z"), "#C98B5E"),
    spot("spot-a", C(8.8, 8.6, 1.2), TINT.cream),
    spot("spot-b", C(14.6, 7.4, 1), TINT.cream),
    spot("spot-c", C(16.4, 10.4, 0.8), TINT.cream),
  ]),
  food("onion", "Onion", "Vegetables", ["vegetable", "food"], [
    shape("body", P("M12 5.5C14.5 8.5 19 10.5 19 14.5C19 18 15.9 20.5 12 20.5C8.1 20.5 5 18 5 14.5C5 10.5 9.5 8.5 12 5.5Z"), "#F2C48D"),
    line("sprout", P("M12 5.5V3")),
    line("layers", P("M12 7.5C10 10.5 9.3 14.5 10 20.2M12 7.5C14 10.5 14.7 14.5 14 20.2")),
    line("roots", P("M10.5 20.5L10 21.8M12 20.5V22M13.5 20.5L14 21.8")),
  ]),
  food("garlic", "Garlic", "Vegetables", ["vegetable", "spice", "food"], [
    shape("bulb", P("M12 4C13 7 18.8 9 18.8 14C18.8 17.8 15.8 20.5 12 20.5C8.2 20.5 5.2 17.8 5.2 14C5.2 9 11 7 12 4Z"), "#F4EFE7"),
    line("cloves", P("M12 8C10.8 11 10.5 15.5 11.2 20.4M12 8C13.2 11 13.5 15.5 12.8 20.4M8.5 11.5C7.8 14 8.2 17.5 9.5 19.8M15.5 11.5C16.2 14 15.8 17.5 14.5 19.8")),
    line("tip", P("M12 4V2.8")),
  ]),
  food("spinach", "Spinach", "Vegetables", ["greens", "leaf", "salad", "vegetable", "food"], [
    shape("leaf", P("M12 20.5C6.5 18 4.5 12.5 6.5 7.5C7.6 4.8 10 3.5 12 3.5C14 3.5 16.4 4.8 17.5 7.5C19.5 12.5 17.5 18 12 20.5Z"), TINT.leaf),
    line("veins", P("M12 21.5V7M12 11L9.2 8.6M12 14.5L8.6 12M12 11L14.8 8.6M12 14.5L15.4 12")),
  ]),

  /* Bakery ---------------------------------------------------------------- */
  food("bread", "Bread", "Bakery", ["toast", "loaf", "bakery", "food"], [
    shape("slice", P("M6 10.5C4.3 10.5 3.5 9.4 3.5 8C3.5 5.8 6.5 4 12 4C17.5 4 20.5 5.8 20.5 8C20.5 9.4 19.7 10.5 18 10.5V18.8C18 19.7 17.3 20.4 16.4 20.4H7.6C6.7 20.4 6 19.7 6 18.8Z"), TINT.bread),
    spot("crumb", P("M8 10V18H16V10C17.4 9.8 18.2 9.2 18.2 8.2C18.2 6.6 15.6 5.6 12 5.6C8.4 5.6 5.8 6.6 5.8 8.2C5.8 9.2 6.6 9.8 8 10Z"), TINT.cream),
  ]),
  food("croissant", "Croissant", "Bakery", ["pastry", "breakfast", "bakery", "food"], [
    shape("body", P("M3.5 15C4.5 10.5 8 7 12 7C16 7 19.5 10.5 20.5 15C19 16.8 17 17.2 15.2 16.4C14.3 17.6 13.2 18 12 18C10.8 18 9.7 17.6 8.8 16.4C7 17.2 5 16.8 3.5 15Z"), "#F2B866"),
    line("folds", P("M8.8 16.4C8.4 13 9.2 9.8 10.4 7.4M15.2 16.4C15.6 13 14.8 9.8 13.6 7.4")),
  ]),
  food("donut", "Donut", "Bakery", ["doughnut", "sweet", "dessert", "bakery", "food"], [
    shape("dough", C(12, 12, 8.5), TINT.bread),
    shape("icing", P("M12 5.2C15.8 5.2 18.8 8.2 18.8 12C18.8 13.2 18 13.6 17.2 13C16.4 12.4 15.4 12.9 15 13.8C14.4 15 12.8 14.9 12.2 14.3L12 14.5C11.2 15 9.6 15 9 13.8C8.6 12.9 7.6 12.4 6.8 13C6 13.6 5.2 13.2 5.2 12C5.2 8.2 8.2 5.2 12 5.2Z"), TINT.pink),
    shape("hole", C(12, 11, 2.2), TINT.white),
    line("sprinkles", P("M8.6 8.4L9.6 7.9M14.6 7.8L15.3 8.7M7.8 11L8.6 11.8M16.4 10.6L15.6 11.2M11.7 6.9H12.7"), "#7C6FE6"),
  ]),
  food("cupcake", "Cupcake", "Bakery", ["muffin", "dessert", "sweet", "bakery", "food"], [
    shape("wrapper", P("M6 12.5H18L16.4 20.5H7.6Z"), TINT.blue),
    line("pleats", P("M10 13L10.3 20.3M14 13L13.7 20.3")),
    shape("frosting", P("M5.5 12.5C4.6 12.5 4 11.7 4.3 10.9C4.7 9.8 5.8 9.4 6.7 9.6C6.9 7.3 8.9 5.6 11.2 5.8C11.4 4.5 12.6 3.6 13.8 3.9C15 4.2 15.6 5.4 15.3 6.5C17 6.9 18.1 8.4 17.8 10C18.8 10 19.7 10.9 19.6 11.9C19.6 12.3 19.2 12.5 18.8 12.5Z"), TINT.pink),
  ]),
  food("pancakes", "Pancakes", "Bakery", ["breakfast", "syrup", "bakery", "food"], [
    shape("plate", P("M3 18.5C3 17.5 7 16.8 12 16.8C17 16.8 21 17.5 21 18.5C21 19.5 17 20.2 12 20.2C7 20.2 3 19.5 3 18.5Z"), TINT.gray),
    shape("cake-bottom", P("M5 15.5C5 14.4 5.9 14 7 14H17C18.1 14 19 14.4 19 15.5C19 16.6 18.1 17 17 17H7C5.9 17 5 16.6 5 15.5Z"), TINT.bread),
    shape("cake-middle", P("M5 12.5C5 11.4 5.9 11 7 11H17C18.1 11 19 11.4 19 12.5C19 13.6 18.1 14 17 14H7C5.9 14 5 13.6 5 12.5Z"), TINT.bread),
    shape("cake-top", P("M5.5 9.5C5.5 8.4 6.4 8 7.5 8H16.5C17.6 8 18.5 8.4 18.5 9.5C18.5 10.6 17.6 11 16.5 11H7.5C6.4 11 5.5 10.6 5.5 9.5Z"), TINT.bread),
    shape("butter", P("M10.5 5.2H13.5V8H10.5Z"), TINT.yellow),
  ]),
  food("pretzel", "Pretzel", "Bakery", ["snack", "bakery", "food"], [
    line("knot", P("M12 13.5C9 16.5 4.5 15.5 4.5 11.5C4.5 7.5 9 5.5 12 9.5C15 5.5 19.5 7.5 19.5 11.5C19.5 15.5 15 16.5 12 13.5ZM8 18.5L12 13.5L16 18.5"), DEEP_BROWN),
    dot("salt-a", C(7, 9.5, 0.55)),
    dot("salt-b", C(17, 9.5, 0.55)),
    dot("salt-c", C(12, 11.4, 0.55)),
  ]),

  /* Drinks ---------------------------------------------------------------- */
  food("coffee-cup", "Coffee Cup", "Drinks", ["coffee", "cup", "espresso", "latte", "drink", "food"], [
    line("steam", P("M8.5 3.5C8 4.5 9 5.2 8.5 6.3M12.5 3.5C12 4.5 13 5.2 12.5 6.3")),
    shape("cup", P("M5 9H16V15C16 17.5 14 19.5 11.5 19.5H9.5C7 19.5 5 17.5 5 15Z"), TINT.cream),
    spot("coffee", P("M5.75 9.75H15.25V11.5H5.75Z"), "#9B6A45"),
    line("handle", P("M16 10.5H17.5C18.9 10.5 20 11.6 20 13C20 14.4 18.9 15.5 17.5 15.5H16")),
    line("saucer", P("M3.5 21H17.5")),
  ]),
  food("tea", "Tea", "Drinks", ["mug", "tea bag", "drink", "food"], [
    shape("mug", P("M4.5 7.5H15.5V17C15.5 18.9 14 20.5 12 20.5H8C6 20.5 4.5 18.9 4.5 17Z"), TINT.white),
    spot("tea", P("M5.25 10.5H14.75V17C14.75 18.5 13.5 19.75 12 19.75H8C6.5 19.75 5.25 18.5 5.25 17Z"), "#F4C97E"),
    line("handle", P("M15.5 9.5H17C18.4 9.5 19.5 10.6 19.5 12C19.5 13.4 18.4 14.5 17 14.5H15.5")),
    line("string", P("M10 7.5V3.5")),
    shape("tag", P("M8.8 3.5H11.2V2H8.8Z"), TINT.leaf),
  ]),
  food("juice", "Juice", "Drinks", ["orange juice", "glass", "drink", "food"], [
    line("straw", P("M13 7.5L15.5 2.5H17.5"), TINT.red),
    spot("glass", P("M6 7.5H18L16.6 19.4C16.5 20 16 20.5 15.4 20.5H8.6C8 20.5 7.5 20 7.4 19.4Z"), TINT.white),
    spot("juice", P("M6.5 11H17.5L16.6 19.4C16.5 20 16 20.5 15.4 20.5H8.6C8 20.5 7.5 20 7.4 19.4Z"), TINT.orange),
    line("glass-edge", P("M6 7.5H18L16.6 19.4C16.5 20 16 20.5 15.4 20.5H8.6C8 20.5 7.5 20 7.4 19.4Z")),
    line("surface", P("M6.5 11H17.5")),
  ]),
  food("bubble-tea", "Bubble Tea", "Drinks", ["boba", "milk tea", "drink", "food"], [
    line("straw", P("M12.8 6.5L14 2.5"), TINT.pink),
    spot("tea", P("M6.6 9.5H17.4L16.2 19.4C16.1 20 15.6 20.5 15 20.5H9C8.4 20.5 7.9 20 7.8 19.4Z"), "#E7C7A2"),
    line("cup", P("M6.6 9.5H17.4L16.2 19.4C16.1 20 15.6 20.5 15 20.5H9C8.4 20.5 7.9 20 7.8 19.4Z")),
    shape("lid", P("M5.5 7.2C5.5 6.5 6 6 6.7 6H17.3C18 6 18.5 6.5 18.5 7.2V8.3C18.5 9 18 9.5 17.3 9.5H6.7C6 9.5 5.5 9 5.5 8.3Z"), TINT.white),
    dot("pearl-a", C(9.6, 17.6, 0.9)),
    dot("pearl-b", C(12, 18.2, 0.9)),
    dot("pearl-c", C(14.4, 17.6, 0.9)),
    dot("pearl-d", C(10.8, 15.6, 0.9)),
    dot("pearl-e", C(13.2, 15.6, 0.9)),
  ]),

  /* Meals ----------------------------------------------------------------- */
  food("pizza", "Pizza", "Meals", ["slice", "fast food", "meal", "food"], [
    shape("cheese", P("M4 5.5C9 3.5 15 3.5 20 5.5L12 21Z"), TINT.yellow),
    shape("crust", P("M4 5.5C9 3.5 15 3.5 20 5.5L19.1 7.4C14.5 5.7 9.5 5.7 4.9 7.4Z"), "#E9A866"),
    shape("pepperoni-a", C(10, 10, 1.6), TINT.red),
    shape("pepperoni-b", C(14.2, 11.6, 1.4), TINT.red),
    shape("pepperoni-c", C(12, 15.6, 1.2), TINT.red),
  ]),
  food("burger", "Burger", "Meals", ["hamburger", "fast food", "meal", "food"], [
    shape("bun-top", P("M4 11C4 7.1 7.6 4.5 12 4.5C16.4 4.5 20 7.1 20 11Z"), TINT.bread),
    spot("seed-a", C(9.5, 7.8, 0.55), TINT.cream),
    spot("seed-b", C(12.5, 6.8, 0.55), TINT.cream),
    spot("seed-c", C(15, 8.4, 0.55), TINT.cream),
    line("lettuce", P("M3.5 12.6C5 11.6 6.2 13.6 7.6 12.6C9 11.6 10.2 13.6 11.6 12.6C13 11.6 14.2 13.6 15.6 12.6C17 11.6 18.2 13.6 20.5 12.6"), DEEP_GREEN),
    shape("patty", P("M4 14.5H20V16C20 16.8 19.3 17.5 18.5 17.5H5.5C4.7 17.5 4 16.8 4 16Z"), "#B9784A"),
    shape("bun-bottom", P("M4.5 18.5H19.5V19C19.5 19.8 18.8 20.5 18 20.5H6C5.2 20.5 4.5 19.8 4.5 19Z"), TINT.bread),
  ]),
  food("taco", "Taco", "Meals", ["mexican", "meal", "food"], [
    line("lettuce", P("M5.4 11.6C6.4 10.4 7.6 11.4 8.4 10.1C9.4 8.8 10.6 9.9 11.5 8.8C12.6 7.7 13.6 9 14.6 8.5C15.8 8 16.6 9.6 17.8 9.4C18.6 9.4 19.2 10.4 19.4 11.4"), DEEP_GREEN),
    shape("shell", P("M3.5 17.5C3.5 11.7 7.3 7.5 12 7.5C16.7 7.5 20.5 11.7 20.5 17.5Z"), TINT.yellow),
    dot("tomato-a", C(9, 11.6, 0.8), TINT.red),
    dot("tomato-b", C(14.6, 11.2, 0.8), TINT.red),
  ]),
  food("sushi", "Sushi", "Meals", ["nigiri", "salmon", "japanese", "meal", "food"], [
    shape("rice", P("M4 13.5C4 12.4 4.9 11.5 6 11.5H18C19.1 11.5 20 12.4 20 13.5V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17Z"), TINT.white),
    shape("salmon", P("M4.5 11.8C5.5 8.8 8.5 7 12 7C15.5 7 18.5 8.8 19.5 11.8Z"), "#FF9F7A"),
    line("stripes", P("M9 8.2L10.2 11.4M12.8 7.4L14 11.4M16.4 8.4L17.2 11.4"), TINT.white),
    shape("nori", P("M10.5 11.5H13.5V19H10.5Z"), "#3A3F45"),
  ]),
  food("ramen", "Ramen", "Meals", ["noodles", "soup", "bowl", "japanese", "meal", "food"], [
    line("chopsticks", P("M13 9.6L20 3.5M15.2 10.4L21 5.6"), DEEP_BROWN),
    line("noodles", P("M7 11.6C7.5 9.6 8.5 9.6 9 11.6M9.6 11.6C10.1 9.4 11.1 9.4 11.6 11.6"), "#D9A400"),
    shape("bowl", P("M3.5 12H20.5C20.5 16.7 16.7 20.5 12 20.5C7.3 20.5 3.5 16.7 3.5 12Z"), TINT.blue),
    line("rim", P("M6.5 15.5H17.5")),
  ]),
  food("fried-egg", "Fried Egg", "Meals", ["egg", "breakfast", "meal", "food"], [
    shape("white", P("M12 4C15.5 4 16.5 6.5 18.5 7.5C20.5 8.5 21 11 19.8 13.2C19 14.8 19.5 17 17.5 18.8C15.5 20.6 13 19.5 11 20C8 20.8 4.5 19.2 4 15.8C3.6 13.3 4.8 12.4 4.8 10.2C4.8 6.6 8.4 4 12 4Z"), TINT.white),
    shape("yolk", C(11.5, 12, 3), TINT.yellow),
    spot("shine", P("M10 11C10.3 10.3 10.9 9.8 11.6 9.7C11.6 10.4 11 10.9 10 11Z"), TINT.white),
  ]),
  food("drumstick", "Drumstick", "Meals", ["chicken", "meat", "meal", "food"], [
    shape("bone", P("M17.2 6.8C16.3 6 16.5 4.4 17.7 4.2C18 3.2 19.6 3.1 20 4.2C21 4.6 20.9 6 20 6.4C19.7 7.4 18.1 7.6 17.2 6.8Z"), TINT.white),
    line("shaft", P("M14.6 9.4L17.4 6.6")),
    shape("meat", P("M14.8 9.2C16.8 11.2 16.5 14.6 14.1 17C11.4 19.7 7.3 20 5.6 18.4C3.9 16.7 4.3 12.6 7 9.9C9.4 7.5 12.8 7.2 14.8 9.2Z"), "#E39A55"),
  ]),
  food("fries", "Fries", "Meals", ["french fries", "chips", "fast food", "meal", "food"], [
    shape("fry-a", P("M7.2 11.5V6H9V11.5Z"), TINT.yellow),
    shape("fry-b", P("M9.6 11.5V4H11.4V11.5Z"), TINT.yellow),
    shape("fry-c", P("M12 11.5V5H13.8V11.5Z"), TINT.yellow),
    shape("fry-d", P("M14.4 11.5V6.5H16.2V11.5Z"), TINT.yellow),
    shape("box", P("M5.5 10H18.5L17 20.5H7Z"), TINT.red),
  ]),
  food("salad", "Salad", "Meals", ["bowl", "greens", "healthy", "meal", "food"], [
    shape("greens", P("M4 12C4 9.5 6 8.5 7.5 9C8 7 10.5 6.2 12 7.5C13.5 6.2 16 7 16.5 9C18 8.5 20 9.5 20 12Z"), TINT.leaf),
    dot("tomato-a", C(9, 10, 1.1), TINT.red),
    dot("tomato-b", C(15, 9.8, 1), TINT.red),
    shape("bowl", P("M3.5 12H20.5C20.5 16.7 16.7 20.5 12 20.5C7.3 20.5 3.5 16.7 3.5 12Z"), TINT.white),
  ]),

  /* Kitchen --------------------------------------------------------------- */
  food("frying-pan", "Frying Pan", "Kitchen", ["pan", "skillet", "cooking", "kitchen"], [
    shape("handle", P("M15.5 10.2L21 6.2C21.6 5.8 22.3 6.5 21.9 7.1L17.4 12.4Z"), "#2F3338"),
    shape("pan", C(9.5, 13, 6.5), TINT.dark),
    spot("inside", C(9.5, 13, 4.6), "#6B717A"),
  ]),
  food("pot", "Pot", "Kitchen", ["saucepan", "stew", "cooking", "kitchen"], [
    line("handles", P("M5 12H3.5M19 12H20.5")),
    shape("body", P("M5 9.5H19V17.5C19 19.2 17.7 20.5 16 20.5H8C6.3 20.5 5 19.2 5 17.5Z"), TINT.red),
    shape("lid", P("M4 9.5C4 7.6 7.6 6.2 12 6.2C16.4 6.2 20 7.6 20 9.5Z"), TINT.red),
    line("knob", P("M10.8 6.2V5.2C10.8 4.5 11.3 4 12 4C12.7 4 13.2 4.5 13.2 5.2V6.2")),
  ]),
  food("wooden-spoon", "Wooden Spoon", "Kitchen", ["spoon", "cooking", "kitchen"], [
    shape("handle", P("M10.3 10.2L18.9 20.3C19.3 20.8 20.1 20.3 19.8 19.7L12 9.3Z"), TINT.brown),
    shape("bowl", P("M8.2 3.6C10.3 2.8 12.6 4.4 12.4 7C12.2 9.3 10.3 10.8 8.5 10.4C6.6 10 5.6 7.9 6.2 5.9C6.5 4.8 7.2 4 8.2 3.6Z"), TINT.brown),
  ]),
  food("spatula", "Spatula", "Kitchen", ["turner", "cooking", "kitchen"], [
    shape("handle", P("M7 12H8.5L9.2 20C9.2 20.6 8.5 21 7.75 21C7 21 6.3 20.6 6.3 20Z"), TINT.brown),
    shape("head", P("M5 3.5H10.5V10C10.5 11.1 9.6 12 8.5 12H7C5.9 12 5 11.1 5 10Z"), TINT.dark),
    line("slots", P("M6.8 5V9.5M8.7 5V9.5"), TINT.white),
  ]),
  food("whisk", "Whisk", "Kitchen", ["baking", "mix", "kitchen"], [
    line("wires", P("M11.2 14C7.8 11 7.8 4 12 3.5C16.2 4 16.2 11 12.8 14M12 14V3.5M11.6 14C9.8 11 10 5 12 3.5M12.4 14C14.2 11 14 5 12 3.5")),
    shape("handle", P("M11 14H13V20.5C13 21 12.6 21.4 12 21.4C11.4 21.4 11 21 11 20.5Z"), TINT.brown),
  ]),
  food("rolling-pin", "Rolling Pin", "Kitchen", ["baking", "dough", "kitchen"], [
    shape("handle-left", P("M2.5 11H5V13H2.5Z"), "#C98B5E"),
    shape("handle-right", P("M19 11H21.5V13H19Z"), "#C98B5E"),
    shape("roller", P("M6.5 9.5H17.5C18.3 9.5 19 10.2 19 11V13C19 13.8 18.3 14.5 17.5 14.5H6.5C5.7 14.5 5 13.8 5 13V11C5 10.2 5.7 9.5 6.5 9.5Z"), TINT.brown),
  ]),
  food("knife", "Knife", "Kitchen", ["chef knife", "cut", "kitchen"], [
    shape("blade", P("M3.5 12.5C3.5 10 6 8.5 9 8.5H14V12.5Z"), TINT.steel),
    shape("handle", P("M14 10H20C20.6 10 21 10.4 21 11V12C21 12.6 20.6 13 20 13H14Z"), "#2F3338"),
    dot("rivet-a", C(16.5, 11.5, 0.5), TINT.white),
    dot("rivet-b", C(18.6, 11.5, 0.5), TINT.white),
  ]),
  food("cutting-board", "Cutting Board", "Kitchen", ["chopping board", "kitchen"], [
    shape("loop", P("M10 7.5V5.5C10 4.4 10.9 3.5 12 3.5C13.1 3.5 14 4.4 14 5.5V7.5Z"), "#C98B5E"),
    shape("board", P("M6.5 7.5H17.5C18.6 7.5 19.5 8.4 19.5 9.5V19C19.5 20.1 18.6 21 17.5 21H6.5C5.4 21 4.5 20.1 4.5 19V9.5C4.5 8.4 5.4 7.5 6.5 7.5Z"), TINT.brown),
    line("grain", P("M8 11.5V17.5M11 12V18.5"), DEEP_BROWN),
  ]),
  food("measuring-cup", "Measuring Cup", "Kitchen", ["baking", "jug", "kitchen"], [
    spot("liquid", P("M5.75 12H15.75V18.5C15.75 19.2 15.2 19.75 14.5 19.75H7C6.3 19.75 5.75 19.2 5.75 18.5Z"), TINT.blue),
    line("cup", P("M5 6.5H16.5V18.5C16.5 19.6 15.6 20.5 14.5 20.5H7C5.9 20.5 5 19.6 5 18.5Z")),
    line("handle", P("M16.5 9H18C19.1 9 20 9.9 20 11V13.5C20 14.6 19.1 15.5 18 15.5H16.5")),
    line("marks", P("M5 9H7.5M5 12H8.5M5 15H7.5"), "#E5534B"),
  ]),
  food("oven-mitt", "Oven Mitt", "Kitchen", ["glove", "baking", "kitchen"], [
    shape("mitt", P("M8.5 21V15.5C6.4 14.4 4.8 12.2 4.8 9.5C4.8 6.2 7.2 3.5 10.4 3.5C13.3 3.5 15.4 5.6 15.7 8.5L17 6.6C17.8 5.5 19.4 5.7 19.9 6.9C20.3 7.7 20 8.6 19.4 9.2L16.5 13.6V21Z"), TINT.red),
    shape("cuff", P("M8.5 18.5H16.5V21H8.5Z"), TINT.white),
  ]),
];
