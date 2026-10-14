"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthButton } from "../auth/AuthButton";
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
        const current = pathname.startsWith(link.href);
        return (
          <li key={link.label}>
            <Link
              href={link.href}
              onClick={onNavigate}
              aria-current={current ? "page" : undefined}
              className={cx(
                "relative flex h-9 items-center rounded-[10px] px-3 text-[14px] leading-[16.8px] font-medium transition-colors",
                current ? "text-ink" : "text-muted hover:text-ink",
                vertical && "px-0 text-[16px]",
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
export function SiteHeader({ cta = "browse", bordered = true }: { cta?: "browse" | "login"; bordered?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  const action =
    cta === "login" ? (
      <AuthButton />
    ) : (
      <>
        <ButtonLink href="/icons">Browse icons</ButtonLink>
        <AuthButton />
      </>
    );
  return (
    <header className={cx("sticky top-0 z-40 bg-white", bordered && "border-b border-divider")}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 md:grid md:grid-cols-[1fr_auto_1fr] md:px-8 xl:px-[82px]">
        <Link href="/" aria-label="Icona — home" className="flex shrink-0 items-center gap-3 justify-self-start rounded-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/logo.png" alt="" width={40} height={40} className="size-10 object-cover" />
          <span className="text-[24px] leading-6 font-semibold tracking-[-0.045em] text-ink">Icona</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-3 justify-self-end md:flex">
          <GithubButton />
          {action}
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
            <div className="ml-auto">{action}</div>
          </div>
        </nav>
      </Sheet>
    </header>
  );
}
