"use client";

import { useState, useSyncExternalStore } from "react";

// Per-user dashboard preferences, kept in this browser for now. Everything goes through usePreferences(), so moving
// them to the backend later only changes this file. Theme and language have their own storage (next-themes and the
// NEXT_LOCALE cookie) because they must apply before the page renders.

export interface Preferences {
  /** Rows per page a data table starts with. */
  tablePageSize: number;
  /** Show a toast when new notifications arrive. */
  notificationToasts: boolean;
}

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const defaults: Preferences = { tablePageSize: 20, notificationToasts: true };

const STORAGE_KEY = "preferences";
const listeners = new Set<() => void>();
let cached: { raw: string | null; value: Preferences } | null = null;

function read(): Preferences {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private mode, disabled site data): use the defaults.
  }
  // useSyncExternalStore needs the same object back while nothing changed.
  if (cached?.raw === raw) return cached.value;
  let stored: Partial<Preferences> = {};
  try {
    stored = raw ? JSON.parse(raw) : {};
  } catch {
    // Unreadable value: start over from the defaults.
  }
  const value = { ...defaults, ...stored };
  if (!PAGE_SIZE_OPTIONS.includes(value.tablePageSize)) value.tablePageSize = defaults.tablePageSize;
  cached = { raw, value };
  return value;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab changed them.
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), [key]: value }));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}

/** The current preferences. Components re-render as soon as one changes, in this tab or another. */
export function usePreferences(): Preferences {
  // The server and the first client render use the defaults; the stored values follow right after hydration.
  return useSyncExternalStore(subscribe, read, () => defaults);
}

/** A table's page size: the preferred one (or `fixed`, for a table that sets its own), until the user picks another one in that table. */
export function useTablePageSize(fixed?: number): [number, (size: number) => void] {
  const { tablePageSize } = usePreferences();
  const [chosen, setChosen] = useState<number | null>(null);
  return [chosen ?? fixed ?? tablePageSize, setChosen];
}
