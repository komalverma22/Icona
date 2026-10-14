"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Favourites, persisted to localStorage. A tiny external store consumed via
 * useSyncExternalStore: every card subscribes, but only cards whose saved
 * flag changes re-render. Stays in sync across tabs via the `storage` event.
 */

const STORAGE_KEY = "icona:saved-icons";
const EMPTY: readonly string[] = Object.freeze([]);

let saved: readonly string[] = EMPTY;
let savedSet: ReadonlySet<string> = new Set();
let hydrated = false;
const listeners = new Set<() => void>();

function read(): readonly string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? Object.freeze(parsed.filter((v): v is string => typeof v === "string")) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function commit(next: readonly string[], persist: boolean) {
  saved = next;
  savedSet = new Set(next);
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage may be unavailable (private mode / quota) - keep in-memory state.
    }
  }
  listeners.forEach((l) => l());
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  saved = read();
  savedSet = new Set(saved);
}

function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY) commit(read(), false);
}

function subscribe(listener: () => void) {
  ensureHydrated();
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  ensureHydrated();
  return saved;
};
const getServerSnapshot = () => EMPTY;

export function toggleSaved(key: string) {
  ensureHydrated();
  commit(savedSet.has(key) ? saved.filter((k) => k !== key) : Object.freeze([...saved, key]), true);
}

/** All saved icon keys, in the order they were saved. */
export function useSavedIcons(): readonly string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Whether one icon is saved - re-renders only when this icon's flag flips. */
export function useIsSaved(key: string): boolean {
  const getFlag = useCallback(() => {
    ensureHydrated();
    return savedSet.has(key);
  }, [key]);
  return useSyncExternalStore(subscribe, getFlag, () => false);
}
