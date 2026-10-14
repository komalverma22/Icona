import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Sign up - Icona",
  description: "Create your Icona account and start your 30 day free trial.",
};

export default function SignUpPage() {
  return (
    <AuthShell>
      <Suspense>
        <AuthPanel mode="signup" />
      </Suspense>
    </AuthShell>
  );
}
