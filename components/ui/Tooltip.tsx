import { useId, type ReactElement, type ReactNode, cloneElement } from "react";
import { cx } from "./Button";

interface TooltipProps {
  label: ReactNode;
  /** Element that triggers the tooltip; receives aria-describedby. */
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom";
  className?: string;
}

/**
 * Lightweight CSS tooltip: shown on hover and on keyboard focus
 * (focus-visible), so it never flashes for mouse clicks.
 */
export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  const id = useId();
  return (
    <span className={cx("group/tooltip relative inline-flex", className)}>
      {cloneElement(children, { "aria-describedby": id })}
      <span
        id={id}
        role="tooltip"
        className={cx(
          "pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-ink px-2 py-1 text-[11px] leading-[14px] font-medium text-white opacity-0 shadow-card-hover transition-[opacity,transform] duration-150",
          side === "top" ? "bottom-full mb-1.5 translate-y-0.5" : "top-full mt-1.5 -translate-y-0.5",
          "group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100 group-has-[:focus-visible]/tooltip:translate-y-0 group-has-[:focus-visible]/tooltip:opacity-100",
        )}
      >
        {label}
      </span>
    </span>
  );
}
