"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section is currently in view, for a nav's active indicator.
 *
 * The rootMargin band is deliberately narrow and centred: an observer that
 * fires on any intersection reports two or three sections at once near a
 * boundary and the indicator flickers. Confining it to the middle slice of the
 * viewport means exactly one section qualifies at a time.
 *
 * Extracted from the default theme's Nav so every theme's nav gets the same
 * behaviour without re-deriving the margins.
 */
export function useScrollSpy(ids: readonly string[], initial = ids[0] ?? "") {
  const [active, setActive] = useState(initial);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // `ids` is a module-level constant at every call site; joining keeps the
    // dep stable without asking callers to memoise an array literal.
  }, [ids.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return active;
}
