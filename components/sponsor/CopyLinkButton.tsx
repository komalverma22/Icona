"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "../icons/clipboard";
import { Button } from "../ui/Button";

/** Copies the site's address so it can be shared. Reports failure instead of pretending. */
export function CopyLinkButton() {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    setState((await copyText(window.location.origin)) ? "done" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  };

  return (
    <>
      <Button onClick={copy}>
        {state === "done" ? "Link copied" : state === "failed" ? "Couldn't copy" : "Copy link to Icona"}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "done" ? "Link copied to clipboard" : state === "failed" ? "Could not copy the link" : ""}
      </span>
    </>
  );
}
