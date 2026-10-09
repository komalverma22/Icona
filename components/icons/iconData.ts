import { ICON_SIZES, type IconDefinition, type IconNode } from "./types";

/**
 * Icona icon set.
 *
 * Design language (applies to every icon):
 *  - 24 × 24 grid, ~2px safe area, optical centre at (12, 12)
 *  - 1.5px stroke, round caps, round joins, 1.5px corner radius on boxes
 *  - Fill variants reuse the outline silhouette (fill + matching 1.5px stroke);
 *    inner details are knocked out with an SVG mask.
 *
 * Node ids are semantic part names consumed by the animation recipes in
 * `animations/animated-icons/*`.
 *
 * To add an icon: define its nodes below → pick an `animation` (or "draw") → done.
 */

type Extra = Omit<Partial<IconNode>, "type" | "id">;

const p = (id: string, d: string, extra: Extra = {}): IconNode => ({ id, type: "path", d, ...extra }) as IconNode;
const c = (id: string, cx: number, cy: number, r: number, extra: Extra = {}): IconNode =>
  ({ id, type: "circle", cx, cy, r, ...extra }) as IconNode;

const FILL = { paint: "fill" } as const;
const KO = { knockout: true } as const;
const KO_FILL = { knockout: true, paint: "fill" } as const;

/* Shared geometry --------------------------------------------------------- */

const HEART_LEFT = "M12 20.5C12 20.5 3.5 15.6 3.5 9.25A4.25 4.25 0 0 1 7.75 5C9.6 5 11.1 6 12 7.6";
const HEART_RIGHT = "M12 20.5C12 20.5 20.5 15.6 20.5 9.25A4.25 4.25 0 0 0 16.25 5C14.4 5 12.9 6 12 7.6";
const HEART_FULL =
  "M12 20.5C12 20.5 3.5 15.6 3.5 9.25A4.25 4.25 0 0 1 7.75 5C9.6 5 11.1 6 12 7.6C12.9 6 14.4 5 16.25 5A4.25 4.25 0 0 1 20.5 9.25C20.5 15.6 12 20.5 12 20.5Z";
const STAR = "M12 3.5L14.6 8.8L20.4 9.65L16.2 13.75L17.2 19.55L12 16.8L6.8 19.55L7.8 13.75L3.6 9.65L9.4 8.8Z";
const BELL_BODY = "M6 10.5A6 6 0 0 1 18 10.5V15L19.5 17.5H4.5L6 15Z";
const BOOKMARK = "M7 3.5H17A1 1 0 0 1 18 4.5V20.5L12 16.5L6 20.5V4.5A1 1 0 0 1 7 3.5Z";
const HOUSE_FILLED =
  "M10.9 3.9A1.7 1.7 0 0 1 13.1 3.9L19.4 9.4C19.8 9.7 20 10.2 20 10.7V19A1.5 1.5 0 0 1 18.5 20.5H5.5A1.5 1.5 0 0 1 4 19V10.7C4 10.2 4.2 9.7 4.6 9.4Z";
const MAIL_BOX = "M4.5 5.5H19.5A1.5 1.5 0 0 1 21 7V17A1.5 1.5 0 0 1 19.5 18.5H4.5A1.5 1.5 0 0 1 3 17V7A1.5 1.5 0 0 1 4.5 5.5Z";
const LOCK_BODY = "M6.5 10.5H17.5A1.5 1.5 0 0 1 19 12V19A1.5 1.5 0 0 1 17.5 20.5H6.5A1.5 1.5 0 0 1 5 19V12A1.5 1.5 0 0 1 6.5 10.5Z";
const CALENDAR_FRAME = "M5.5 5H18.5A1.5 1.5 0 0 1 20 6.5V18.5A1.5 1.5 0 0 1 18.5 20H5.5A1.5 1.5 0 0 1 4 18.5V6.5A1.5 1.5 0 0 1 5.5 5Z";
const CAMERA_BODY =
  "M4.5 7.5H7.1L8.6 5H15.4L16.9 7.5H19.5A1.5 1.5 0 0 1 21 9V18A1.5 1.5 0 0 1 19.5 19.5H4.5A1.5 1.5 0 0 1 3 18V9A1.5 1.5 0 0 1 4.5 7.5Z";
const CLOUD = "M7 18.5A4.5 4.5 0 0 1 6.5 9.53A6 6 0 0 1 17.6 8.6A5 5 0 0 1 17 18.5Z";
const PLAY = "M8 5.5V18.5A0.75 0.75 0 0 0 9.1 19.15L19.5 12.65A0.75 0.75 0 0 0 19.5 11.35L9.1 4.85A0.75 0.75 0 0 0 8 5.5Z";
const PAUSE_LEFT = "M7 5H9.5A0.5 0.5 0 0 1 10 5.5V18.5A0.5 0.5 0 0 1 9.5 19H7A0.5 0.5 0 0 1 6.5 18.5V5.5A0.5 0.5 0 0 1 7 5Z";
const PAUSE_RIGHT = "M14.5 5H17A0.5 0.5 0 0 1 17.5 5.5V18.5A0.5 0.5 0 0 1 17 19H14.5A0.5 0.5 0 0 1 14 18.5V5.5A0.5 0.5 0 0 1 14.5 5Z";
const TRIANGLE = "M10.7 4.25A1.5 1.5 0 0 1 13.3 4.25L20.9 17.5A1.5 1.5 0 0 1 19.6 19.75H4.4A1.5 1.5 0 0 1 3.1 17.5Z";
const EYE_LID = "M2.5 12C4.5 8 8 5.5 12 5.5S19.5 8 21.5 12C19.5 16 16 18.5 12 18.5S4.5 16 2.5 12Z";
const FOLDER = "M3.5 7A1.5 1.5 0 0 1 5 5.5H9L11 8H19A1.5 1.5 0 0 1 20.5 9.5V18A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18Z";
const FILE_PAGE = "M14 3.5H7A1.5 1.5 0 0 0 5.5 5V19A1.5 1.5 0 0 0 7 20.5H17A1.5 1.5 0 0 0 18.5 19V8Z";
const BUBBLE =
  "M5 4.5H19A1.5 1.5 0 0 1 20.5 6V15.5A1.5 1.5 0 0 1 19 17H11L6.5 20.5V17H5A1.5 1.5 0 0 1 3.5 15.5V6A1.5 1.5 0 0 1 5 4.5Z";
/** Full circle (r 8.5) starting at the top so it draws clockwise from 12 o'clock. */
const RING = "M12 3.5A8.5 8.5 0 1 1 12 20.5A8.5 8.5 0 1 1 12 3.5";
/** Animation-only parts used by the "Open Letter" and "Drop In" motion variants. */
const TRASH_SCRAP = "M10.5 1L13.5 1.5L13 4L10 3.5Z";
const MAIL_LETTER: IconNode[] = [
  { id: "letter", type: "path", d: "M7 11V4.5A1 1 0 0 1 8 3.5H16A1 1 0 0 1 17 4.5V11", animationOnly: true },
  { id: "letterLine", type: "path", d: "M9.5 6.5H14.5", animationOnly: true },
];

/* Icons ------------------------------------------------------------------- */

const sizes = ICON_SIZES;

export const iconDefinitions: IconDefinition[] = [
  /* ---------------------------------------------------------------- Core */
  {
    id: "check",
    name: "Check",
    category: "core",
    subcategory: "Status",
    tags: ["check", "success", "done", "tick", "complete", "confirm"],
    sizes,
    animation: "check",
    outline: [p("check", "M5 12.5L9.5 17L19 7.5")],
  },
  {
    id: "check-circle",
    name: "Check Circle",
    category: "core",
    subcategory: "Status",
    tags: ["check", "success", "done", "verified", "complete"],
    sizes,
    animation: "checkCircle",
    outline: [p("circle", RING), p("check", "M8.25 12.25L10.75 14.75L15.75 9.5")],
    fill: [p("circle", RING, FILL), p("check", "M8.25 12.25L10.75 14.75L15.75 9.5", KO)],
  },
  {
    id: "x",
    name: "X",
    category: "core",
    subcategory: "Status",
    tags: ["x", "close", "cancel", "remove", "delete", "dismiss", "cross"],
    sizes,
    animation: "cross",
    outline: [p("a", "M6 6L18 18"), p("b", "M18 6L6 18")],
  },
  {
    id: "plus",
    name: "Plus",
    category: "core",
    subcategory: "Math",
    tags: ["plus", "add", "new", "create", "increase"],
    sizes,
    animation: "plus",
    outline: [p("h", "M5 12H19"), p("v", "M12 5V19")],
  },
  {
    id: "minus",
    name: "Minus",
    category: "core",
    subcategory: "Math",
    tags: ["minus", "subtract", "remove", "decrease", "collapse"],
    sizes,
    animation: "minus",
    outline: [p("h", "M5 12H19")],
  },
  {
    id: "info",
    name: "Info",
    category: "core",
    subcategory: "Status",
    tags: ["info", "information", "help", "about", "details"],
    sizes,
    animation: "info",
    outline: [p("circle", RING), p("stem", "M12 11V16.5"), p("dot", "M12 7.75H12.01")],
    fill: [p("circle", RING, FILL), p("stem", "M12 11V16.5", KO), p("dot", "M12 7.75H12.01", KO)],
  },
  {
    id: "alert",
    name: "Alert",
    category: "core",
    subcategory: "Status",
    tags: ["alert", "warning", "caution", "error", "danger", "triangle"],
    sizes,
    animation: "alert",
    outline: [p("triangle", TRIANGLE), p("bang", "M12 9.5V13.5"), p("dot", "M12 16.75H12.01")],
    fill: [p("triangle", TRIANGLE, FILL), p("bang", "M12 9.5V13.5", KO), p("dot", "M12 16.75H12.01", KO)],
  },
  {
    id: "home",
    name: "Home",
    category: "core",
    subcategory: "Essentials",
    tags: ["home", "house", "main", "dashboard", "start"],
    sizes,
    animation: "home",
    outline: [
      p("roof", "M3.5 11L12 3.5L20.5 11"),
      p("body", "M5.5 9.5V19A1.5 1.5 0 0 0 7 20.5H17A1.5 1.5 0 0 0 18.5 19V9.5"),
      p("door", "M10 20.5V16A2 2 0 0 1 14 16V20.5"),
    ],
    fill: [p("body", HOUSE_FILLED, FILL), p("door", "M10 21V16A2 2 0 0 1 14 16V21Z", KO_FILL)],
  },
  {
    id: "user",
    name: "User",
    category: "core",
    subcategory: "Essentials",
    tags: ["user", "person", "account", "profile", "avatar", "member"],
    sizes,
    animation: "user",
    outline: [c("head", 12, 8, 3.5), p("body", "M5 20C5 16.4 8.1 14 12 14S19 16.4 19 20")],
    fill: [c("head", 12, 8, 3.5, FILL), p("body", "M5 20C5 16.4 8.1 14 12 14S19 16.4 19 20Z", FILL)],
  },
  {
    id: "heart",
    name: "Heart",
    category: "core",
    subcategory: "Essentials",
    tags: ["heart", "like", "love", "favorite", "favourite", "health"],
    sizes,
    animation: "heart",
    outline: [
      p("fill", HEART_FULL, { paint: "fillOnly", animationOnly: true }),
      p("left", HEART_LEFT),
      p("right", HEART_RIGHT),
    ],
    fill: [p("fill", HEART_FULL, { paint: "fillOnly" }), p("left", HEART_LEFT), p("right", HEART_RIGHT)],
  },
  {
    id: "star",
    name: "Star",
    category: "core",
    subcategory: "Essentials",
    tags: ["star", "favorite", "rating", "rate", "bookmark", "featured"],
    sizes,
    animation: "star",
    outline: [p("star", STAR)],
    fill: [p("star", STAR, FILL)],
  },
  {
    id: "bookmark",
    name: "Bookmark",
    category: "core",
    subcategory: "Essentials",
    tags: ["bookmark", "save", "saved", "ribbon", "read later"],
    sizes,
    animation: "bookmark",
    outline: [p("body", BOOKMARK)],
    fill: [p("body", BOOKMARK, FILL)],
  },

  /* ------------------------------------------------------------------ UI */
  {
    id: "search",
    name: "Search",
    category: "ui",
    subcategory: "Controls",
    tags: ["search", "find", "magnifier", "lookup", "zoom", "query"],
    sizes,
    animation: "search",
    outline: [
      // Ring starts at the handle joint (45°) so the pen flows into the handle.
      p("ring", "M15.6 15.6A6.5 6.5 0 0 1 6.4 6.4A6.5 6.5 0 0 1 15.6 15.6"),
      p("handle", "M15.6 15.6L20 20"),
    ],
  },
  {
    id: "settings",
    name: "Settings",
    category: "ui",
    subcategory: "Controls",
    tags: ["settings", "preferences", "sliders", "controls", "adjust", "options", "configure"],
    sizes,
    animation: "settings",
    outline: [
      p("rail1a", "M4 8H7"),
      p("rail1b", "M11 8H20"),
      c("knob1", 9, 8, 2),
      p("rail2a", "M4 16H13"),
      p("rail2b", "M17 16H20"),
      c("knob2", 15, 16, 2),
    ],
  },
  {
    id: "menu",
    name: "Menu",
    category: "ui",
    subcategory: "Controls",
    tags: ["menu", "hamburger", "navigation", "list", "bars", "sidebar"],
    sizes,
    animation: "menu",
    outline: [p("top", "M4 6.5H20"), p("middle", "M4 12H20"), p("bottom", "M4 17.5H20")],
  },
  {
    id: "filter",
    name: "Filter",
    category: "ui",
    subcategory: "Controls",
    tags: ["filter", "funnel", "sort", "refine"],
    sizes,
    animation: "filter",
    outline: [p("funnel", "M4 4.5H20A0.5 0.5 0 0 1 20.4 5.3L14 13V19L10 20.5V13L3.6 5.3A0.5 0.5 0 0 1 4 4.5Z")],
    fill: [p("funnel", "M4 4.5H20A0.5 0.5 0 0 1 20.4 5.3L14 13V19L10 20.5V13L3.6 5.3A0.5 0.5 0 0 1 4 4.5Z", FILL)],
  },
  {
    id: "more",
    name: "More",
    category: "ui",
    subcategory: "Controls",
    tags: ["more", "dots", "ellipsis", "options", "overflow", "menu"],
    sizes,
    animation: "more",
    outline: [c("a", 6, 12, 1, FILL), c("b", 12, 12, 1, FILL), c("c", 18, 12, 1, FILL)],
  },
  {
    id: "loader",
    name: "Loader",
    category: "ui",
    subcategory: "Controls",
    tags: ["loader", "loading", "spinner", "progress", "wait", "busy"],
    sizes,
    animation: "loader",
    outline: [
      c("track", 12, 12, 8.5, { attrs: { strokeOpacity: 0.2 } }),
      c("arc", 12, 12, 8.5, {
        attrs: { strokeDasharray: "37.38 16.02", strokeDashoffset: 0, transform: "rotate(-90 12 12)" },
      }),
    ],
  },
  {
    id: "eye",
    name: "Eye",
    category: "ui",
    subcategory: "Actions",
    tags: ["eye", "view", "show", "visible", "preview", "watch"],
    sizes,
    animation: "eye",
    outline: [p("lid", EYE_LID), c("pupil", 12, 12, 3)],
    fill: [p("lid", EYE_LID, FILL), c("pupil", 12, 12, 3, KO)],
  },
  {
    id: "eye-off",
    name: "Eye Off",
    category: "ui",
    subcategory: "Actions",
    tags: ["eye off", "hide", "hidden", "invisible", "private", "password"],
    sizes,
    animation: "eyeOff",
    outline: [p("lid", EYE_LID), c("pupil", 12, 12, 3), p("slash", "M4 4L20 20")],
  },
  {
    id: "copy",
    name: "Copy",
    category: "ui",
    subcategory: "Actions",
    tags: ["copy", "duplicate", "clipboard", "clone", "paste"],
    sizes,
    animation: "copy",
    outline: [
      p("back", "M15.5 8V5.5A1.5 1.5 0 0 0 14 4H5.5A1.5 1.5 0 0 0 4 5.5V14A1.5 1.5 0 0 0 5.5 15.5H8"),
      p("front", "M10 8H18.5A1.5 1.5 0 0 1 20 9.5V18A1.5 1.5 0 0 1 18.5 19.5H10A1.5 1.5 0 0 1 8.5 18V9.5A1.5 1.5 0 0 1 10 8Z"),
    ],
  },
  {
    id: "edit",
    name: "Edit",
    category: "ui",
    subcategory: "Actions",
    tags: ["edit", "pencil", "write", "compose", "modify", "pen"],
    sizes,
    animation: "edit",
    outline: [
      p("pencil", "M15.5 4.5L19.5 8.5L9 19L4.5 20L5.5 15.5Z"),
      p("nib", "M13.5 6.5L17.5 10.5"),
      p("line", "M13 20H20"),
    ],
  },
  {
    id: "trash",
    name: "Trash",
    category: "ui",
    subcategory: "Actions",
    tags: ["trash", "delete", "remove", "bin", "garbage", "discard"],
    sizes,
    animation: "trash",
    outline: [
      p("lid", "M4 6.5H20"),
      p("handle", "M9.5 6.5V5A1.5 1.5 0 0 1 11 3.5H13A1.5 1.5 0 0 1 14.5 5V6.5"),
      p("body", "M6 6.5L6.9 19.1A1.5 1.5 0 0 0 8.4 20.5H15.6A1.5 1.5 0 0 0 17.1 19.1L18 6.5"),
      p("rib1", "M10 10.5V16.5"),
      p("rib2", "M14 10.5V16.5"),
      p("scrap", TRASH_SCRAP, { animationOnly: true }),
    ],
    fill: [
      p("lid", "M4 6.5H20"),
      p("handle", "M9.5 6.5V5A1.5 1.5 0 0 1 11 3.5H13A1.5 1.5 0 0 1 14.5 5V6.5"),
      p("body", "M6 6.5H18L17.1 19.1A1.5 1.5 0 0 1 15.6 20.5H8.4A1.5 1.5 0 0 1 6.9 19.1Z", FILL),
      p("rib1", "M10 10.5V16.5", KO),
      p("rib2", "M14 10.5V16.5", KO),
      p("scrap", TRASH_SCRAP, { animationOnly: true }),
    ],
  },
  {
    id: "lock",
    name: "Lock",
    category: "ui",
    subcategory: "Actions",
    tags: ["lock", "secure", "security", "password", "private", "protected"],
    sizes,
    animation: "lock",
    outline: [p("shackle", "M8 10.5V7.5A4 4 0 0 1 16 7.5V10.5"), p("body", LOCK_BODY), p("keyhole", "M12 14.5V16.5")],
    fill: [p("shackle", "M8 10.5V7.5A4 4 0 0 1 16 7.5V10.5"), p("body", LOCK_BODY, FILL), p("keyhole", "M12 14.5V16.5", KO)],
  },
  {
    id: "clock",
    name: "Clock",
    category: "ui",
    subcategory: "Time",
    tags: ["clock", "time", "hour", "watch", "schedule", "history"],
    sizes,
    animation: "clock",
    outline: [p("face", RING), p("minute", "M12 12V7.5"), p("hour", "M12 12L15 14")],
  },
  {
    id: "calendar",
    name: "Calendar",
    category: "ui",
    subcategory: "Time",
    tags: ["calendar", "date", "schedule", "event", "month", "day"],
    sizes,
    animation: "calendar",
    outline: [
      p("frame", CALENDAR_FRAME),
      p("ring1", "M8.5 3V7"),
      p("ring2", "M15.5 3V7"),
      p("rule", "M4 9.5H20"),
      p("d1", "M8 13.5H8.01"),
      p("d2", "M12 13.5H12.01"),
      p("d3", "M16 13.5H16.01"),
      p("d4", "M8 16.75H8.01"),
    ],
    fill: [
      p("frame", CALENDAR_FRAME, FILL),
      p("ring1", "M8.5 3V7"),
      p("ring2", "M15.5 3V7"),
      p("rule", "M4 9.5H20", KO),
      p("d1", "M8 13.5H8.01", KO),
      p("d2", "M12 13.5H12.01", KO),
      p("d3", "M16 13.5H16.01", KO),
      p("d4", "M8 16.75H8.01", KO),
    ],
  },

  /* ---------------------------------------------------------- Navigation */
  {
    id: "arrow",
    name: "Arrow",
    category: "navigation",
    subcategory: "Arrows",
    tags: ["arrow", "up right", "diagonal", "direction", "go", "link"],
    sizes,
    animation: "arrow",
    animationOptions: { direction: "upRight" },
    outline: [p("shaft", "M6 18L17.5 6.5"), p("head", "M8 6H18V16")],
  },
  {
    id: "arrow-right",
    name: "Arrow Right",
    category: "navigation",
    subcategory: "Arrows",
    tags: ["arrow", "right", "next", "forward", "direction", "east"],
    sizes,
    animation: "arrow",
    animationOptions: { direction: "right" },
    outline: [p("shaft", "M4 12H19"), p("head", "M13 6L19 12L13 18")],
  },
  {
    id: "arrow-left",
    name: "Arrow Left",
    category: "navigation",
    subcategory: "Arrows",
    tags: ["arrow", "left", "back", "previous", "direction", "west"],
    sizes,
    animation: "arrow",
    animationOptions: { direction: "left" },
    outline: [p("shaft", "M20 12H5"), p("head", "M11 6L5 12L11 18")],
  },
  {
    id: "arrow-up",
    name: "Arrow Up",
    category: "navigation",
    subcategory: "Arrows",
    tags: ["arrow", "up", "top", "increase", "direction", "north"],
    sizes,
    animation: "arrow",
    animationOptions: { direction: "up" },
    outline: [p("shaft", "M12 20V5"), p("head", "M6 11L12 5L18 11")],
  },
  {
    id: "arrow-down",
    name: "Arrow Down",
    category: "navigation",
    subcategory: "Arrows",
    tags: ["arrow", "down", "bottom", "decrease", "direction", "south"],
    sizes,
    animation: "arrow",
    animationOptions: { direction: "down" },
    outline: [p("shaft", "M12 4V19"), p("head", "M6 13L12 19L18 13")],
  },
  {
    id: "chevron-right",
    name: "Chevron Right",
    category: "navigation",
    subcategory: "Chevrons",
    tags: ["chevron", "right", "next", "caret", "expand"],
    sizes,
    animation: "chevron",
    animationOptions: { direction: "right" },
    outline: [p("chevron", "M9 5L16 12L9 19")],
  },
  {
    id: "chevron-down",
    name: "Chevron Down",
    category: "navigation",
    subcategory: "Chevrons",
    tags: ["chevron", "down", "dropdown", "caret", "expand", "select"],
    sizes,
    outline: [p("chevron", "M5 9L12 16L19 9")],
  },
  {
    id: "external-link",
    name: "External Link",
    category: "navigation",
    subcategory: "Links",
    tags: ["external link", "open", "new tab", "share", "outbound", "link"],
    sizes,
    animation: "externalLink",
    outline: [
      p("box", "M18 13.5V17.5A1.5 1.5 0 0 1 16.5 19H6.5A1.5 1.5 0 0 1 5 17.5V7.5A1.5 1.5 0 0 1 6.5 6H10.5"),
      p("shaft", "M11 13L19.5 4.5"),
      p("head", "M14.5 4H20V9.5"),
    ],
  },

  /* ------------------------------------------------------- Communication */
  {
    id: "bell",
    name: "Bell",
    category: "communication",
    tags: ["bell", "notification", "alert", "alarm", "ring", "reminder"],
    sizes,
    animation: "bell",
    outline: [p("crown", "M12 3V4.5"), p("body", BELL_BODY), p("clapper", "M10.2 20A2 2 0 0 0 13.8 20")],
    fill: [p("crown", "M12 3V4.5"), p("body", BELL_BODY, FILL), p("clapper", "M10.2 20A2 2 0 0 0 13.8 20")],
  },
  {
    id: "mail",
    name: "Mail",
    category: "communication",
    tags: ["mail", "email", "envelope", "message", "inbox", "letter"],
    sizes,
    animation: "mail",
    outline: [p("envelope", MAIL_BOX), p("flap", "M3.5 7L12 13L20.5 7"), ...MAIL_LETTER],
    fill: [p("envelope", MAIL_BOX, FILL), p("flap", "M3.5 7L12 13L20.5 7", KO), ...MAIL_LETTER],
  },
  {
    id: "message",
    name: "Message",
    category: "communication",
    tags: ["message", "chat", "comment", "conversation", "bubble", "typing"],
    sizes,
    animation: "message",
    outline: [p("bubble", BUBBLE), p("d1", "M8.5 10.75H8.51"), p("d2", "M12 10.75H12.01"), p("d3", "M15.5 10.75H15.51")],
    fill: [
      p("bubble", BUBBLE, FILL),
      p("d1", "M8.5 10.75H8.51", KO),
      p("d2", "M12 10.75H12.01", KO),
      p("d3", "M15.5 10.75H15.51", KO),
    ],
  },

  /* -------------------------------------------------------------- Social */
  {
    id: "share",
    name: "Share",
    category: "social",
    tags: ["share", "network", "connect", "send", "social", "nodes"],
    sizes,
    animation: "share",
    outline: [
      c("source", 6, 12, 2.5),
      p("link1", "M8.2 10.8L15.8 6.7"),
      p("link2", "M8.2 13.2L15.8 17.3"),
      c("target1", 18, 5.5, 2.5),
      c("target2", 18, 18.5, 2.5),
    ],
  },
  {
    id: "github",
    name: "Github",
    category: "social",
    tags: ["github", "git", "code", "repository", "octocat", "brand", "social"],
    sizes,
    animation: "github",
    outline: [
      p(
        "body",
        "M15 21.5V18.3C15 17.4 14.7 16.7 14.2 16.2C17 15.9 20 14.8 20 10C20 8.7 19.5 7.6 18.8 6.7C18.9 6.4 19.3 5.1 18.7 3.4C18.7 3.4 17.7 3.1 15.4 4.6A11.3 11.3 0 0 0 9.4 4.6C7.1 3.1 6.1 3.4 6.1 3.4C5.5 5.1 5.9 6.4 6 6.7C5.2 7.6 4.8 8.7 4.8 10C4.8 14.8 7.7 15.9 10.6 16.2C10.2 16.6 9.9 17.2 9.8 18V21.5",
      ),
      p("tail", "M9.8 19.2C6.6 20.2 6.2 17.6 4.5 17.2"),
    ],
  },

  /* --------------------------------------------------------------- Media */
  {
    id: "play",
    name: "Play",
    category: "media",
    subcategory: "Playback",
    tags: ["play", "start", "video", "audio", "media", "resume"],
    sizes,
    animation: "play",
    outline: [p("triangle", PLAY)],
    fill: [p("triangle", PLAY, FILL)],
  },
  {
    id: "pause",
    name: "Pause",
    category: "media",
    subcategory: "Playback",
    tags: ["pause", "stop", "hold", "video", "audio", "media"],
    sizes,
    animation: "pause",
    outline: [p("left", PAUSE_LEFT), p("right", PAUSE_RIGHT)],
    fill: [p("left", PAUSE_LEFT, FILL), p("right", PAUSE_RIGHT, FILL)],
  },
  {
    id: "volume",
    name: "Volume",
    category: "media",
    subcategory: "Playback",
    tags: ["volume", "sound", "audio", "speaker", "loud", "music"],
    sizes,
    animation: "volume",
    outline: [
      p("speaker", "M4.5 9.5H7.5L12 5.5V18.5L7.5 14.5H4.5A1 1 0 0 1 3.5 13.5V10.5A1 1 0 0 1 4.5 9.5Z"),
      p("wave1", "M15.5 9A4 4 0 0 1 15.5 15"),
      p("wave2", "M18.5 6.5A7.5 7.5 0 0 1 18.5 17.5"),
    ],
  },
  {
    id: "camera",
    name: "Camera",
    category: "media",
    subcategory: "Capture",
    tags: ["camera", "photo", "picture", "capture", "snapshot", "lens"],
    sizes,
    animation: "camera",
    outline: [p("body", CAMERA_BODY), c("lens", 12, 13, 3.5)],
    fill: [p("body", CAMERA_BODY, FILL), c("lens", 12, 13, 3.5, KO)],
  },
  {
    id: "image",
    name: "Image",
    category: "media",
    subcategory: "Capture",
    tags: ["image", "picture", "photo", "gallery", "media", "landscape"],
    sizes,
    outline: [
      p("frame", "M5 4.5H19A1.5 1.5 0 0 1 20.5 6V18A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Z"),
      p("mountain", "M3.5 16L8 11.5L12 15.5L14.5 13L20.5 19"),
      c("sun", 15.5, 9, 1.5),
    ],
  },

  /* --------------------------------------------------------------- Files */
  {
    id: "download",
    name: "Download",
    category: "files",
    tags: ["download", "save", "import", "arrow down", "get"],
    sizes,
    animation: "download",
    outline: [
      p("tray", "M4 15V18.5A1.5 1.5 0 0 0 5.5 20H18.5A1.5 1.5 0 0 0 20 18.5V15"),
      p("shaft", "M12 3.5V14.5"),
      p("head", "M7.5 10L12 14.5L16.5 10"),
    ],
  },
  {
    id: "upload",
    name: "Upload",
    category: "files",
    tags: ["upload", "export", "send", "arrow up", "publish"],
    sizes,
    animation: "upload",
    outline: [
      p("tray", "M4 15V18.5A1.5 1.5 0 0 0 5.5 20H18.5A1.5 1.5 0 0 0 20 18.5V15"),
      p("shaft", "M12 14.5V3.5"),
      p("head", "M7.5 8L12 3.5L16.5 8"),
    ],
  },
  {
    id: "cloud",
    name: "Cloud",
    category: "files",
    tags: ["cloud", "storage", "sync", "weather", "backup", "online"],
    sizes,
    animation: "cloud",
    outline: [p("cloud", CLOUD)],
    fill: [p("cloud", CLOUD, FILL)],
  },
  {
    id: "folder",
    name: "Folder",
    category: "files",
    tags: ["folder", "directory", "files", "project", "archive"],
    sizes,
    animation: "folder",
    outline: [p("folder", FOLDER), p("pocket", "M3.5 11H20.5")],
    fill: [p("folder", FOLDER, FILL), p("pocket", "M3.5 11H20.5", KO)],
  },
  {
    id: "file",
    name: "File",
    category: "files",
    tags: ["file", "document", "page", "paper", "text", "doc"],
    sizes,
    animation: "file",
    outline: [p("page", FILE_PAGE), p("corner", "M14 3.5V8H18.5"), p("line1", "M9 13H15"), p("line2", "M9 16.5H13")],
    fill: [
      p("page", FILE_PAGE, FILL),
      p("corner", "M14 3.5V8H18.5", KO),
      p("line1", "M9 13H15", KO),
      p("line2", "M9 16.5H13", KO),
    ],
  },

  /* ------------------------------------------------------------ Commerce */
  {
    id: "cart",
    name: "Cart",
    category: "commerce",
    tags: ["cart", "shopping", "basket", "buy", "checkout", "store"],
    sizes,
    animation: "cart",
    outline: [
      p("basket", "M3 4H5L7.2 14.5A1.5 1.5 0 0 0 8.7 15.7H17.3A1.5 1.5 0 0 0 18.8 14.5L20.5 8H6"),
      c("wheel1", 9, 19.5, 1.25),
      c("wheel2", 17, 19.5, 1.25),
    ],
  },
  {
    id: "tag",
    name: "Tag",
    category: "commerce",
    tags: ["tag", "price", "label", "sale", "discount", "coupon"],
    sizes,
    outline: [
      p("tag", "M3.5 12.1V4.5A1 1 0 0 1 4.5 3.5H12.1A1 1 0 0 1 12.8 3.8L20.8 11.8A1 1 0 0 1 20.8 13.2L13.2 20.8A1 1 0 0 1 11.8 20.8L3.8 12.8A1 1 0 0 1 3.5 12.1Z"),
      c("hole", 8, 8, 1.25),
    ],
  },
  {
    id: "credit-card",
    name: "Credit Card",
    category: "commerce",
    tags: ["credit card", "payment", "card", "billing", "pay", "checkout"],
    sizes,
    outline: [
      p("card", "M5 5.5H19A1.5 1.5 0 0 1 20.5 7V17A1.5 1.5 0 0 1 19 18.5H5A1.5 1.5 0 0 1 3.5 17V7A1.5 1.5 0 0 1 5 5.5Z"),
      p("stripe", "M3.5 10H20.5"),
      p("chip", "M7 14.5H10"),
    ],
  },
];
