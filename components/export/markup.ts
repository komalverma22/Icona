/**
 * A tiny element tree that serialises to SVG markup *or* JSX, so every export
 * format (SVG file, React component, HTML snippet) is generated from one
 * description and can never drift apart.
 */

export type Attrs = Record<string, string | number | undefined>;

export interface El {
  tag: string;
  attrs?: Attrs;
  children?: (El | string)[];
}

export const el = (tag: string, attrs?: Attrs, children?: (El | string)[]): El => ({ tag, attrs, children });

const escapeAttr = (value: string | number) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escapeText = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Presentation attributes are kebab-case in markup; geometry / structural ones (viewBox, maskUnits, pathLength) are not. */
const kebab = (name: string) => (/^(stroke|fill|shape|clip|stop|font|text)[A-Z]/.test(name) ? name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`) : name);

/** The same attribute in React's naming. */
const camel = (name: string) => (name === "class" ? "className" : /^(data|aria)-/.test(name) ? name : name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()));

interface Options {
  indent?: string;
  /** Extra attributes spliced into the root element's opening tag (already formatted, e.g. `{...props}`). */
  rootExtra?: string;
}

function openTag(node: El, format: "svg" | "jsx", rootExtra?: string): string {
  const attrs = Object.entries(node.attrs ?? {}).filter(([, v]) => v !== undefined) as [string, string | number][];
  const parts = attrs.map(([k, v]) => {
    if (format === "svg") return `${kebab(k)}="${escapeAttr(v)}"`;
    const name = camel(k);
    // Numbers become {expr}; strings stay quoted.
    return typeof v === "number" ? `${name}={${v}}` : `${name}="${escapeAttr(v)}"`;
  });
  if (rootExtra) parts.push(rootExtra);
  return `<${node.tag}${parts.length ? ` ${parts.join(" ")}` : ""}`;
}

function write(node: El | string, depth: number, format: "svg" | "jsx", o: Required<Pick<Options, "indent">> & Options, out: string[]) {
  const pad = o.indent.repeat(depth);
  if (typeof node === "string") {
    out.push(pad + (format === "jsx" ? node : escapeText(node)));
    return;
  }
  const open = openTag(node, format, depth === 0 ? o.rootExtra : undefined);
  const kids = node.children ?? [];
  if (!kids.length) {
    out.push(`${pad}${open}/>`);
    return;
  }
  out.push(`${pad}${open}>`);
  for (const k of kids) write(k, depth + 1, format, o, out);
  out.push(`${pad}</${node.tag}>`);
}

/** Serialise to standalone SVG / HTML markup. */
export function toMarkup(node: El, options: Options = {}): string {
  const out: string[] = [];
  write(node, 0, "svg", { indent: "  ", ...options }, out);
  return out.join("\n");
}

/** Serialise to JSX (React attribute names, numeric attributes as expressions). */
export function toJsx(node: El, options: Options = {}): string {
  const out: string[] = [];
  write(node, 0, "jsx", { indent: "  ", ...options }, out);
  return out.join("\n");
}
