import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Log in - Icona",
  description: "Log in to your Icona account.",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense>
        <AuthPanel mode="login" />
      </Suspense>
    </AuthShell>
  );
}
