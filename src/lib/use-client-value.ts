"use client";

import * as React from "react";

/** There is no external store to watch: the value is read once, on the client. */
const subscribe = () => () => {};

/**
 * Returns `serverValue` on the server and through hydration, then whatever
 * `read()` reports in the browser.
 *
 * For capability checks — "does this pointer hover", "is motion welcome" — whose
 * answer must not differ between server and client markup. The obvious
 * spelling, `useState` plus a `setState` in an effect, triggers a cascading
 * render and is what React 19's compiler rules flag; this reads in render
 * instead.
 *
 * `read` must return a stable value for a given client state (a primitive, or a
 * cached object), or React will re-render without end.
 */
export function useClientValue<T>(read: () => T, serverValue: T): T {
  return React.useSyncExternalStore(subscribe, read, () => serverValue);
}

const alwaysTrue = () => true;

/**
 * False while rendering on the server and through hydration, true afterwards.
 *
 * For markup that can only be decided in the browser — the resolved colour
 * theme, say — where rendering the client answer during hydration would
 * mismatch the server's.
 */
export function useHasHydrated(): boolean {
  return useClientValue(alwaysTrue, false);
}
