import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Split-screen frame for login and sign up (Figma "SignUp page"): the form on a
 * soft card-coloured half, the animated build illustration on the white half.
 * The illustration is dropped below the lg breakpoint so phones get just the form.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-svh overflow-hidden bg-card lg:grid-cols-2">
      <main className="flex min-h-0 flex-col overflow-y-auto px-4 py-5 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-8 lg:px-12 [&::-webkit-scrollbar]:hidden">
        <Link href="/" aria-label="Icona home" className="flex w-fit items-center gap-3 rounded-[10px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/logo.png" alt="" width={40} height={40} className="size-10 object-cover" />
          <span className="text-[24px] leading-6 font-semibold tracking-[-0.045em] text-ink">Icona</span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-4">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </main>

      <aside aria-hidden className="relative hidden min-h-0 items-center justify-center overflow-hidden border-l border-divider bg-white p-10 lg:flex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/auth/icona-build.svg" alt="" width={920} height={660} className="h-auto max-h-full w-full max-w-[720px] select-none" draggable={false} />
      </aside>
    </div>
  );
}
