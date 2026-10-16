"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/Button";
import { loginHref, useUser } from "../auth/useUser";

/** Starts a Dodo Payments checkout for the given tier, sending signed-out visitors to log in first. */
export function SponsorCheckoutButton({
  tierId,
  tierName,
  variant = "accent",
  className,
}: {
  tierId: string;
  tierName: string;
  variant?: "accent" | "raised";
  className?: string;
}) {
  const user = useUser();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (!user) {
      router.push(loginHref("sponsor"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sponsor/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId }),
      });
      const body = await res.json();
      if (!res.ok || !body.checkout_url) throw new Error(body.error ?? "Could not start checkout.");
      window.location.href = body.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Button variant={variant} className={className} disabled={busy || user === undefined} onClick={start}>
        {busy ? "Starting checkout…" : `Choose ${tierName}`}
      </Button>
      {error && (
        <p role="alert" className="text-[12px] leading-4 text-[#d92d20]">
          {error}
        </p>
      )}
    </div>
  );
}
