"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "../ui/Button";
import { signOut, useUser } from "./useUser";

/** "Login" for visitors, "Log out" once signed in. */
export function AuthButton({ className }: { className?: string }) {
  const user = useUser();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <Button
        variant="accent"
        className={className}
        disabled={busy}
        title={user.email ?? undefined}
        onClick={async () => {
          setBusy(true);
          await signOut();
          setBusy(false);
          router.refresh();
        }}
      >
        {busy ? "Logging out…" : "Log out"}
      </Button>
    );
  }
  // While the session check is pending, keep the slot's width but hide it to avoid a Login→Log out flash.
  return (
    <ButtonLink variant="accent" href="/login" className={`${className ?? ""} ${user === undefined ? "invisible" : ""}`}>
      Login
    </ButtonLink>
  );
}
