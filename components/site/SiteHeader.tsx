"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink, cx } from "../ui/Button";
import { Sheet } from "../ui/Sheet";
import { Tooltip } from "../ui/Tooltip";
import { GITHUB_URL, NAV_LINKS } from "./config";

/** Primary navigation shared by every page. The current route is marked with aria-current. */
export function NavLinks({ vertical = false, onNavigate }: { vertical?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname() ?? "/";
  return (
    <ul className={cx("flex", vertical ? "flex-col gap-1" : "items-center gap-1")}>
      {NAV_LINKS.map((link) => {
        const current = link.href === "/" ? pathname === "/" || pathname.startsWith("/icons") : pathname.startsWith(link.href);
        return (
          <li key={link.label}>
            <Link
              href={link.href}
              onClick={onNavigate}
              aria-current={current ? "page" : undefined}
              className={cx(
                "relative flex h-8 items-center rounded-[10px] px-2.5 text-[12px] leading-[14.4px] font-medium transition-colors",
                current ? "text-ink" : "text-muted hover:text-ink",
                vertical && "px-0 text-[14px]",
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function GithubButton() {
  return (
    <Tooltip label="GitHub" side="bottom">
      <ButtonLink iconOnly href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Icona on GitHub (opens in a new tab)">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/github.svg" alt="" aria-hidden width={18} height={18} className="size-[18px]" />
      </ButtonLink>
    </Tooltip>
  );
}

/** Top bar for the Docs and Sponsor pages — the library's bar, minus the search and filters. */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 md:px-8 xl:px-[82px]">
        <Link href="/" aria-label="Icona — all icons" className="flex shrink-0 items-center gap-2.5 rounded-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/logo.png" alt="" width={32} height={32} className="size-8 object-cover" />
          <span className="text-[14px] leading-4 font-medium text-ink">Icona</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <nav aria-label="Primary">
            <NavLinks />
          </nav>
          <GithubButton />
          <ButtonLink variant="accent" href="/">
            Browse icons
          </ButtonLink>
        </div>

        <Button iconOnly className="md:hidden" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </Button>
      </div>
      <Sheet open={menuOpen} onClose={close} title="Menu">
        <nav aria-label="Primary" className="flex flex-col gap-4">
          <NavLinks vertical onNavigate={close} />
          <div className="flex items-center gap-3 border-t border-divider pt-4">
            <GithubButton />
            <ButtonLink variant="accent" href="/" className="ml-auto">
              Browse icons
            </ButtonLink>
          </div>
        </nav>
      </Sheet>
    </header>
  );
}
