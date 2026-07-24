"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

type MagneticButtonProps = ComponentPropsWithoutRef<typeof motion.a> & {
  /** how far the control slides toward the cursor, as a fraction of the offset */
  strength?: number;
  /** max lean in degrees toward the cursor */
  lean?: number;
};

const SPRING = { stiffness: 280, damping: 20, mass: 0.4 } as const;

/**
 * A magnetic anchor: as the cursor moves across it, the control slides a little
 * toward the pointer, leans in 3D, and lights a soft glare that tracks the
 * cursor (via the `--mx/--my` custom properties consumed by `.btn-magnetic` in
 * globals.css). It springs back on leave and dips on press. Everything is
 * disabled under prefers-reduced-motion — the anchor then behaves like a plain
 * link, so behaviour and accessibility are unchanged.
 */
export function MagneticButton({
  strength = 0.3,
  lean = 6,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...rest
}: MagneticButtonProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const srx = useSpring(rx, SPRING);
  const sry = useSpring(ry, SPRING);

  function handleMove(e: React.PointerEvent<HTMLAnchorElement>) {
    onPointerMove?.(e);
    const el = ref.current;
    if (reduce || !el) return;
    const r = el.getBoundingClientRect();
    const relX = e.clientX - r.left;
    const relY = e.clientY - r.top;
    const dx = relX - r.width / 2;
    const dy = relY - r.height / 2;
    x.set(dx * strength);
    y.set(dy * strength);
    // Lean toward the cursor: horizontal cursor → Y rotation, vertical → X.
    ry.set((dx / (r.width / 2)) * lean);
    rx.set((-dy / (r.height / 2)) * lean);
    el.style.setProperty("--mx", `${relX}px`);
    el.style.setProperty("--my", `${relY}px`);
  }

  function handleLeave(e: React.PointerEvent<HTMLAnchorElement>) {
    onPointerLeave?.(e);
    x.set(0);
    y.set(0);
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.a
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      style={
        reduce
          ? undefined
          : {
              x: sx,
              y: sy,
              rotateX: srx,
              rotateY: sry,
              transformPerspective: 600,
            }
      }
      className={className}
      {...rest}
    >
      {children}
    </motion.a>
  );
}
