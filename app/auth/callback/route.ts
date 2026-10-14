import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** OAuth / email-confirmation landing: swaps the `code` for a session cookie. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/icons";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${dest}`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
