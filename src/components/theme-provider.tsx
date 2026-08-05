"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { DEFAULT_THEME, isTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

type ThemeContextValue = { theme: Theme; setTheme: (next: Theme) => void; toggle: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

/*
 * Owns the `data-theme` attribute after hydration and persists changes.
 *
 * The attribute itself is set before paint by THEME_INIT_SCRIPT, so this provider
 * reads the value already on the element rather than defaulting and overwriting
 * it — initialising from DEFAULT_THEME here would undo a persisted light choice
 * on every load.
 *
 * No context is required for the theme to *work*: every component follows the CSS
 * custom properties, so they all re-render in the new palette with no React
 * involvement. The context exists only so a control can read and change it.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  /*
   * Re-asserts the attribute on mount rather than only reading it.
   *
   * React owns <html> (the root layout renders it) and strips attributes it did
   * not render when it hydrates — `suppressHydrationWarning` silences the warning
   * but does not stop the removal. Measured: `data-theme` was "dark" at
   * readyState=interactive and null once hydration finished. So the pre-paint
   * script wins the first paint and this effect makes it stick.
   *
   * Storage is the source of truth here, not the attribute, precisely because the
   * attribute may already have been removed by the time this runs.
   */
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      /* storage unavailable; fall through to the default */
    }
    const resolved = isTheme(stored) ? stored : DEFAULT_THEME;
    setThemeState(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing or a full quota. The theme still applies for this
      // session; only persistence is lost, which is not worth surfacing.
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
