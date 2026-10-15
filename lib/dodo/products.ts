import { TIERS } from "@/components/sponsor/tiers";

/** Maps each sponsorship tier id to its Dodo Payments product id (set once the products exist in the dashboard). */
const PRODUCT_ID_BY_TIER: Record<string, string | undefined> = {
  gold: process.env.DODO_PRODUCT_ID_GOLD,
  silver: process.env.DODO_PRODUCT_ID_SILVER,
  bronze: process.env.DODO_PRODUCT_ID_BRONZE,
};

export function productIdForTier(tierId: string): string | undefined {
  return PRODUCT_ID_BY_TIER[tierId];
}

export function tierForProductId(productId: string): string | undefined {
  return TIERS.find((tier) => PRODUCT_ID_BY_TIER[tier.id] === productId)?.id;
}
