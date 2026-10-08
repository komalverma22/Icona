"use client";

import { useEffect, useRef } from "react";
import { useLibrary } from "../library/LibraryProvider";
import { Search } from "../ui/Search";

/**
 * Library search bound to filter state. Ctrl/⌘ + F focuses it (as hinted in
 * the Figma input); Escape clears the query, then blurs.
 */
export function IconSearch({ className, autoFocusShortcut = true }: { className?: string; autoFocusShortcut?: boolean }) {
  const { filters, setFilter } = useLibrary();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocusShortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        const input = inputRef.current;
        // Only hijack the shortcut when this input is actually visible.
        if (!input || input.offsetParent === null) return;
        e.preventDefault();
        input.focus();
        input.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [autoFocusShortcut]);

  return (
    <Search
      ref={inputRef}
      className={className}
      value={filters.query}
      onValueChange={(v) => setFilter("query", v)}
      aria-label="Search icons by name, category or tag"
      placeholder="Search"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          if (filters.query) setFilter("query", "");
          else e.currentTarget.blur();
        }
      }}
    />
  );
}
