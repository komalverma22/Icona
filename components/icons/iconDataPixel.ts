import { spriteNodes, outlineSprite } from "./pixelArt";
import { ICON_SIZES, type CategoryId, type IconDefinition, type PixelArt } from "./types";

/**
 * Pixel Art set — hand-placed 12×12 sprites ("#" solid, "+" shade).
 * Fill style is the sprite itself; outline style is auto-traced from it.
 * Extra frames feed frame-by-frame animations (walk cycles, an opening lid).
 */

const HEART = [
  "............",
  "............",
  "..##....##..",
  ".#+##..####.",
  ".#+########.",
  ".##########.",
  "..########..",
  "...######...",
  "....####....",
  ".....##.....",
  "............",
  "............",
];

const COIN = [
  "............",
  "....####....",
  "..##++++##..",
  ".#++++#+++#.",
  ".#+++##+++#.",
  ".#++++#+++#.",
  ".#++++#+++#.",
  ".#++++#+++#.",
  ".#+++###++#.",
  "..##++++##..",
  "....####....",
  "............",
];

const ROCKET = [
  ".....##.....",
  "....####....",
  "....####....",
  "...##++##...",
  "...#+..+#...",
  "...##++##...",
  "...######...",
  "..########..",
  ".##.####.##.",
  ".#...##...#.",
  "............",
  "............",
];

const SWORD = [
  "..........##",
  ".........#+#",
  "........#+#.",
  ".......#+#..",
  "......#+#...",
  "..#..#+#....",
  "...##+#.....",
  "....##......",
  "...#.##.....",
  "..#...#.....",
  ".##.........",
  ".#..........",
];

const POTION = [
  "............",
  "....####....",
  "....#..#....",
  "....#..#....",
  "...#....#...",
  "..#......#..",
  ".#++++++++#.",
  ".#+++#++++#.",
  ".#++++++#+#.",
  "..#++++++#..",
  "...######...",
  "............",
];

const GHOST = [
  "............",
  "....####....",
  "..########..",
  ".##########.",
  ".##..##..##.",
  ".##..##..##.",
  ".##########.",
  ".##########.",
  ".##########.",
  ".##.##.##.#.",
  ".#..#..#..#.",
  "............",
];

const SLIME = [
  "............",
  "............",
  "............",
  ".....##.....",
  "....##+#....",
  "...######...",
  "..##.##.##..",
  ".##########.",
  ".####++####.",
  "############",
  ".##########.",
  "............",
];

const STAR = [
  ".....##.....",
  ".....##.....",
  "....####....",
  "############",
  ".####++####.",
  "..###++###..",
  "...######...",
  "...######...",
  "..###..###..",
  "..##....##..",
  ".##......##.",
  "............",
];

const GEM = [
  "............",
  "............",
  "............",
  "...######...",
  "..##+##+##..",
  ".##########.",
  "..#+####+#..",
  "...#+##+#...",
  "....####....",
  ".....##.....",
  "............",
  "............",
];

const KEY = [
  "............",
  "............",
  "............",
  "............",
  ".###........",
  "#...########",
  "#...#...#.#.",
  ".###....#.#.",
  "............",
  "............",
  "............",
  "............",
];

const CHEST = [
  "............",
  "............",
  "..########..",
  ".#++++++++#.",
  ".#++++++++#.",
  ".##########.",
  ".#+++##+++#.",
  ".#+++##+++#.",
  ".#++++++++#.",
  ".##########.",
  "............",
  "............",
];

const CHEST_OPEN = [
  "..########..",
  ".#++++++++#.",
  ".#++++++++#.",
  ".##########.",
  ".#........#.",
  ".##########.",
  ".#+++##+++#.",
  ".#+++##+++#.",
  ".#++++++++#.",
  ".##########.",
  "............",
  "............",
];

const BOMB = [
  "........#...",
  ".......#....",
  "......#.....",
  ".....##.....",
  "...######...",
  "..##+#####..",
  ".##+#######.",
  ".##########.",
  ".##########.",
  ".##########.",
  "..########..",
  "...######...",
];

const GAMEPAD = [
  "............",
  "............",
  "............",
  ".##########.",
  "###.####.###",
  "##...##.#.##",
  "###.####.###",
  "############",
  "###......###",
  ".#........#.",
  "............",
  "............",
];

const TROPHY = [
  "............",
  "..########..",
  "#.##+#####.#",
  "#.##+#####.#",
  ".#.######.#.",
  "...######...",
  "....####....",
  ".....##.....",
  ".....##.....",
  "....####....",
  "...######...",
  "............",
];

const FLOPPY = [
  "............",
  ".#########..",
  ".##+++#+###.",
  ".##+++#+###.",
  ".##+++++###.",
  ".##########.",
  ".#........#.",
  ".#.######.#.",
  ".#........#.",
  ".#.####...#.",
  ".##########.",
  "............",
];

const HERO = [
  "....####....",
  "...######...",
  "...#+##+#...",
  "...++++++...",
  "....++++....",
  "..########..",
  ".#.######.#.",
  ".#.######.#.",
  "...######...",
  "...##..##...",
  "...##..##...",
  "..###..###..",
];

const HERO_STRIDE = [
  "....####....",
  "...######...",
  "...#+##+#...",
  "...++++++...",
  "....++++....",
  "..########..",
  "..#######.#.",
  ".#.######...",
  "...######...",
  "...##..##...",
  "..##....##..",
  ".##......##.",
];

const CURSOR = [
  "..#.........",
  "..##........",
  "..#+#.......",
  "..#++#......",
  "..#+++#.....",
  "..#++++#....",
  "..#+++++#...",
  "..#++++++#..",
  "..#+++####..",
  "..#+#+#.....",
  "..##.#+#....",
  "......##....",
];

const HOURGLASS = [
  ".##########.",
  "..#++++++#..",
  "..#++++++#..",
  "...#++++#...",
  "....#++#....",
  ".....##.....",
  "....#..#....",
  "...#....#...",
  "..#..++..#..",
  "..#++++++#..",
  ".##########.",
  "............",
];

const LIGHTNING = [
  "......###...",
  ".....###....",
  "....###.....",
  "...###......",
  "..########..",
  "......###...",
  ".....###....",
  "....###.....",
  "...##.......",
  "..#.........",
  "............",
  "............",
];

interface PixelSpec {
  id: string;
  name: string;
  subcategory: string;
  tags: string[];
  art: PixelArt;
}

const SPECS: PixelSpec[] = [
  { id: "pixel-heart", name: "Pixel Heart", subcategory: "Items", tags: ["heart", "life", "health", "love", "hp", "8-bit"], art: { sprite: HEART } },
  { id: "pixel-coin", name: "Pixel Coin", subcategory: "Items", tags: ["coin", "money", "score", "points", "currency", "8-bit"], art: { sprite: COIN } },
  { id: "pixel-rocket", name: "Pixel Rocket", subcategory: "Items", tags: ["rocket", "launch", "space", "deploy", "ship", "8-bit"], art: { sprite: ROCKET } },
  { id: "pixel-sword", name: "Pixel Sword", subcategory: "Items", tags: ["sword", "attack", "weapon", "quest", "rpg", "8-bit"], art: { sprite: SWORD } },
  { id: "pixel-potion", name: "Pixel Potion", subcategory: "Items", tags: ["potion", "flask", "magic", "brew", "power up", "8-bit"], art: { sprite: POTION } },
  { id: "pixel-gem", name: "Pixel Gem", subcategory: "Items", tags: ["gem", "diamond", "premium", "crystal", "reward", "8-bit"], art: { sprite: GEM } },
  { id: "pixel-key", name: "Pixel Key", subcategory: "Items", tags: ["key", "unlock", "access", "secret", "door", "8-bit"], art: { sprite: KEY } },
  { id: "pixel-chest", name: "Pixel Chest", subcategory: "Items", tags: ["chest", "treasure", "loot", "reward", "box", "8-bit"], art: { sprite: CHEST, frames: { open: CHEST_OPEN } } },
  { id: "pixel-bomb", name: "Pixel Bomb", subcategory: "Items", tags: ["bomb", "explode", "danger", "boom", "destroy", "8-bit"], art: { sprite: BOMB } },
  { id: "pixel-trophy", name: "Pixel Trophy", subcategory: "Items", tags: ["trophy", "win", "achievement", "award", "victory", "8-bit"], art: { sprite: TROPHY } },
  { id: "pixel-ghost", name: "Pixel Ghost", subcategory: "Characters", tags: ["ghost", "spooky", "enemy", "haunt", "arcade", "8-bit"], art: { sprite: GHOST } },
  { id: "pixel-slime", name: "Pixel Slime", subcategory: "Characters", tags: ["slime", "blob", "monster", "jelly", "rpg", "8-bit"], art: { sprite: SLIME } },
  { id: "pixel-hero", name: "Pixel Hero", subcategory: "Characters", tags: ["hero", "player", "character", "avatar", "walk", "8-bit"], art: { sprite: HERO, frames: { stride: HERO_STRIDE } } },
  { id: "pixel-star", name: "Pixel Star", subcategory: "Elements", tags: ["star", "power up", "favorite", "bonus", "invincible", "8-bit"], art: { sprite: STAR } },
  { id: "pixel-lightning", name: "Pixel Lightning", subcategory: "Elements", tags: ["lightning", "bolt", "energy", "power", "fast", "8-bit"], art: { sprite: LIGHTNING } },
  { id: "pixel-hourglass", name: "Pixel Hourglass", subcategory: "Elements", tags: ["hourglass", "time", "wait", "loading", "timer", "8-bit"], art: { sprite: HOURGLASS } },
  { id: "pixel-gamepad", name: "Pixel Gamepad", subcategory: "Interface", tags: ["gamepad", "controller", "game", "play", "console", "8-bit"], art: { sprite: GAMEPAD } },
  { id: "pixel-floppy", name: "Pixel Floppy", subcategory: "Interface", tags: ["floppy", "save", "disk", "storage", "retro", "8-bit"], art: { sprite: FLOPPY } },
  { id: "pixel-cursor", name: "Pixel Cursor", subcategory: "Interface", tags: ["cursor", "pointer", "click", "mouse", "select", "8-bit"], art: { sprite: CURSOR } },
];

const category: CategoryId = "pixel";

/** Outline-style pixel art: the sprite and every extra frame traced to 1px lines. */
export function tracedArt(art: PixelArt): PixelArt {
  return {
    sprite: outlineSprite(art.sprite),
    frames: art.frames ? Object.fromEntries(Object.entries(art.frames).map(([k, g]) => [k, outlineSprite(g)])) : undefined,
  };
}

export const pixelIconDefinitions: IconDefinition[] = SPECS.map((s) => ({
  id: s.id,
  name: s.name,
  category,
  subcategory: s.subcategory,
  tags: [...s.tags, "pixel", "pixel art", "retro", "arcade"],
  sizes: ICON_SIZES,
  isNew: true,
  pixel: s.art,
  outline: spriteNodes(outlineSprite(s.art.sprite)),
  fill: spriteNodes(s.art.sprite),
}));
