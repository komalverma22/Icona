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
}

/** Edit prices and perks here — the Sponsor page renders whatever is listed. */
export const TIERS: readonly Tier[] = [
  {
    id: "passenger",
    name: "Passenger",
    price: 5,
    seat: "12A",
    tagline: "Hop on and keep the icons free for everyone.",
    perks: ["Your name on the passenger manifest", "Early look at new icon sets"],
  },
  {
    id: "crew",
    name: "Crew",
    price: 25,
    seat: "3C",
    tagline: "For people and teams who ship with Icona.",
    perks: ["Everything in Passenger", "Name with a link on the manifest", "Logo in the project README", "Ask for an icon to be drawn"],
    featured: true,
  },
  {
    id: "captain",
    name: "Captain",
    price: 100,
    seat: "1A",
    tagline: "Help steer where the library goes next.",
    perks: ["Everything in Crew", "Logo on the icons page", "Priority on icon requests", "A shoutout when a new set ships"],
  },
];
