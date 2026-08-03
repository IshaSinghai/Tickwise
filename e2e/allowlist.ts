/*
 * Console/page errors that predate this migration and aren't caused by
 * anything it touches. Shared across every spec so the allowlist only has to
 * be maintained in one place. Do not add an entry to silence a real
 * regression — if a route starts erroring because of a change you made, fix
 * the change, don't allowlist it.
 */
export const KNOWN_ERROR_ALLOWLIST: RegExp[] = [
  // Pre-existing Lovable bug on /pricing: Row's `value` prop isn't
  // locale-pinned (`toLocaleString()` with no locale arg), so the server
  // (en-US, Vercel) and a non-en-US browser render different digit grouping
  // ("500,000" vs "5,00,000"), and React can't reconcile the mismatch.
  // Confirmed present on pristine `develop` before this migration started;
  // out of scope for a tech-stack-parity migration. Tracked separately.
  /Hydration failed because the server rendered text didn't match the client/,

  // Pre-existing Lovable bug on /contact: the submit handler calls
  // `(e.currentTarget as HTMLFormElement).reset()` inside a setTimeout.
  // React nulls SyntheticEvent.currentTarget once the handler that received it
  // returns, so by the time the timeout fires 700ms later, currentTarget is
  // null and .reset() throws. Confirmed present on pristine `develop` before
  // this migration started; the toast itself fires correctly, only the form
  // reset silently fails. Out of scope for a tech-stack-parity migration.
  /Cannot read properties of null \(reading 'reset'\)/,
];

export function isAllowlistedError(text: string): boolean {
  return KNOWN_ERROR_ALLOWLIST.some((re) => re.test(text));
}
