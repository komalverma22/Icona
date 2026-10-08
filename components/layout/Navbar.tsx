"use client";

import { useState } from "react";
import { iconVariantsByKey } from "../icons/iconLibrary";
import { IconRenderer } from "../icons/IconRenderer";
import { useLibrary } from "../library/LibraryProvider";
import { IconSearch } from "../search/IconSearch";
import { Button, ButtonLink, cx } from "../ui/Button";
import { Sheet } from "../ui/Sheet";
import { Tooltip } from "../ui/Tooltip";

const NAV_LINKS = [
  { label: "Icons", href: "/", current: true },
  { label: "Sponsor", href: "#sponsor", current: false },
  { label: "Docs", href: "#docs", current: false },
] as const;

const GITHUB_URL = "https://github.com";
const MENU_ICON = iconVariantsByKey.get("menu-outline")!;

function NavLinks({ vertical = false, onNavigate }: { vertical?: boolean; onNavigate?: () => void }) {
  return (
    <ul className={cx("flex", vertical ? "flex-col gap-1" : "items-center gap-1")}>
      {NAV_LINKS.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            onClick={onNavigate}
            aria-current={link.current ? "page" : undefined}
            className={cx(
              "flex h-8 items-center rounded-[10px] px-2.5 text-[12px] leading-[14.4px] font-medium transition-colors",
              link.current ? "text-ink" : "text-muted hover:text-ink",
              vertical && "px-0 text-[14px]",
            )}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

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
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 md:px-8 xl:px-[82px]">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-[19px]">
          <a href="/" aria-label="Icona — all icons" className="shrink-0 rounded-[10px]">
            <img src="/figma/logo.png" alt="" width={32} height={32} className="size-8 object-cover" />
          </a>
          <IconSearch className="max-w-[332px]" />
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <nav aria-label="Primary">
            <NavLinks />
          </nav>
          <SavedButton />
          <GithubButton />
          <Button variant="accent">Login</Button>
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
            <Button variant="accent" className="ml-auto">
              Login
            </Button>
          </div>
        </nav>
      </Sheet>
    </header>
  );
}
