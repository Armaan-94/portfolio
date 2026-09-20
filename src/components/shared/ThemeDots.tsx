"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMedia } from "@/lib/useMedia";
import { THEMES, type ThemeId } from "@/themes/registry";

/** Matches the veil animation in globals.css. */
const VEIL_MS = 220;
/** Grace period so the pointer can cross the gap from dots to panel. */
const CLOSE_MS = 180;

/**
 * The preview renders a real page at a desktop width and is scaled down, so
 * what you see is the actual layout rather than an impression of it. These two
 * numbers are the only place the ratio lives; the CSS reads them.
 */
const FRAME_W = 1280;
const FRAME_H = 800;

/**
 * Theme switcher: four dots in the nav, live preview on hover, commit on click.
 *
 * This replaced a peeled page corner. The peel was fixed to the viewport and,
 * by design, painted the NEXT theme's ground and ink, which meant every page
 * permanently carried a patch of a foreign palette and sat on top of its own
 * footer. "Show what is underneath" and "do not disturb this theme" turned out
 * to be the same knob turned opposite ways. Nothing here is visible until you
 * point at it, and everything that is visible is drawn from the CURRENT
 * theme's tokens, so an unopened switcher cannot clash with anything.
 *
 * WHY THE PREVIEW IS AN IFRAME. The themes are not skins. Each is a separate
 * statically prerendered route with its own components, its own section order
 * and its own markup, so there is no palette of Manga that could be painted
 * onto Weyland's layout: previewing the real thing means rendering the real
 * route. One frame is alive at a time and its src is swapped, which bounds the
 * cost to a single extra document no matter how long someone browses the list.
 * The pages are static and CDN-cached, so a second look is instant.
 *
 * Under the frame sits that theme's ground colour, painted immediately. A
 * preview therefore resolves palette-first and then fills in, instead of
 * flashing blank.
 */
/**
 * Every dot is the same object: a disc split on the diagonal, the theme's
 * ground on one side and its signature colour on the other, under an
 * identical hairline ring.
 *
 * Three of the four grounds are near-black because three of the four themes
 * are dark; Manga is the only light one. That asymmetry is the dot doing its
 * job, not a defect.
 *
 * An earlier version filled with the ground and ringed with the accent, which
 * looked uniform in the stylesheet and was not on screen: Manga's cream ground
 * read as a solid light disc while the three dark-ground themes read as hollow
 * rings, because their fill vanished into the panel behind them. Picking one
 * channel instead does not work either. Three of the four grounds are
 * near-black, and Manga's vermillion sits next to Retro's brick, so neither
 * ground nor accent alone separates all four. Showing both does, and keeps
 * every dot structurally identical.
 */
function dotStyle(ground: string, signature: string) {
  return {
    backgroundImage: `linear-gradient(135deg, ${ground} 0 50%, ${signature} 50% 100%)`,
  };
}

export function ThemeDots({ current }: { current: ThemeId }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<ThemeId>(current);
  const [loaded, setLoaded] = useState<ThemeId | null>(null);
  const [leaving, setLeaving] = useState<ThemeId | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  // No hover on a touch screen, so there is nothing to preview with: the panel
  // becomes a plain labelled list and the frame is never mounted at all. That
  // is a deliberate saving, not a fallback - it keeps a phone from fetching a
  // second full document to show a thumbnail nobody asked for.
  const canHover = useMedia("(hover: hover) and (pointer: fine)", false);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Closing also abandons whatever was being previewed, so the frame shows the
  // page you are actually on next time it opens. Done here rather than in an
  // effect watching `open`: the React Compiler rules reject setState inside an
  // effect, and every path that closes the panel already runs through here.
  const close = useCallback(() => {
    cancelClose();
    setOpen(false);
    setPreview(current);
  }, [cancelClose, current]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(close, CLOSE_MS);
  }, [cancelClose, close]);

  useEffect(() => cancelClose, [cancelClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, close]);

  function pick(e: React.MouseEvent<HTMLAnchorElement>, t: (typeof THEMES)[number]) {
    // Modified clicks belong to the browser.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (t.id === current) {
      close();
      return;
    }
    try {
      sessionStorage.setItem("theme:entering", t.id);
    } catch {
      // Private mode. The next page appears without the fade-up.
    }
    setLeaving(t.id);
    window.setTimeout(() => window.location.assign(t.href), VEIL_MS);
  }

  const previewed = THEMES.find((t) => t.id === preview) ?? THEMES[0];
  const leavingTheme = THEMES.find((t) => t.id === leaving);

  return (
    <div
      ref={rootRef}
      className="theme-dots"
      onPointerEnter={canHover ? () => { cancelClose(); setOpen(true); } : undefined}
      onPointerLeave={canHover ? scheduleClose : undefined}
    >
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Theme: ${THEMES.find((t) => t.id === current)?.label}. Change it.`}
        className="theme-dots__trigger"
      >
        {THEMES.map((t) => (
          <span
            key={t.id}
            aria-hidden
            data-on={t.id === current ? "" : undefined}
            className="theme-dots__dot"
            style={dotStyle(t.swatch[0], t.signature)}
          />
        ))}
      </button>

      {open ? (
        <div className="theme-dots__panel" role="group" aria-label="Choose a theme">
          <p className="theme-dots__title">Theme</p>

          {canHover ? (
            <span
              aria-hidden
              className="theme-dots__preview"
              style={{ background: previewed.swatch[0] }}
            >
              <iframe
                key="preview"
                src={previewed.href}
                title=""
                aria-hidden
                tabIndex={-1}
                scrolling="no"
                onLoad={() => setLoaded(previewed.id)}
                data-ready={loaded === previewed.id ? "" : undefined}
                width={FRAME_W}
                height={FRAME_H}
              />
            </span>
          ) : null}

          <ul>
            {THEMES.map((t) => {
              const isCurrent = t.id === current;
              return (
                <li key={t.id}>
                  <a
                    href={t.href}
                    onClick={(e) => pick(e, t)}
                    onPointerEnter={canHover ? () => setPreview(t.id) : undefined}
                    onFocus={() => setPreview(t.id)}
                    aria-current={isCurrent ? "true" : undefined}
                    data-active={t.id === preview ? "" : undefined}
                  >
                    <span
                      aria-hidden
                      className="theme-dots__dot"
                      style={dotStyle(t.swatch[0], t.signature)}
                    />
                    <span>{t.label}</span>
                    {isCurrent ? (
                      <span className="theme-dots__now">now</span>
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* The fade out. Painted in the DESTINATION theme's ground, so the two
          pages meet on the same colour and the switch reads as one move
          rather than as a flash of the old palette. Opacity only: it creates a
          stacking context but not a containing block, so it can never capture
          the default theme's fixed orb layer. */}
      {leavingTheme ? (
        <span
          aria-hidden
          className="theme-veil theme-dots__veil"
          style={{ background: leavingTheme.swatch[0] }}
        />
      ) : null}
    </div>
  );
}
