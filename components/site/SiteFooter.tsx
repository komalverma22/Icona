"use client";

import Link from "next/link";
import { ButtonLink } from "../ui/Button";
import { GITHUB_URL, SPONSOR_URL } from "./config";
import { FooterWordmark } from "./FooterWordmark";

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Library",
    links: [
      { label: "All icons", href: "/icons" },
      { label: "Animation studio", href: "/icons" },
      { label: "Sign up", href: "/signup" },
    ],
  },
  {
    title: "Docs",
    links: [
      { label: "Quick start", href: "/docs#quick-start" },
      { label: "Installation", href: "/docs#installation" },
      { label: "Export formats", href: "/docs#exports" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQs", href: "/#faq" },
      { label: "Sponsor", href: "/sponsor" },
      { label: "GitHub", href: GITHUB_URL, external: true },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className = "group/link inline-flex items-center gap-1 text-[14px] leading-5 text-muted transition-colors hover:text-ink";
  const arrow = (
    <span aria-hidden className="-translate-x-1 opacity-0 transition-[opacity,translate] duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100">
      →
    </span>
  );
  return link.external ? (
    <a href={link.href} target="_blank" rel="noreferrer" className={className}>
      {link.label}
      {arrow}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.label}
      {arrow}
    </Link>
  );
}

/**
 * Site footer: logo and social row, a "reach out" card with link columns, a
 * giant faded wordmark whose letters rise in on scroll, and the legal line.
 */
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-divider bg-white">
      <div className="mx-auto max-w-[1440px] px-4 pt-12 md:px-8 md:pt-16 xl:px-[82px]">
        {/* Logo + social */}
        <div className="flex items-center justify-between gap-4 border-b border-divider pb-6">
          <Link href="/" aria-label="Icona home" className="flex items-center gap-3 rounded-[10px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figma/logo.png" alt="" width={36} height={36} className="size-9 object-cover" />
            <span className="text-[22px] leading-6 font-semibold tracking-[-0.045em] text-ink">Icona</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] leading-4 text-muted sm:inline">Follow the project</span>
            <ButtonLink iconOnly href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Icona on GitHub (opens in a new tab)">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/figma/github.svg" alt="" aria-hidden width={18} height={18} className="size-[18px]" />
            </ButtonLink>
          </div>
        </div>

        {/* Reach out + columns */}
        <div className="grid gap-10 py-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
          <div>
            <p className="text-[14px] leading-5 font-medium text-ink">Reach out to us</p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="group/card mt-4 flex w-full max-w-[340px] items-center gap-3 rounded-[14px] border border-line bg-card p-3 transition-[border-color,box-shadow,background-color] duration-200 hover:border-[rgba(28,31,33,0.2)] hover:bg-white hover:shadow-card-hover"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-black bg-[#1d1f23] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-transform duration-300 group-hover/card:-rotate-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/figma/github.svg" alt="" aria-hidden width={18} height={18} className="size-[18px] invert" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] leading-5 font-medium text-ink">Open an issue on GitHub</span>
                <span className="block text-[12px] leading-4 text-muted">Report a bug or request an icon</span>
              </span>
              <span aria-hidden className="pr-1 text-muted transition-transform duration-200 group-hover/card:translate-x-1 group-hover/card:text-ink">
                →
              </span>
            </a>
            <a href={SPONSOR_URL} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[13px] leading-5 text-muted underline decoration-[rgba(28,31,33,0.2)] underline-offset-[3px] transition-colors hover:text-ink">
              Enjoying Icona? Sponsor the project
            </a>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3 md:gap-x-16">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[14px] leading-5 font-medium text-ink">{col.title}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <FooterLinkItem link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Giant wordmark */}
      <div className="relative mx-auto max-w-[1440px] px-4 md:px-8 xl:px-[82px]">
        <FooterWordmark />
      </div>

      {/* Legal line */}
      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-3 px-4 pt-4 pb-8 text-[13px] leading-5 text-muted sm:flex-row sm:items-center sm:justify-between md:px-8 xl:px-[82px]">
        <p>© {new Date().getFullYear()} Icona. All rights reserved.</p>
        <p>MIT licensed · Made for people who ship interfaces</p>
      </div>
    </footer>
  );
}
