/**
 * Outbound links used by the site chrome and the Sponsor page.
 * Point these at the real project before launch — every button that uses them
 * opens exactly this URL.
 */
export const GITHUB_URL = "https://github.com";
export const SPONSOR_URL = `${GITHUB_URL}/sponsors`;

export const NAV_LINKS = [
  { label: "Icons", href: "/icons" },
  { label: "Docs", href: "/docs" },
  { label: "Sponsor", href: "/sponsor" },
] as const;
