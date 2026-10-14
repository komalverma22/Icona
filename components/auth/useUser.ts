"use client";

import type { User } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * The signed-in Supabase user, shared by every component through one external
 * store (a single auth subscription, however many icon cards read it).
 * `undefined` = still checking, `null` = signed out.
 */
let current: User | null | undefined;
let started: Promise<User | null> | null = null;
const listeners = new Set<() => void>();

function set(user: User | null) {
  current = user;
  listeners.forEach((l) => l());
}

function start(): Promise<User | null> {
  if (!started) {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((_event, session) => set(session?.user ?? null));
    started = supabase.auth.getSession().then(({ data }) => {
      set(data.session?.user ?? null);
      return data.session?.user ?? null;
    });
  }
  return started;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void start();
  return () => {
    listeners.delete(listener);
  };
}

export function useUser(): User | null | undefined {
  return useSyncExternalStore(subscribe, () => current, () => undefined);
}

/** Resolves the current user (waits for the first session check). */
export async function ensureUser(): Promise<User | null> {
  if (current !== undefined) return current;
  return start();
}

/** Login URL that returns the visitor to the page they were on. */
export function loginHref(reason?: "save" | "export") {
  const next = `${window.location.pathname}${window.location.search}`;
  return `/login?next=${encodeURIComponent(next)}${reason ? `&reason=${reason}` : ""}`;
}

export async function signOut() {
  await createClient().auth.signOut();
}
