"use client";

import { useEffect, useRef, useState } from "react";
import type { Language } from "../export/code";
import { highlightLine } from "../details/highlight";
import { useOrigin } from "../details/shared";
import { copyText } from "../icons/clipboard";
import { Button } from "../ui/Button";

/**
 * A highlighted snippet with a Copy button. `{origin}` in the code is replaced
 * with the address this site is served from, so install commands always point
 * at the real registry the reader is looking at.
 */
export function DocCode({ code, language = "tsx", title }: { code: string; language?: Language; title?: string }) {
  const origin = useOrigin();
  const text = code.replaceAll("{origin}", origin).replace(/\n$/, "");
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    setState((await copyText(text)) ? "done" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  };

  return (
    <figure className="my-4 overflow-hidden rounded-[12px] border border-line bg-card">
      <figcaption className="flex min-h-10 items-center justify-between gap-2 border-b border-line bg-white py-1 pr-1.5 pl-3">
        <span className="truncate text-[12px] leading-4 font-medium text-muted">{title ?? language}</span>
        <Button onClick={copy} aria-label={`Copy ${title ?? language} snippet`} className="h-7 text-[11px]">
          {state === "done" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}
        </Button>
      </figcaption>
      <pre className="code-block overflow-x-auto p-3 font-mono text-[12px] leading-[18px] text-ink" tabIndex={0}>
        <code>
          {text.split("\n").map((line, i) => (
            <div key={i} className="whitespace-pre">
              {highlightLine(line, language)}
              {line === "" && " "}
            </div>
          ))}
        </code>
      </pre>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "done" ? "Copied to clipboard" : state === "failed" ? "Could not copy" : ""}
      </span>
    </figure>
  );
}
