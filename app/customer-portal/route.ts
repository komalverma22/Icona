import { NextRequest, NextResponse } from "next/server";
import { CustomerPortal } from "@dodopayments/nextjs";
import { createClient } from "@/lib/supabase/server";

const portal = CustomerPortal({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode",
});

/**
 * Auth-gated wrapper: the adapter's handler itself has no auth, so we look up
 * the signed-in user's own Dodo customer id and never trust one from the client.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/sponsor&reason=sponsor", request.url));

  const { data } = await supabase
    .from("sponsorships")
    .select("dodo_customer_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.dodo_customer_id) return NextResponse.redirect(new URL("/sponsor", request.url));

  const portalUrl = new URL(request.url);
  portalUrl.searchParams.set("customer_id", data.dodo_customer_id);
  return portal(new NextRequest(portalUrl, { headers: request.headers }));
}
