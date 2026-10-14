"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { CodeFile } from "../export/code";
import { PARTICLE_RUNTIME_PATH } from "../export/code";
import { cx } from "../ui/Button";

/** A short call-out. `tone` "warn" is for things that don't carry over to a format. */
export function Note({ tone = "info", title, children }: { tone?: "info" | "warn"; title?: string; children: ReactNode }) {
  return (
    <div
      role="note"
      className={cx(
        "flex gap-2.5 rounded-[10px] border px-3 py-2.5 text-[12px] leading-[18px]",
        tone === "warn" ? "border-[rgba(214,142,32,0.35)] bg-[rgba(255,196,64,0.12)] text-ink" : "border-line bg-card text-muted",
      )}
    >
      <span aria-hidden className={cx("mt-[5px] size-1.5 shrink-0 rounded-full", tone === "warn" ? "bg-[#e0a21f]" : "bg-muted")} />
      <div className="min-w-0">
        {title && <p className="font-medium text-ink">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Badge({ tone, children }: { tone: "animated" | "still" | "neutral"; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex h-[18px] items-center rounded-[5px] px-1.5 text-[10px] leading-3 font-medium",
        tone === "animated" ? "bg-[rgba(43,154,243,0.12)] text-accent-ink" : tone === "still" ? "bg-badge text-muted" : "bg-badge text-ink",
      )}
    >
      {children}
    </span>
  );
}

/** Where this page is served from - install commands point at it. */
export function useOrigin() {
  const [origin, setOrigin] = useState("https://your-icona-domain");
  useEffect(() => setOrigin(window.location.origin), []);
  return origin;
}

/** The particle runtime's source, fetched from the registry (the same file the CLI installs). */
export function useParticleSource(needed: boolean): { file: CodeFile | null; error: boolean } {
  const [file, setFile] = useState<CodeFile | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!needed || file) return;
    let cancelled = false;
    fetch("/r/icona-particles.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((item: { files: { content: string }[] }) => !cancelled && setFile({ path: PARTICLE_RUNTIME_PATH, language: "ts", content: item.files[0].content }))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [needed, file]);
  return { file, error };
}
