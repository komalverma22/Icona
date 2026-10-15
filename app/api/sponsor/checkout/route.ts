import { NextResponse } from "next/server";
import { APIError } from "dodopayments/core/error";
import { createClient } from "@/lib/supabase/server";
import { createDodoClient } from "@/lib/dodo/client";
import { productIdForTier } from "@/lib/dodo/products";

/** Starts a Dodo Payments checkout for a sponsorship tier. Requires a logged-in Supabase user. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in to sponsor Icona." }, { status: 401 });

  const { tier } = await request.json().catch(() => ({ tier: undefined }));
  const productId = typeof tier === "string" ? productIdForTier(tier) : undefined;
  if (!productId) return NextResponse.json({ error: "Unknown sponsorship tier." }, { status: 400 });

  const origin = new URL(request.url).origin;
  try {
    const session = await createDodoClient().checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: user.email!, name: (user.user_metadata?.name as string | undefined) ?? undefined },
      return_url: `${origin}/sponsor?checkout=success`,
      // Lets the webhook attribute the resulting subscription back to this Supabase user.
      metadata: { supabase_user_id: user.id },
    });

    if (!session.checkout_url) return NextResponse.json({ error: "Checkout could not be started." }, { status: 502 });
    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (err) {
    const message = err instanceof APIError ? err.message : "Could not start checkout. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
