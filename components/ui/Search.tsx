"use client";

import { forwardRef, useEffect, useState, type InputHTMLAttributes } from "react";
import { cx } from "./Button";

interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onValueChange: (value: string) => void;
  /** Show the "Ctrl F" / "⌘ F" shortcut hint (Figma). */
  showShortcut?: boolean;
}

/**
 * Search field — Figma "Input" (48:1052): #f5f6f8 field, hairline border,
 * 10px radius, 12px Booton placeholder, leading search glyph, shortcut hint
 * and a clear button that replaces the hint once there is a query.
 */
export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search(
  { value, onValueChange, showShortcut = true, className, placeholder = "Search", ...rest },
  ref,
) {
  const [modKey, setModKey] = useState("Ctrl");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setModKey("⌘");
  }, []);

  const hasValue = value.length > 0;

  return (
    <div className={cx("relative w-full", className)}>
      <img
        src="/figma/search.svg"
        alt=""
        aria-hidden
        width={11}
        height={11}
        className="pointer-events-none absolute top-1/2 left-[10.5px] size-[11px] -translate-y-1/2"
      />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cx(
          "h-8 w-full rounded-[10px] border border-line bg-field pl-[29.8px] text-[12px] text-ink shadow-field outline-none placeholder:text-muted",
          "transition-[border-color,box-shadow] duration-150 focus:border-accent focus-visible:outline-none focus:shadow-[0_0_0_3px_rgba(91,220,103,0.18)]",
          "[&::-webkit-search-cancel-button]:appearance-none",
          hasValue ? "pr-8" : showShortcut ? "pr-3 sm:pr-[64px]" : "pr-3",
        )}
        {...rest}
      />

      {hasValue ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onValueChange("")}
          className="absolute top-1/2 right-[9.54px] flex size-3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-scrim transition-transform hover:scale-110 focus-visible:outline-offset-1"
        >
          <img src="/figma/clear.svg" alt="" aria-hidden width={10} height={10} className="size-2.5" />
        </button>
      ) : (
        showShortcut && (
          <span aria-hidden className="pointer-events-none absolute top-1/2 right-[6.54px] hidden -translate-y-1/2 gap-[3px] sm:flex">
            <kbd className="flex h-5 w-6 items-center justify-center rounded-[6px] bg-kbd font-sans text-[10px] leading-[10px] font-medium tracking-[-0.25px] text-muted">
              {modKey}
            </kbd>
            <kbd className="flex h-5 w-6 items-center justify-center rounded-[6px] bg-kbd font-sans text-[10px] leading-[10px] font-medium text-muted">
              F
            </kbd>
          </span>
        )
      )}
    </div>
  );
});
