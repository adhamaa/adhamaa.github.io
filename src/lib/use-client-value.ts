import * as React from "react";

/** There is no external store to watch: the value is read once, on the client. */
const subscribe = () => () => {};

/**
 * Returns `serverValue` on the server and through hydration, then whatever
 * `read()` reports in the browser.
 *
 * For capability checks — "are we mounted", "does this pointer hover" — that
 * must not differ between server and client markup. The obvious spelling,
 * `useState` plus a `setState` in an effect, triggers a cascading render and is
 * what React 19's compiler rules flag; this reads the value in render instead.
 *
 * `read` must return a stable value for a given client state (a primitive, or a
 * cached object), or React will re-render without end.
 */
export function useClientValue<T>(read: () => T, serverValue: T): T {
  return React.useSyncExternalStore(subscribe, read, () => serverValue);
}
