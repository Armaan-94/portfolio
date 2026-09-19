"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { THEMES, type ThemeId } from "@/themes/registry";

const VEIL_MS = 220;

/**
 * A one-shot handoff so the next document knows to fade itself up.
 *
 * This is the only thing the switcher stores. The theme itself is not
 * remembered anywhere: "/" is always the default theme, and a theme is a URL.
 */
function markEntering(id: ThemeId) {
  try {
    sessionStorage.setItem("theme:entering", id);
  } catch {
    // Private mode or storage disabled. The page just appears without the fade.
  }
}

/**
 * The theme switcher.
 *
 * Styled entirely from the active theme's own semantic tokens, so it belongs
 * to whichever theme is showing rather than looking like a widget bolted on
 * top of all of them.
 *
 * Each entry is a real anchor to that theme's route, so middle-click, "open in
 * new tab" and a visitor without JavaScript all still work. The click handler
 * takes over only for an unmodified left click, and then hard-navigates rather
 * than routing: a full document load guarantees the default theme's WebGL
 * context is torn down, resets scroll naturally, and paints a fully
 * server-rendered page instead of reconciling two completely different trees.
 */
export function ThemeDial({ current }: { current: ThemeId }) {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  function pick(e: React.MouseEvent<HTMLAnchorElement>, id: ThemeId, href: string) {
    // Modified clicks belong to the browser.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    if (id === current) {
      setOpen(false);
      return;
    }

    markEntering(id);
    setLeaving(true);
    // Straight to the theme's own route, which is the same URL the anchor
    // already points at. The address bar therefore always names the theme on
    // screen, and "/" is only ever the default.
    window.setTimeout(() => window.location.assign(href), VEIL_MS);
  }

  const veil =
    leaving
      ? createPortal(
          // Portaled to body so it is a sibling of the page and never an
          // ancestor of it. An ancestor carrying a filter or backdrop-filter
          // would become the containing block for the default theme's fixed
          // orb layer and clip it.
          <div
            aria-hidden
            className="theme-veil pointer-events-none fixed inset-0 z-[200] bg-canvas"
          />,
          document.body
        )
      : null;

  const currentTheme = THEMES.find((t) => t.id === current);

  return (
    <>
      <div
        ref={rootRef}
        className="fixed right-4 bottom-4 z-[120] print:hidden sm:right-6 sm:bottom-6"
      >
        {open ? (
          <div
            role="group"
            aria-label="Choose a theme"
            className="mb-3 w-[16.5rem] overflow-hidden rounded-xl border border-hairline bg-surface"
          >
            <p className="border-b border-hairline px-3.5 py-2.5 font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
              Theme
            </p>
            <ul>
              {THEMES.map((t) => {
                const isCurrent = t.id === current;
                return (
                  <li key={t.id}>
                    <a
                      href={t.href}
                      onClick={(e) => pick(e, t.id, t.href)}
                      aria-current={isCurrent ? "true" : undefined}
                      className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors ${
                        isCurrent ? "bg-surface-2" : "hover:bg-surface-2"
                      }`}
                    >
                      <span
                        aria-hidden
                        className="flex h-8 w-8 shrink-0 overflow-hidden rounded-md border border-hairline"
                      >
                        {t.swatch.map((c) => (
                          <span
                            key={c}
                            className="flex-1"
                            style={{ background: c }}
                          />
                        ))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink">
                          {t.label}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {t.tagline}
                        </span>
                      </span>
                      {isCurrent ? (
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo"
                        />
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close theme picker" : "Change theme"}
          className="ml-auto flex h-11 items-center gap-2 rounded-full border border-hairline bg-surface px-3.5 text-sm text-ink transition-colors hover:border-indigo"
        >
          <span
            aria-hidden
            className="flex h-5 w-5 overflow-hidden rounded-full border border-hairline"
          >
            {(currentTheme?.swatch ?? []).map((c) => (
              <span key={c} className="flex-1" style={{ background: c }} />
            ))}
          </span>
          <span className="hidden sm:inline">Theme</span>
        </button>
      </div>
      {veil}
    </>
  );
}
