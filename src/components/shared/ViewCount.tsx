"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "views:counted";

/**
 * One visit is one browser session, not one page load.
 *
 * This matters here more than on a normal site: switching theme is a full
 * document navigation, so counting page loads would mean anyone clicking
 * through all four themes counted as four visitors. A sessionStorage flag
 * makes the first load of a session the only one that increments; every later
 * load in that session reads the number without touching it.
 *
 * React runs effects twice in development StrictMode, which would double the
 * very first visit. The flag is written BEFORE the request goes out, so the
 * second invocation takes the read path.
 */
function alreadyCounted(): boolean {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return true;
    sessionStorage.setItem(SESSION_KEY, "1");
    return false;
  } catch {
    // Private mode. Read rather than count: inflating the number is worse
    // than missing a visit.
    return true;
  }
}

export function ViewCount({ className = "" }: { className?: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const method = alreadyCounted() ? "GET" : "POST";
    let live = true;
    void fetch("/api/views", { method })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { configured?: boolean; views?: number | null } | null) => {
        if (!live || !data?.configured || typeof data.views !== "number") return;
        setViews(data.views);
      })
      .catch(() => {
        // Nothing renders. See the route: the counter is a flourish.
      });
    return () => {
      live = false;
    };
  }, []);

  // Renders nothing until there is a real number, so no layout shift from a
  // placeholder and nothing at all when the store is not provisioned.
  if (views == null) return null;

  return (
    <span className={className}>
      <span aria-hidden>◉ </span>
      {views.toLocaleString()} {views === 1 ? "visit" : "visits"}
    </span>
  );
}
