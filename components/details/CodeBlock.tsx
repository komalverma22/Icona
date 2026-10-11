"use client";

import { useMemo } from "react";
import type { CodeFile } from "../export/code";
import { copyCode, downloadText } from "../export/delivery";
import { ActionButton } from "./CopyButton";
import { highlightLine } from "./highlight";

const MAX_LINES = 400;

const MIME: Record<string, string> = { svg: "image/svg+xml", html: "text/html", css: "text/css", tsx: "text/plain", jsx: "text/plain", ts: "text/plain" };

/**
 * Syntax-highlighted source with a prominent Copy button and a Download
 * button. Long files (baked animation CSS) show their first lines; Copy and
 * Download always carry the complete file.
 */
export function CodeBlock({ file, extraActions, download = true }: { file: CodeFile; extraActions?: React.ReactNode; download?: boolean }) {
  const lines = useMemo(() => file.content.replace(/\n$/, "").split("\n"), [file.content]);
  const shown = lines.slice(0, MAX_LINES);
  const name = file.path.split("/").pop() ?? file.path;

  return (
    <div className="overflow-hidden rounded-[12px] border border-line bg-card">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-line bg-white px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2 text-[12px] leading-4">
          <span className="truncate font-medium text-ink">{name}</span>
          <span className="shrink-0 text-muted">{lines.length.toLocaleString()} lines · {(file.content.length / 1024).toFixed(1)} KB</span>
        </div>
        <div className="flex items-center gap-1.5">
          {extraActions}
          {download && (
            <ActionButton action={() => downloadText(file.content, name, MIME[file.language] ?? "text/plain")} done="Saved" label={`Download ${name}`}>
              Download
            </ActionButton>
          )}
          <ActionButton variant="accent" action={() => copyCode(file.content, name)} label={`Copy ${name}`}>
            Copy
          </ActionButton>
        </div>
      </div>
      <pre className="code-block max-h-[460px] overflow-auto p-3 font-mono text-[12px] leading-[18px] text-ink" tabIndex={0} aria-label={`${name} source code`}>
        <code>
          {shown.map((line, i) => (
            <div key={i} className="whitespace-pre">
              {highlightLine(line, file.language)}
              {line === "" && " "}
            </div>
          ))}
        </code>
      </pre>
      {lines.length > MAX_LINES && (
        <p className="border-t border-line bg-white px-3 py-2 text-[11px] leading-4 text-muted">
          Showing the first {MAX_LINES} of {lines.length.toLocaleString()} lines. Copy and Download include the whole file.
        </p>
      )}
    </div>
  );
}
