"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Outcome } from "../export/delivery";
import { iconVariantsByKey } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";
import { Button } from "../ui/Button";
import { useToast } from "./Toast";

const CHECK = iconVariantsByKey.get("check-outline")!;

/**
 * A button that runs an action (copy or download), shows a brief "Done" state
 * on success and reports the outcome - success or failure - in a toast.
 */
export function ActionButton({
  action,
  children,
  done = "Copied",
  variant,
  disabled,
  label,
  className,
}: {
  action: () => Promise<Outcome> | Outcome;
  children: ReactNode;
  done?: string;
  variant?: "raised" | "accent";
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const toast = useToast();
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const run = async () => {
    setState("busy");
    const outcome = await action();
    toast.show(outcome);
    if (outcome.ok) {
      setState("done");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setState("idle"), 1600);
    } else setState("idle");
  };

  return (
    <Button variant={variant} onClick={run} disabled={disabled || state === "busy"} aria-label={label} className={className}>
      <span className="relative flex h-[14px] items-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "done" ? (
            <motion.span key="done" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.18 }} className="flex items-center gap-1 whitespace-nowrap">
              <span className={variant === "accent" ? "text-white" : "text-accent"}>
                <IconRenderer variant={CHECK} size={12} recipe={null} />
              </span>
              {done}
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.18 }} className="flex items-center gap-1.5 whitespace-nowrap">
              {state === "busy" ? "Working…" : children}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </Button>
  );
}
