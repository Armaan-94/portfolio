"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * A surface with a soft light that follows the cursor. On pointer move it
 * writes the local cursor position to `--mx/--my`, which the `.card-spotlight`
 * rule in globals.css turns into a radial glow clipped to the card's shape.
 * Purely additive over the existing card styling; inert under reduced motion.
 */
export function SpotlightCard({
  className = "",
  children,
  onPointerMove,
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(e);
    const el = ref.current;
    if (reduce || !el) return;
    const r = el.getBoundingClientRect();
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
