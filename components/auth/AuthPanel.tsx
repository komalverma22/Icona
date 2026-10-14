"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthForm, type AuthValues } from "./AuthForm";

/** Connects the auth form to Supabase. */
export function AuthPanel({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/icons";
  const callback = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(dest)}`;

  const onSubmit = async ({ name, email, password }: AuthValues) => {
    const supabase = createClient();
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      router.replace(dest);
      router.refresh();
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: callback() } });
    if (error) throw new Error(error.message);
    if (data.session) {
      router.replace(dest);
      router.refresh();
      return;
    }
    return "Check your inbox - we sent you a link to confirm your email.";
  };

  const onGoogle = async () => {
    // Supabase answers a disabled provider with a raw JSON error page, so check first.
    const settings = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
    })
      .then((r) => r.json() as Promise<{ external?: Record<string, boolean> }>)
      .catch(() => null);
    if (settings && !settings.external?.google) throw new Error("Google sign-in isn’t enabled yet. Use email and password for now.");
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback() } });
    if (error) throw new Error(error.message);
  };

  return (
    <>
      {params.get("reason") && (
        <p role="status" className="mb-4 rounded-[10px] border border-line bg-white px-3 py-2.5 text-[13px] leading-5 text-text">
          {params.get("reason") === "save" ? "Log in to save icons to your collection." : "Log in to export icons."}
        </p>
      )}
      {params.get("error") && (
        <p role="alert" className="mb-4 rounded-[10px] border border-[#d92d20]/30 bg-white px-3 py-2.5 text-[13px] leading-5 text-[#d92d20]">
          Sign-in didn’t complete. Please try again.
        </p>
      )}
      <AuthForm mode={mode} onSubmit={onSubmit} onGoogle={onGoogle} />
    </>
  );
}
