/*
 * Console/page errors that predate this migration and aren't caused by anything
 * it touches.
 *
 * Every entry is scoped to the specific routes where the bug was actually
 * observed. That scoping is the point: this migration replaces components that
 * render during SSR, so *introducing* a new hydration mismatch is a realistic
 * regression. A blanket "ignore React #418 everywhere" allowlist would silence
 * exactly the failure we most need to catch. Scoped this way, the known-bad
 * routes stay quiet while a new mismatch anywhere else still fails the suite.
 *
 * Do not add an entry to silence a regression. If a route starts erroring
 * because of a change you made, fix the change.
 */
type AllowEntry = {
  pattern: RegExp;
  /** Routes where this error is known pre-existing. Errors elsewhere still fail. */
  routes: string[];
  why: string;
};

const ALLOWLIST: AllowEntry[] = [
  {
    // React #418 is the hydration text-content mismatch. Cause: Lovable's code
    // calls `toLocaleString()` with no locale argument, so the server (en-US on
    // Vercel) and a non-en-US browser produce different digit grouping
    // ("500,000" vs "5,00,000") and React can't reconcile the text node.
    // Confirmed present on pristine `develop` before this migration started, by
    // stashing all changes and reproducing it. Out of scope for a
    // tech-stack-parity migration; tracked separately.
    // In dev the same bug reports as the unminified "Hydration failed because
    // the server rendered text didn't match the client" — both forms listed so
    // the harness works against either server.
    pattern:
      /Minified React error #418|Hydration failed because the server rendered text didn't match the client/,
    routes: ["/pricing", "/explore"],
    why: "pre-existing unlocalized toLocaleString() hydration mismatch",
  },
  {
    // The /contact submit handler calls `(e.currentTarget as HTMLFormElement)
    // .reset()` inside a setTimeout. React nulls SyntheticEvent.currentTarget
    // once the handler returns, so 700ms later it's null and .reset() throws.
    // The toast still fires correctly; only the form reset silently fails.
    // Confirmed identical on pristine `develop`.
    pattern: /Cannot read properties of null \(reading 'reset'\)/,
    routes: ["/contact"],
    why: "pre-existing stale SyntheticEvent.currentTarget in setTimeout",
  },
];

/** True if `text` is a known pre-existing error for `route`. */
export function isAllowlistedError(text: string, route: string): boolean {
  return ALLOWLIST.some((e) => e.routes.includes(route) && e.pattern.test(text));
}
