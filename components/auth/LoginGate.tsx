"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "../ui/Button";

/** Shown in place of a feature that needs an account (exports). */
export function LoginGate({ title, description }: { title: string; description: string }) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    setQuery(`?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}&reason=export`);
  }, []);
  return (
    <div className="flex flex-col items-start gap-3 rounded-[12px] border border-line bg-card p-5">
      <h3 className="text-[15px] leading-5 font-medium text-ink">{title}</h3>
      <p className="text-[13px] leading-5 text-muted">{description}</p>
      <div className="flex gap-2">
        <ButtonLink variant="accent" href={`/login${query}`}>
          Log in
        </ButtonLink>
        <ButtonLink href={`/signup${query}`}>Create account</ButtonLink>
      </div>
    </div>
  );
}
