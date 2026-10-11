import type { ReactNode } from "react";
import type { Language } from "../export/code";

/**
 * A deliberately small syntax highlighter: one tokenising regex per language,
 * no dependencies. It only needs to make generated code easy to scan.
 */

type Rule = [kind: string, pattern: string];

const KEYWORDS = "import|export|from|const|let|var|function|return|type|interface|extends|default|as|if|else|new|void|true|false|null|undefined|typeof|for|of|in";

const JS: Rule[] = [
  ["comment", String.raw`\/\*[\s\S]*?\*\/|\/\/[^\n]*`],
  ["string", String.raw`\`(?:\[\s\S]|[^\`\])*\`|"(?:\.|[^"\\n])*"|'(?:\.|[^'\\n])*'`],
  ["tag", String.raw`<\/?[A-Za-z][\w.:-]*|\/?>`],
  ["keyword", String.raw`\b(?:${KEYWORDS})\b`],
  ["number", String.raw`-?\b\d+(?:\.\d+)?\b`],
  ["attr", String.raw`[A-Za-z_:][\w:.-]*(?==)`],
];

const MARKUP: Rule[] = [
  ["comment", String.raw`<!--[\s\S]*?-->`],
  ["string", String.raw`"[^"]*"|'[^']*'`],
  ["tag", String.raw`<\/?[A-Za-z][\w.:-]*|\/?>`],
  ["attr", String.raw`[A-Za-z_:][\w:.-]*(?==)`],
];

const CSS: Rule[] = [
  ["comment", String.raw`\/\*[\s\S]*?\*\/`],
  ["string", String.raw`"[^"]*"|'[^']*'`],
  ["keyword", String.raw`@[\w-]+`],
  ["number", String.raw`-?\d*\.?\d+(?:%|px|s|ms|deg|em|rem)?(?![\w-])`],
  ["prop", String.raw`[a-z-]+(?=\s*:)`],
];

const BASH: Rule[] = [
  ["comment", String.raw`#[^\n]*`],
  ["string", String.raw`"[^"]*"|'[^']*'`],
  ["keyword", String.raw`\b(?:npx|npm|pnpm|yarn|bunx|add|install|init)\b`],
  ["attr", String.raw`(?<=\s)--?[\w-]+`],
];

const RULES: Record<Language, Rule[]> = { tsx: JS, jsx: JS, ts: JS, json: JS, svg: MARKUP, html: MARKUP, css: CSS, bash: BASH };

const compiled = new Map<Language, RegExp>();
function regexFor(language: Language) {
  let re = compiled.get(language);
  if (!re) {
    re = new RegExp(RULES[language].map(([, p]) => `(${p})`).join("|"), "g");
    compiled.set(language, re);
  }
  return re;
}

/** Highlighted tokens for one line (lines are tokenised independently, except multi-line strings / comments, which render plain). */
export function highlightLine(line: string, language: Language): ReactNode[] {
  const re = regexFor(language);
  const rules = RULES[language];
  const out: ReactNode[] = [];
  let last = 0;
  re.lastIndex = 0;
  for (let m = re.exec(line); m; m = re.exec(line)) {
    if (m[0] === "") {
      re.lastIndex++;
      continue;
    }
    if (m.index > last) out.push(line.slice(last, m.index));
    const group = m.findIndex((g, i) => i > 0 && g !== undefined) - 1;
    out.push(
      <span key={m.index} className={`tok-${rules[group][0]}`}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}
