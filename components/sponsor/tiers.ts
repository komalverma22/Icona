export interface Tier {
  id: string;
  name: string;
  /** Monthly price in USD. */
  price: number;
  /** Flavour field on the boarding pass. */
  seat: string;
  tagline: string;
  perks: string[];
  featured?: boolean;
  /** How many logo slots the tier card shows. */
  slots: number;
}

/** Edit prices and perks here — the Sponsor page renders whatever is listed, highest tier first. */
export const TIERS: readonly Tier[] = [
  {
    id: "gold",
    name: "Gold",
    price: 150,
    seat: "1A",
    tagline: "Your logo everywhere Icona is seen.",
    perks: ["Logo on the icons page", "Logo on the landing page", "Listing on the sponsors page", "Shoutout on X", "Logo in the README"],
    featured: true,
    slots: 3,
  },
  {
    id: "silver",
    name: "Silver",
    price: 100,
    seat: "3C",
    tagline: "Front and centre on the landing page.",
    perks: ["Logo on the landing page", "Listing on the sponsors page", "Shoutout on X"],
    slots: 3,
  },
  {
    id: "bronze",
    name: "Bronze",
    price: 30,
    seat: "12A",
    tagline: "Back the project and get noticed.",
    perks: ["Logo in the README", "Shoutout on X"],
    slots: 3,
  },
];
