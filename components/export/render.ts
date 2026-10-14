import { ROOT_ATTRS } from "../icons/svgAttributes";
import type { IconVariant } from "../icons/types";
import type { SpeedMode } from "./css";
import { el, toMarkup, type Attrs, type El } from "./markup";
import type { ExportOptions } from "./options";
import { buildScene, type Scene } from "./scene";
import { recolor } from "./static";

export type Trigger = "loop" | "hover";

export const bakedSpeed = (speed: number): SpeedMode => ({ mode: "bake", value: speed });

/** Presentation attributes on the root <svg>. */
function rootAttributes(scene: Scene) {
  return {
    width: scene.width,
    height: scene.height,
    viewBox: scene.viewBox,
    ...ROOT_ATTRS,
    strokeWidth: scene.strokeWidth,
  };
}

/**
 * The scene as a standalone <svg> element tree. Animated scenes carry their
 * own <style> and loop (or play on hover) - drop the file into an <img> and it
 * animates; paste it inline and the colour follows `currentColor`.
 */
export function svgTree(scene: Scene, options: Pick<ExportOptions, "color">, trigger: Trigger = "loop", extra: Attrs = {}): El {
  const animated = Boolean(scene.css);
  const root = el(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", ...(animated ? { class: scene.scope, "data-animate": trigger } : {}), ...rootAttributes(scene), ...extra },
    [...(animated ? [el("style", {}, [scene.css])] : []), ...scene.body],
  );
  return options.color ? recolor(root, options.color) : root;
}

/** Standalone SVG markup for an icon with the user's customisations baked in. */
export function svgMarkup(variant: IconVariant, options: ExportOptions, trigger: Trigger = "loop"): { markup: string; scene: Scene } {
  const scene = buildScene(variant, options, bakedSpeed(options.speed));
  return { markup: toMarkup(svgTree(scene, options, trigger)), scene };
}
