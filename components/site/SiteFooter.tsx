import Link from "next/link";
import { GITHUB_URL, NAV_LINKS } from "./config";

export function SiteFooter() {
  return (
    <footer className="border-t border-divider">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between md:px-8 xl:px-[82px]">
        <Link href="/" className="flex items-center gap-2.5 rounded-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/logo.png" alt="" width={28} height={28} className="size-7 object-cover" />
          <span className="text-[18px] leading-6 font-semibold tracking-[-0.04em] text-ink">Icona</span>
        </Link>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] leading-5 font-medium text-muted">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
                GitHub
              </a>
            </li>
          </ul>
        </nav>
        <p className="text-[13px] leading-5 text-muted">© {new Date().getFullYear()} Icona. MIT licensed.</p>
      </div>
    </footer>
  );
}
