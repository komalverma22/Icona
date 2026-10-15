import DodoPayments from "dodopayments";

/** Server-only Dodo Payments client. Never import this from a Client Component. */
export function createDodoClient() {
  return new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode",
  });
}
