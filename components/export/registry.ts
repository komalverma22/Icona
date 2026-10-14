import { iconVariants } from "../icons/iconLibrary";
import type { IconVariant } from "../icons/types";
import { getMotions } from "../motion/registry";
import { generateCode, needsParticleRuntime } from "./code";
import { iconSlug } from "./naming";
import { DEFAULT_OPTIONS, optionsToParams, parseOptions, type ExportOptions } from "./options";

/**
 * A shadcn-style component registry. `npx shadcn@latest add <url>` downloads a
 * registry item (JSON with the file contents) and writes the files into the
 * project, installing any `dependencies` and following `registryDependencies`.
 *
 * Items are generated on request from the same code the details page shows,
 * so the CLI, the copy button and the downloads can never disagree.
 */

export const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
export const PARTICLES_ITEM = "icona-particles";

interface Entry {
  variant: IconVariant;
  motionId: string | null;
}

let index: Map<string, Entry> | null = null;

/** slug → icon + motion, for every static icon and every animation (built once). */
function entries(): Map<string, Entry> {
  if (index) return index;
  const map = new Map<string, Entry>();
  for (const variant of iconVariants) {
    map.set(iconSlug(variant), { variant, motionId: null });
    for (const motion of getMotions(variant)) map.set(iconSlug(variant, motion), { variant, motionId: motion.id });
  }
  index = map;
  return map;
}

export const findEntry = (slug: string) => entries().get(slug);

/** Static params for every registry item (used by tests and sitemap-style listings). */
export const allRegistrySlugs = () => [...entries().keys()];

export interface RegistryFile {
  path: string;
  content: string;
  type: "registry:component";
  target: string;
}

export interface RegistryItem {
  $schema: string;
  name: string;
  type: "registry:component";
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
}

const file = (path: string, content: string): RegistryFile => ({ path: `registry/${path}`, content, type: "registry:component", target: `components/${path}` });

/** The shared particle runtime (ships once; every animated-with-particles icon depends on it). */
export function particlesItem(source: string): RegistryItem {
  return {
    $schema: REGISTRY_SCHEMA,
    name: PARTICLES_ITEM,
    type: "registry:component",
    title: "Icona particle runtime",
    description: "Canvas particle engine used by animated Icona icons that emit particles (confetti, sparks, smoke…). No dependencies.",
    dependencies: [],
    registryDependencies: [],
    files: [file("icona/particles.ts", source)],
  };
}

/** Registry item for one icon (+ motion) with the user's customisations. Returns null for unknown names. */
export function iconItem(slug: string, params: Pick<URLSearchParams, "get">, origin: string): RegistryItem | null {
  const entry = findEntry(slug);
  if (!entry) return null;
  const options: ExportOptions = { ...parseOptions(params, entry.variant, DEFAULT_OPTIONS), motionId: entry.motionId };
  const code = generateCode(entry.variant, options, "tsx");
  const motion = code.scene.info.motion;
  return {
    $schema: REGISTRY_SCHEMA,
    name: slug,
    type: "registry:component",
    title: `${entry.variant.name} (${entry.variant.style})${motion ? ` - ${motion.label}` : ""}`,
    description: motion
      ? `Animated ${entry.variant.name} icon: ${motion.label}. React + CSS${needsParticleRuntime(code.scene) ? " with canvas particles" : ""}, no animation library.`
      : `${entry.variant.name} icon as a React component.`,
    dependencies: [],
    registryDependencies: needsParticleRuntime(code.scene) ? [`${origin}/r/${PARTICLES_ITEM}.json`] : [],
    files: [file(code.main.path, code.main.content)],
  };
}

/** The `npx shadcn` command for an export (options other than the defaults ride along as a query string). */
export function installCommand(origin: string, variant: IconVariant, options: ExportOptions): string {
  const motion = options.motionId ? getMotions(variant).find((m) => m.id === options.motionId) : undefined;
  const params = optionsToParams({ ...options, motionId: null });
  const query = params.toString();
  const url = `${origin}/r/${iconSlug(variant, motion)}.json${query ? `?${query}` : ""}`;
  // A query string contains & and ?, which shells treat specially, so it must be quoted.
  return `npx shadcn@latest add ${query ? `"${url}"` : url}`;
}
