"use client";

import { useState } from "react";
import { AuthButton } from "../auth/AuthButton";
import { iconVariantsByKey } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";
import { useLibrary } from "../library/LibraryProvider";
import { IconSearch } from "../search/IconSearch";
import { Button, ButtonLink } from "../ui/Button";
import { Sheet } from "../ui/Sheet";
import { Tooltip } from "../ui/Tooltip";
import { GITHUB_URL } from "../site/config";
import { NavLinks } from "../site/SiteHeader";

const MENU_ICON = iconVariantsByKey.get("menu-outline")!;

/** Saved-icons toggle — Figma bookmark button (48:1070). */
function SavedButton({ onClick }: { onClick?: () => void }) {
  const { filters, setFilter, savedCount } = useLibrary();
  const active = filters.set.kind === "saved";
  return (
    <Tooltip label={`Saved icons${savedCount ? ` · ${savedCount}` : ""}`} side="bottom">
      <Button
        iconOnly
        pressed={active}
        aria-label={`Saved icons, ${savedCount} saved`}
        onClick={() => {
          setFilter("set", active ? { kind: "all" } : { kind: "saved" });
          onClick?.();
        }}
      >
        <img src="/figma/bookmark.svg" alt="" aria-hidden width={18} height={18} className="size-[18px]" />
      </Button>
    </Tooltip>
  );
}

function GithubButton() {
  return (
    <Tooltip label="GitHub" side="bottom">
      <ButtonLink iconOnly href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Icona on GitHub (opens in a new tab)">
        <img src="/figma/github.svg" alt="" aria-hidden width={18} height={18} className="size-[18px]" />
      </ButtonLink>
    </Tooltip>
  );
}

/**
 * Figma "top bar" (48:1047): 64px tall, #e9e9e9 bottom border, logo + search
 * on the left, actions on the right. Collapses into a menu sheet on phones.
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 md:grid md:grid-cols-[1fr_auto_1fr] md:px-8 xl:px-[82px]">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-[19px] md:flex-none">
          <a href="/" aria-label="Icona — home" className="shrink-0 rounded-[10px]">
            <img src="/figma/logo.png" alt="" width={32} height={32} className="size-8 object-cover" />
          </a>
          <IconSearch className="max-w-[332px]" />
        </div>

        <nav aria-label="Primary" className="hidden md:block">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-3 justify-self-end md:flex">
          <SavedButton />
          <GithubButton />
          <AuthButton />
        </div>

        <Button iconOnly className="md:hidden" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
          <span className="text-text">
            <IconRenderer variant={MENU_ICON} size={18} />
          </span>
        </Button>
      </div>

      <Sheet open={menuOpen} onClose={closeMenu} title="Menu">
        <nav aria-label="Primary" className="flex flex-col gap-4">
          <NavLinks vertical onNavigate={closeMenu} />
          <div className="flex items-center gap-3 border-t border-divider pt-4">
            <SavedButton onClick={closeMenu} />
            <GithubButton />
            <AuthButton className="ml-auto" />
          </div>
        </nav>
      </Sheet>
    </header>
  );
}
