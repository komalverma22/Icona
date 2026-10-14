"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useId, useState } from "react";
import { categories, iconVariantsByKey } from "../icons/iconLibrary";
import type { CategoryId } from "../icons/types";
import { useLibrary } from "../library/LibraryProvider";
import { SavedFilter } from "./SavedFilter";
import { SetRow } from "./SetRow";

const ALL_ICON = iconVariantsByKey.get("layers-outline");
const NEW_ICON = iconVariantsByKey.get("sparkles-outline");

/**
 * "Sets" menu: All, New, every category (expandable into its sub-groups) and
 * Saved - each row with its icon, a live count badge and a trailing chevron.
 */
export function CategoryFilter() {
  const { filters, setFilter, setCounts } = useLibrary();
  const baseId = useId();
  const [expanded, setExpanded] = useState<CategoryId | null>(null);
  const set = filters.set;

  const toggle = (id: CategoryId) => setExpanded((cur) => (cur === id ? null : id));

  return (
    <nav aria-label="Icon sets" className="flex w-full flex-col">
      <h3 className="pt-7 pb-3 text-[12px] leading-3 font-medium text-muted">Sets</h3>
      <LayoutGroup id={baseId}>
        <ul className="flex w-full flex-col gap-0.5">
          <li>
            <SetRow
              label="All icons"
              icon={ALL_ICON}
              count={setCounts.all}
              selected={set.kind === "all"}
              onSelect={() => setFilter("set", { kind: "all" })}
            />
          </li>
          <li>
            <SetRow
              label="New"
              icon={NEW_ICON}
              count={setCounts.new}
              selected={set.kind === "new"}
              onSelect={() => setFilter("set", set.kind === "new" ? { kind: "all" } : { kind: "new" })}
            />
          </li>
          {categories.map((category) => {
            const isOpen = expanded === category.id;
            const listId = `${baseId}-${category.id}`;
            const selectedCategory = set.kind === "category" && set.id === category.id;
            return (
              <li key={category.id}>
                <SetRow
                  label={category.label}
                  icon={category.icon}
                  count={setCounts.categories[category.id] ?? 0}
                  selected={selectedCategory && !set.subcategory}
                  onSelect={() => {
                    setFilter("set", { kind: "category", id: category.id });
                    if (category.subcategories.length) setExpanded(category.id);
                  }}
                  expandable={
                    category.subcategories.length
                      ? { expanded: isOpen, onToggle: () => toggle(category.id), controls: listId }
                      : undefined
                  }
                />
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul
                      id={listId}
                      key="sub"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="relative flex flex-col gap-0.5 overflow-hidden pt-0.5 before:absolute before:top-1 before:bottom-1 before:left-[17.5px] before:w-px before:bg-divider"
                    >
                      {category.subcategories.map((sub) => (
                        <li key={sub}>
                          <SetRow
                            indent
                            label={sub}
                            count={setCounts.subcategories[`${category.id}/${sub}`] ?? 0}
                            selected={selectedCategory && set.subcategory === sub}
                            onSelect={() => setFilter("set", { kind: "category", id: category.id, subcategory: sub })}
                          />
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
          <li>
            <SavedFilter />
          </li>
        </ul>
      </LayoutGroup>
    </nav>
  );
}
