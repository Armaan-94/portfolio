"use client";

import { useState } from "react";
import { THEMES, type ThemeId } from "@/themes/registry";

/** How long the full-viewport turn runs before the navigation fires. */
const TURN_MS = 620;

function nextTheme(current: ThemeId) {
  const i = THEMES.findIndex((t) => t.id === current);
  return THEMES[(i + 1) % THEMES.length];
}

/**
 * The theme switcher: the bottom corner of the page, peeled back.
 *
 * Underneath the current sheet is the next theme, and clicking finishes the
 * turn. Three of the four themes are print metaphors, so a page that can be
 * turned is the house language rather than an imported effect, and it replaces
 * a corner dropdown whose "preview" was three flat colour stripes that told you
 * nothing about what you were switching to.
 *
 * GEOMETRY. Take a square of side S in the bottom-right corner, local
 * coordinates (0,0) top-left to (S,S). The corner being lifted is (S,S) and the
 * fold is the anti-diagonal from (S,0) to (0,S). So:
 *
 *   revealed  triangle (S,0) (S,S) (0,S), the lower-right half
 *   flap      the same triangle reflected across the fold
 *
 * Reflection about y = -x is matrix(0,-1,-1,0,0,0), which maps (x,y) to
 * (-y,-x); translating by (S,S) puts it about y = -x + S, giving (S-y, S-x).
 * With transform-origin at the top left and a box that is exactly S square,
 * translate(100%,100%) IS that translation, so the whole thing survives S
 * changing on hover without recomputing anything in JavaScript.
 *
 * The flap is flat rather than curled. A curl needs either a real 3D transform
 * with a gradient standing in for the shading, or an SVG filter, and both cost
 * more than they return at this size: a flat fold with a light edge along the
 * crease and a shadow falling on what it uncovers already reads as paper.
 *
 * It is a real anchor to the next theme's route, so middle-click, open-in-new
 * tab and no-JS all work, and it cycles: four themes is at most three turns to
 * any of them, and "turn to the next one" is the metaphor doing the explaining.
 */
export function ThemePeel({ current }: { current: ThemeId }) {
  const [turning, setTurning] = useState(false);
  const next = nextTheme(current);

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Modified clicks belong to the browser.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    try {
      sessionStorage.setItem("theme:entering", next.id);
    } catch {
      // Private mode. The next page just appears without the fade.
    }
    setTurning(true);
    window.setTimeout(() => window.location.assign(next.href), TURN_MS);
  }

  return (
    <a
      href={next.href}
      onClick={onClick}
      data-turning={turning ? "" : undefined}
      // The destination is named here because the visible label only appears
      // once the corner is lifted, and at rest there is nothing to read.
      aria-label={`Change theme: turn the page to ${next.label}`}
      className={`theme-peel theme-peel--${next.id}`}
    >
      {/* What the lifted corner uncovers: the next theme's own ground. */}
      <span aria-hidden className="theme-peel__under">
        <span className="theme-peel__label">{next.label}</span>
      </span>

      {/* The back of the sheet being lifted, in the CURRENT theme's colours. */}
      <span aria-hidden className="theme-peel__flap" />
    </a>
  );
}
