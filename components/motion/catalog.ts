import type { AnimationName, AnimationOptions } from "../icons/animations/animationTypes";
import type { MotionStyleId, MotionVariant } from "./types";

/**
 * Curated motion variants per icon id. Each icon gets animations that match
 * what it means - a car drives, a bell swings, a balloon pops - rather than
 * one generic effect for everything. The icon's own path animation is always
 * offered first as "Signature" (added by the registry).
 *
 * Entry: [label, style, effect?, extras?]
 */
type Extra = { recipe?: AnimationName; recipeOptions?: AnimationOptions; morphTo?: string; pixel?: string };
type Entry = readonly [label: string, style: MotionStyleId, effect?: string, extra?: Extra];

const slug = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* Shared groups ------------------------------------------------------------- */

const ARROW: Entry[] = [
  ["Dash", "motion", "dash"],
  ["Fly Through", "motion", "fly-through"],
  ["Nudge", "loop", "nudge"],
  ["Point at Cursor", "cursor", "look-at"],
  ["Afterimage", "experimental", "afterimage"],
];
const CHEVRON: Entry[] = [
  ["Nudge", "loop", "nudge"],
  ["Dash", "motion", "dash"],
  ["Flip", "3d", "flip-x"],
  ["Rubber Band", "elastic", "rubber-band"],
];
const DATA: Entry[] = [
  ["Wipe Reveal", "morph", "wipe"],
  ["Shine", "light", "shine"],
  ["Jelly", "elastic", "jelly"],
];

/* Catalogue ------------------------------------------------------------------ */

const CATALOG: Record<string, Entry[]> = {
  /* Core */
  check: [["Stamp", "elastic", "boing"], ["Nod Yes", "3d", "nod"], ["Confetti", "explosive", "confetti-burst"], ["Iris Reveal", "morph", "iris"]],
  "check-circle": [["Success Burst", "explosive", "confetti-burst"], ["Coin Flip", "3d", "flip-y"], ["Ripple", "particles", "ripple"], ["Pulse", "loop", "pulse"]],
  x: [["Head Shake", "shake", "headshake"], ["Shake No", "shake", "shake"], ["Shatter", "explosive", "shatter"], ["Rubber Band", "elastic", "rubber-band"]],
  plus: [["Morph to Close", "morph", undefined, { recipe: "plusMorph" }], ["Boing", "elastic", "boing"], ["Sparkle", "particles", "sparkle"], ["Wind Up", "motion", "wind-up"]],
  minus: [["Morph to Plus", "morph", "gooey-morph", { morphTo: "plus" }], ["Squash", "elastic", "rubber-band"], ["Wobble", "shake", "wobble"]],
  info: [["Drop In", "physics", "drop-bounce"], ["Pulse", "loop", "pulse"], ["Ripple", "particles", "ripple"], ["Glow", "light", "glow-pulse"]],
  alert: [["Alarm Rattle", "shake", "rattle"], ["Warning Flicker", "light", "neon-flicker"], ["Ripple", "particles", "ripple"], ["Jelly", "elastic", "jelly"]],
  home: [["Drop In", "physics", "drop-bounce"], ["Tilt 3D", "cursor", "tilt-3d"], ["Home Sweet Home", "particles", "hearts"], ["Pop Out", "3d", "pop-out"]],
  user: [["Peekaboo", "experimental", "peekaboo"], ["Say Hi", "shake", "jiggle"], ["Magnetic", "cursor", "magnetic"], ["Spotlight", "light", "shine"]],
  heart: [
    ["Heartbeat", "loop", "heartbeat"],
    ["Love Burst", "particles", "hearts"],
    ["Jelly", "elastic", "jelly"],
    ["Heartbreak", "explosive", "shatter"],
    ["Flip Card", "3d", "flip-y"],
  ],
  star: [["Supernova", "explosive", "supernova"], ["Twinkle", "particles", "sparkle"], ["Spin", "3d", "flip-y"], ["Shine", "light", "shine"]],
  bookmark: [["Drop In", "physics", "drop-bounce"], ["Ribbon Flutter", "elastic", "wobble-skew"], ["Card Swing", "3d", "card-swing"]],

  /* UI */
  search: [["Scan Around", "motion", "orbit-path"], ["Zoom Boing", "elastic", "boing"], ["Follow Cursor", "cursor", "magnetic"], ["Glint", "light", "shine"]],
  settings: [["Jelly", "elastic", "jelly"], ["Wobble", "shake", "wobble"], ["Glitch", "experimental", "glitch"]],
  menu: [["Morph to Close", "morph", undefined, { recipe: "menuMorph" }], ["Stretch", "elastic", "rubber-band"], ["Wobble", "shake", "wobble"]],
  filter: [["Drip", "particles", "rain"], ["Squash", "elastic", "squash-stretch"], ["Shake", "shake", "shake"]],
  more: [["Wave", "elastic", "wobble-skew"], ["Pulse", "loop", "pulse"], ["Glitch", "experimental", "glitch"]],
  loader: [["Spin", "loop", "spin"], ["Orbit", "particles", "orbit"], ["Breathe", "loop", "breathe"], ["Glitch", "experimental", "glitch"]],
  eye: [["Blink", "morph", undefined, { recipe: "eyeBlink" }], ["Look at Cursor", "cursor", "magnetic"], ["Peekaboo", "experimental", "peekaboo"], ["Hide", "morph", "gooey-morph", { morphTo: "eye-off" }]],
  "eye-off": [["Reveal", "morph", "gooey-morph", { morphTo: "eye" }], ["Shake", "shake", "shake"], ["Glitch", "experimental", "glitch"]],
  copy: [["Duplicate", "experimental", "afterimage"], ["Flip", "3d", "flip-y"], ["Stamp", "elastic", "boing"], ["Shine", "light", "shine"]],
  edit: [["Scribble", "motion", "scribble"], ["Wobble", "shake", "wobble"], ["Sparkle", "particles", "sparkle"]],
  trash: [["Drop It In", "physics", undefined, { recipe: "trashDrop" }], ["Tip Over", "physics", "tip-over"], ["Compact", "elastic", "jelly"], ["Rattle", "shake", "rattle"], ["Disintegrate", "experimental", "disintegrate"]],
  lock: [["Rattle", "shake", "rattle"], ["Hack", "experimental", "glitch"], ["Flip", "3d", "flip-y"], ["Shine", "light", "shine"]],
  clock: [["Time Warp", "motion", undefined, { recipe: "clockSpin" }], ["Alarm Rattle", "shake", "rattle"], ["Tick-Tock", "loop", "metronome"], ["Melt", "experimental", "melt"]],
  calendar: [["Page Flip", "3d", "flip-x"], ["Drop In", "physics", "drop-bounce"], ["Event Confetti", "explosive", "confetti-burst"], ["Shake", "shake", "shake"]],
  refresh: [["Spin", "loop", "spin"], ["Wind Up", "motion", "wind-up"], ["Rewind", "experimental", "rewind"]],
  undo: [["Rewind", "experimental", "rewind"], ["Dash Back", "motion", "dash", { recipeOptions: { direction: "left" } }], ["Wobble", "shake", "wobble"]],
  layers: [["Tilt 3D", "cursor", "tilt-3d"], ["Flip", "3d", "flip-x"], ["Squash", "elastic", "squash-stretch"], ["Float", "loop", "float"]],
  hourglass: [["Flip Over", "physics", "flip-over"], ["Spin", "loop", "spin"], ["Melt", "experimental", "melt"]],

  /* Navigation */
  arrow: ARROW,
  "arrow-right": ARROW,
  "arrow-left": ARROW,
  "arrow-up": ARROW,
  "arrow-down": ARROW,
  "chevron-right": CHEVRON,
  "chevron-down": CHEVRON,
  "external-link": [["Fly Out", "motion", "fly-through"], ["Pop Out", "3d", "pop-out"], ["Shine", "light", "shine"]],

  /* Communication & social */
  bell: [["Ring", "shake", "swing"], ["Vibrate", "shake", "vibrate"], ["Drop In", "physics", "drop-bounce"], ["Ripple", "particles", "ripple"], ["Glow", "light", "glow-pulse"]],
  mail: [["Open Letter", "morph", undefined, { recipe: "mailOpen" }], ["Fly Away", "motion", "fly-curve"], ["New Mail", "shake", "rattle"], ["Love Letter", "particles", "hearts"]],
  message: [["Pop In", "physics", "drop-bounce"], ["Jelly", "elastic", "jelly"], ["Hearts", "particles", "hearts"], ["Float", "loop", "float"]],
  share: [["Burst", "explosive", "star-scatter"], ["Orbit", "particles", "orbit"], ["Spin", "3d", "flip-y"], ["Ripple", "particles", "ripple"]],
  github: [["Tilt 3D", "cursor", "tilt-3d"], ["Wobble", "shake", "wobble"], ["Glitch", "experimental", "glitch"], ["Float", "loop", "float"]],

  /* Media */
  play: [["Morph to Pause", "morph", "gooey-morph", { morphTo: "pause" }], ["Dash", "motion", "dash"], ["Pulse", "loop", "pulse"], ["Ripple", "particles", "ripple"]],
  pause: [["Morph to Play", "morph", "flip-morph", { morphTo: "play" }], ["Breathe", "loop", "breathe"], ["Squash", "elastic", "squash-stretch"]],
  volume: [["Music Notes", "particles", "notes"], ["Bass Thump", "elastic", "thump"], ["Ripple", "particles", "ripple"], ["Vibrate", "shake", "vibrate"]],
  camera: [["Flash", "light", "camera-flash"], ["Shutter Shake", "shake", "jiggle"], ["Pop Out", "3d", "pop-out"]],
  image: [["Iris Reveal", "morph", "iris"], ["Tilt 3D", "cursor", "tilt-3d"], ["Polaroid Drop", "physics", "drop-bounce"], ["Shine", "light", "shine"]],

  /* Files */
  download: [["Drop Into Tray", "physics", undefined, { recipe: "downloadDrop" }], ["Bounce", "elastic", "squash-stretch"], ["Pulse", "loop", "pulse"]],
  upload: [["Launch", "motion", "launch"], ["Float", "loop", "float"], ["Pulse", "loop", "pulse"]],
  cloud: [["Rain", "particles", "rain"], ["Drift", "loop", "float"], ["Thunder", "light", "flash"], ["Melt", "experimental", "melt"]],
  folder: [["Open Door", "3d", "door-open"], ["Drop In", "physics", "drop-bounce"], ["Jelly", "elastic", "jelly"]],
  file: [["Page Turn", "3d", "flip-y"], ["Tip Over", "physics", "tip-over"], ["Iris Reveal", "morph", "iris"], ["Disintegrate", "experimental", "disintegrate"]],

  /* Commerce */
  cart: [["Drive Off", "motion", "drive-forward"], ["Cha-Ching", "particles", "coins"], ["Rattle", "shake", "rattle"]],
  tag: [["Swing", "physics", "pendulum"], ["Coins", "particles", "coins"], ["Shine", "light", "shine"]],
  "credit-card": [["Swipe", "motion", "fly-through"], ["Flip", "3d", "flip-y"], ["Cha-Ching", "particles", "coins"], ["Shine", "light", "shine"]],
  gift: [["Shake Shake", "shake", "rattle"], ["Unbox Confetti", "explosive", "confetti-burst"], ["Toss", "physics", "toss"], ["Hearts", "particles", "hearts"]],

  /* Developer */
  command: [["Spin", "loop", "spin"], ["Glitch", "experimental", "glitch"], ["Jelly", "elastic", "jelly"]],
  keyboard: [["Clatter", "shake", "vibrate"], ["Glitch", "experimental", "glitch"], ["Wave", "elastic", "wobble-skew"]],
  terminal: [["Blinking Caret", "light", "blink"], ["Glitch", "experimental", "glitch"], ["Boot Up", "morph", "wipe"], ["Shake", "shake", "shake"]],
  code: [["Glitch", "experimental", "glitch"], ["Afterimage", "experimental", "afterimage"], ["Bracket Squeeze", "elastic", "rubber-band"], ["Flip", "3d", "flip-y"]],
  "git-branch": [["Orbit", "particles", "orbit"], ["Wobble", "shake", "wobble"], ["Float", "loop", "float"]],
  scan: [["Scan Shine", "light", "shine"], ["Pulse", "loop", "pulse"], ["Ripple", "particles", "ripple"], ["Glitch", "experimental", "glitch"]],
  "qr-code": [["Glitch", "experimental", "glitch"], ["Scan Shine", "light", "shine"], ["Flip", "3d", "flip-y"]],
  toggle: [["Jelly", "elastic", "jelly"], ["Bounce", "physics", "drop-bounce"], ["Magnetic", "cursor", "magnetic"]],
  cursor: [["Click", "elastic", "click"], ["Magnetic", "cursor", "magnetic"], ["Point at Cursor", "cursor", "look-at"], ["Afterimage", "experimental", "afterimage"]],
  grip: [["Wiggle", "shake", "jiggle"], ["Magnetic", "cursor", "magnetic"], ["Drag", "experimental", "afterimage"]],
  rocket: [
    ["Launch", "motion", "launch", { recipe: "rocketFlame" }],
    ["Loop-the-Loop", "motion", "loop-the-loop", { recipe: "rocketFlame" }],
    ["Hover", "loop", "hover"],
    ["Rumble", "shake", "burnout"],
  ],
  bug: [["Scurry", "motion", "zigzag"], ["Squash", "elastic", "squash-stretch"], ["Glitch", "experimental", "glitch"], ["Tremble", "shake", "tremble"]],

  /* Devices */
  wifi: [["Signal Ripple", "particles", "ripple"], ["Pulse", "loop", "pulse"], ["Weak Signal", "light", "neon-flicker"]],
  battery: [["Charging Glow", "light", "glow-pulse"], ["Electric", "particles", "electric"], ["Low Battery", "shake", "shake"]],
  mic: [["Voice Ripple", "particles", "ripple"], ["Sing", "particles", "notes"], ["Vibrate", "shake", "vibrate"], ["Bob", "loop", "bob"]],
  headphones: [["Beat", "elastic", "thump"], ["Music Notes", "particles", "notes"], ["Tilt 3D", "cursor", "tilt-3d"], ["Wobble", "shake", "wobble"]],

  /* Security */
  fingerprint: [["Scan Shine", "light", "shine"], ["Glow", "light", "glow-pulse"], ["Ripple", "particles", "ripple"], ["Glitch", "experimental", "glitch"]],
  key: [["Swing", "physics", "pendulum"], ["Shine", "light", "shine"], ["Rattle", "shake", "rattle"], ["Flip", "3d", "flip-x"]],
  "shield-check": [["Block", "elastic", "boing"], ["Shine", "light", "shine"], ["Pulse", "loop", "pulse"], ["Flip", "3d", "flip-y"]],

  /* Nature */
  sun: [["Slow Spin", "loop", "slow-spin"], ["Supernova", "explosive", "supernova"], ["Morph to Moon", "morph", "gooey-morph", { morphTo: "moon" }], ["Glow", "light", "glow-pulse"]],
  moon: [["Sleepy Zzz", "particles", "zzz"], ["Float", "loop", "float"], ["Morph to Sun", "morph", "gooey-morph", { morphTo: "sun" }], ["Twinkle", "particles", "sparkle"]],
  sparkles: [["Twinkle", "particles", "sparkle"], ["Firework", "explosive", "firework"], ["Spin", "3d", "flip-y"], ["Pulse", "loop", "pulse"]],
  zap: [["Electric Flash", "light", "flash"], ["Strike", "physics", "strike"], ["Neon Flicker", "light", "neon-flicker"], ["Charged", "particles", "electric"]],
  flame: [["Embers", "particles", "embers"], ["Flicker", "light", "neon-flicker"], ["Grow", "elastic", "stretch-reach"], ["Liquid Sway", "elastic", "liquid"]],
  droplet: [["Splash", "physics", "splash"], ["Ripple", "particles", "ripple"], ["Jelly", "elastic", "jelly"], ["Melt", "experimental", "melt"]],
  leaf: [["Falling Leaf", "physics", "leaf-fall"], ["Leaf Shower", "particles", "leaves"], ["Sway", "loop", "sway"], ["Spin", "3d", "flip-y"]],
  lightbulb: [["Idea!", "light", "camera-flash"], ["Hanging Swing", "physics", "pendulum"], ["Flicker", "light", "neon-flicker"], ["Pop", "elastic", "boing"]],
  umbrella: [["Rainy Day", "particles", "umbrella-rain"], ["Pop Open", "elastic", "boing"], ["Swing", "physics", "pendulum"]],
  atom: [["Orbit", "particles", "orbit"], ["Spin", "loop", "spin"], ["Supernova", "explosive", "supernova"], ["Turntable", "3d", "turntable"]],
  sprout: [["Grow", "elastic", "stretch-reach"], ["Sway", "loop", "sway"], ["Leaf Shower", "particles", "leaves"]],

  /* Maps */
  "map-pin": [["Drop & Bounce", "physics", "drop-bounce"], ["Ripple", "particles", "ripple"], ["Float", "loop", "float"], ["Spin", "3d", "flip-y"]],
  compass: [["Point at Cursor", "cursor", "look-at"], ["Spin", "loop", "spin"], ["Wobble", "shake", "wobble"]],
  anchor: [["Sink & Bob", "physics", "sink-bob"], ["Swing", "physics", "pendulum"], ["Bubbles", "particles", "bubbles"]],
  flag: [["Sway", "loop", "sway"], ["Plant", "physics", "drop-bounce"], ["Finish Line", "explosive", "confetti-burst"]],
  target: [["Bullseye", "explosive", "bullseye"], ["Ripple", "particles", "ripple"], ["Spin", "3d", "flip-y"], ["Pulse", "loop", "pulse"]],
  car: [
    ["Drive Forward", "motion", "drive-forward", { recipe: "carWheels" }],
    ["Drift", "motion", "drift", { recipe: "carWheels" }],
    ["Wheel Spin", "motion", "burnout", { recipe: "carWheels" }],
    ["Reverse", "motion", "reverse", { recipe: "carWheels", recipeOptions: { direction: "left" } }],
    ["Crash Bounce", "physics", "crash-bounce"],
  ],

  /* Playground */
  "paper-plane": [["Fly Curve", "motion", "fly-curve"], ["Loop-the-Loop", "motion", "loop-the-loop"], ["Fly Through", "motion", "fly-through", { recipeOptions: { direction: "upRight" } }], ["Crumple", "elastic", "jelly"]],
  "party-popper": [
    ["Pop!", "explosive", "confetti-tip", { recipe: "partyStreamers" }],
    ["Firework", "explosive", "firework"],
    ["Shake to Pop", "shake", "rattle"],
    ["Spin", "3d", "flip-y"],
  ],
  ghost: [["Float & Fade", "loop", "breathe"], ["Peekaboo", "experimental", "peekaboo"], ["Haunt", "shake", "tremble"], ["Pass Through", "experimental", "afterimage"], ["Shy", "cursor", "repel"]],
  magnet: [["Attract", "particles", "attract"], ["Magnetic", "cursor", "magnetic"], ["Pulse", "loop", "pulse"], ["Rattle", "shake", "rattle"]],
  coffee: [["Steam", "particles", "steam"], ["Jiggle", "shake", "jiggle"], ["Warm Glow", "light", "glow-pulse"]],
  megaphone: [["Announce", "shake", "rattle"], ["Broadcast", "particles", "ripple"], ["Boing", "elastic", "boing"]],
  "magic-wand": [["Cast Spell", "particles", "wand-cast"], ["Twinkle", "particles", "sparkle"], ["Spin", "3d", "flip-y"]],
  dice: [["Roll", "physics", "toss"], ["Rattle", "shake", "rattle"], ["Spin 3D", "3d", "flip-x"]],
  balloon: [["Float Away", "motion", "float-away"], ["Pop", "explosive", "pop"], ["Sway", "loop", "sway"]],
  eyedropper: [["Drip", "particles", "rain"], ["Squeeze", "elastic", "rubber-band"], ["Tilt 3D", "cursor", "tilt-3d"]],
  "pen-tool": [["Scribble", "motion", "scribble"], ["Wobble", "shake", "wobble"], ["Shine", "light", "shine"]],
  palette: [["Paint Splash", "explosive", "confetti-burst"], ["Spin", "loop", "spin"], ["Jelly", "elastic", "jelly"]],

  /* Discover set */
  regex: [["Glitch", "experimental", "glitch"], ["Spin", "loop", "spin"], ["Pulse", "loop", "pulse"]],
  variable: [["Bracket Squeeze", "elastic", "rubber-band"], ["Glitch", "experimental", "glitch"], ["Flip", "3d", "flip-y"]],
  breakpoint: [["Pulse", "loop", "pulse"], ["Ripple", "particles", "ripple"], ["Shake", "shake", "shake"]],
  diff: [["Flip", "3d", "flip-y"], ["Glitch", "experimental", "glitch"], ["Jelly", "elastic", "jelly"]],
  webhook: [["Orbit", "particles", "orbit"], ["Ripple", "particles", "ripple"], ["Spin", "loop", "spin"]],
  recurring: [["Spin", "loop", "spin"], ["Rewind", "experimental", "rewind"], ["Pulse", "loop", "pulse"]],
  sparkline: DATA,
  heatmap: [["Glitch", "experimental", "glitch"], ...DATA.slice(0, 2)],
  "scatter-plot": [["Shatter", "explosive", "shatter"], ...DATA.slice(0, 2)],
  "box-plot": [["Squash", "elastic", "squash-stretch"], ...DATA],
  "funnel-chart": [["Drip", "particles", "rain"], ["Squash", "elastic", "squash-stretch"], ["Wipe Reveal", "morph", "wipe"]],
  sankey: [["Wipe Reveal", "morph", "wipe"], ["Afterimage", "experimental", "afterimage"], ["Float", "loop", "float"]],
  distribution: [["Wipe Reveal", "morph", "wipe"], ["Jelly", "elastic", "jelly"], ["Breathe", "loop", "breathe"]],
  gauge: [["Rev Up", "shake", "vibrate"], ["Pulse", "loop", "pulse"], ["Glow", "light", "glow-pulse"]],
  accessibility: [["Wave Hello", "shake", "jiggle"], ["Spin", "loop", "spin"], ["Pulse", "loop", "pulse"]],
  contrast: [["Spin", "loop", "slow-spin"], ["Flip", "3d", "flip-y"], ["Glow", "light", "glow-pulse"]],
  "text-size": [["Grow", "elastic", "boing"], ["Stretch", "elastic", "rubber-band"], ["Iris Reveal", "morph", "iris"]],
  "screen-reader": [["Read Aloud", "particles", "ripple"], ["Pulse", "loop", "pulse"], ["Wipe Reveal", "morph", "wipe"]],
  "closed-captions": [["Blink", "light", "blink"], ["Wipe Reveal", "morph", "wipe"], ["Flip", "3d", "flip-x"]],
  "reduce-motion": [["Breathe", "loop", "breathe"], ["Float", "loop", "float"], ["Glow", "light", "glow-pulse"]],
  "focus-ring": [["Pulse", "loop", "pulse"], ["Glow", "light", "glow-pulse"], ["Ripple", "particles", "ripple"]],
  "tab-key": [["Dash", "motion", "dash"], ["Nudge", "loop", "nudge"], ["Afterimage", "experimental", "afterimage"]],
  "sidebar-collapse": [["Squeeze", "elastic", "rubber-band"], ["Dash Left", "motion", "dash", { recipeOptions: { direction: "left" } }], ["Flip", "3d", "flip-y"]],
  "split-view": [["Stretch", "elastic", "rubber-band"], ["Flip", "3d", "flip-y"], ["Wipe Reveal", "morph", "wipe"]],
  "picture-in-picture": [["Pop Out", "3d", "pop-out"], ["Float", "loop", "float"], ["Tilt 3D", "cursor", "tilt-3d"]],
  "resize-handle": [["Stretch", "elastic", "rubber-band"], ["Magnetic", "cursor", "magnetic"], ["Wiggle", "shake", "jiggle"]],
  breadcrumb: [["Dash", "motion", "dash"], ["Afterimage", "experimental", "afterimage"], ["Wave", "elastic", "wobble-skew"]],
  "command-palette": [["Drop In", "physics", "drop-bounce"], ["Glitch", "experimental", "glitch"], ["Shine", "light", "shine"]],
  "scroll-to-top": [["Launch", "motion", "launch"], ["Bounce Up", "elastic", "squash-stretch"], ["Float", "loop", "float"]],
  skeleton: [["Shimmer", "light", "shine"], ["Breathe", "loop", "breathe"], ["Pulse", "loop", "pulse"]],
  "empty-state": [["Breathe", "loop", "breathe"], ["Jelly", "elastic", "jelly"], ["Sparkle", "particles", "sparkle"]],
  toast: [["Pop Up", "physics", "drop-bounce"], ["Jelly", "elastic", "jelly"], ["Shake", "shake", "shake"]],
  tooltip: [["Pop", "elastic", "boing"], ["Float", "loop", "float"], ["Swing", "shake", "swing"]],
  "long-press": [["Ripple", "particles", "ripple"], ["Pulse", "loop", "pulse"], ["Press", "elastic", "pinch"]],
  swipe: [["Swipe", "motion", "dash"], ["Afterimage", "experimental", "afterimage"], ["Fly Through", "motion", "fly-through"]],
  pinch: [["Pinch", "elastic", "pinch"], ["Boing", "elastic", "boing"], ["Spin", "loop", "spin"]],
  kanban: [["Shuffle", "shake", "jiggle"], ["Flip", "3d", "flip-y"], ["Wipe Reveal", "morph", "wipe"]],
  checklist: [["All Done", "explosive", "confetti-burst"], ["Wipe Reveal", "morph", "wipe"], ["Jelly", "elastic", "jelly"]],
  "focus-timer": [["Spin", "loop", "spin"], ["Pulse", "loop", "pulse"], ["Alarm Rattle", "shake", "rattle"]],
  snooze: [["Sleepy Zzz", "particles", "zzz"], ["Float", "loop", "float"], ["Alarm Rattle", "shake", "rattle"]],
  "inbox-zero": [["Celebrate", "explosive", "confetti-burst"], ["Drop In", "physics", "drop-bounce"], ["Float", "loop", "float"]],

  /* Pixel art */
  "pixel-heart": [
    ["8-bit Beat", "pixel", undefined, { pixel: "heartbeat" }],
    ["Shatter & Rebuild", "pixel", undefined, { pixel: "explode" }],
    ["Morph to Star", "pixel", undefined, { pixel: "morph", morphTo: "pixel-star" }],
    ["Pixel Glitch", "pixel", undefined, { pixel: "glitch" }],
    ["Pixel Confetti", "pixel", "pixel-burst", { pixel: "bounce" }],
  ],
  "pixel-coin": [
    ["Coin Spin", "pixel", undefined, { pixel: "coin-spin" }],
    ["Collect", "pixel", undefined, { pixel: "collect" }],
    ["Pixel Bounce", "pixel", undefined, { pixel: "bounce" }],
    ["Dissolve", "pixel", undefined, { pixel: "dissolve" }],
  ],
  "pixel-rocket": [
    ["Pixel Launch", "pixel", undefined, { pixel: "launch" }],
    ["Pixel Explosion", "pixel", undefined, { pixel: "explode" }],
    ["Pixel Trail", "pixel", undefined, { pixel: "trail" }],
    ["Pixel Teleport", "pixel", undefined, { pixel: "teleport" }],
  ],
  "pixel-sword": [
    ["Slash", "pixel", undefined, { pixel: "slash" }],
    ["Spin Attack", "pixel", undefined, { pixel: "spin-attack" }],
    ["Blade Glint", "pixel", undefined, { pixel: "glint" }],
    ["Rumble", "pixel", undefined, { pixel: "rumble" }],
  ],
  "pixel-potion": [
    ["Bubble & Glow", "pixel", undefined, { pixel: "bubble" }],
    ["Brew", "pixel", undefined, { pixel: "loading" }],
    ["Glint", "pixel", undefined, { pixel: "glint" }],
    ["Explode", "pixel", undefined, { pixel: "explode" }],
  ],
  "pixel-gem": [
    ["Glint", "pixel", undefined, { pixel: "glint" }],
    ["Shatter", "pixel", undefined, { pixel: "explode" }],
    ["Morph to Coin", "pixel", undefined, { pixel: "morph", morphTo: "pixel-coin" }],
    ["Pixel Reveal", "pixel", undefined, { pixel: "reveal" }],
  ],
  "pixel-key": [
    ["Unlock Turn", "pixel", undefined, { pixel: "turn" }],
    ["Glint", "pixel", undefined, { pixel: "glint" }],
    ["Bounce", "pixel", undefined, { pixel: "bounce" }],
  ],
  "pixel-chest": [
    ["Open Loot", "pixel", undefined, { pixel: "open" }],
    ["Rumble", "pixel", undefined, { pixel: "rumble" }],
    ["Pixel Reveal", "pixel", undefined, { pixel: "reveal" }],
  ],
  "pixel-bomb": [
    ["Fuse & Boom", "pixel", undefined, { pixel: "fuse-boom" }],
    ["Rumble", "pixel", undefined, { pixel: "rumble" }],
    ["Glitch", "pixel", undefined, { pixel: "glitch" }],
  ],
  "pixel-trophy": [
    ["Victory", "pixel", "pixel-burst", { pixel: "bounce" }],
    ["Glint", "pixel", undefined, { pixel: "glint" }],
    ["Pixel Reveal", "pixel", undefined, { pixel: "reveal" }],
  ],
  "pixel-ghost": [
    ["Haunt", "pixel", undefined, { pixel: "haunt" }],
    ["Vanish", "pixel", undefined, { pixel: "dissolve" }],
    ["Teleport", "pixel", undefined, { pixel: "teleport" }],
    ["Glitch", "pixel", undefined, { pixel: "glitch" }],
  ],
  "pixel-slime": [
    ["Squish Bounce", "pixel", undefined, { pixel: "bounce" }],
    ["Splat", "pixel", undefined, { pixel: "explode" }],
    ["Morph to Heart", "pixel", undefined, { pixel: "morph", morphTo: "pixel-heart" }],
    ["Dissolve", "pixel", undefined, { pixel: "dissolve" }],
  ],
  "pixel-hero": [
    ["Walk Cycle", "pixel", undefined, { pixel: "walk" }],
    ["Jump", "pixel", undefined, { pixel: "bounce" }],
    ["Teleport", "pixel", undefined, { pixel: "teleport" }],
    ["Dissolve", "pixel", undefined, { pixel: "dissolve" }],
  ],
  "pixel-star": [
    ["Twinkle", "pixel", undefined, { pixel: "twinkle" }],
    ["Star Spin", "pixel", undefined, { pixel: "coin-spin" }],
    ["Power Up", "pixel", "pixel-burst", { pixel: "bounce" }],
    ["Pixel Reveal", "pixel", undefined, { pixel: "reveal" }],
  ],
  "pixel-lightning": [
    ["Strike", "pixel", undefined, { pixel: "strike" }],
    ["Glitch", "pixel", undefined, { pixel: "glitch" }],
    ["Overload", "pixel", undefined, { pixel: "explode" }],
  ],
  "pixel-hourglass": [
    ["Flip", "pixel", undefined, { pixel: "flip" }],
    ["Sand Fill", "pixel", undefined, { pixel: "loading" }],
    ["Glitch", "pixel", undefined, { pixel: "glitch" }],
  ],
  "pixel-gamepad": [
    ["Power On", "pixel", undefined, { pixel: "power-on" }],
    ["Rumble", "pixel", undefined, { pixel: "rumble" }],
    ["Glitch", "pixel", undefined, { pixel: "glitch" }],
    ["Bounce", "pixel", undefined, { pixel: "bounce" }],
  ],
  "pixel-floppy": [
    ["Saving…", "pixel", undefined, { pixel: "loading" }],
    ["Corrupt", "pixel", undefined, { pixel: "glitch" }],
    ["Dissolve", "pixel", undefined, { pixel: "dissolve" }],
  ],
  "pixel-cursor": [
    ["Click", "pixel", undefined, { pixel: "click" }],
    ["Glitch", "pixel", undefined, { pixel: "glitch" }],
    ["Teleport", "pixel", undefined, { pixel: "teleport" }],
  ],
};

export function catalogFor(iconId: string): MotionVariant[] {
  return (CATALOG[iconId] ?? []).map(([label, style, effect, extra]) => ({ id: slug(label), label, style, effect, ...extra }));
}

/** Every id referenced by the catalogue (used by the dev consistency check). */
export const catalogEntries = () => Object.entries(CATALOG);
