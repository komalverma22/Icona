"use client";

import Link from "next/link";
import { useId, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Button, cx } from "../ui/Button";

type Mode = "login" | "signup";

export interface AuthValues {
  name: string;
  email: string;
  password: string;
}

const COPY = {
  signup: {
    title: "Create your Icona account",
    lead: "Save favorites, tune animations and install icons in seconds.",
    google: "Sign up with Google",
    submit: "Get Started",
    swap: { text: "Already have an account?", label: "Log in", href: "/login" },
  },
  login: {
    title: "Welcome back",
    lead: "Log in to your saved icons, colors and motion presets.",
    google: "Continue with Google",
    submit: "Log in",
    swap: { text: "Don’t have an account?", label: "Sign up", href: "/signup" },
  },
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT =
  "h-[42px] w-full rounded-[12px] border border-[rgba(28,31,33,0.18)] bg-field px-[18px] text-[14px] leading-5 text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-ink focus:shadow-[0_0_0_3px_rgba(28,31,33,0.08)] focus:outline-none aria-[invalid=true]:border-[#d92d20]";

type Errors = Partial<Record<keyof AuthValues | "terms", string>>;

function Field({ label, error, children, htmlFor }: { label: string; error?: string; children: ReactNode; htmlFor: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[14px] leading-5 tracking-[-0.01em] text-text">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-[12px] leading-4 text-[#d92d20]">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Login / sign-up form. Validation runs in the browser; the actual request is
 * supplied by the caller through `onSubmit`. There is no auth backend in this
 * project yet, so without it a valid form shows a notice instead of pretending to sign in.
 */
export function AuthForm({ mode, onSubmit }: { mode: Mode; onSubmit?: (values: AuthValues) => Promise<void> | void }) {
  const copy = COPY[mode];
  const signup = mode === "signup";
  const uid = useId();
  const [values, setValues] = useState<AuthValues>({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const set = (key: keyof AuthValues) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const finish = async (run: () => Promise<void> | void) => {
    setNotice(null);
    setBusy(true);
    try {
      await run();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (signup && !values.name.trim()) next.name = "Enter your name.";
    if (!EMAIL.test(values.email.trim())) next.email = "Enter a valid email address.";
    if (values.password.length < 8) next.password = "Use at least 8 characters.";
    if (signup && !agreed) next.terms = "Please accept the terms to continue.";
    setErrors(next);
    if (Object.keys(next).length) return;
    void finish(async () => {
      if (!onSubmit) throw new Error("Accounts aren’t connected to a backend yet, so nothing was sent.");
      await onSubmit({ ...values, email: values.email.trim(), name: values.name.trim() });
    });
  };

  const google = () =>
    void finish(() => {
      throw new Error("Google sign-in isn’t connected yet.");
    });

  return (
    <div>
      <h1 className="text-center text-[26px] leading-[1.15] font-medium tracking-[-0.03em] text-ink sm:text-[28px]">{copy.title}</h1>
      <p className="mt-2 text-center text-[14px] leading-5 tracking-[-0.01em] text-muted sm:text-[15px]">{copy.lead}</p>

      <Button size="lg" className="mt-6 w-full" disabled={busy} onClick={google}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/auth/google.svg" alt="" aria-hidden width={14} height={14} className="size-[14px]" />
        {copy.google}
      </Button>

      <div className="my-4 flex items-center gap-3 text-[14px] leading-5 text-muted" role="separator" aria-label="or">
        <span aria-hidden className="h-px flex-1 bg-line" />
        or
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
        {signup && (
          <Field label="Name" htmlFor={`${uid}-name`} error={errors.name}>
            <input id={`${uid}-name`} className={INPUT} placeholder="Enter your name" autoComplete="name" value={values.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} />
          </Field>
        )}
        <Field label="Email" htmlFor={`${uid}-email`} error={errors.email}>
          <input id={`${uid}-email`} type="email" className={INPUT} placeholder="Enter your email" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={Boolean(errors.email)} />
        </Field>
        <Field label="Password" htmlFor={`${uid}-password`} error={errors.password}>
          <div className="relative">
            <input
              id={`${uid}-password`}
              type={show ? "text" : "password"}
              className={cx(INPUT, "pr-12")}
              placeholder="Enter your password"
              autoComplete={signup ? "new-password" : "current-password"}
              value={values.password}
              onChange={set("password")}
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] text-muted transition-colors hover:text-ink"
            >
              <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                <circle cx="12" cy="12" r="3" />
                {show && <path d="M4 4l16 16" />}
              </svg>
            </button>
          </div>
        </Field>

        {signup && (
          <div>
            <label className="flex cursor-pointer items-center gap-3 text-[14px] leading-5 tracking-[-0.01em] text-text">
              <span className="relative size-[20px] shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    setErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  className="peer absolute inset-0 m-0 cursor-pointer appearance-none rounded-[5px] border border-[rgba(28,31,33,0.18)] bg-white transition-colors checked:border-black checked:bg-[#1d1f23] focus-visible:outline-offset-2"
                />
                <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute inset-0 m-auto size-3.5 text-white opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              I agree to all Terms, Privacy Policy and Fees
            </label>
            {errors.terms && (
              <p role="alert" className="mt-2 text-[12px] leading-4 text-[#d92d20]">
                {errors.terms}
              </p>
            )}
          </div>
        )}

        {notice && (
          <p role="status" className="rounded-[10px] border border-line bg-white px-3 py-2.5 text-[13px] leading-5 text-text">
            {notice}
          </p>
        )}

        <Button type="submit" variant="accent" size="lg" className="mt-1 w-full" disabled={busy}>
          {busy ? "Please wait…" : copy.submit}
        </Button>
      </form>

      <p className="mt-4 text-[14px] leading-5 tracking-[-0.01em] text-muted">
        {copy.swap.text}{" "}
        <Link href={copy.swap.href} className="font-semibold text-ink underline decoration-[rgba(28,31,33,0.25)] underline-offset-[3px] transition-colors hover:decoration-ink">
          {copy.swap.label}
        </Link>
      </p>
    </div>
  );
}
