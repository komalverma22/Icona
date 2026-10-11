import type { IconVariant } from "../icons/types";
import type { ParticleScript } from "../motion/particles";
import { toJsx, toMarkup } from "./markup";
import { componentName, iconSlug } from "./naming";
import { motionOf, type ExportOptions } from "./options";
import { bakedSpeed, svgTree } from "./render";
import { LOOP_PAUSE, buildScene, type Scene } from "./scene";

export type CodeFormat = "tsx" | "jsx" | "svg" | "html" | "css";
export type Language = "tsx" | "jsx" | "svg" | "html" | "css" | "ts" | "json" | "bash";

export interface CodeFile {
  /** Path relative to the project's components folder, e.g. `icona/heart-fill.tsx`. */
  path: string;
  language: Language;
  content: string;
}

export interface GeneratedCode {
  /** The file the user asked for. */
  main: CodeFile;
  scene: Scene;
}

/** Where the shared particle runtime lives, relative to the components folder. */
export const PARTICLE_RUNTIME_PATH = "icona/particles.ts";

const indent = (text: string, spaces: number) =>
  text
    .split("\n")
    .map((l) => (l ? " ".repeat(spaces) + l : l))
    .join("\n");

const fixed = (n: number) => String(Math.round(n * 1000) / 1000);

/** Does the React component for this scene need the particle runtime (and a client component)? */
export const needsParticleRuntime = (scene: Scene) => Boolean(scene.script) && scene.info.tier === "animated";

/* -------------------------------------------------------------------------- */
/* React                                                                       */
/* -------------------------------------------------------------------------- */

const BACKTICK = "`";
const escapeTemplate = (css: string) => css.replaceAll(BACKTICK, "\\" + BACKTICK).replaceAll("${", "\\${");

/** React component source. `ts` switches between TSX (typed) and JSX (plain JavaScript). */
/** Where a packaged component finds the shared prop types and the particle runtime. */
export interface PackageImports {
  types: string;
  particles: string;
}

function reactComponent(variant: IconVariant, options: ExportOptions, ts: boolean, shared?: PackageImports): GeneratedCode {
  const motion = motionOf(variant, options);
  const scene = buildScene(variant, options, { mode: "var", value: options.speed });
  const name = componentName(variant, motion);
  const slug = iconSlug(variant, motion);
  const animated = Boolean(scene.css);
  const particles = needsParticleRuntime(scene);
  // Particle-only animations have no CSS, but still take speed / animate props.
  const playable = animated || particles;
  const color = options.color ?? "currentColor";
  const ratio = scene.width / options.size;
  const sizeExpr = ratio === 1 ? "size" : `size * ${fixed(ratio)}`;
  const heightExpr = scene.height === scene.width ? sizeExpr : `size * ${fixed(scene.height / options.size)}`;
  const cast = ts ? " as CSSProperties" : "";

  /* The <svg> ------------------------------------------------------------- */
  const classExpr = `className={className ? ${BACKTICK}${scene.scope} \${className}${BACKTICK} : "${scene.scope}"}`;
  const attrs = [
    `xmlns="http://www.w3.org/2000/svg"`,
    animated && classExpr,
    animated && `data-animate={animate}`,
    `width={${sizeExpr}}`,
    `height={${heightExpr}}`,
    `viewBox="${scene.viewBox}"`,
    `fill="none"`,
    `stroke="currentColor"`,
    `color={color}`,
    `strokeWidth={strokeWidth}`,
    `strokeLinecap="round"`,
    `strokeLinejoin="round"`,
    animated && `style={{ "--icona-speed": speed, ...style }${cast}}`,
    `aria-hidden="true"`,
    `{...props}`,
  ].filter(Boolean) as string[];
  const children = [...(animated ? ["<style>{CSS}</style>"] : []), ...scene.body.map((n) => toJsx(n))].join("\n");
  const svg = (pad: number) => `<svg\n${attrs.map((a) => " ".repeat(pad + 2) + a).join("\n")}\n${" ".repeat(pad)}>\n${indent(children, pad + 2)}\n${" ".repeat(pad)}</svg>`;

  /* Props ------------------------------------------------------------------ */
  const params = [`size = ${options.size}`, `color = "${color}"`, `strokeWidth = ${options.strokeWidth}`];
  if (playable) params.push(`speed = ${options.speed}`, `animate = "hover"`);
  if (animated) params.push("className", "style");
  params.push("...props");
  const annotation = ts ? (shared && playable ? ": AnimatedIconProps" : ": IconProps") : "";

  const propsType = ts && !shared
    ? `interface IconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  /** Width of the 24-unit icon box in px. */
  size?: number;
  /** Any CSS colour. Defaults to ${options.color ? "the colour you picked" : "the surrounding text colour"}. */
  color?: string;
  strokeWidth?: number;${
    playable
      ? `
  /** Playback speed multiplier. */
  speed?: number;
  /** "hover" plays on hover / focus, "loop" repeats, "none" stays still. */
  animate?: "hover" | "loop" | "none";`
      : ""
  }
}

`
    : "";

  /* Imports ---------------------------------------------------------------- */
  const reactNamed = [...(particles ? ["useEffect", "useRef"] : []), ...(ts ? [...(animated ? ["type CSSProperties"] : []), ...(shared ? [] : ["type SVGProps"])] : [])];
  const imports = [
    reactNamed.length ? `import { ${reactNamed.join(", ")} } from "react";` : "",
    shared ? `import type { ${playable ? "AnimatedIconProps" : "IconProps"} } from "${shared.types}";` : "",
    particles ? `import { ParticleField, playParticleScript${ts ? ", type ParticleScript" : ""} } from "${shared?.particles ?? "./particles"}";` : "",
  ].filter(Boolean);

  const css = animated ? `const CSS = ${BACKTICK}\n${indent(escapeTemplate(scene.css), 2)}\n${BACKTICK};\n\n` : "";
  const script = particles ? scriptConst(scene.script!, scene, ts) : "";
  const head = `${particles ? '"use client";\n\n' : ""}${imports.length ? imports.join("\n") + "\n\n" : ""}${css}${script}${propsType}`;

  const doc = playable
    ? `/** ${scene.info.motion?.label} — ${variant.name} (${variant.style})${particles ? ", with particles" : ""}. */`
    : `/** ${variant.name} (${variant.style}). */`;
  const signature = `export function ${name}({ ${params.join(", ")} }${annotation})`;

  const body = particles
    ? `${signature} {
  const host = useRef${ts ? "<HTMLSpanElement>" : ""}(null);

  useEffect(() => {
    const el = host.current;
    if (!el || animate === "none" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const field = new ParticleField(el);
    let stop = () => {};
    const play = () => {
      stop();
      stop = playParticleScript(field, el, SCRIPT, { size, ink: getComputedStyle(el).color, speed, follow: el.querySelector(".fx") });
    };
    if (animate === "loop") {
      play();
      const timer = window.setInterval(play, (PASS_SECONDS / speed) * 1000);
      return () => {
        window.clearInterval(timer);
        stop();
        field.destroy();
      };
    }
    const leave = () => stop();
    el.addEventListener("pointerenter", play);
    el.addEventListener("focusin", play);
    el.addEventListener("pointerleave", leave);
    return () => {
      stop();
      field.destroy();
      el.removeEventListener("pointerenter", play);
      el.removeEventListener("focusin", play);
      el.removeEventListener("pointerleave", leave);
    };
  }, [animate, size, speed]);

  return (
    <span ref={host} style={{ position: "relative", display: "inline-flex", color }}>
      ${svg(6)}
    </span>
  );
}
`
    : `${signature} {
  return (
    ${svg(4)}
  );
}
`;

  return {
    main: { path: `icona/${slug}.${ts ? "tsx" : "jsx"}`, language: ts ? "tsx" : "jsx", content: `${head}${doc}\n${body}` },
    scene,
  };
}

function scriptConst(script: ParticleScript, scene: Scene, ts: boolean): string {
  const pass = fixed(scene.info.duration + LOOP_PAUSE);
  return `/** Particle cues, on the 24-unit icon grid. */\nconst SCRIPT${ts ? ": ParticleScript" : ""} = ${JSON.stringify(script, null, 2)};\nconst PASS_SECONDS = ${pass};\n\n`;
}

/* -------------------------------------------------------------------------- */
/* SVG / HTML / CSS                                                            */
/* -------------------------------------------------------------------------- */

function svgFile(variant: IconVariant, options: ExportOptions, trigger: "loop" | "hover", ext = "svg"): GeneratedCode {
  const motion = motionOf(variant, options);
  const scene = buildScene(variant, options, bakedSpeed(options.speed));
  return { main: { path: `${iconSlug(variant, motion)}.${ext}`, language: "svg", content: toMarkup(svgTree(scene, options, trigger)) + "\n" }, scene };
}

function htmlSnippet(variant: IconVariant, options: ExportOptions): GeneratedCode {
  const out = svgFile(variant, options, "hover", "html");
  const note = out.scene.css ? '<!-- Plays on hover or keyboard focus. Set data-animate="loop" to repeat. -->\n' : "";
  return { scene: out.scene, main: { ...out.main, language: "html", content: note + out.main.content } };
}

function cssOnly(variant: IconVariant, options: ExportOptions): GeneratedCode {
  const out = svgFile(variant, options, "loop", "css");
  const css = out.scene.css;
  return { scene: out.scene, main: { ...out.main, language: "css", content: css ? css + "\n" : "/* Static icon: there is no animation CSS. */\n" } };
}

export function generateCode(variant: IconVariant, options: ExportOptions, format: CodeFormat, shared?: PackageImports): GeneratedCode {
  switch (format) {
    case "tsx":
      return reactComponent(variant, options, true, shared);
    case "jsx":
      return reactComponent(variant, options, false);
    case "svg":
      return svgFile(variant, options, "loop");
    case "html":
      return htmlSnippet(variant, options);
    case "css":
      return cssOnly(variant, options);
  }
}
