"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * A surface with a soft light that follows the cursor. On pointer move it
 * writes the local cursor position to `--mx/--my`, which the `.card-spotlight`
 * rule in globals.css turns into a radial glow clipped to the card's shape.
 * Purely additive over the existing card styling; inert under reduced motion.
 *
 * The card's own box is measured lazily and cached: `getBoundingClientRect` is
 * a layout read, and doing one per `pointermove` is wasteful once this is on
 * every card in three sections. The cache is dropped whenever the box could
 * have moved (scroll, resize, or the element itself resizing), so the maths
 * stays exact.
 *
 * Callers must supply `relative overflow-hidden` and give the card's own
 * children `relative`, so they paint above the absolutely positioned glow.
 */
export function SpotlightCard({
  className = "",
  children,
  onPointerMove,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const invalidate = () => {
      rect.current = null;
    };
    // Scroll moves the viewport-relative box; resize can move and reshape it.
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    const observer = new ResizeObserver(invalidate);
    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      observer.disconnect();
    };
  }, []);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(e);
    const el = ref.current;
    if (reduce || !el) return;
    if (!rect.current) rect.current = el.getBoundingClientRect();
    const r = rect.current;
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      className={`card-spotlight ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
