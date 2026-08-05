/*
 * Theme selection, shared by the provider and the pre-paint script.
 *
 * The brief specifies light and dark via `data-theme` with the choice persisted in
 * localStorage. Kept in one module so the inline script in the document head and
 * the React provider cannot disagree about the storage key or the default.
 */

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "cp-theme";

/*
 * Dark is the default rather than the OS preference, deliberately.
 *
 * The palette is dark-first — :root in globals.css is the dark set — and the
 * light theme is a complete but newer variant. Following prefers-color-scheme
 * would flip the site to light for the majority of visitors whose OS is light,
 * which is a product decision rather than an implementation detail, so it is not
 * made here. Setting `data-theme` explicitly on first paint also means the
 * attribute is always present, which keeps the CSS selectors unambiguous.
 */
export const DEFAULT_THEME: Theme = "dark";

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

/**
 * The script that runs before first paint.
 *
 * Emitted into <head> so `data-theme` is on <html> before the browser paints. A
 * provider effect alone would apply the theme one frame late, which is the
 * familiar flash of the wrong palette on every navigation-free page load. Written
 * as a string because it must execute ahead of the React bundle.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t!=="dark"&&t!=="light"){t=${JSON.stringify(
  DEFAULT_THEME,
)};}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme",${JSON.stringify(
  DEFAULT_THEME,
)});}})();`;
