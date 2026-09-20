"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribe to a media query.
 *
 * useSyncExternalStore rather than useEffect + setState, which is not a style
 * preference: the React Compiler lint rules reject setState-in-effect, and the
 * effect version also paints one frame with the server value before correcting
 * itself. `serverValue` is what SSR renders, so pick the one that produces the
 * markup you would rather ship to a client that never runs the hydration.
 */
export function useMedia(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
