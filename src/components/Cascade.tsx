"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Plays a one-shot staggered entrance across its direct children the first
 * time it scrolls into view. Each child's offset rides on a `--i` custom
 * property the caller sets inline; the timing lives in `.cascade-run` in
 * globals.css.
 *
 * Two classes on purpose, and the hiding one is applied defensively. The
 * children are visible in the server-rendered HTML, so if JavaScript never
 * runs they simply stay visible. `cascade-armed` hides them only once a live
 * observer has confirmed they are still off screen, so there is no path where
 * they end up hidden with nothing left to reveal them. `cascade-run` then
 * plays the sweep exactly once.
 *
 * Both classes are written straight to the DOM rather than held in state: this
 * is presentation-only and should not cost a React render, matching the "refs
 * over state for animation" rule the scene code follows.
 *
 * A scroll-driven CSS version was tried first and rejected. The grid is only
 * ~95px tall, so its own view() range is over in 95px of scroll, and hanging
 * the cells off a named view-timeline on the taller card did not animate
 * reliably. An observer is deterministic and also works in browsers with no
 * scroll-timeline support at all.
 */
export function Cascade({
  className = "",
  children,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    let armed = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!armed) {
          // An observer's first callback fires immediately on observe(). Only
          // hide the children if they are genuinely still off screen: if the
          // reader has already landed on this section, showing them plainly
          // beats risking a grid that never un-hides.
          armed = true;
          if (entry.isIntersecting) {
            observer.disconnect();
            return;
          }
          el.classList.add("cascade-armed");
          return;
        }
        if (!entry.isIntersecting) return;
        el.classList.add("cascade-run");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduce]);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
