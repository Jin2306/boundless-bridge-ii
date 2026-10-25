import { useCallback, useEffect, useState } from "react";

export type Role = "participant" | "supporter";
export type Reflection = { id: string; text: string; date: string };
export type Completed = { id: string; date: string };
export type Settings = { largeText: boolean; highContrast: boolean; reduceMotion: boolean; audio: boolean; aiConsent: boolean };

const KEYS = {
  role: "bb.role",
  favorites: "bb.favorites",
  completed: "bb.completed",
  reflections: "bb.reflections",
  settings: "bb.settings",
  demo: "bb.demo",
} as const;

const DEFAULT_SETTINGS: Settings = { largeText: false, highContrast: false, reduceMotion: false, audio: true, aiConsent: false };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("bb-store", { detail: key }));
}

/** Local-only persisted state. Reads after hydration to avoid SSR mismatch. */
export function useLocal<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    setValue(read(key, fallback));
    const on = (e: Event) => {
      if ((e as CustomEvent).detail === key || e.type === "storage") setValue(read(key, fallback));
    };
    window.addEventListener("bb-store", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("bb-store", on);
      window.removeEventListener("storage", on);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(read(key, fallback)) : next;
      write(key, resolved);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set] as const;
}

export const useRole = () => useLocal<Role | null>(KEYS.role, null);
export const useFavorites = () => useLocal<string[]>(KEYS.favorites, []);
export const useCompleted = () => useLocal<Completed[]>(KEYS.completed, []);
export const useReflections = () => useLocal<Reflection[]>(KEYS.reflections, []);
export const useSettings = () => useLocal<Settings>(KEYS.settings, DEFAULT_SETTINGS);

export type DemoState = {
  step: "idle" | "invited" | "accepted" | "confirmed" | "revoked";
  share: { favorites: boolean; together: boolean; message: boolean };
  message: string;
};
export const DEMO_DEFAULT: DemoState = { step: "idle", share: { favorites: false, together: false, message: false }, message: "" };
export const useDemo = () => useLocal<DemoState>(KEYS.demo, DEMO_DEFAULT);

export function markCompleted(id: string) {
  const list = read<Completed[]>(KEYS.completed, []);
  write(KEYS.completed, [{ id, date: new Date().toISOString() }, ...list].slice(0, 100));
}

export function clearAllLocalData() {
  Object.keys(window.localStorage).filter((k) => k.startsWith("bb.buddy.")).forEach((k) => {
    window.localStorage.removeItem(k);
    window.dispatchEvent(new CustomEvent("bb-store", { detail: k }));
  });
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  Object.values(KEYS).forEach((k) => window.dispatchEvent(new CustomEvent("bb-store", { detail: k })));
}

export function applySettings(s: Settings) {
  const c = document.documentElement.classList;
  c.toggle("large-text", s.largeText);
  c.toggle("hc", s.highContrast);
  c.toggle("reduce-motion", s.reduceMotion);
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
  return true;
}
export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
