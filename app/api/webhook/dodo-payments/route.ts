import { Webhooks } from "@dodopayments/nextjs";
import type { Subscription } from "@dodopayments/core/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { tierForProductId } from "@/lib/dodo/products";

/**
 * Upserts by `dodo_subscription_id`, so a retried webhook delivery just
 * re-applies the same state instead of double-processing.
 */
async function syncSubscription(data: Subscription) {
  const userId = data.metadata?.supabase_user_id;
  const tier = tierForProductId(data.product_id);
  if (typeof userId !== "string" || !tier) return;

  await createAdminClient()
    .from("sponsorships")
    .upsert(
      {
        dodo_subscription_id: data.subscription_id,
        user_id: userId,
        tier,
        dodo_customer_id: data.customer.customer_id,
        status: data.status,
        current_period_end: data.next_billing_date,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "dodo_subscription_id" },
    );
}

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
  onSubscriptionActive: ({ data }) => syncSubscription(data),
  onSubscriptionRenewed: ({ data }) => syncSubscription(data),
  onSubscriptionPlanChanged: ({ data }) => syncSubscription(data),
  onSubscriptionOnHold: ({ data }) => syncSubscription(data),
  onSubscriptionCancelled: ({ data }) => syncSubscription(data),
  onSubscriptionFailed: ({ data }) => syncSubscription(data),
  onSubscriptionExpired: ({ data }) => syncSubscription(data),
});
