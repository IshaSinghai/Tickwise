"use client";

/*
 * The one data-loading hook for the client-rendered realms.
 *
 * The brief allows no data-fetching library — "fetching is useEffect plus a typed
 * fetch wrapper" — and every page that loads data needs the same four states
 * (loading, empty, error, populated). Written once here so those states are
 * identical everywhere rather than re-derived per page, which is how the portal
 * ended up with one page that had them and eight that didn't.
 *
 * Empty is not a state this hook returns: emptiness is a property of the data, so
 * only the caller knows whether `[]`, `null` or `{items: []}` means empty. The
 * hook resolves loading/error/ready and the caller renders <EmptyState/>.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/lib/api";

export type AsyncState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: T; error: null };

const LOADING = { status: "loading", data: null, error: null } as const;

export function useAsync<T>(
  load: (signal: AbortSignal) => Promise<T>,
  fallbackMessage: string,
): AsyncState<T> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>(LOADING);
  const [attempt, setAttempt] = useState(0);

  /*
   * `load` is nearly always an inline arrow, so it is a new function every
   * render. Holding it in a ref keeps it out of the effect's dependencies —
   * passing it directly would re-fetch on every render, forever.
   */
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState(LOADING);

    loadRef
      .current(controller.signal)
      .then((data) => {
        if (active) setState({ status: "ready", data, error: null });
      })
      .catch((err: unknown) => {
        // An abort is this component unmounting or retrying, not a failure.
        if (!active || controller.signal.aborted) return;
        setState({
          status: "error",
          data: null,
          // The brief asks for errors shown inline "showing the server's own
          // message"; ApiError already carries it.
          error: err instanceof ApiError ? err.message : fallbackMessage,
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt, fallbackMessage]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { ...state, retry };
}
